# Ubiverse – Git workflow helpers
# Usage:
#   make push          – add, commit & push (dev branch only)
#   make merge         – merge dev → main, push main, switch back to dev

BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

# ── Push changes (dev only) ────────────────────────────────────
.PHONY: push
push:
	@if [ "$(BRANCH)" != "dev" ]; then \
		echo "ERROR: You must be on the 'dev' branch (current: $(BRANCH))"; \
		exit 1; \
	fi
	@read -p "Commit message: " msg; \
	git add -A; \
	git commit -m "$$msg"; \
	git push origin dev
	@echo "✅ Pushed to dev."

# ── Merge dev → main ──────────────────────────────────────────
.PHONY: merge
merge:
	@if [ "$(BRANCH)" != "dev" ]; then \
		echo "ERROR: Run this from the 'dev' branch (current: $(BRANCH))"; \
		exit 1; \
	fi
	git checkout main
	git merge dev
	git push origin main
	git checkout dev
	@echo "✅ Merged dev → main and switched back to dev."
