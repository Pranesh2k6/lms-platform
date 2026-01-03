#!/bin/bash

# Ollama + Llama 3.1:8b Setup Script for LMS
# This script automates the Ollama installation and setup

set -e  # Exit on error

echo "=================================="
echo "LMS AI Agent - Ollama Setup"
echo "=================================="
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
else
    OS="Unknown"
fi

echo "Detected OS: $OS"
echo ""

# Check if Ollama is already installed
if command -v ollama &> /dev/null; then
    echo "✓ Ollama is already installed"
    OLLAMA_VERSION=$(ollama --version 2>/dev/null || echo "unknown")
    echo "  Version: $OLLAMA_VERSION"
else
    echo "✗ Ollama not found. Installing..."
    echo ""

    if [[ "$OS" == "macOS" ]]; then
        # Check if Homebrew is installed
        if command -v brew &> /dev/null; then
            echo "Installing Ollama via Homebrew..."
            brew install ollama
        else
            echo "Homebrew not found. Please install Homebrew first:"
            echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OS" == "Linux" ]]; then
        echo "Installing Ollama via curl..."
        curl -fsSL https://ollama.com/install.sh | sh
    else
        echo "Unsupported OS. Please install Ollama manually:"
        echo "  https://ollama.com/download"
        exit 1
    fi
fi

echo ""
echo "=================================="
echo "Step 1: Starting Ollama Server"
echo "=================================="
echo ""

# Check if Ollama is already running
if curl -s http://localhost:11434 > /dev/null 2>&1; then
    echo "✓ Ollama server is already running"
else
    echo "Starting Ollama server..."
    if [[ "$OS" == "macOS" ]]; then
        # On macOS, Ollama may run as a background service
        ollama serve &> /dev/null &
        sleep 2
    else
        # On Linux, start in background
        nohup ollama serve &> /dev/null &
        sleep 2
    fi

    # Verify it started
    if curl -s http://localhost:11434 > /dev/null 2>&1; then
        echo "✓ Ollama server started successfully"
    else
        echo "✗ Failed to start Ollama server"
        echo "  Try running manually: ollama serve"
        exit 1
    fi
fi

echo ""
echo "=================================="
echo "Step 2: Checking for Llama 3.1:8b"
echo "=================================="
echo ""

# Check if model is already downloaded
if ollama list | grep -q "llama3.1:8b"; then
    echo "✓ Llama 3.1:8b is already downloaded"
else
    echo "Downloading Llama 3.1:8b model..."
    echo "This will download ~4.7GB. Please be patient..."
    echo ""
    ollama pull llama3.1:8b
    echo ""
    echo "✓ Model downloaded successfully"
fi

echo ""
echo "=================================="
echo "Step 3: Testing the Model"
echo "=================================="
echo ""

echo "Running a test query..."
TEST_RESPONSE=$(ollama run llama3.1:8b "Say 'Hello, I am ready to help with your LMS!' in one sentence." 2>&1 | head -n 1)
echo "Response: $TEST_RESPONSE"

echo ""
echo "=================================="
echo "Setup Complete! 🎉"
echo "=================================="
echo ""
echo "Your LMS AI Agent is now ready to use with Ollama!"
echo ""
echo "Next steps:"
echo "1. Make sure your backend is running:"
echo "   cd backend && npm run dev"
echo ""
echo "2. Make sure your frontend is running:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Log in as Admin or Professor"
echo ""
echo "4. Click the AI Agent button (bottom-right)"
echo ""
echo "5. Try commands like:"
echo "   - 'Create a course called Advanced Java with code CS301'"
echo "   - 'Show me all students'"
echo "   - 'Add a student named John Doe'"
echo ""
echo "Configuration:"
echo "  Provider: Ollama (zero-cost, local)"
echo "  Model: llama3.1:8b"
echo "  Host: http://localhost:11434"
echo ""
echo "To stop Ollama later: pkill ollama"
echo "To restart Ollama: ollama serve"
echo ""
echo "For more info, see: OLLAMA_SETUP.md"
echo "=================================="
