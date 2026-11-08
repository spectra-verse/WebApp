# Changelog

All notable changes to Spectraverse. Model-support updates are reviewed weekly against the [Ollama library](https://ollama.com/library).

## 2026-11-08

### Models
- New single source of truth for supported models: `lib/models/curated-models.json`, used by the landing page, the FAQ, and **Settings → Install New Models**.
- **Added:** Qwen 3.8, Qwen 3.6, Qwen 3.5, gpt-oss (20B), MiMo V2.6, Qwen3 Coder, Qwen3 VL, Phi-4, Llama 3.2 (3B), LFM3 (1.7B).
- **Kept:** Gemma 4 (default), DeepSeek R1, DeepSeek Coder V2.
- **Removed from the curated list:** Llama 4 (67 GB default download — too large for most laptops), Qwen 2.5 and Phi-3 (superseded by Qwen 3.5 and Phi-4). They can still be installed manually with `ollama pull`.

### Install scripts
- macOS/Linux scripts now let you pick models from a numbered menu (Enter = Gemma 4), or set `SPECTRAVERSE_MODELS="gemma4 qwen3.5"` to skip the menu. Windows supports `$env:SPECTRAVERSE_MODELS`.
- **Fix (macOS native):** if the Ollama menu-bar app was already running, the script left CORS disabled, so the website could not reach Ollama (HTTP 403). The app ignores `OLLAMA_ORIGINS`, so the script now quits it and runs `ollama serve` with CORS enabled, then verifies CORS and warns if it is still off.
- Database migration step no longer dumps raw JSON to the terminal.

### App
- **Fix:** "Install New Models" never showed models as *Installed*, because Ollama reports names with a tag (`gemma4:latest`). Names are now compared with the tag normalized.
- Install command now has a **Native Ollama / Docker** toggle. It previously always showed the Docker command, which fails for macOS native installs.
- Model picker shows category, download size, and capabilities.

### Website
- Landing page lists all supported models with the date the list was last updated.
- FAQ answers mention current models, read from the shared list.
- Replaced leftover template text on the mobile hero ("Highly customizable components…").
- Install step descriptions now mention model choice.

### Docs
- README: fixed the database port (8190, not 8080), the clone URL, and documented all three install scripts, model selection, a CORS troubleshooting step, and the new Supported Models section.
