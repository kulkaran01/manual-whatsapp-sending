#!/bin/bash

# WhatsApp Template Messenger Server
cd "$(dirname "$0")"

echo ""
echo "============================================"
echo "  WhatsApp Template Messenger"
echo "============================================"
echo ""

# Open browser after short delay
(sleep 1 && cmd.exe /c start "http://localhost:8080" 2>/dev/null) &

# Start our custom Python server
python3 server.py

echo ""
echo "============================================"
echo "  Server stopped"
echo "============================================"
read -p "Press Enter to exit..."
