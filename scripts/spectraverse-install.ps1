# Spectraverse Setup Script — Windows (PowerShell)
# Sets up Ollama and the local database (sqld) in Docker
# Usage: irm <gist-url> | iex
#    or: powershell -ExecutionPolicy Bypass -File spectraverse-install.ps1

$ErrorActionPreference = "Stop"

$ContainerName     = "ollama"
$OllamaPort        = 11434
$SqldContainerName = "spectraverse-db"
$SqldPort          = 8080
$DataDir           = "$env:USERPROFILE\.spectraverse"

function Print-Banner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   " -ForegroundColor Cyan -NoNewline
    Write-Host "Spectraverse Setup" -ForegroundColor Blue -NoNewline
    Write-Host "   │   Windows      ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Print-Step($msg)    { Write-Host "➜ $msg" -ForegroundColor Yellow }
function Print-Success($msg) { Write-Host "✓ $msg" -ForegroundColor Green }
function Print-Error($msg)   { Write-Host "✗ $msg" -ForegroundColor Red }

function Check-Docker {
    Print-Step "Checking Docker installation..."

    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Print-Error "Docker is not installed"
        Write-Host ""
        Write-Host "  Install Docker Desktop from:"
        Write-Host "  https://www.docker.com/products/docker-desktop/"
        exit 1
    }
    Print-Success "Docker is installed"

    Print-Step "Checking Docker daemon..."
    $dockerRunning = $false
    try { docker info 2>&1 | Out-Null; $dockerRunning = $true } catch {}

    if (-not $dockerRunning) {
        Print-Step "Starting Docker Desktop..."

        $dockerExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        if (Test-Path $dockerExe) {
            Start-Process $dockerExe
        } else {
            Print-Error "Docker Desktop executable not found. Please start Docker Desktop manually and re-run."
            exit 1
        }

        $maxRetries = 30
        $count = 0
        while ($count -lt $maxRetries) {
            Start-Sleep -Seconds 2
            try { docker info 2>&1 | Out-Null; Print-Success "Docker daemon is running"; return } catch {}
            $count++
        }

        Print-Error "Docker Desktop failed to start within 60s"
        exit 1
    }

    Print-Success "Docker daemon is running"
}

function Setup-Sqld {
    Print-Step "Setting up database container..."

    New-Item -ItemType Directory -Force -Path "$DataDir\db" | Out-Null

    $existing = docker ps -a --format "{{.Names}}" 2>&1 | Where-Object { $_ -eq $SqldContainerName }
    if ($existing) {
        Write-Host "  Removing existing database container..." -ForegroundColor DarkGray
        docker stop $SqldContainerName 2>&1 | Out-Null
        docker rm   $SqldContainerName 2>&1 | Out-Null
    }

    Write-Host "  Pulling sqld image..." -ForegroundColor DarkGray
    docker pull ghcr.io/tursodatabase/libsql-server:latest

    # Docker Desktop on Windows accepts forward-slash paths for volume mounts
    $dbPath = ($DataDir -replace "\\", "/") + "/db"
    docker run -d `
        --name $SqldContainerName `
        -p "${SqldPort}:8080" `
        -v "${dbPath}:/var/lib/sqld" `
        --restart unless-stopped `
        ghcr.io/tursodatabase/libsql-server:latest | Out-Null

    Print-Success "Database container started"
}

function Wait-ForSqld {
    Print-Step "Waiting for database to initialize..."

    $body = '{"requests": [{"type": "close"}]}'
    $maxRetries = 30
    $count = 0

    while ($count -lt $maxRetries) {
        try {
            Invoke-RestMethod -Method Post `
                -Uri "http://localhost:${SqldPort}/v2/pipeline" `
                -ContentType "application/json" `
                -Body $body | Out-Null
            Print-Success "Database is ready"
            return
        } catch {}
        $count++
        Start-Sleep -Seconds 2
    }

    Print-Error "Database failed to start"
    exit 1
}

function Run-Migrations {
    Print-Step "Running database migrations..."

    $body = @'
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
'@

    Invoke-RestMethod -Method Post `
        -Uri "http://localhost:${SqldPort}/v2/pipeline" `
        -ContentType "application/json" `
        -Body $body | Out-Null

    Print-Success "Database schema ready"
}

function Setup-Ollama {
    Print-Step "Setting up Ollama container..."

    $existing = docker ps -a --format "{{.Names}}" 2>&1 | Where-Object { $_ -eq $ContainerName }
    if ($existing) {
        Write-Host "  Removing existing container..." -ForegroundColor DarkGray
        docker stop $ContainerName 2>&1 | Out-Null
        docker rm   $ContainerName 2>&1 | Out-Null
    }

    Write-Host "  Pulling Ollama image..." -ForegroundColor DarkGray
    docker pull ollama/ollama:latest

    Write-Host "  Starting container with CORS='*'..." -ForegroundColor DarkGray
    docker run -d `
        --name $ContainerName `
        -p "${OllamaPort}:${OllamaPort}" `
        -e OLLAMA_ORIGINS="*" `
        -v ollama_data:/root/.ollama `
        --restart unless-stopped `
        ollama/ollama:latest | Out-Null

    Print-Success "Ollama container started"
}

function Wait-ForOllama {
    Print-Step "Waiting for Ollama to initialize..."

    $maxRetries = 30
    $count = 0

    while ($count -lt $maxRetries) {
        try {
            Invoke-RestMethod -Uri "http://localhost:${OllamaPort}/api/tags" | Out-Null
            Print-Success "Ollama is ready"
            return
        } catch {}
        $count++
        Start-Sleep -Seconds 2
    }

    Print-Error "Ollama failed to start"
    exit 1
}

function Print-Summary {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║         Installation Complete!            ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Ollama API  " -ForegroundColor Blue -NoNewline; Write-Host "http://localhost:${OllamaPort}"
    Write-Host "  Database    " -ForegroundColor Blue -NoNewline; Write-Host "http://localhost:${SqldPort}"
    Write-Host "  Data        " -ForegroundColor Blue -NoNewline; Write-Host "$DataDir\db"
    Write-Host "  CORS        " -ForegroundColor Blue -NoNewline; Write-Host "Enabled for all origins (*)"
    Write-Host "  Model       " -ForegroundColor Blue -NoNewline; Write-Host "gemma4"
    Write-Host ""
    Write-Host "  Commands" -ForegroundColor Yellow
    Write-Host "  ────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "  Test Ollama   curl http://localhost:${OllamaPort}/api/tags"
    Write-Host "  Chat          docker exec -it $ContainerName ollama run gemma4"
    Write-Host "  List models   docker exec $ContainerName ollama list"
    Write-Host "  Pull more     docker exec $ContainerName ollama pull <model>"
    Write-Host "  Stop all      docker stop $ContainerName $SqldContainerName"
    Write-Host "  Start all     docker start $ContainerName $SqldContainerName"
    Write-Host ""
}

# Main
Print-Banner
Check-Docker

Write-Host ""

Setup-Sqld
Wait-ForSqld
Run-Migrations

Setup-Ollama
Wait-ForOllama

Print-Step "Pulling gemma4..."
docker exec $ContainerName ollama pull gemma4
Print-Success "gemma4 installed"

Print-Summary
