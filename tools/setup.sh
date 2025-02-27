#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Doc Editor development environment...${NC}"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm is not installed. Installing pnpm...${NC}"
    npm install -g pnpm@latest
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)

if [ $NODE_MAJOR -lt 22 ]; then
    echo -e "${RED}Node.js version 22 or higher is required. Current version: $NODE_VERSION${NC}"
    exit 1
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
pnpm install

# Build packages
echo -e "${GREEN}Building packages...${NC}"
pnpm build

# Setup database (if needed)
# echo -e "${GREEN}Setting up database...${NC}"
# cd apps/api && cargo run --bin setup_db

echo -e "${GREEN}Setup complete! You can now run the following commands:${NC}"
echo -e "${YELLOW}pnpm dev${NC} - Start the development server"
echo -e "${YELLOW}pnpm build${NC} - Build all packages"
echo -e "${YELLOW}pnpm test${NC} - Run tests"

exit 0
