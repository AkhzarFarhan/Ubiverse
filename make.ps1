# Ubiverse – Git workflow helpers (PowerShell)
# Usage:
#   .\make.ps1 push    – add, commit & push (dev branch only)
#   .\make.ps1 merge   – merge dev → main, push main, switch back to dev
#   .\make.ps1 pushm   – runs push, then immediately merges to main

param(
    [Parameter(Position = 0)]
    [ValidateSet("push", "merge", "pushm")]
    [string]$Command
)

if (-not $Command) {
    Write-Host "Usage: .\make.ps1 <push|merge|pushm>" -ForegroundColor Yellow
    exit 1
}

$branch = git rev-parse --abbrev-ref HEAD

function Push-Dev {
    if ($branch -ne "dev") {
        Write-Host "ERROR: You must be on the 'dev' branch (current: $branch)" -ForegroundColor Red
        exit 1
    }
    $msg = Read-Host "Commit message"
    if (-not $msg) {
        Write-Host "ERROR: Commit message cannot be empty." -ForegroundColor Red
        exit 1
    }
    git add -A
    git commit -m $msg
    git push origin dev
    Write-Host "Pushed to dev." -ForegroundColor Green
}

function Merge-ToMain {
    if ($branch -ne "dev") {
        Write-Host "ERROR: Run this from the 'dev' branch (current: $branch)" -ForegroundColor Red
        exit 1
    }
    git checkout main
    git merge dev
    git push origin main
    git checkout dev
    Write-Host "Merged dev -> main and switched back to dev." -ForegroundColor Green
}

switch ($Command) {
    "push"  { Push-Dev }
    "merge" { Merge-ToMain }
    "pushm" { 
        Push-Dev
        if ($LASTEXITCODE -eq 0) {
            Merge-ToMain
            Write-Host "Push and merge complete." -ForegroundColor Green
        }
    }
}
