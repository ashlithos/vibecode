# Concepts Tracker

> `[ ]` NOT LEARNED · `[~]` LEARNING · `[x]` COMFORTABLE
>
> You graduate concepts, not the agent. It may move `[ ]` → `[~]` after teaching something
> in context, but only marks `[x]` after you say yes. Edit freely.
> After `—` is a one-line plain-English meaning. After `·` the agent may add `seen: <date> (<where>)`.

## Reading a codebase
- [ ] File & folder structure — where things live and the naming conventions that tell you
- [ ] Imports / exports — how one file borrows from another
- [ ] package.json & scripts — the project's ingredients list plus its "run this" buttons
- [ ] Running the dev server — a live local copy of the app that reloads as you edit
- [ ] Environment variables — settings and secrets kept outside the code

## Frontend foundations
- [ ] DOM — the live tree of elements in the browser, like a layers panel
- [ ] Semantic HTML — using the element that means what it is (button, nav, label)
- [ ] CSS layout (flex/grid) — how boxes arrange themselves, like auto layout
- [ ] Cascade & specificity — which style rule wins when several apply
- [ ] Responsive design — layouts that adapt to screen size
- [ ] JavaScript fundamentals — variables, functions, arrays, objects, conditionals
- [ ] TypeScript fundamentals — labels on data that catch mistakes before they run
- [ ] Async behavior — work that finishes later (fetching data), and what the UI shows meanwhile

## React / components
- [ ] Components — reusable UI pieces, like main components
- [ ] Props — the settings you pass into a component, like variant properties
- [ ] State — the app's short-term memory; changing it redraws the UI
- [ ] Rendering — React redrawing the UI from current props and state
- [ ] Event handlers — code that runs when the user does something
- [ ] Hooks — reusable behaviors a component plugs in (useState, useEffect, custom hooks)
- [ ] Conditional rendering — showing different UI for different states
- [ ] Lists & keys — rendering many items and helping React track each one

## Design → code
- [ ] Design tokens in code — named colors/spacing/type used instead of raw values
- [ ] Design-system components — the shared library you should reuse before building
- [ ] Variants ↔ props — mapping Figma variants to component props
- [ ] Interactive states — hover, focus, active, disabled, selected in code

## Systems
- [ ] Client / server model — the browser asks, the server answers
- [ ] APIs — the menu of requests the server accepts
- [ ] JSON — the plain-text format data travels in
- [ ] Authentication — proving who you are
- [ ] Authorization / permissions — what you're allowed to do
- [ ] Error handling — deciding what happens when things fail

## Engineering workflow
- [ ] Git — version history for code
- [ ] Branches — a safe parallel copy to work in
- [ ] Commits — a saved checkpoint with a note
- [ ] Diffs — exactly what changed, line by line
- [ ] Pull requests — proposing a change for review before it joins main
- [ ] Merge conflicts — two changes to the same lines; a human picks
- [ ] Tests — acceptance criteria that check themselves
- [ ] Linting — an automatic style guide and spellcheck for code
- [ ] Type checking — catching mismatched data before running
- [ ] CI/CD — robots that run the checks on every PR (and deploy)

## Debugging
- [ ] Console — where the app prints messages and errors
- [ ] Error messages & stack traces — what broke, and the trail of calls that led there
- [ ] Browser DevTools — inspecting elements, styles, and layout live
- [ ] Network requests — watching what the app asks the server and what comes back
- [ ] Tracing data flow — following a value from the server to the pixel

## Production quality
- [ ] Accessibility — keyboard, focus, labels, screen readers, contrast
- [ ] Loading states — what users see while waiting
- [ ] Empty states — what users see when there's nothing yet
- [ ] Error states — what users see when it fails, and how they recover
- [ ] Responsive behavior — checked at real breakpoints, not assumed
- [ ] Analytics / telemetry — events the product team relies on
- [ ] Performance basics — avoiding needless work, re-renders, and huge bundles
- [ ] Security boundaries — never trust the browser; secrets stay server-side

## Architecture
- [ ] Component boundaries — what one component should and shouldn't know
- [ ] State ownership — which component is the single source of truth
- [ ] Separation of concerns — UI, logic, and data in sensible places
- [ ] Dependency awareness — what else relies on the thing you're changing
- [ ] Blast radius — how far a change can ripple (main component vs. instance)

## Working with AI
- [ ] Scoping a request — asking for the smallest change that achieves the intent
- [ ] Reviewing AI output — reading the diff critically instead of trusting it
- [ ] Spotting invented APIs — noticing when generated code calls things that don't exist
- [ ] Asking engineers cheap questions — context, findings, hypothesis, yes/no
