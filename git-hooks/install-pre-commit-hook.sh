#!/usr/bin/env bash

# Based on "Boost Code Quality: Adding a Custom Git Pre-Commit Hook with Bash Script" article by Michael Appiah Dankwah (https://michaeladev.medium.com/boost-code-quality-adding-a-custom-git-pre-commit-hook-with-bash-script-97954c4b015a)

# Specify the path to the pre-commit hook file
pre_commit_hook_file="pre-commit"

# Specify the path to the hooks directory
hooks_directory=".git/hooks"

# Define the pre-commit hook script
pre_commit_script=$(cat ./git-hooks/pre-commit.sh)

# Create the pre-commit hook file
echo "$pre_commit_script" > "$pre_commit_hook_file"

# Set the execution permission for the pre-commit hook file
chmod +x "$pre_commit_hook_file"

# Move the pre-commit hook file to the hooks directory
mv "$pre_commit_hook_file" "$hooks_directory/pre-commit"

# Inform the user about the successful installation
echo "Pre-commit hook installed successfully!"