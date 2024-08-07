#!/usr/bin/env bash
echo "Running pre-commit hook..."

deno lint
deno format 

#Remove image metadata
if deno task deleteImgMeta; then
    exit 0
else
    echo "Image metadata deletion failed. Please check error message"
    echo "You can bypass this hook by adding --no-verify argument to git commit call"
    exit 1
fi
# Script should not end up here
echo "Something went wrong with pre-commit hook itself"
exit 1