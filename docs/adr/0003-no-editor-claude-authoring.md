# No in-app editor; author Setups as JSON with Claude

Setups (positions + Coached lines + reasoning) are authored as typed JSON in the repo,
generated conversationally with Claude in the vault and reviewed by Carl in-app. We do
**not** build a tap-place in-app editor for the MVP.

## Why this is worth recording

Paths set the opposite precedent — it has a tap-place editor, and its design notes warn
"authoring friction kills the catalogue." A reader who knows Paths will expect an editor
here too.

- **Paths needed precise geometry** — its mechanic is a cue-ball *path*, so millimetres
  matter, and only tap-placing gets them right. **Line's answer is an *order*, not a
  path.** Ball positions only need to be a plausible, readable situation, so precise
  placement — and therefore an editor — buys little.
- The hard part of Line's content is the **Coached line + reasoning** (prose), which is
  exactly what Carl and Claude produce well together in the vault.
- Building an editor is a whole second surface (Paths spent a milestone on its one). We
  build the player, not the editor.

## Consequences

- If Claude-assisted JSON authoring proves too slow in practice, the fallback is to build
  the tap editor then — not to pre-build it now.
- Setups need a runtime schema validator so hand/Claude-authored JSON fails loudly rather
  than rendering a broken table.
