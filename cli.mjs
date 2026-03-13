#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync, symlinkSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { homedir, platform } from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = dirname(__filename);

const SRC_DIR = join(REPO_ROOT, 'src');
const GITHUB_DIR = join(REPO_ROOT, '.github');
const CONFIG_PATH = join(REPO_ROOT, 'config.json');
const DEFAULT_INSTALL_DIR = join(homedir(), '.copilot', 'engagent');

// Discover what to build from src/ contents
function getManagedDirs() {
  if (!existsSync(SRC_DIR)) return [];
  return readdirSync(SRC_DIR).filter(name =>
    statSync(join(SRC_DIR, name)).isDirectory()
  );
}

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) return {};
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
}

function getInstallDir(config) {
  const dir = config.installDir || DEFAULT_INSTALL_DIR;
  // Resolve ~ to homedir
  if (dir.startsWith('~/')) return join(homedir(), dir.slice(2));
  return resolve(dir);
}

// Collect tools from a config map whose keys glob-match the agent name
function collectMatchingTools(configMap, agentName) {
  const collected = [];
  for (const [pattern, tools] of Object.entries(configMap)) {
    const re = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    if (re.test(agentName)) collected.push(...tools);
  }
  return collected;
}

// Inject extra tools from config into agent frontmatter, then remove excluded tools
function injectTools(filePath, config) {
  let content = readFileSync(filePath, 'utf8');
  const toolsConfig = config.tools;
  const excludeConfig = config.excludeTools;

  // Extract agent name from frontmatter
  const nameMatch = content.match(/^name:\s*(.+)$/m);
  if (!nameMatch) return;
  const agentName = nameMatch[1].trim();

  // Phase 1: Inject tools (glob-matched from config.tools)
  if (toolsConfig) {
    const extraTools = collectMatchingTools(toolsConfig, agentName);

    if (extraTools.length > 0) {
      const toolsLineRe = /^(\s*\[.+)\]$/m;
      const match = content.match(toolsLineRe);
      if (match) {
        const existingTools = match[1].replace(/^\s*\[/, '').split(',').map(t => t.trim());
        const newTools = extraTools.filter(t => !existingTools.includes(t));
        if (newTools.length > 0) {
          content = content.replace(toolsLineRe, `${match[1]}, ${newTools.join(', ')}]`);
          console.log(`    + ${newTools.length} tools injected into ${agentName}`);
        }
      }
    }
  }

  // Phase 2: Exclude tools (glob-matched from config.excludeTools)
  if (excludeConfig) {
    const excludeSet = new Set(collectMatchingTools(excludeConfig, agentName));
    const toolsLineRe = /^(\s*)\[(.+)\]$/m;
    const match = content.match(toolsLineRe);
    if (match) {
      const indent = match[1];
      const allTools = match[2].split(',').map(t => t.trim()).filter(t => t);
      const filtered = allTools.filter(t => !excludeSet.has(t));
      const removed = allTools.length - filtered.length;
      if (removed > 0) {
        content = content.replace(toolsLineRe, `${indent}[${filtered.join(', ')}]`);
        console.log(`    - ${removed} tools excluded from ${agentName}`);
      }
    }
  }

  writeFileSync(filePath, content);
}

// ── Build ──────────────────────────────────────────────────────────────────────

function build() {
  console.log('Building .github/ from src/...');
  const config = loadConfig();

  const dirs = getManagedDirs();
  if (dirs.length === 0) {
    console.log('  nothing to build (src/ is empty or missing)');
    return;
  }

  for (const dir of dirs) {
    const srcPath = join(SRC_DIR, dir);
    const destPath = join(GITHUB_DIR, dir);

    // Clean destination, then recursive copy
    if (existsSync(destPath)) {
      rmSync(destPath, { recursive: true });
    }
    cpSync(srcPath, destPath, { recursive: true });
    console.log(`  src/${dir}/ → .github/${dir}/`);
  }

  // Inject/exclude config tools in built agents
  if (config.tools || config.excludeTools) {
    const agentsDir = join(GITHUB_DIR, 'agents');
    if (existsSync(agentsDir)) {
      for (const file of readdirSync(agentsDir)) {
        if (file.endsWith('.agent.md')) {
          injectTools(join(agentsDir, file), config);
        }
      }
    }
  }

  console.log('Build complete.');
}

// ── Install ────────────────────────────────────────────────────────────────────

function getVSCodeSettingsPaths() {
  const p = platform();
  const home = homedir();
  const paths = [];

  if (p === 'win32') {
    paths.push(join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'Code', 'User', 'settings.json'));
  } else if (p === 'darwin') {
    paths.push(join(home, 'Library', 'Application Support', 'Code', 'User', 'settings.json'));
  } else {
    paths.push(join(home, '.config', 'Code', 'User', 'settings.json'));

    // WSL: also write to Windows-side settings
    const wslUser = process.env.WSLENV !== undefined || existsSync('/proc/version');
    if (wslUser) {
      try {
        const procVersion = readFileSync('/proc/version', 'utf8');
        if (/microsoft|wsl/i.test(procVersion)) {
          // Find Windows username from /mnt/c/Users/
          const usersDir = '/mnt/c/Users';
          if (existsSync(usersDir)) {
            const windowsUser = readdirSync(usersDir).find(name =>
              !['Default', 'Public', 'Default User', 'All Users'].includes(name) &&
              statSync(join(usersDir, name)).isDirectory() &&
              existsSync(join(usersDir, name, 'AppData', 'Roaming', 'Code', 'User'))
            );
            if (windowsUser) {
              paths.push(join(usersDir, windowsUser, 'AppData', 'Roaming', 'Code', 'User', 'settings.json'));
            }
          }
        }
      } catch { /* not WSL */ }
    }
  }

  return paths;
}

function readJSONFile(filePath) {
  if (!existsSync(filePath)) return {};
  const raw = readFileSync(filePath, 'utf8');
  // Strip JSONC: remove single-line comments (but not inside strings) and trailing commas
  let result = '';
  let inString = false;
  let escape = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escape) { result += ch; escape = false; continue; }
    if (inString) {
      if (ch === '\\') { result += ch; escape = true; continue; }
      if (ch === '"') inString = false;
      result += ch;
      continue;
    }
    // Outside string
    if (ch === '"') { inString = true; result += ch; continue; }
    if (ch === '/' && raw[i + 1] === '/') {
      // Skip to end of line
      while (i < raw.length && raw[i] !== '\n') i++;
      result += '\n';
      continue;
    }
    result += ch;
  }
  // Remove trailing commas before } or ]
  result = result.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(result);
}

function writeJSONFile(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function install() {
  const config = loadConfig();
  const installDir = getInstallDir(config);
  console.log('Installing EngAgent...');

  // 1. Symlink ~/.copilot/engagent → .github/
  if (existsSync(installDir)) {
    rmSync(installDir, { recursive: true });
  }
  mkdirSync(dirname(installDir), { recursive: true });
  symlinkSync(GITHUB_DIR, installDir, 'junction');
  console.log(`  ${installDir} → ${GITHUB_DIR}`);

  // 2. Register VS Code user-level settings
  const settingsPaths = getVSCodeSettingsPaths();

  // VS Code requires ~/... paths, not absolute
  const home = homedir();
  const settingsDir = installDir.startsWith(home)
    ? '~' + installDir.slice(home.length)
    : installDir;

  const settingsMap = {
    'chat.agentFilesLocations':        { [settingsDir + '/agents']: true },
    'chat.promptFilesLocations':       { [settingsDir + '/prompts']: true },
    'chat.agentSkillsLocations':       { [settingsDir + '/skills']: true },
    'chat.instructionsFilesLocations': { [settingsDir + '/instructions']: true },
  };

  for (const settingsPath of settingsPaths) {
    const settings = readJSONFile(settingsPath);

    for (const [key, newEntries] of Object.entries(settingsMap)) {
      const existing = settings[key] || {};
      settings[key] = { ...existing, ...newEntries };
    }

    writeJSONFile(settingsPath, settings);
    console.log(`  VS Code settings: ${settingsPath}`);
  }

  console.log('Install complete.');
}

// ── Uninstall ──────────────────────────────────────────────────────────────────

function uninstall() {
  const config = loadConfig();
  const installDir = getInstallDir(config);
  console.log('Uninstalling EngAgent...');

  // 1. Remove symlink
  if (existsSync(installDir)) {
    rmSync(installDir, { recursive: true });
    console.log(`  removed ${installDir}`);
  }

  // 2. Clean VS Code settings
  const settingsPaths = getVSCodeSettingsPaths();

  const home = homedir();
  const settingsDir = installDir.startsWith(home)
    ? '~' + installDir.slice(home.length)
    : installDir;

  const keysToClean = [
    'chat.agentFilesLocations',
    'chat.promptFilesLocations',
    'chat.agentSkillsLocations',
    'chat.instructionsFilesLocations',
  ];

  for (const settingsPath of settingsPaths) {
    if (!existsSync(settingsPath)) continue;
    const settings = readJSONFile(settingsPath);

    for (const key of keysToClean) {
      if (!settings[key]) continue;
      for (const path of Object.keys(settings[key])) {
        // Match both ~/... and absolute paths
        if (path.startsWith(settingsDir) || path.startsWith(installDir)) {
          delete settings[key][path];
        }
      }
      if (Object.keys(settings[key]).length === 0) {
        delete settings[key];
      }
    }

    writeJSONFile(settingsPath, settings);
    console.log(`  VS Code settings cleaned: ${settingsPath}`);
  }

  console.log('Uninstall complete.');
}

// ── CLI dispatch ───────────────────────────────────────────────────────────────

const command = process.argv[2];

const commands = { build, install, uninstall };

if (!command || !commands[command]) {
  console.log(`Usage: node cli.mjs <command>

Commands:
  build      Copy src/ → .github/ (agents, prompts, skills)
  install    Symlink .github/ to ~/.copilot/engagent/ + register VS Code settings
  uninstall  Remove symlinks and VS Code settings entries
`);
  process.exit(command ? 1 : 0);
}

commands[command]();
