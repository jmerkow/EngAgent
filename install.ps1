<#
.SYNOPSIS
    Installs EngAgent into ~/.copilot/engagent and registers paths in VS Code.

.DESCRIPTION
    Copies .github/{agents,prompts,skills} into ~/.copilot/engagent/ and adds
    the paths to VS Code's chat.agentFilesLocations, chat.promptFilesLocations,
    and chat.agentSkillsLocations settings.

.NOTES
    Run this from the repo root: .\install.ps1
    To update: git pull && .\install.ps1
#>

$ErrorActionPreference = "Stop"

# --- Locate repo root (where this script lives) ---
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# --- Destination: ~/.copilot/engagent ---
$EngAgentDir = Join-Path $HOME ".copilot" "engagent"

# --- VS Code settings.json ---
$CodeUserDir = Join-Path $env:APPDATA "Code" "User"
$SettingsFile = Join-Path $CodeUserDir "settings.json"

if (-not (Test-Path $CodeUserDir)) {
    Write-Error "VS Code UserData not found at: $CodeUserDir"
    Write-Error "Is VS Code installed?"
    exit 1
}

# --- Copy .github/{agents,prompts,skills} → ~/.copilot/engagent/ ---
$Copied = 0
$Skipped = 0

foreach ($Category in @("agents", "prompts", "skills")) {
    $SrcDir = Join-Path $RepoRoot ".github" $Category
    $DestDir = Join-Path $EngAgentDir $Category

    if (-not (Test-Path $SrcDir)) {
        Write-Warning "Source not found, skipping: $SrcDir"
        $Skipped++
        continue
    }

    if (-not (Test-Path $DestDir)) {
        New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
        Write-Host "  Created: $DestDir" -ForegroundColor DarkGray
    }

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
Write-Host "Copied $Copied file(s) to: $EngAgentDir" -ForegroundColor Cyan

# --- Register paths in VS Code settings.json ---
# VS Code requires ~/ prefix, not absolute paths
$LocationSettings = [ordered]@{
    "chat.agentFilesLocations"  = "~/.copilot/engagent/agents"
    "chat.promptFilesLocations" = "~/.copilot/engagent/prompts"
    "chat.agentSkillsLocations" = "~/.copilot/engagent/skills"
}

if (Test-Path $SettingsFile) {
    $Settings = Get-Content $SettingsFile -Raw | ConvertFrom-Json
} else {
    $Settings = [PSCustomObject]@{}
}

$SettingsChanged = $false

foreach ($Key in $LocationSettings.Keys) {
    $PathToAdd = $LocationSettings[$Key]
    $Current = $Settings.PSObject.Properties[$Key]

    if ($null -eq $Current) {
        # Setting expects { "path": true } object format
        $Obj = [PSCustomObject]@{ $PathToAdd = $true }
        $Settings | Add-Member -NotePropertyName $Key -NotePropertyValue $Obj
        $SettingsChanged = $true
        Write-Host "  Added setting: $Key" -ForegroundColor Green
    } else {
        # Check if our path is already a key in the object
        $ExistingProp = $Current.Value.PSObject.Properties[$PathToAdd]
        if ($null -eq $ExistingProp) {
            $Current.Value | Add-Member -NotePropertyName $PathToAdd -NotePropertyValue $true
            $SettingsChanged = $true
            Write-Host "  Updated setting: $Key" -ForegroundColor Green
        } else {
            Write-Host "  Already set: $Key" -ForegroundColor DarkGray
        }
    }
}

if ($SettingsChanged) {
    $Settings | ConvertTo-Json -Depth 32 | Set-Content $SettingsFile -Encoding utf8NoBOM
    Write-Host ""
    Write-Host "Updated VS Code settings: $SettingsFile" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "VS Code settings already up to date." -ForegroundColor DarkGray
}

if ($Skipped -gt 0) {
    Write-Host "Skipped $Skipped missing source(s)." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Restart VS Code or reload the window for changes to take effect." -ForegroundColor DarkGray
