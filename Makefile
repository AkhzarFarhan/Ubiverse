# Ubiverse – Git workflow helpers
# Usage:
#   make push          – commit, fetch & rebase from main, push, then run tests
#   make test          – run exhaustive test scripts one by one

BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
PYTHON := $(shell command -v python3 >/dev/null 2>&1 && echo python3 || echo python)

TEST_SCRIPTS := \
	tests/test_01_repository_integrity.py \
	tests/test_02_app_routes_and_navigation.py \
	tests/test_03_firebase_and_telegram_contracts.py \
	tests/test_04_module_contracts.py

.PHONY: test
test:
	@echo "Running exhaustive test scripts..."
	@for script in $(TEST_SCRIPTS); do \
		echo "\n=== Running $$script ==="; \
		$(PYTHON) $$script || exit $$?; \
	done
	@echo "\n✅ All test scripts passed."

# ── Push changes (main only) ────────────────────────────────────
.PHONY: push
push:
	@if [ "$(BRANCH)" != "main" ]; then \
		echo "ERROR: You must be on the 'main' branch (current: $(BRANCH))"; \
		exit 1; \
	fi
	@read -p "Commit message: " msg; \
	git add -A; \
	git commit -m "$$msg"; \
	git pull --rebase origin main; \
	git push origin main; \
	$(MAKE) test
	@echo "✅ Pushed to main and tests completed."
