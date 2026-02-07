<#
.SYNOPSIS
    Installs EngAgent agents, prompts, and skills into VS Code UserData.

.DESCRIPTION
    Copies .github/{agents,prompts,skills} from this repo into your VS Code
    User profile directory. Files placed there are auto-discovered by VS Code
    in every workspace, including remote SSH sessions.

.NOTES
    Run this from the repo root: .\install.ps1
    To update: git pull && .\install.ps1
#>

$ErrorActionPreference = "Stop"

# --- Locate repo root (where this script lives) ---
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# --- Locate VS Code UserData directory ---
$CodeUserDir = Join-Path $env:APPDATA "Code" "User"

if (-not (Test-Path $CodeUserDir)) {
    Write-Error "VS Code UserData not found at: $CodeUserDir"
    Write-Error "Is VS Code installed?"
    exit 1
}

# --- Source directories in the repo ---
$Sources = @{
    agents = Join-Path $RepoRoot ".github" "agents"
    prompts = Join-Path $RepoRoot ".github" "prompts"
    skills = Join-Path $RepoRoot ".github" "skills"
}

# --- Copy each category ---
$Copied = 0
$Skipped = 0

foreach ($Category in $Sources.Keys) {
    $SrcDir = $Sources[$Category]
    $DestDir = Join-Path $CodeUserDir $Category

    if (-not (Test-Path $SrcDir)) {
        Write-Warning "Source not found, skipping: $SrcDir"
        $Skipped++
        continue
    }

    # Create destination if it doesn't exist
    if (-not (Test-Path $DestDir)) {
        New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
        Write-Host "  Created: $DestDir" -ForegroundColor DarkGray
    }

    # Copy files (recursive for skills which have subdirectories)
    $Items = Get-ChildItem -Path $SrcDir -Recurse
    foreach ($Item in $Items) {
        $RelPath = $Item.FullName.Substring($SrcDir.Length + 1)
        $DestPath = Join-Path $DestDir $RelPath

        if ($Item.PSIsContainer) {
            if (-not (Test-Path $DestPath)) {
                New-Item -ItemType Directory -Path $DestPath -Force | Out-Null
            }
        } else {
            Copy-Item -Path $Item.FullName -Destination $DestPath -Force
            Write-Host "  $Category/$RelPath" -ForegroundColor Green
            $Copied++
        }
    }
}

Write-Host ""
Write-Host "Done. Copied $Copied file(s) to: $CodeUserDir" -ForegroundColor Cyan
if ($Skipped -gt 0) {
    Write-Host "Skipped $Skipped missing source(s)." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Restart VS Code or reload the window for changes to take effect." -ForegroundColor DarkGray
