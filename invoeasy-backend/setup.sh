#!/bin/bash
# InvoEasy Backend Setup Script
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== InvoEasy Backend Setup ==="

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate
source venv/bin/activate
echo "Virtual environment activated: $(which python3)"

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo "=== Setup Complete ==="