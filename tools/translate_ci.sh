#!/bin/bash
set -e
set -x

cd "$(dirname "$0")/../"

git config --local core.hooksPath /notexistent
git config --local user.email "41898282+github-actions[bot]@users.noreply.github.com"
git config --local user.name "github-actions[bot]"

tsx tools/translate.ts

export TZ=
git diff --exit-code i18n || {
  git stash
	git pull
  git stash pop
	git add i18n
	git commit -m "translate ru -> en"
	git push
}

git config --local --unset user.email
git config --local --unset user.name
