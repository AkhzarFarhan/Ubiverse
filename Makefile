.PHONY: push merge

# Default commit message if not provided
m ?= "Auto-commit from Makefile"

push:
	@echo "Checking current branch..."
	@BRANCH=$$(git rev-parse --abbrev-ref HEAD); \
	if [ "$$BRANCH" = "main" ]; then \
		echo "Currently on main branch. Switching to dev branch..."; \
		git checkout dev || git checkout -b dev; \
	fi
	@echo "Adding changes..."
	@git add .
	@echo "Committing with message: '$(m)'"
	@git commit -m "$(m)" || echo "No changes to commit"
	@echo "Pushing to dev branch..."
	@git push origin dev || git push -u origin dev
	@echo "✅ Successfully pushed to dev branch!"

merge:
	@echo "Checking current branch..."
	@BRANCH=$$(git rev-parse --abbrev-ref HEAD); \
	if [ "$$BRANCH" != "dev" ]; then \
		echo "Switching to dev branch first..."; \
		git checkout dev; \
	fi
	@echo "Pulling latest dev..."
	@git pull origin dev || echo "No remote dev branch to pull"
	@echo "Switching to main branch..."
	@git checkout main
	@echo "Pulling latest main..."
	@git pull origin main || echo "No remote main branch to pull"
	@echo "Merging dev into main..."
	@git merge dev -m "Merge dev into main"
	@echo "Pushing main branch..."
	@git push origin main
	@echo "Switching back to dev branch..."
	@git checkout dev
	@echo "✅ Successfully merged dev into main and returned to dev!"
