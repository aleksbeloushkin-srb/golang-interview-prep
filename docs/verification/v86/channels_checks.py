#!/usr/bin/env python3
"""Checks for the claims of the channels track (v86).

Usage: python3 docs/verification/v86/channels_checks.py <go binary> [--leakprofile-env KEY=VALUE]
Runs, in docs/verification/fixtures/channels:
  * go vet and go test -race ./... (facts on any Go; bubble needs Go 1.25+);
  * every leak demo alone (-tags leakdemo): TestLeak* must fail, TestFixed* must pass;
  * the W3-1 tests against the semaphore and SetLimit forms (workerpool-alt);
  * the goroutineleak profile program for each scenario.
"""
import os, re, subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1] / "fixtures" / "channels"
go = sys.argv[1]
extra_env = dict(kv.split("=", 1) for kv in sys.argv[3:]) if len(sys.argv) > 2 and sys.argv[2] == "--leakprofile-env" else {}
env = {**os.environ, "GOTOOLCHAIN": "local"}
version = subprocess.run([go, "env", "GOVERSION"], capture_output=True, text=True).stdout.strip()
minor = int(re.match(r"go1\.(\d+)", version).group(1))
failures = 0

def run(args, **kw):
    return subprocess.run([go, *args], cwd=ROOT, capture_output=True, text=True, env={**env, **kw.get("env", {})})

def report(ok, what, detail=""):
    global failures
    failures += 0 if ok else 1
    print(f"{'ok  ' if ok else 'FAIL'} {version} {what} {detail}".rstrip(), flush=True)

p = run(["vet", "./..."])
report(p.returncode == 0, "go vet ./...", p.stderr.strip()[:200])
p = run(["test", "-race", "-count=1", "./..."])
report(p.returncode == 0, "go test -race ./...", " | ".join(l for l in p.stdout.splitlines() if l.startswith(("ok", "FAIL", "---"))))

if minor >= 25:
    demos = [(pkg, name) for pkg, file in [("leaks", "leaks_test.go"), ("review", "leak_test.go")]
             for name in re.findall(r"^func (Test\w+)\(", (ROOT / pkg / file).read_text(), re.M)]
    for pkg, name in demos:
        p = run(["test", "-race", "-count=1", "-tags", "leakdemo", "-run", f"^{name}$", f"./{pkg}/"])
        failed = p.returncode != 0
        expect_fail = name.startswith("TestLeak")
        out = p.stdout + p.stderr
        why = ""
        if "blocked goroutines remain" in out:
            why = f"synctest: blocked goroutines remain ({len(re.findall(r'^goroutine \d+ \[.*synctest bubble', out, re.M))} in the bubble)"
        elif "found unexpected goroutines" in out:
            why = f"goleak: {len(re.findall(r'Goroutine \d+ in state', out))} unexpected goroutines"
        report(failed == expect_fail, f"{name} ({'must fail' if expect_fail else 'must pass'})", why)

# K3.5: W3-1 solved with a semaphore and with errgroup.SetLimit passes the W3-1 tests unchanged.
tests = ROOT.parent / "practice" / "workerpool" / "workerpool_test.go"
for form in ["sem", "group"]:
    dst = ROOT / "workerpool-alt" / form / "workerpool_test.go"
    dst.write_text(tests.read_text())
    try:
        p = run(["test", "-race", "-count=5", f"./workerpool-alt/{form}/"])
    finally:
        dst.unlink()
    report(p.returncode == 0, f"W3-1 tests on workerpool-alt/{form}", p.stdout.strip().splitlines()[-1] if p.stdout.strip() else p.stderr.strip()[:200])

for scenario in ["boss", "boss-buffered", "first", "global"]:
    p = run(["run", "-race", "./leakprofile", "-scenario", scenario], env=extra_env)
    report(p.returncode == 0, "leakprofile", (p.stdout + p.stderr).strip().splitlines()[-1] if (p.stdout + p.stderr).strip() else "")

sys.exit(1 if failures else 0)
