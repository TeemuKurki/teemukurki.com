#!/usr/bin/env bash
echo "Running pre-commit hook..."

function exit_code () {
  git stash pop
  exit $1
}

tmp_stash="temp-hook-stash"
#Push all non-staged changes to stash
git stash push -k -u -m "$tmp_stash"

if ! (deno lint);then
  echo "Deno lint failed"
  exit_code 1
fi

# Format and add formated files to stage 
deno fmt
git add .

#Remove image metadata
if deno task deleteImgMeta; then
    git add ./src/img
    exit_code 0
else
    echo "Image metadata deletion failed. Please check error message"
    echo "You can bypass this hook by adding --no-verify argument to git commit call"
    exit_code 1
fi

# Script should not end up here
echo "Something went wrong with pre-commit hook itself"
exit_code 1