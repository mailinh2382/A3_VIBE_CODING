#!/bin/bash
# Verification script for InvoEasy Backend
source /Users/kimberly/Downloads/A3_VIBE_CODING/invoeasy-backend/venv/bin/activate
cd /Users/kimberly/Downloads/A3_VIBE_CODING/invoeasy-backend

echo "=== 1. Testing Database Connection ==="
python test_database_connection.py
echo "EXIT_CODE=$?"

echo ""
echo "=== 2. Initializing Database ==="
python database.py
echo "EXIT_CODE=$?"

echo ""
echo "=== 3. Checking Tables ==="
python check_tables.py
echo "EXIT_CODE=$?"

echo ""
echo "=== ALL TESTS COMPLETE ==="