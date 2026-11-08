#!/bin/bash

# Spectraverse Setup Script — macOS/Linux
# Sets up Ollama and the local database (sqld) in Docker
# Usage: curl -fsSL <gist-url> | bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

CONTAINER_NAME="ollama"
OLLAMA_PORT=11434
SQLD_CONTAINER_NAME="spectraverse-db"
SQLD_PORT=8190
DATA_DIR="$HOME/.spectraverse"

print_banner() {
  echo ""
  echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║   ${NC}${BLUE}Spectraverse Setup${NC}${CYAN}   │   ${NC}${DIM}$(uname -s)${NC}${CYAN}      ║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
  echo ""
}

# Curated models offered by the installer (keep in sync with lib/models/curated-models.json)
DEFAULT_MODELS="gemma4"
MODEL_MENU=(
  "gemma4|Gemma 4 (Google) — general, vision|6.6 GB"
  "qwen3.5|Qwen 3.5 (Alibaba) — general, vision|6.6 GB"
  "qwen3.8|Qwen 3.8 (Alibaba) — newest Qwen, strong all-round|17.7 GB"
  "gpt-oss|gpt-oss 20B (OpenAI) — reasoning|13.8 GB"
  "deepseek-r1|DeepSeek R1 — reasoning|5.2 GB"
  "mimo-v2.6|MiMo V2.6 (Xiaomi) — coding & agents|6.6 GB"
  "qwen3-coder|Qwen3 Coder — coding|18.6 GB"
  "qwen3-vl|Qwen3 VL — vision|6.2 GB"
  "llama3.2|Llama 3.2 3B (Meta) — small & fast|2.0 GB"
  "lfm3|LFM3 1.7B (Liquid AI) — tiny, runs anywhere|1.1 GB"
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
    printf "  ${CYAN}%2d${NC}) %-50s ${DIM}%s${NC}\n" "$i" "$desc" "$size"
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
  echo -e "  ${CYAN}•${NC} ${BLUE}Ollama${NC}           AI model runtime  (Docker container)"
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

# Check Docker installation
check_docker() {
  print_step "Checking Docker installation..."

  if ! command -v docker &>/dev/null; then
    print_error "Docker is not installed"
    echo ""
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
    if [[ "$(uname -s)" == "Darwin" ]]; then
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
    else
      print_error "Docker daemon is not running"
      echo ""
      echo "  Please start Docker and try again."
      exit 1
    fi
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

# Setup Ollama container
setup_ollama() {
  print_step "Setting up Ollama container..."

  if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "  ${DIM}Removing existing container...${NC}"
    docker stop ${CONTAINER_NAME} >/dev/null 2>&1 || true
    docker rm ${CONTAINER_NAME} >/dev/null 2>&1 || true
  fi

  echo -e "  ${DIM}Pulling Ollama image...${NC}"
  docker pull ollama/ollama:latest

  echo -e "  ${DIM}Starting container with CORS='*'...${NC}"
  docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${OLLAMA_PORT}:${OLLAMA_PORT} \
    -e OLLAMA_ORIGINS="*" \
    -v ollama_data:/root/.ollama \
    --restart unless-stopped \
    ollama/ollama:latest >/dev/null

  print_success "Ollama container started"
}

# Wait for Ollama to be ready
wait_for_ollama() {
  print_step "Waiting for Ollama to initialize..."

  local max_retries=30
  local count=0

  while [ $count -lt $max_retries ]; do
    if curl -s http://localhost:${OLLAMA_PORT}/api/tags >/dev/null 2>&1; then
      print_success "Ollama is ready"
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
  echo -e "  ${BLUE}Ollama API${NC}     http://localhost:${OLLAMA_PORT}"
  echo -e "  ${BLUE}Database${NC}       http://localhost:${SQLD_PORT}"
  echo -e "  ${BLUE}Data${NC}           ${DATA_DIR}/db"
  echo -e "  ${BLUE}CORS${NC}           Enabled for all origins (*)"
  echo -e "  ${BLUE}Models${NC}         ${SELECTED_MODELS}"
  echo ""
  echo -e "  ${YELLOW}Commands${NC}"
  echo -e "  ${DIM}────────────────────────────────────────────${NC}"
  echo "  Test Ollama   curl http://localhost:${OLLAMA_PORT}/api/tags"
  echo "  Test DB       curl -s -X POST http://localhost:${SQLD_PORT}/v2/pipeline -H 'Content-Type: application/json' -d '{\"requests\":[{\"type\":\"close\"}]}'"
  echo "  Chat          docker exec -it ${CONTAINER_NAME} ollama run ${SELECTED_MODELS%% *}"
  echo "  List models   docker exec ${CONTAINER_NAME} ollama list"
  echo "  Pull more     docker exec ${CONTAINER_NAME} ollama pull <model>"
  echo "  Stop all      docker stop ${CONTAINER_NAME} ${SQLD_CONTAINER_NAME}"
  echo "  Start all     docker start ${CONTAINER_NAME} ${SQLD_CONTAINER_NAME}"
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

  setup_ollama
  wait_for_ollama

  for model in $SELECTED_MODELS; do
    print_step "Pulling $model..."
    docker exec ${CONTAINER_NAME} ollama pull "$model"
    print_success "$model installed"
  done

  print_summary
}

main "$@"
