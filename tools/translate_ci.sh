#!/bin/bash
set -e
set -x

cd "$(dirname "$0")"

git config --local core.hooksPath /notexistent
git config --local user.email "41898282+github-actions[bot]@users.noreply.github.com"
git config --local user.name "github-actions[bot]"

export TZ=
git diff --exit-code i18n || {
	git pull
	git add i18n
	git commit -m "sync"
	git push
}

git config --local --unset user.email
git config --local --unset user.name
