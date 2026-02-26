# Contributing to SoundLab

Thank you for your interest in contributing to SoundLab. This document explains how to participate in the project, how to propose changes, and how to work within the architectural and conceptual framework that defines the engine. SoundLab is designed to be a clean, maintainable, and extensible synthesizer engine, and contributions that respect this structure are welcome.

---

## Project Philosophy

SoundLab is an open project, but not an open‑ended one. The engine has a clear identity and direction:

- The engine state is pure and side‑effect‑free.
- UI and engine logic remain strictly separated.
- Terminology is consistent and defined in `GLOSSARY.md`.
- The project is not intended to be forked into derivative synthesizers or rebranded engines.
- Contributions should align with the roadmap and architectural principles.

Contributors are encouraged to open issues, propose improvements, and submit pull requests that strengthen the engine without fragmenting it.

---

## Before You Begin

Please review the following documents:

- `README.md` — Overview, goals, and project structure.
- `GLOSSARY.md` — Definitions of key terms such as Patch, Module, Panel, Routing, and Engine State.
- `LICENSE` and `NOTICE` — Legal and attribution requirements.

Understanding these documents ensures that contributions fit naturally into the project.

---

## How to Propose Changes

### Reporting Issues

When opening an issue, include:

- A clear description of the problem or request.
- Steps to reproduce (for bugs).
- Expected vs. actual behavior.
- Screenshots or code snippets if relevant.
- Whether the issue relates to engine logic, UI behavior, presets, routing, or documentation.

### Feature Requests

Feature requests should:

- Align with the roadmap (see README).
- Respect the architecture (pure engine state, modular structure).
- Use established terminology.
- Include a rationale and potential impact.

Large features should be discussed in an issue before a pull request is submitted.

---

## Pull Request Guidelines

### Branching

Use descriptive branch names:

- `fix/filter-envelope-bug`
- `feature/vibrato-depth-modulation`
- `docs/update-glossary`

Avoid generic names like `patch-1` or `dev`.

### Code Style

SoundLab follows a few core principles:

- Engine files contain no DOM or UI logic.
- UI files do not contain DSP or engine‑state mutation logic.
- Each Module has a clear, self‑contained file or folder.
- Naming follows the glossary (Module, Panel, Component, Control).
- Functions are small, pure, and predictable.
- No implicit side effects.

### Commit Messages

Use clear, descriptive commit messages:

- `Add FM operator module with ratio and index controls`
- `Fix envelope attack time calculation`
- `Refactor UI bindings for filter panel`
- `Update preset serialization format`

Avoid vague messages like `update` or `fix`.

### Pull Request Content

A good PR includes:

- A summary of the change.
- Why the change is needed.
- How it fits into the architecture.
- Any new terminology or concepts (must align with glossary).
- Tests or examples if applicable.

Small, focused PRs are easier to review and merge.

---

## Development Workflow

### Running the Project

SoundLab has no build step. To run locally:

1. Clone the repository.
2. Open `index.html` in a browser.
3. Make changes in `src/` and refresh the page.

### File Structure Expectations

The project uses a clear, modular structure:

```text
src/
  engine/      # Pure engine logic and DSP
  presets/     # Preset loading, saving, serialization
  ui/          # Panels, bindings, dirty flags, render scheduling
  app/         # Initialization and orchestration
  styles/      # CSS for UI
assets/        # Icons, waveforms, presets
```

New files should follow this structure unless discussed otherwise.

---

## Architectural Principles

Contributions must respect the following:

- **Engine State is the source of truth.**  
  UI reads from it; setters write to it.

- **Modules are functional blocks.**  
  Panels represent them in the UI.

- **Routing is explicit and controlled.**  
  No hidden signal paths or implicit modulation.

- **DSP is isolated.**  
  No UI references, no DOM access, no global state.

- **UI uses dirty flags and scheduled rendering.**  
  No direct DOM manipulation from engine code.

- **Terminology is consistent.**  
  Use the definitions in `GLOSSARY.md`.

These principles keep SoundLab predictable and maintainable.

---

## What Not to Submit

To preserve the project’s identity, please avoid:

- Rebranding or derivative synthesizer engines.
- Architectural rewrites without discussion.
- Features outside the roadmap (e.g., polyphony before V2).
- Mixing UI and engine logic.
- Adding external dependencies without discussion.
- Introducing new terminology that conflicts with the glossary.

---

## Code of Conduct

Be respectful, constructive, and collaborative. SoundLab is a technical project, but it is also a community effort. Disagreements are normal; disrespect is not.

---

## Thank You

Your contributions help SoundLab grow into a powerful, elegant, and approachable synthesizer engine. Thoughtful participation—whether through issues, discussions, or pull requests—makes the project stronger.

If you have questions about how to approach a contribution, open an issue and start a conversation.
