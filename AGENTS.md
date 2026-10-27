# Repository guidance

## Project context

This is a Go runtime learning site built with plain HTML, CSS, and JavaScript, without a build step or external runtime dependencies.

- `index.html`: page structure and navigation.
- `css/style.css`: shared styles and responsive layouts.
- `js/app.js`: routing, interactions, rendering, and saved progress.
- `data/cards.js`, `data/simulators.js`, `data/quiz.js`: learning content.

Keep this architecture unless the task requires changing it. There is no root Go module or npm project; isolated verification modules live under `docs/verification/fixtures/`. Go rules apply to examples and those fixtures. Preserve the Russian UI and bilingual learning content unless asked otherwise.

## Working approach

- Read the relevant code and README before editing. Make the smallest complete change that solves the user’s problem.
- Prefer clear names, small functions, explicit data flow, and standard library/browser APIs. Add abstractions or dependencies only for a concrete need.
- Preserve unrelated work. Avoid opportunistic rewrites, broad formatting changes, and speculative features.
- Carry authorized local work through implementation and verification. Ask only when missing information materially affects correctness or scope.
- Keep comments brief and explain non-obvious reasons. Update documentation when behavior or usage changes.
- Never put secrets in source, browser storage, or logs. Commit, push, publish, and modify shared resources only when explicitly authorized.

## Go best practices

- Follow idiomatic Go and the module’s declared Go version. Use `gofmt`; do not upgrade the toolchain merely to use newer syntax.
- Keep packages cohesive and APIs small. Prefer concrete types; define small interfaces at the consumer when a real boundary needs one. Avoid a mandatory directory hierarchy for small programs.
- Handle errors explicitly. Add useful context with `%w` when callers should inspect the cause; use `errors.Is`/`errors.As`. Log failures once at the handling boundary, without sensitive data. Reserve panics for unrecoverable programmer errors.
- Pass `context.Context` as the first argument for cancellable operations and propagate it through I/O. Release resources and cancel derived contexts when done; configure network timeouts.
- Give each goroutine a clear owner and termination path. Bound concurrency, synchronize shared state, and make blocking operations cancellable where required. The sending owner closes a channel only after all sends finish.
- Prefer simple synchronous code until concurrency has a purpose. Measure with benchmarks and profiles before optimizing; avoid `unsafe` unless justified and isolated.
- Test observable behavior, edge cases, and failures. Use named table cases when helpful, real objects or small fakes, and parallel tests only when isolated. Keep tests deterministic; avoid sleeps for synchronization.
- After Go changes, format touched files and run `go vet ./...` and `go test ./...` from the affected module. Use `go test -race ./...` for concurrency changes where supported, and existing project lint/security checks when configured.
- Run `go mod tidy` when dependencies change and review module-file changes. Do not run sweeping modernization or add testing/lint libraries by default.

## Accuracy of Go learning content

- Distinguish language guarantees from runtime implementation details. Verify version-sensitive claims against the Go specification, release notes, or source for the stated version.
- Keep examples minimal and executable where intended. Label pseudocode, intentional bugs, and nondeterministic output; provide the explanation or corrected form.
- Check related cards, quiz explanations, diagrams, and links together when changing a concept. Preserve stable content IDs and saved progress compatibility.
- Derive displayed counts from data where practical. Simulators must describe what they simplify and must not imply guaranteed scheduling or timing.

## HTML and accessibility

- Use semantic landmarks, logical headings, links for navigation, and native buttons for actions. Prefer native controls before adding ARIA.
- Give controls accessible names and inputs visible labels; placeholders are not labels. Use meaningful alternative text for informative images and empty alt text for decorative ones.
- Make every interaction work with keyboard and touch. Keep focus visible, manage focus when views/dialogs change, and expose selected/expanded states where appropriate.
- Do not rely on color, hover, or animation alone to communicate meaning. Keep text readable, support zoom, and honor `prefers-reduced-motion`.
- Preserve useful page titles, language metadata, hash deep links, and browser Back/Forward behavior. Make empty and error states understandable.

## CSS and visual design

- Build from narrow screens upward using flexible Grid/Flexbox layouts and content-driven breakpoints. Avoid fixed heights that clip translated or enlarged text.
- Reuse CSS custom properties for colors, spacing, and other repeated values. Keep selectors shallow, styles grouped by component, and specificity predictable.
- Maintain a coherent hierarchy of typography, spacing, surfaces, and primary actions. Follow the existing visual language unless a redesign is requested.
- Keep code blocks and wide diagrams scrollable within their containers without causing page-wide overflow. Give controls comfortable touch targets.
- Define hover, focus, active, and disabled states. Use restrained motion that supports understanding and reserve image dimensions to prevent layout shifts.
- Prefer CSS or SVG for simple diagrams; use appropriate, optimized image assets when they help the content. Avoid decorative weight that slows reading or interaction.

## JavaScript and browser behavior

- Prefer `const`, use `let` for reassignment, and keep functions focused. Separate data transformation, state updates, and DOM rendering where it improves clarity.
- Preserve the current script loading order and required global entry points. Prefer `addEventListener` for new interactions; do not migrate the whole app to modules or a framework incidentally.
- Use `textContent` for plain text and code examples. Never insert untrusted strings into `innerHTML`; deliberate rich HTML needs controlled templates and appropriate sanitization.
- Treat browser storage as optional and untrusted: handle unavailable storage and malformed JSON, validate loaded data, and preserve compatible progress records.
- Handle asynchronous failures explicitly. For network features, check HTTP status, provide useful loading/error/empty states, and prevent stale responses from overwriting newer state.
- Keep shortcuts inactive while typing in inputs, textareas, or editable content. Avoid duplicate listeners, unnecessary DOM rebuilds, and leaked timers or observers.
- Keep rendered content and counters consistent with application state; avoid multiple competing sources of truth.

## Verification and completion

- Follow [VERIFICATION_WORKFLOW_RU.md](VERIFICATION_WORKFLOW_RU.md): select coverage from the diff before editing. Content-only work still needs authoritative Go review, affected examples, linked content and browser checks; shared UI/storage/routing changes require broad regression. Unclear impact means broaden coverage, not skip it.
- Use `node scripts/check-content.mjs --base <base-commit>` for syntax, structural checks and changed content IDs. This does not certify technical correctness, translation equivalence, UI behavior or review completion. Run `node --test scripts/check-content.test.mjs` when changing the checker.
- Reuse successful evidence only for unchanged relevant files, fixtures, toolchain and conditions. After a fix rerun failed and affected checks; do not repeat the full suite solely to finalize a commit. Publication checks verify deployed bytes and browser loading; they do not repeat all local semantic tests when the bytes match.
- Keep current backlog in `CURRENT_STATUS_RU.md` and append the detailed change rationale to `CHANGE_LOG_RU.md`. Update other documents only when their content or contracts change. Keep reports concise; do not copy every previous successful assertion into each report.
- Match verification to the change. Documentation-only edits need a content/diff review; behavior changes need relevant checks and regression coverage when useful.
- Preview the site with `python3 -m http.server 8000 --bind 127.0.0.1` from the repository root, then visit `http://127.0.0.1:8000`. Stop the server when finished.
- For changed JavaScript, use `node --check <file>` if Node is available. There are no npm scripts today; do not invent build/test commands or introduce tooling solely to check a small edit.
- For UI changes, inspect the affected views in a real browser at phone and desktop widths. Check keyboard navigation, focus, overflow, browser console errors, and missing assets.
- Exercise affected routes, search/filters, answer reveal, quiz/simulator controls, and progress persistence across reloads. Check empty results and relevant failure states, not just the happy path.
- Review the final diff for accidental changes. Report what changed, what was actually verified, and any remaining limitations. Never claim browser checks or tests ran when they did not.

## References

- [Go workflow article that inspired this simplified guide](https://codex.danielvaughan.com/2026/03/30/codex-cli-go-teams/#agentsmd-template-for-a-go-repository)
- [Effective Go](https://go.dev/doc/effective_go) and [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)
- [MDN: accessible HTML](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML)
- [Codex: AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
