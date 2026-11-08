# Changelog

All notable changes to Spectraverse. Model-support updates are reviewed weekly against the [Ollama library](https://ollama.com/library).

## 2026-11-08 — Latest models for MacBook Pro

### Models
- Curated list rebuilt around **current, local models that run well on Apple Silicon MacBooks**. Each model now lists the minimum Mac memory it needs (`minMemoryGB`) and the minimum Ollama version (`requiresOllama`).
- **8 GB+:** Bonsai 2 (Prism ML, ternary 9B), Nemotron 3 Nano 4B (NVIDIA), LFM3 1.7B (Liquid AI).
- **16 GB+:** Gemma 4 (Google, default), Qwen 3.5 9B (Alibaba), Ornith 1.5 9B (Ornith), Ministral 3 8B (Mistral AI), Granite 4.2 8B (IBM), LFM2.5 8B (Liquid AI), MiMo V2.6 (Xiaomi).
- **24 GB+:** gpt-oss 20B (OpenAI). **32 GB+:** Qwen 3.8 27B (Alibaba), Muse Glimmer 30B (Meta). **48 GB+:** Laguna XS 2.1 (Poolside), Flint 40B MoE (Recursive).
- **Removed (outdated or superseded):** DeepSeek R1 and DeepSeek Coder V2 (DeepSeek's newer models are cloud-only), Phi-4 (no newer local Phi), Llama 3.2 (Meta's current open model is Muse Glimmer), Qwen3 Coder, Qwen3 VL and Qwen 3.6 (superseded by Qwen 3.5/3.8, which include vision).
- New providers: Ornith, Mistral AI, IBM, Prism ML, NVIDIA, Meta (Muse), Poolside, Recursive.
- Every curated model supports tool calling, in line with the product goal of a local coding agent and assistant.

### Install scripts
- macOS native: checks the Ollama version and **auto-updates** to 0.40.15+ (Homebrew formula/cask, or the signed Ollama.app download) — newer models refuse to download on older Ollama.
- A model that fails to download no longer aborts the whole install; it's skipped and listed at the end.
- Model menus show provider and minimum Mac memory.

### App & website
- Model picker shows "Mac N GB+" and the required Ollama version.
- Landing page model chips show the provider; hero copy now describes Spectraverse as a private AI assistant and coding agent on local models.
- README: vision statement, Mac-memory model table, and Ollama version guidance.

### Tested on a 24 GB M4 MacBook Pro
- Bonsai 2: 33 tok/s · Gemma 4: 19 tok/s.
- LFM3 and MiMo V2.6 need Ollama 0.40.13+ / 0.40.15+ (machine has 0.40.9; the auto-update step was not run here).

## 2026-11-08 — Initial model refresh

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
