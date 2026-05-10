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
SQLD_PORT=8080
DATA_DIR="$HOME/.spectraverse"
GUM_VERSION="0.17.0"
GUM_PATH=""

# Get model description (bash 3.2 compatible - no associative arrays)
get_model_description() {
    case "$1" in
        gemma3)         echo "Google's Gemma 3 - Fast & capable (4GB)" ;;
        llama3.2)       echo "Meta's Llama 3.2 - Latest Llama (2GB)" ;;
        mistral)        echo "Mistral 7B - Great all-rounder (4GB)" ;;
        phi3)           echo "Microsoft Phi-3 - Small & efficient (2GB)" ;;
        qwen2.5)        echo "Alibaba Qwen 2.5 - Multilingual (4GB)" ;;
        codellama)      echo "Meta CodeLlama - For coding (4GB)" ;;
        deepseek-coder) echo "DeepSeek Coder - Code specialist (1GB)" ;;
        llava)          echo "LLaVA - Vision model (4GB)" ;;
        mixtral)        echo "Mixtral 8x7B - MoE powerhouse (26GB)" ;;
        llama3.1)       echo "Meta Llama 3.1 8B - Powerful (4GB)" ;;
        *)              echo "Unknown model" ;;
    esac
}

# Ordered list of models for display
MODELS=(
    "gemma3"
    "llama3.2"
    "mistral"
    "phi3"
    "qwen2.5"
    "codellama"
    "deepseek-coder"
    "llava"
    "mixtral"
    "llama3.1"
)

print_banner() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   ${NC}${BLUE}Spectraverse Setup${NC}${CYAN}   │   ${NC}${DIM}$(uname -s)${NC}${CYAN}      ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
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

cleanup() {
    if [[ -n "$GUM_PATH" && "$GUM_PATH" != "gum" ]]; then
        rm -rf "$(dirname "$(dirname "$GUM_PATH")")" 2>/dev/null || true
    fi
}

cleanup_on_error() {
    echo ""
    print_error "Installation failed."
    cleanup
    exit 1
}

trap cleanup_on_error ERR
trap cleanup EXIT

# Download gum if not present
ensure_gum() {
    if command -v gum &> /dev/null; then
        GUM_PATH="gum"
        return 0
    fi

    print_step "Downloading gum TUI toolkit..."

    local arch
    if [[ $(uname -m) == "arm64" || $(uname -m) == "aarch64" ]]; then
        arch="arm64"
    else
        arch="x86_64"
    fi

    local os
    if [[ "$(uname -s)" == "Darwin" ]]; then
        os="Darwin"
    else
        os="Linux"
    fi

    local url="https://github.com/charmbracelet/gum/releases/download/v${GUM_VERSION}/gum_${GUM_VERSION}_${os}_${arch}.tar.gz"
    local tmp_dir=$(mktemp -d)

    if curl -fsSL "$url" | tar -xz -C "$tmp_dir" 2>/dev/null; then
        GUM_PATH="${tmp_dir}/gum_${GUM_VERSION}_${os}_${arch}/gum"
        chmod +x "$GUM_PATH"
        print_success "gum downloaded"
    else
        print_error "Failed to download gum"
        exit 1
    fi
}

# TUI model selection with gum
select_models_gum() {
    echo ""

    local options=()
    for model in "${MODELS[@]}"; do
        options+=("${model} - $(get_model_description "$model")")
    done

    echo -e "${BLUE}Select models to install ${DIM}(space to select, enter to confirm)${NC}"
    echo ""

    local selected
    selected=$("$GUM_PATH" choose --no-limit --height=12 --cursor-prefix="○ " --selected-prefix="◉ " "${options[@]}")

    if [ -z "$selected" ]; then
        print_error "No models selected"
        exit 1
    fi

    SELECTED_MODELS=()
    while IFS= read -r line; do
        model_name=$(echo "$line" | cut -d' ' -f1)
        SELECTED_MODELS+=("$model_name")
    done <<< "$selected"
}

# Check Docker installation
check_docker() {
    print_step "Checking Docker installation..."

    if ! command -v docker &> /dev/null; then
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
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        echo ""
        echo "  Please start Docker Desktop and try again."
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
        docker stop ${SQLD_CONTAINER_NAME} > /dev/null 2>&1 || true
        docker rm ${SQLD_CONTAINER_NAME} > /dev/null 2>&1 || true
    fi

    echo -e "  ${DIM}Pulling sqld image...${NC}"
    docker pull ghcr.io/tursodatabase/libsql-server:latest

    docker run -d \
        --name ${SQLD_CONTAINER_NAME} \
        -p ${SQLD_PORT}:8080 \
        -v "${DATA_DIR}/db:/var/lib/sqld" \
        --restart unless-stopped \
        ghcr.io/tursodatabase/libsql-server:latest > /dev/null

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
        -d @- << 'MIGRATION'
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
        docker stop ${CONTAINER_NAME} > /dev/null 2>&1 || true
        docker rm ${CONTAINER_NAME} > /dev/null 2>&1 || true
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
        ollama/ollama:latest > /dev/null

    print_success "Ollama container started"
}

# Wait for Ollama to be ready
wait_for_ollama() {
    print_step "Waiting for Ollama to initialize..."

    local max_retries=30
    local count=0

    while [ $count -lt $max_retries ]; do
        if curl -s http://localhost:${OLLAMA_PORT}/api/tags > /dev/null 2>&1; then
            print_success "Ollama is ready"
            return 0
        fi
        count=$((count + 1))
        sleep 2
    done

    print_error "Ollama failed to start"
    exit 1
}

# Pull selected models
pull_models() {
    echo ""
    echo -e "${BLUE}Installing ${#SELECTED_MODELS[@]} model(s)...${NC}"
    echo ""

    for model in "${SELECTED_MODELS[@]}"; do
        print_step "Pulling ${model}..."

        "$GUM_PATH" spin --spinner dot --title "Downloading ${model}..." -- \
            docker exec ${CONTAINER_NAME} ollama pull ${model}

        print_success "${model} installed"
    done
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
    echo -e "  ${BLUE}Models${NC}         ${SELECTED_MODELS[*]}"
    echo ""
    echo -e "  ${YELLOW}Commands${NC}"
    echo -e "  ${DIM}────────────────────────────────────────────${NC}"
    echo "  Test Ollama   curl http://localhost:${OLLAMA_PORT}/api/tags"
    echo "  Test DB       curl -s -X POST http://localhost:${SQLD_PORT}/v2/pipeline -H 'Content-Type: application/json' -d '{\"requests\":[{\"type\":\"close\"}]}'"
    echo "  Chat          docker exec -it ${CONTAINER_NAME} ollama run ${SELECTED_MODELS[0]}"
    echo "  List models   docker exec ${CONTAINER_NAME} ollama list"
    echo "  Pull more     docker exec ${CONTAINER_NAME} ollama pull <model>"
    echo "  Stop all      docker stop ${CONTAINER_NAME} ${SQLD_CONTAINER_NAME}"
    echo "  Start all     docker start ${CONTAINER_NAME} ${SQLD_CONTAINER_NAME}"
    echo ""
}

# Main execution
main() {
    print_banner

    check_docker

    echo ""

    ensure_gum

    setup_sqld
    wait_for_sqld
    run_migrations

    # Reattach to tty if running via pipe (curl | bash)
    if [ ! -t 0 ]; then
        exec < /dev/tty
    fi

    select_models_gum

    echo ""
    echo -e "${DIM}Selected: ${SELECTED_MODELS[*]}${NC}"
    echo ""

    "$GUM_PATH" confirm "Proceed with installation?" || exit 0

    echo ""

    setup_ollama
    wait_for_ollama
    pull_models
    print_summary
}

main "$@"
