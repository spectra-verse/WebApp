#!/bin/bash

# Spectraverse Setup Script — macOS (Native Ollama)
# Installs Ollama natively for Metal GPU acceleration; sqld runs in Docker
# Usage: curl -fsSL <url> | bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

OLLAMA_PORT=11434
SQLD_CONTAINER_NAME="spectraverse-db"
SQLD_PORT=8190
DATA_DIR="$HOME/.spectraverse"
# Newest curated models need a recent Ollama (keep in sync with minOllamaVersion
# in lib/models/curated-models.json)
MIN_OLLAMA_VERSION="0.40.15"

print_banner() {
  echo ""
  echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║   ${NC}${BLUE}Spectraverse Setup${NC}${CYAN}   │   ${NC}${DIM}macOS Native${NC}${CYAN}   ║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
  echo ""
}

# Curated models offered by the installer (keep in sync with lib/models/curated-models.json)
DEFAULT_MODELS="gemma4"
MODEL_MENU=(
  "gemma4|Gemma 4 (Google) — general, vision · Mac 16GB+|6.6 GB"
  "qwen3.5|Qwen 3.5 9B (Alibaba) — general, vision · Mac 16GB+|6.6 GB"
  "ornith-1.5:9b|Ornith 1.5 9B (Ornith) — general, vision · Mac 16GB+|6.6 GB"
  "ministral-3:8b|Ministral 3 8B (Mistral AI) — general, vision · Mac 16GB+|6.0 GB"
  "granite4.2:8b|Granite 4.2 8B (IBM) — general, tools · Mac 16GB+|5.3 GB"
  "lfm2.5:8b|LFM2.5 8B (Liquid AI) — fast general · Mac 16GB+|5.2 GB"
  "mimo-v2.6|MiMo V2.6 9B (Xiaomi) — coding & agents · Mac 16GB+|6.6 GB"
  "bonsai-2|Bonsai 2 9B ternary (Prism ML) — small, vision · Mac 8GB+|3.2 GB"
  "nemotron-3-nano:4b|Nemotron 3 Nano 4B (NVIDIA) — small · Mac 8GB+|2.8 GB"
  "lfm3|LFM3 1.7B (Liquid AI) — tiny · Mac 8GB+|1.1 GB"
  "gpt-oss:20b|gpt-oss 20B (OpenAI) — reasoning · Mac 24GB+|13.8 GB"
  "qwen3.8|Qwen 3.8 27B (Alibaba) — strongest all-round · Mac 32GB+|17.7 GB"
  "muse-glimmer|Muse Glimmer 30B (Meta) — agents, vision · Mac 32GB+|18.2 GB"
  "laguna-xs-2.1|Laguna XS 2.1 (Poolside) — coding · Mac 48GB+|20.3 GB"
  "flint|Flint 40B MoE (Recursive) — coding agents · Mac 48GB+|22.9 GB"
)

# Decide which models to pull.
# Priority: SPECTRAVERSE_MODELS env var (space/comma separated) > interactive menu > default.
# The menu reads from /dev/tty so it also works with `curl ... | bash`.
choose_models() {
  if [ -n "${SPECTRAVERSE_MODELS:-}" ]; then
    SELECTED_MODELS=$(echo "$SPECTRAVERSE_MODELS" | tr ',' ' ')
    return 0
  fi

  SELECTED_MODELS="$DEFAULT_MODELS"
  if ! { exec 3</dev/tty; } 2>/dev/null; then
    return 0
  fi

  echo -e "  ${YELLOW}Choose models to download${NC} ${DIM}(e.g. 1 5 9 — press Enter for Gemma 4)${NC}"
  local i=1
  for entry in "${MODEL_MENU[@]}"; do
    IFS='|' read -r name desc size <<< "$entry"
    printf "  ${CYAN}%2d${NC}) %-62s ${DIM}%s${NC}\n" "$i" "$desc" "$size"
    i=$((i + 1))
  done
  printf "  > "
  local answer=""
  read -r answer <&3 || true
  exec 3<&-

  if [ -n "$answer" ]; then
    local picked=""
    for n in $(echo "$answer" | tr ',' ' '); do
      if [[ "$n" =~ ^[0-9]+$ ]] && [ "$n" -ge 1 ] && [ "$n" -le "${#MODEL_MENU[@]}" ]; then
        IFS='|' read -r name _ <<< "${MODEL_MENU[$((n - 1))]}"
        picked="$picked $name"
      fi
    done
    if [ -n "$picked" ]; then
      SELECTED_MODELS="${picked# }"
    fi
  fi
  echo ""
}

print_install_info() {
  echo -e "  This script will install the following on your local system:"
  echo ""
  echo -e "  ${CYAN}•${NC} ${BLUE}Ollama${NC}           AI model runtime  (native macOS — uses Metal GPU)"
  echo -e "  ${CYAN}•${NC} ${BLUE}AI models${NC}        Gemma 4 by default — or pick others from a list"
  echo -e "  ${CYAN}•${NC} ${BLUE}sqld${NC}             Local database     (Docker container)"
  echo ""
}

print_step() {
  echo -e "${YELLOW}➜${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

cleanup_on_error() {
  echo ""
  print_error "Installation failed."
  exit 1
}

trap cleanup_on_error ERR

# Check Docker installation (needed for sqld)
check_docker() {
  print_step "Checking Docker installation..."

  if ! command -v docker &>/dev/null; then
    print_error "Docker is not installed"
    echo ""
    echo "  Docker is required for the local database (sqld)."
    echo "  Install Docker Desktop from:"
    echo "  https://www.docker.com/products/docker-desktop/"
    echo ""
    echo "  Or via Homebrew:"
    echo "  brew install --cask docker"
    exit 1
  fi
  print_success "Docker is installed"

  print_step "Checking Docker daemon..."
  if ! docker info &>/dev/null 2>&1; then
    print_step "Starting Docker Desktop..."
    open -a Docker

    local max_retries=30
    local count=0
    while [ $count -lt $max_retries ]; do
      if docker info &>/dev/null 2>&1; then
        print_success "Docker daemon is running"
        return 0
      fi
      count=$((count + 1))
      sleep 2
    done

    print_error "Docker Desktop failed to start within 60s"
    exit 1
  fi
  print_success "Docker daemon is running"
}

# Setup sqld (local database) container
setup_sqld() {
  print_step "Setting up database container..."

  mkdir -p "${DATA_DIR}/db"

  if docker ps -a --format '{{.Names}}' | grep -q "^${SQLD_CONTAINER_NAME}$"; then
    echo -e "  ${DIM}Removing existing database container...${NC}"
    docker stop ${SQLD_CONTAINER_NAME} >/dev/null 2>&1 || true
    docker rm ${SQLD_CONTAINER_NAME} >/dev/null 2>&1 || true
  fi

  echo -e "  ${DIM}Pulling sqld image...${NC}"
  docker pull ghcr.io/tursodatabase/libsql-server:latest

  docker run -d \
    --name ${SQLD_CONTAINER_NAME} \
    -p ${SQLD_PORT}:8080 \
    -v "${DATA_DIR}/db:/var/lib/sqld" \
    --restart unless-stopped \
    ghcr.io/tursodatabase/libsql-server:latest >/dev/null

  print_success "Database container started"
}

# Wait for sqld HTTP API to be ready
wait_for_sqld() {
  print_step "Waiting for database to initialize..."

  local max_retries=30
  local count=0

  while [ $count -lt $max_retries ]; do
    if curl -s -X POST "http://localhost:${SQLD_PORT}/v2/pipeline" \
      -H "Content-Type: application/json" \
      -d '{"requests": [{"type": "close"}]}' -o /dev/null 2>/dev/null; then
      print_success "Database is ready"
      return 0
    fi
    count=$((count + 1))
    sleep 2
  done

  print_error "Database failed to start"
  exit 1
}

# Run SQL migrations via sqld HTTP API
# Uses IF NOT EXISTS on all statements — safe to re-run
run_migrations() {
  print_step "Running database migrations..."

  curl -sf -o /dev/null -X POST "http://localhost:${SQLD_PORT}/v2/pipeline" \
    -H "Content-Type: application/json" \
    -d @- <<'MIGRATION'
{
  "requests": [
    {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS `user` (`id` text PRIMARY KEY NOT NULL, `name` text, `email` text, `created_at` integer NOT NULL, `updated_at` integer NOT NULL)"}},
    {"type": "execute", "stmt": {"sql": "CREATE UNIQUE INDEX IF NOT EXISTS `user_email_unique` ON `user` (`email`)"}},
    {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS `user_settings` (`id` text PRIMARY KEY NOT NULL, `user_id` text NOT NULL, `ollama_url` text DEFAULT 'http://localhost:11434/v1' NOT NULL, `created_at` integer NOT NULL, `updated_at` integer NOT NULL, FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade)"}},
    {"type": "execute", "stmt": {"sql": "CREATE UNIQUE INDEX IF NOT EXISTS `user_settings_user_id_unique` ON `user_settings` (`user_id`)"}},
    {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS `conversations` (`id` text PRIMARY KEY NOT NULL, `user_id` text NOT NULL, `name` text DEFAULT '' NOT NULL, `model` text, `created_at` integer NOT NULL, `updated_at` integer NOT NULL, FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade)"}},
    {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS `messages` (`id` text PRIMARY KEY NOT NULL, `conversation_id` text NOT NULL, `user_id` text NOT NULL, `role` text NOT NULL, `content` text NOT NULL, `created_at` integer NOT NULL, FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade, FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade)"}},
    {"type": "close"}
  ]
}
MIGRATION

  print_success "Database schema ready"
}

# Install Ollama natively (skip if already installed)
install_ollama_native() {
  print_step "Setting up Ollama (native)..."

  if command -v ollama &>/dev/null; then
    print_success "Ollama already installed"
    return 0
  fi

  if command -v brew &>/dev/null; then
    echo -e "  ${DIM}Installing via Homebrew...${NC}"
    brew install ollama
  else
    echo -e "  ${DIM}Installing via curl...${NC}"
    curl -fsSL https://ollama.com/install.sh | sh
  fi

  print_success "Ollama installed"
}

# Returns 0 if version $1 < version $2
version_lt() {
  [ "$1" != "$2" ] && [ "$(printf '%s\n%s\n' "$1" "$2" | sort -V | head -1)" = "$1" ]
}

ollama_version() {
  ollama -v 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | tail -1
}

# Newer models refuse to download on older Ollama, so upgrade when needed
ensure_ollama_version() {
  local current
  current=$(ollama_version)
  if [ -z "$current" ] || ! version_lt "$current" "$MIN_OLLAMA_VERSION"; then
    print_success "Ollama ${current} is up to date"
    return 0
  fi

  print_step "Updating Ollama ${current} → ${MIN_OLLAMA_VERSION}+ (needed for the latest models)..."
  if command -v brew &>/dev/null && brew list --formula ollama &>/dev/null; then
    brew upgrade ollama || true
  elif command -v brew &>/dev/null && brew list --cask ollama-app &>/dev/null; then
    brew upgrade --cask ollama-app || true
  elif [ -d "/Applications/Ollama.app" ]; then
    local tmp
    tmp=$(mktemp -d)
    if curl -fsSL -o "${tmp}/Ollama-darwin.zip" https://ollama.com/download/Ollama-darwin.zip \
      && ditto -x -k "${tmp}/Ollama-darwin.zip" "${tmp}" \
      && codesign --verify --deep --strict "${tmp}/Ollama.app" 2>/dev/null; then
      osascript -e 'tell application "Ollama" to quit' >/dev/null 2>&1 || true
      pkill -x Ollama >/dev/null 2>&1 || true
      pkill -f "ollama serve" >/dev/null 2>&1 || true
      sleep 2
      rm -rf "/Applications/Ollama.app" && ditto "${tmp}/Ollama.app" "/Applications/Ollama.app" || true
    fi
    rm -rf "${tmp}"
  fi

  current=$(ollama_version)
  if version_lt "${current:-0.0.0}" "$MIN_OLLAMA_VERSION"; then
    echo -e "  ${YELLOW}!${NC} Couldn't update Ollama automatically (still ${current})."
    echo -e "  ${DIM}Update it from the Ollama menu-bar icon or https://ollama.com/download — some newer models won't download until then.${NC}"
  else
    # Make sure the new binary is the one serving
    pkill -x Ollama >/dev/null 2>&1 || true
    pkill -f "ollama serve" >/dev/null 2>&1 || true
    sleep 2
    print_success "Ollama updated to ${current}"
  fi
}

# Returns 0 if Ollama accepts browser requests from another origin (CORS enabled)
ollama_cors_ok() {
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: https://spectraverseinc.com" \
    http://localhost:${OLLAMA_PORT}/api/tags 2>/dev/null || true)
  [ "$code" = "200" ]
}

# Start Ollama server if not already running
start_ollama_native() {
  print_step "Starting Ollama server..."

  export OLLAMA_ORIGINS="*"

  if curl -s http://localhost:${OLLAMA_PORT}/api/tags >/dev/null 2>&1; then
    if ollama_cors_ok; then
      print_success "Ollama is already running with CORS enabled"
      return 0
    fi

    # Running without CORS (usually the Ollama menu-bar app, which starts its
    # server with its own settings and ignores OLLAMA_ORIGINS). Stop it and run
    # the server directly with CORS enabled so the browser app can connect.
    echo -e "  ${DIM}Ollama is running without CORS — restarting it with CORS enabled...${NC}"
    # Quit the menu-bar app first, otherwise it immediately respawns its own server
    osascript -e 'tell application "Ollama" to quit' >/dev/null 2>&1 || true
    pkill -x Ollama >/dev/null 2>&1 || true
    sleep 2
    pkill -f "ollama serve" >/dev/null 2>&1 || true
    local waited=0
    while curl -s http://localhost:${OLLAMA_PORT}/api/tags >/dev/null 2>&1 && [ $waited -lt 15 ]; do
      sleep 1
      waited=$((waited + 1))
    done
  fi

  nohup ollama serve >"${DATA_DIR}/ollama.log" 2>&1 &
  print_success "Ollama server started"
}

# Wait for Ollama to be ready
wait_for_ollama() {
  print_step "Waiting for Ollama to initialize..."

  local max_retries=30
  local count=0

  while [ $count -lt $max_retries ]; do
    if curl -s http://localhost:${OLLAMA_PORT}/api/tags >/dev/null 2>&1; then
      print_success "Ollama is ready"
      if ! ollama_cors_ok; then
        echo -e "  ${YELLOW}!${NC} Ollama is up but CORS is not enabled, so the web app can't connect."
        echo -e "  ${DIM}Quit the Ollama app, then run: OLLAMA_ORIGINS=\"*\" ollama serve${NC}"
      fi
      return 0
    fi
    count=$((count + 1))
    sleep 2
  done

  print_error "Ollama failed to start"
  exit 1
}

# Print final summary
print_summary() {
  echo ""
  echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║         Installation Complete! 🎉         ║${NC}"
  echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${BLUE}Ollama API${NC}     http://localhost:${OLLAMA_PORT}  (native)"
  echo -e "  ${BLUE}Database${NC}       http://localhost:${SQLD_PORT}  (Docker)"
  echo -e "  ${BLUE}Data${NC}           ${DATA_DIR}/db"
  echo -e "  ${BLUE}CORS${NC}           Enabled (server log: ${DATA_DIR}/ollama.log)"
  echo -e "  ${BLUE}Models${NC}         ${SELECTED_MODELS}"
  echo ""
  echo -e "  ${YELLOW}Commands${NC}"
  echo -e "  ${DIM}────────────────────────────────────────────${NC}"
  echo "  Test Ollama   curl http://localhost:${OLLAMA_PORT}/api/tags"
  echo "  Test DB       curl -s -X POST http://localhost:${SQLD_PORT}/v2/pipeline -H 'Content-Type: application/json' -d '{\"requests\":[{\"type\":\"close\"}]}'"
  echo "  Chat          ollama run ${SELECTED_MODELS%% *}"
  echo "  List models   ollama list"
  echo "  Pull more     ollama pull <model>"
  echo "  Stop DB       docker stop ${SQLD_CONTAINER_NAME}"
  echo "  Start DB      docker start ${SQLD_CONTAINER_NAME}"
  echo ""
  echo -e "  ${YELLOW}Note:${NC} After a reboot, start Ollama with CORS enabled (instead of the menu-bar app):"
  echo -e "  ${DIM}OLLAMA_ORIGINS=\"*\" ollama serve${NC}   ${DIM}— or just re-run this script${NC}"
  echo ""
}

# Main execution
main() {
  print_banner
  print_install_info
  choose_models

  check_docker

  echo ""

  setup_sqld
  wait_for_sqld
  run_migrations

  install_ollama_native
  ensure_ollama_version
  start_ollama_native
  wait_for_ollama

  for model in $SELECTED_MODELS; do
    print_step "Pulling $model..."
    if ollama pull "$model"; then
      print_success "$model installed"
    else
      FAILED_MODELS="$FAILED_MODELS $model"
      echo -e "  ${YELLOW}!${NC} Couldn't download $model — skipping (try later: ollama pull $model)"
    fi
  done

  if [ -n "${FAILED_MODELS:-}" ]; then
    echo -e "  ${YELLOW}!${NC} Not installed:${FAILED_MODELS}"
  fi
  print_summary
}

main "$@"
