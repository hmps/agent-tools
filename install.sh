#!/usr/bin/env bash

# install.sh - Install agent-tools scripts to user's PATH
#
# This script installs all executable scripts from the tools/ directory
# to ~/.local/bin and ensures that directory is in the user's PATH.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

INSTALL_DIR="$HOME/.local/bin"
TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/tools" && pwd)"

echo -e "${BLUE}Installing agent-tools...${NC}"

# Create installation directory if it doesn't exist
if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Creating $INSTALL_DIR${NC}"
    mkdir -p "$INSTALL_DIR"
fi

# Install each tool
installed_count=0
for tool in "$TOOLS_DIR"/*; do
    if [ -f "$tool" ]; then
        tool_name=$(basename "$tool" .sh)
        dest="$INSTALL_DIR/$tool_name"

        # Create symlink
        if [ -L "$dest" ]; then
            rm "$dest"
        elif [ -f "$dest" ]; then
            echo -e "${YELLOW}Warning: $dest already exists (not a symlink), removing${NC}"
            rm "$dest"
        fi

        ln -s "$tool" "$dest"
        chmod +x "$tool"
        echo -e "${GREEN}✓${NC} Installed: $tool_name"
        ((installed_count++))
    fi
done

echo -e "\n${GREEN}Successfully installed $installed_count tool(s)${NC}"

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo -e "\n${YELLOW}$INSTALL_DIR is not in your PATH${NC}"
    echo "Adding it to your shell configuration..."

    PATH_EXPORT="export PATH=\"\$HOME/.local/bin:\$PATH\""

    # Update shell config files
    updated_files=()

    if [ -f "$HOME/.bashrc" ]; then
        if ! grep -q "$INSTALL_DIR" "$HOME/.bashrc"; then
            echo "" >> "$HOME/.bashrc"
            echo "# Added by agent-tools installer" >> "$HOME/.bashrc"
            echo "$PATH_EXPORT" >> "$HOME/.bashrc"
            updated_files+=("~/.bashrc")
        fi
    fi

    if [ -f "$HOME/.zshrc" ]; then
        if ! grep -q "$INSTALL_DIR" "$HOME/.zshrc"; then
            echo "" >> "$HOME/.zshrc"
            echo "# Added by agent-tools installer" >> "$HOME/.zshrc"
            echo "$PATH_EXPORT" >> "$HOME/.zshrc"
            updated_files+=("~/.zshrc")
        fi
    fi

    if [ ${#updated_files[@]} -gt 0 ]; then
        echo -e "${GREEN}Updated: ${updated_files[*]}${NC}"
        echo -e "\n${YELLOW}Please restart your shell or run:${NC}"
        echo -e "  source ~/.bashrc  ${BLUE}# for bash${NC}"
        echo -e "  source ~/.zshrc   ${BLUE}# for zsh${NC}"
    else
        echo -e "${YELLOW}No shell config files were updated.${NC}"
        echo -e "Add this to your shell config manually:"
        echo -e "  $PATH_EXPORT"
    fi
else
    echo -e "\n${GREEN}$INSTALL_DIR is already in your PATH${NC}"
    echo -e "${GREEN}Tools are ready to use!${NC}"
fi

echo -e "\n${BLUE}Installed tools:${NC}"
for tool in "$TOOLS_DIR"/*; do
    if [ -f "$tool" ]; then
        tool_name=$(basename "$tool" .sh)
        echo "  - $tool_name"
    fi
done
