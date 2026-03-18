# Ubiverse Development and Deployment Workflows

## Local development

### Environment setup
Create `js/env.js` from [js/env.js.example](js/env.js.example) for local development.

Required values:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `TG_BOT_TOKEN` (optional)
- `TG_LEDGER_CHAT_ID` (optional)
- `TG_USERNAME` (optional)

### Running locally
Serve the repository root with any static file server. Example options:
- `python -m http.server 8080`
- `npx serve .`

Open the site in a browser and test with Firebase configured.

## Deployment
Deployment is handled by [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

### Pages requirements
- GitHub Pages source must be set to **GitHub Actions**
- The workflow target environment is `github-pages`
- Secrets can be defined at repo or environment level, but names must match the workflow

### Secrets expected by deploy.yml
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `TG_BOT_TOKEN`
- `TG_LEDGER_CHAT_ID`
- `TG_USERNAME`

### What the workflow does
1. Checks out the repo
2. Generates `js/env.js` from secrets
3. Uploads the repo as a Pages artifact
4. Deploys the artifact to GitHub Pages

## Git workflow
Branch model:
- `dev` = active development
- `main` = deployment branch

### Git Bash / WSL commands
Defined in [Makefile](Makefile):
- `make push`
- `make merge`
- `make pushm`

### PowerShell commands
Defined in [make.ps1](make.ps1):
- `./make.ps1 push`
- `./make.ps1 merge`
- `./make.ps1 pushm`

## Operational notes
- If history is rewritten with `git filter-repo`, the `origin` remote may be removed and must be re-added.
- HTTPS pushes may require Git Credential Manager or a personal access token.
- Avoid direct edits to generated `js/env.js` in source control.
