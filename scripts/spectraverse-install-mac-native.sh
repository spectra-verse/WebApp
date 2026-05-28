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

print_banner() {
  echo ""
  echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║   ${NC}${BLUE}Spectraverse Setup${NC}${CYAN}   │   ${NC}${DIM}macOS Native${NC}${CYAN}   ║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
  echo ""
}

print_install_info() {
  echo -e "  This script will install the following on your local system:"
  echo ""
  echo -e "  ${CYAN}•${NC} ${BLUE}Ollama${NC}           AI model runtime  (native macOS — uses Metal GPU)"
  echo -e "  ${CYAN}•${NC} ${BLUE}gemma4${NC}           Google Gemma 4 language model"
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

  curl -sf -X POST "http://localhost:${SQLD_PORT}/v2/pipeline" \
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

# Start Ollama server if not already running
start_ollama_native() {
  print_step "Starting Ollama server..."

  if curl -s http://localhost:${OLLAMA_PORT}/api/tags >/dev/null 2>&1; then
    print_success "Ollama is already running"
    return 0
  fi

  export OLLAMA_ORIGINS="*"
  ollama serve &>/dev/null &
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
  echo -e "  ${BLUE}CORS${NC}           Enabled for this session"
  echo -e "  ${BLUE}Model${NC}          gemma4"
  echo ""
  echo -e "  ${YELLOW}Commands${NC}"
  echo -e "  ${DIM}────────────────────────────────────────────${NC}"
  echo "  Test Ollama   curl http://localhost:${OLLAMA_PORT}/api/tags"
  echo "  Test DB       curl -s -X POST http://localhost:${SQLD_PORT}/v2/pipeline -H 'Content-Type: application/json' -d '{\"requests\":[{\"type\":\"close\"}]}'"
  echo "  Chat          ollama run gemma4"
  echo "  List models   ollama list"
  echo "  Pull more     ollama pull <model>"
  echo "  Stop DB       docker stop ${SQLD_CONTAINER_NAME}"
  echo "  Start DB      docker start ${SQLD_CONTAINER_NAME}"
  echo ""
  echo -e "  ${YELLOW}Note:${NC} To keep CORS enabled across restarts, add this to your shell profile:"
  echo -e "  ${DIM}export OLLAMA_ORIGINS=\"*\"${NC}"
  echo ""
}

# Main execution
main() {
  print_banner
  print_install_info

  check_docker

  echo ""

  setup_sqld
  wait_for_sqld
  run_migrations

  install_ollama_native
  start_ollama_native
  wait_for_ollama

  print_step "Pulling gemma4..."
  ollama pull gemma4
  print_success "gemma4 installed"

  print_summary
}

main "$@"
