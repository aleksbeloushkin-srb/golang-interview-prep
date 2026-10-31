package grpcserver

import (
	"bytes"
	"context"
	"errors"
	"log/slog"
	"net"
	"strings"
	"sync"
	"testing"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/health"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/status"
	"google.golang.org/grpc/test/bufconn"
	"google.golang.org/protobuf/types/known/emptypb"
)

// testService is registered by hand with the ServiceDesc that
// protoc-gen-go-grpc would generate for
// service Test { rpc Panic, Hang, Release, Deadline (Empty) returns (Empty);
// rpc PanicStream (Empty) returns (stream Empty) }.
type testService struct {
	hangStarted chan struct{} // Hang has started
	hangErr     chan error    // why Hang returned
	release     chan struct{} // closed to let Release return
	releaseIn   chan struct{} // Release has started
	deadlines   chan time.Time
}

func unary(name string, h func(*testService, context.Context) error) grpc.MethodDesc {
	return grpc.MethodDesc{
		MethodName: name,
		Handler: func(srv any, ctx context.Context, dec func(any) error, interceptor grpc.UnaryServerInterceptor) (any, error) {
			in := new(emptypb.Empty)
			if err := dec(in); err != nil {
				return nil, err
			}
			call := func(ctx context.Context, _ any) (any, error) {
				if err := h(srv.(*testService), ctx); err != nil {
					return nil, err
				}
				return &emptypb.Empty{}, nil
			}
			if interceptor == nil {
				return call(ctx, in)
			}
			return interceptor(ctx, in, &grpc.UnaryServerInfo{Server: srv, FullMethod: "/test.Test/" + name}, call)
		},
	}
}

var testDesc = grpc.ServiceDesc{
	ServiceName: "test.Test",
	HandlerType: (*any)(nil),
	Methods: []grpc.MethodDesc{
		unary("Panic", func(*testService, context.Context) error {
			panic("db password=hunter2")
		}),
		unary("Hang", func(s *testService, ctx context.Context) error {
			close(s.hangStarted)
			<-ctx.Done() // a long call that honours cancellation
			s.hangErr <- ctx.Err()
			return status.FromContextError(ctx.Err()).Err()
		}),
		unary("Release", func(s *testService, ctx context.Context) error {
			close(s.releaseIn)
			<-s.release // ignores ctx
			return nil
		}),
		unary("Deadline", func(s *testService, ctx context.Context) error {
			dl, ok := ctx.Deadline()
			if !ok {
				return status.Error(codes.InvalidArgument, "no deadline")
			}
			s.deadlines <- dl
			return nil
		}),
	},
	Streams: []grpc.StreamDesc{{
		StreamName:    "PanicStream",
		ServerStreams: true,
		Handler: func(any, grpc.ServerStream) error {
			panic("stream secret=hunter2")
		},
	}},
	Metadata: "test.proto",
}

// closeSignal reports when GracefulStop or Stop closes the listener.
type closeSignal struct {
	net.Listener
	once   sync.Once
	closed chan struct{}
}

func (l *closeSignal) Close() error {
	l.once.Do(func() { close(l.closed) })
	return l.Listener.Close()
}

type env struct {
	srv    *grpc.Server
	hs     *health.Server
	conn   *grpc.ClientConn
	svc    *testService
	lis    *closeSignal
	logs   *bytes.Buffer
	served chan error
}

func start(t *testing.T) *env {
	t.Helper()
	logs := new(bytes.Buffer)
	srv, hs := New(slog.New(slog.NewTextHandler(logs, nil)))
	svc := &testService{
		hangStarted: make(chan struct{}),
		hangErr:     make(chan error, 1),
		release:     make(chan struct{}),
		releaseIn:   make(chan struct{}),
		deadlines:   make(chan time.Time, 1),
	}
	srv.RegisterService(&testDesc, svc)
	bl := bufconn.Listen(1 << 20)
	lis := &closeSignal{Listener: bl, closed: make(chan struct{})}
	served := make(chan error, 1)
	go func() { served <- srv.Serve(lis) }()

	conn, err := grpc.NewClient("passthrough:///bufnet",
		grpc.WithContextDialer(func(ctx context.Context, _ string) (net.Conn, error) { return bl.DialContext(ctx) }),
		grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		t.Fatal(err)
	}
	e := &env{srv: srv, hs: hs, conn: conn, svc: svc, lis: lis, logs: logs, served: served}
	t.Cleanup(func() {
		conn.Close()
		srv.Stop()
		if err := <-served; err != nil {
			t.Errorf("Serve: %v", err)
		}
	})
	return e
}

func (e *env) call(ctx context.Context, method string) error {
	return e.conn.Invoke(ctx, "/test.Test/"+method, &emptypb.Empty{}, new(emptypb.Empty))
}

func (e *env) health(t *testing.T) healthpb.HealthCheckResponse_ServingStatus {
	t.Helper()
	resp, err := healthpb.NewHealthClient(e.conn).Check(context.Background(), &healthpb.HealthCheckRequest{})
	if err != nil {
		t.Fatalf("health check: %v", err)
	}
	return resp.GetStatus()
}

func TestHealthServing(t *testing.T) {
	e := start(t)
	if got := e.health(t); got != healthpb.HealthCheckResponse_SERVING {
		t.Fatalf("status = %v, want SERVING", got)
	}
}

func TestPanicBecomesInternal(t *testing.T) {
	e := start(t)
	err := e.call(context.Background(), "Panic")
	st, ok := status.FromError(err)
	if !ok || st.Code() != codes.Internal || st.Message() != "internal error" {
		t.Fatalf("err = %v, want Internal \"internal error\"", err)
	}
	if strings.Contains(st.Message(), "hunter2") {
		t.Fatal("panic text leaked to the client")
	}
	if !strings.Contains(e.logs.String(), "hunter2") || !strings.Contains(e.logs.String(), "/test.Test/Panic") {
		t.Fatalf("panic not logged: %s", e.logs.String())
	}
	// The process survived and the server keeps serving.
	if got := e.health(t); got != healthpb.HealthCheckResponse_SERVING {
		t.Fatalf("status after panic = %v", got)
	}
}

func TestStreamPanicBecomesInternal(t *testing.T) {
	e := start(t)
	cs, err := e.conn.NewStream(context.Background(), &grpc.StreamDesc{ServerStreams: true}, "/test.Test/PanicStream")
	if err != nil {
		t.Fatal(err)
	}
	if err := cs.SendMsg(&emptypb.Empty{}); err != nil {
		t.Fatal(err)
	}
	if err := cs.CloseSend(); err != nil {
		t.Fatal(err)
	}
	err = cs.RecvMsg(new(emptypb.Empty))
	if st, ok := status.FromError(err); !ok || st.Code() != codes.Internal || st.Message() != "internal error" {
		t.Fatalf("err = %v, want Internal \"internal error\"", err)
	}
	if !strings.Contains(e.logs.String(), "/test.Test/PanicStream") {
		t.Fatalf("stream panic not logged: %s", e.logs.String())
	}
	if got := e.health(t); got != healthpb.HealthCheckResponse_SERVING {
		t.Fatalf("status after panic = %v", got)
	}
}

func TestDeadlineReachesHandler(t *testing.T) {
	e := start(t)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	clientDL, _ := ctx.Deadline()
	if err := e.call(ctx, "Deadline"); err != nil {
		t.Fatal(err)
	}
	// The deadline travels as the remaining time (the grpc-timeout header), so
	// the server's deadline differs from the client's by the transit time.
	serverDL := <-e.svc.deadlines
	if d := serverDL.Sub(clientDL).Abs(); d > time.Second {
		t.Fatalf("server deadline %v differs from client deadline %v by %v", serverDL, clientDL, d)
	}
}

func TestShutdownWaitsForRunningRPC(t *testing.T) {
	e := start(t)
	callErr := make(chan error, 1)
	go func() { callErr <- e.call(context.Background(), "Release") }()
	<-e.svc.releaseIn

	stopped := make(chan bool, 1)
	go func() { stopped <- Shutdown(e.srv, e.hs, 30*time.Second) }()
	<-e.lis.closed // GracefulStop has started and accepts no new connections
	select {
	case <-stopped:
		t.Fatal("Shutdown returned while an RPC was still running")
	case err := <-callErr:
		t.Fatalf("RPC finished before release: %v", err)
	default:
	}
	close(e.svc.release)
	if err := <-callErr; err != nil {
		t.Fatalf("running RPC failed during graceful stop: %v", err)
	}
	if !<-stopped {
		t.Fatal("Shutdown = false, want true")
	}
}

func TestShutdownStopsHangingRPC(t *testing.T) {
	e := start(t)
	callErr := make(chan error, 1)
	go func() { callErr <- e.call(context.Background(), "Hang") }()
	<-e.svc.hangStarted

	const timeout = 100 * time.Millisecond
	begin := time.Now()
	if Shutdown(e.srv, e.hs, timeout) {
		t.Fatal("Shutdown = true, want false: the RPC never finishes by itself")
	}
	if took := time.Since(begin); took > 5*time.Second {
		t.Fatalf("Shutdown took %v, timeout was %v", took, timeout)
	}
	if err := <-e.svc.hangErr; !errors.Is(err, context.Canceled) {
		t.Fatalf("handler ctx error = %v, want context.Canceled", err)
	}
	if code := status.Code(<-callErr); code != codes.Unavailable {
		t.Fatalf("client code = %v, want Unavailable", code)
	}
}

// A handler that ignores ctx and a client whose deadline expired: the client
// resets the stream, the drained connection closes, and GracefulStop waits for
// the handler while holding the server lock (grpc-go before v1.85.0). A Stop
// called then blocks behind it, so Shutdown must not wait for Stop.
func TestShutdownReturnsWhenHandlerIgnoresCtx(t *testing.T) {
	e := start(t)
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()
	callErr := make(chan error, 1)
	go func() { callErr <- e.call(ctx, "Release") }()
	<-e.svc.releaseIn
	if code := status.Code(<-callErr); code != codes.DeadlineExceeded {
		t.Fatalf("client code = %v, want DeadlineExceeded", code)
	}

	const timeout = 200 * time.Millisecond
	begin := time.Now()
	stopped := make(chan bool, 1)
	go func() { stopped <- Shutdown(e.srv, e.hs, timeout) }()
	select {
	case graceful := <-stopped:
		if graceful {
			t.Fatal("Shutdown = true while the handler was still running")
		}
	case <-time.After(5 * time.Second):
		close(e.svc.release)
		t.Fatalf("Shutdown blocked %v with timeout %v", time.Since(begin), timeout)
	}
	close(e.svc.release) // let the handler return, so cleanup can stop the server
}
