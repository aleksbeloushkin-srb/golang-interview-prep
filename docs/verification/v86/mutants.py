#!/usr/bin/env python3
"""Mutation check for the v86 practice tasks: every mutant must fail its task's tests.

Usage: python3 docs/verification/v86/mutants.py <go binary> [task ...]
Each mutant replaces exactly one fragment of the reference solution in a temporary
copy of the practice module and runs go test -race on that package.
"""
import pathlib, shutil, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1] / "fixtures" / "practice"

MUTANTS = {
    "timeout": [
        ("unbuffered result channel", "res := make(chan result, 1)", "res := make(chan result)"),
        ("context not cancelled on return", "\tdefer cancel()\n", "\t_ = cancel\n"),
        ("waits for f without select", "\tselect {\n\tcase r := <-res:\n\t\treturn r.v, r.err\n\tcase <-ctx.Done():\n\t\tvar zero T\n\t\treturn zero, ctx.Err()\n\t}", "\tr := <-res\n\treturn r.v, r.err"),
        ("parent ctx passed to f", "v, err := f(ctx)", "v, err := f(context.WithoutCancel(ctx))"),
        ("error dropped", "return r.v, r.err", "return r.v, nil"),
    ],
    "fanout": [
        ("send without select", "\t\t\t\tselect {\n\t\t\t\tcase outs[partition(key(v), n)] <- v:\n\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\treturn\n\t\t\t\t}", "\t\t\t\touts[partition(key(v), n)] <- v"),
        ("range in, no ctx while waiting", "\t\t\tcase <-ctx.Done():\n\t\t\t\treturn\n\t\t\tcase v, ok := <-in:", "\t\t\tcase v, ok := <-in:"),
        ("everything to output 0", "return int(h.Sum32() % uint32(n))", "return 0"),
        ("round-robin instead of key", "case outs[partition(key(v), n)] <- v:", "case outs[rr()%n] <- v:"),
        ("only the first output closed", "\t\t\tfor _, out := range outs {\n\t\t\t\tclose(out)\n\t\t\t}", "\t\t\tclose(outs[0])"),
        ("n not clamped", "\tn = max(n, 1)\n", ""),
        ("buffered outputs pile values up", "\t\touts[i] = make(chan T)\n", "\t\touts[i] = make(chan T, 1024)\n"),
        ("goroutine per send", "\t\t\t\tselect {\n\t\t\t\tcase outs[partition(key(v), n)] <- v:\n\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\treturn\n\t\t\t\t}", "\t\t\t\tgo func() {\n\t\t\t\t\tselect {\n\t\t\t\t\tcase outs[partition(key(v), n)] <- v:\n\t\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\t}\n\t\t\t\t}()"),
    ],
    "tee": [
        ("or-done: send without select", "\t\t\t\tselect {\n\t\t\t\tcase out <- v:\n\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\treturn\n\t\t\t\t}", "\t\t\t\tout <- v"),
        ("or-done: no ctx while waiting for in", "\t\t\tcase <-ctx.Done():\n\t\t\t\treturn\n\t\t\tcase v, ok := <-in:", "\t\t\tcase v, ok := <-in:"),
        ("tee: fast, does not wait for every output", "\t\t\twg.Wait()\n", ""),
        ("tee: send to an output without select", "\t\t\t\t\tselect {\n\t\t\t\t\tcase out <- v:\n\t\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\t}", "\t\t\t\t\tout <- v"),
        ("tee: n not clamped", "\tn = max(n, 1)\n", ""),
    ],
}

def run(go, task):
    failures = 0
    for name, old, new in MUTANTS[task]:
        with tempfile.TemporaryDirectory() as tmp:
            dst = pathlib.Path(tmp) / "practice"
            shutil.copytree(ROOT, dst)
            src = dst / task / f"{task}.go"
            text = src.read_text()
            if text.count(old) != 1:
                print(f"BROKEN  {task}: {name}: fragment found {text.count(old)} times")
                failures += 1
                continue
            text = text.replace(old, new)
            if "rr()" in new:
                text += "\nvar rrNext int\n\nfunc rr() int { rrNext++; return rrNext }\n"
            src.write_text(text)
            proc = subprocess.run([go, "test", "-race", "-count=1", "-timeout=60s", f"./{task}/"], cwd=dst,
                                  capture_output=True, text=True, env={**__import__("os").environ, "GOTOOLCHAIN": "local"})
            if "[build failed]" in proc.stdout or "[setup failed]" in proc.stdout:
                print(f"BROKEN  {task}: {name}: mutant does not compile", flush=True)
                failures += 1
                continue
            caught = proc.returncode != 0
            first = next((l.strip() for l in proc.stdout.splitlines() if l.strip().startswith(("--- FAIL", "panic:", "#", "vet:"))), "")
            print(f"{'caught ' if caught else 'MISSED '} {task}: {name} {first}", flush=True)
            failures += 0 if caught else 1
    return failures

if __name__ == "__main__":
    go, tasks = sys.argv[1], sys.argv[2:] or list(MUTANTS)
    sys.exit(1 if sum(run(go, t) for t in tasks) else 0)
