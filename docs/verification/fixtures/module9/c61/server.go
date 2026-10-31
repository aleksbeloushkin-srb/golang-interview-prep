// Package grpcserver shows what a production gRPC server needs besides the
// generated code: panic-recovery interceptors, the standard health service
// and a graceful stop with a time limit.
package grpcserver

import (
	"context"
	"log/slog"
	"runtime/debug"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/health"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/status"
)

// New builds a server with interceptors and registers the health service.
// Logging, metrics, tracing and auth interceptors go into the same chains;
// the first one listed is the outermost, so recovery goes after logging and
// metrics and they record codes.Internal.
func New(log *slog.Logger) (*grpc.Server, *health.Server) {
	srv := grpc.NewServer(
		grpc.ChainUnaryInterceptor(RecoverUnary(log)),
		grpc.ChainStreamInterceptor(RecoverStream(log)),
	)
	hs := health.NewServer() // the overall status "" starts as SERVING
	healthpb.RegisterHealthServer(srv, hs)
	return srv, hs
}

// RecoverUnary turns a panic in a unary handler into codes.Internal. grpc-go
// does not recover panics itself: without this the whole process crashes.
func RecoverUnary(log *slog.Logger) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
		defer func() {
			if p := recover(); p != nil {
				resp, err = nil, recovered(ctx, log, info.FullMethod, p)
			}
		}()
		return handler(ctx, req)
	}
}

// RecoverStream does the same for streaming handlers, Health/Watch included.
func RecoverStream(log *slog.Logger) grpc.StreamServerInterceptor {
	return func(srv any, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) (err error) {
		defer func() {
			if p := recover(); p != nil {
				err = recovered(ss.Context(), log, info.FullMethod, p)
			}
		}()
		return handler(srv, ss)
	}
}

// recovered logs the panic value and the stack; the client gets a generic text.
func recovered(ctx context.Context, log *slog.Logger, method string, p any) error {
	log.ErrorContext(ctx, "panic in handler", "method", method, "panic", p, "stack", string(debug.Stack()))
	return status.Error(codes.Internal, "internal error")
}

// Shutdown marks the server NOT_SERVING, lets running RPCs finish and, after
// timeout, starts Stop, which cancels the rest. It returns within timeout and
// reports whether all RPCs finished in time.
func Shutdown(srv *grpc.Server, hs *health.Server, timeout time.Duration) bool {
	hs.Shutdown()
	done := make(chan struct{})
	go func() {
		srv.GracefulStop() // waits for every running RPC, a long stream included
		close(done)
	}()
	t := time.NewTimer(timeout)
	defer t.Stop()
	select {
	case <-done:
		return true
	case <-t.C:
		// Stop closes the connections and cancels the RPC contexts. Before
		// grpc-go v1.85.0, a Stop called while GracefulStop waits for handlers
		// blocks on the server lock until they return, so do not wait for it:
		// the RPCs end only if their handlers honour ctx.
		go srv.Stop()
		return false
	}
}
