#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync, symlinkSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { homedir, platform } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = dirname(__filename);

const SRC_DIR = join(REPO_ROOT, 'src');
const GITHUB_DIR = join(REPO_ROOT, '.github');
const STAGING_DIR = join(REPO_ROOT, '.build-staging');
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

// Resolve .example.instructions.md files from the repo root: use user override
// (same name without .example.) if present, otherwise use the example as default.
// Copies the resolved file into destDir with the clean name.
function resolveExampleFiles(destDir) {
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
  for (const file of readdirSync(REPO_ROOT)) {
    if (!file.endsWith('.example.instructions.md')) continue;

    const resolved = file.replace('.example.instructions.md', '.instructions.md');
    const overrideSrc = join(REPO_ROOT, resolved);
    const exampleSrc = join(REPO_ROOT, file);
    const resolvedDest = join(destDir, resolved);

    if (existsSync(overrideSrc)) {
      cpSync(overrideSrc, resolvedDest);
      console.log(`    ⤷ ${resolved} (user override)`);
    } else {
      cpSync(exampleSrc, resolvedDest);
      console.log(`    ⤷ ${resolved} (default)`);
    }
  }
}

// ── Tool diffing & resolution ──────────────────────────────────────────────────

const TOOLS_LINE_RE = /^(\s*)\[(.+)\]$/m;

function parseTools(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const match = content.match(TOOLS_LINE_RE);
  if (!match) return [];
  return match[2].split(',').map(t => t.trim()).filter(Boolean);
}

function replaceTools(filePath, tools) {
  let content = readFileSync(filePath, 'utf8');
  const match = content.match(TOOLS_LINE_RE);
  if (!match) return;
  const indent = match[1];
  content = content.replace(TOOLS_LINE_RE, `${indent}[${tools.join(', ')}]`);
  writeFileSync(filePath, content);
}

function diffAgentTools(stagingAgentsDir, currentAgentsDir) {
  const changes = {};
  if (!existsSync(stagingAgentsDir)) return changes;

  for (const file of readdirSync(stagingAgentsDir)) {
    if (!file.endsWith('.agent.md')) continue;
    const currentFile = join(currentAgentsDir, file);
    if (!existsSync(currentFile)) continue;

    const incoming = parseTools(join(stagingAgentsDir, file));
    const current = parseTools(currentFile);

    const inSet = new Set(incoming);
    const curSet = new Set(current);
    const added = incoming.filter(t => !curSet.has(t));
    const removed = current.filter(t => !inSet.has(t));

    if (added.length || removed.length) {
      const agentName = file.replace('.agent.md', '');
      changes[agentName] = { added, removed, incoming, current, file };
    }
  }
  return changes;
}

function formatToolReport(changes) {
  const agents = Object.keys(changes);
  if (agents.length === 0) return '';

  const WRAP = 100;
  const RED = '\x1b[31m';
  const GREEN = '\x1b[32m';
  const DIM = '\x1b[2m';
  const RESET = '\x1b[0m';

  function groupByNamespace(tools) {
    const groups = {};
    for (const t of tools) {
      const slash = t.indexOf('/');
      const ns = slash > -1 ? t.slice(0, slash) : '(other)';
      const name = slash > -1 ? t.slice(slash + 1) : t;
      (groups[ns] ??= []).push(name);
    }
    return groups;
  }

  function formatGroups(prefix, groups, color) {
    const lines = [];
    for (const [ns, names] of Object.entries(groups)) {
      let line = `    ${color}${prefix} ${DIM}${ns}/${RESET}${color}`;
      for (let i = 0; i < names.length; i++) {
        const sep = i < names.length - 1 ? ', ' : '';
        if (line.length + names[i].length + sep.length > WRAP && i > 0) {
          lines.push(line + RESET);
          line = `    ${color}  `;
        }
        line += names[i] + sep;
      }
      lines.push(line + RESET);
    }
    return lines;
  }

  const lines = ['\nTool changes detected:\n'];
  for (const agent of agents) {
    const { added, removed } = changes[agent];
    lines.push(`  ${agent}: (${removed.length} removed, ${added.length} added)`);
    lines.push(...formatGroups('-', groupByNamespace(removed), RED));
    lines.push(...formatGroups('+', groupByNamespace(added), GREEN));
    lines.push('');
  }
  return lines.join('\n');
}

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function promptResolution(changes) {
  const agents = Object.keys(changes);
  const resolutions = {};

  const isTTY = process.stdin.isTTY;
  if (!isTTY) {
    console.log('  (non-interactive — defaulting to merge)');
    for (const a of agents) resolutions[a] = 'merge';
    return resolutions;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    const answer = (await ask(rl,
      'Resolve all agents: [I]ncoming / [C]urrent / [M]erge / [P]er-agent? '
    )).trim().toLowerCase();

    if (answer === 'p') {
      for (const agent of agents) {
        const { added, removed } = changes[agent];
        const a = (await ask(rl,
          `  ${agent} (+${added.length} -${removed.length}): [I]ncoming / [C]urrent / [M]erge? `
        )).trim().toLowerCase();
        resolutions[agent] = a === 'c' ? 'current' : a === 'm' ? 'merge' : 'incoming';
      }
    } else {
      const choice = answer === 'c' ? 'current' : answer === 'm' ? 'merge' : 'incoming';
      for (const a of agents) resolutions[a] = choice;
    }
  } finally {
    rl.close();
  }

  return resolutions;
}

function applyResolution(stagingDir, currentAgentsDir, destDir, changes, resolutions) {
  // Move staging → dest
  const dirs = getManagedDirs();
  for (const dir of dirs) {
    const destPath = join(destDir, dir);
    const stagingPath = join(stagingDir, dir);
    if (existsSync(destPath)) rmSync(destPath, { recursive: true });
    if (existsSync(stagingPath)) cpSync(stagingPath, destPath, { recursive: true });
  }

  // Also copy non-managed content that resolveExampleFiles wrote
  const stagingInstructions = join(stagingDir, 'instructions');
  const destInstructions = join(destDir, 'instructions');
  if (existsSync(stagingInstructions)) {
    if (existsSync(destInstructions)) rmSync(destInstructions, { recursive: true });
    cpSync(stagingInstructions, destInstructions, { recursive: true });
  }

  // Patch tools per resolution
  const agentsDir = join(destDir, 'agents');
  for (const [agent, resolution] of Object.entries(resolutions)) {
    const info = changes[agent];
    if (!info) continue;
    const filePath = join(agentsDir, info.file);
    if (!existsSync(filePath)) continue;

    if (resolution === 'current') {
      replaceTools(filePath, info.current);
      console.log(`  ${agent}: kept current tools`);
    } else if (resolution === 'merge') {
      const inSet = new Set(info.incoming);
      const merged = [...info.incoming, ...info.current.filter(t => !inSet.has(t))];
      replaceTools(filePath, merged);
      console.log(`  ${agent}: merged tools (${merged.length} total)`);
    } else {
      console.log(`  ${agent}: using incoming tools`);
    }
  }
}

async function promptSaveConfig(resolutions, changes, config) {
  const needsSave = Object.entries(resolutions).some(([, r]) => r !== 'incoming');
  if (!needsSave || !process.stdin.isTTY) return;

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await ask(rl,
      'Save resolutions to config.json (skip prompts next build)? [y/N] '
    )).trim().toLowerCase();
    if (answer !== 'y') return;
  } finally {
    rl.close();
  }

  if (!config.tools) config.tools = {};
  if (!config.excludeTools) config.excludeTools = {};

  for (const [agent, resolution] of Object.entries(resolutions)) {
    if (resolution === 'incoming') continue;
    const info = changes[agent];
    if (!info) continue;

    const inSet = new Set(info.incoming);
    let resolved;
    if (resolution === 'current') {
      resolved = info.current;
    } else {
      resolved = [...info.incoming, ...info.current.filter(t => !inSet.has(t))];
    }
    const resolvedSet = new Set(resolved);

    // Extra tools: in resolved but not in incoming → inject
    const extras = resolved.filter(t => !inSet.has(t));
    if (extras.length > 0) {
      const existing = config.tools[agent] || [];
      config.tools[agent] = [...new Set([...existing, ...extras])];
    }

    // Unwanted tools: in incoming but not in resolved → exclude
    const unwanted = info.incoming.filter(t => !resolvedSet.has(t));
    if (unwanted.length > 0) {
      const existing = config.excludeTools[agent] || [];
      config.excludeTools[agent] = [...new Set([...existing, ...unwanted])];
    }
  }

  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
  console.log('  config.json updated.');
}

// ── Build ──────────────────────────────────────────────────────────────────────

async function build() {
  console.log('Building .github/ from src/...');
  const config = loadConfig();

  const dirs = getManagedDirs();
  if (dirs.length === 0) {
    console.log('  nothing to build (src/ is empty or missing)');
    return;
  }

  // Phase 1: Build to staging
  if (existsSync(STAGING_DIR)) rmSync(STAGING_DIR, { recursive: true });
  mkdirSync(STAGING_DIR, { recursive: true });

  for (const dir of dirs) {
    const srcPath = join(SRC_DIR, dir);
    const stagingPath = join(STAGING_DIR, dir);
    cpSync(srcPath, stagingPath, { recursive: true });
    console.log(`  src/${dir}/ → staging/${dir}/`);
  }

  resolveExampleFiles(join(STAGING_DIR, 'instructions'));

  if (config.tools || config.excludeTools) {
    const agentsDir = join(STAGING_DIR, 'agents');
    if (existsSync(agentsDir)) {
      for (const file of readdirSync(agentsDir)) {
        if (file.endsWith('.agent.md')) {
          injectTools(join(agentsDir, file), config);
        }
      }
    }
  }

  // Phase 2: Diff tools against current .github
  const stagingAgents = join(STAGING_DIR, 'agents');
  const currentAgents = join(GITHUB_DIR, 'agents');
  const changes = diffAgentTools(stagingAgents, currentAgents);
  const hasChanges = Object.keys(changes).length > 0;

  let resolutions = {};
  if (hasChanges) {
    console.log(formatToolReport(changes));
    resolutions = await promptResolution(changes);
  }

  // Phase 3: Apply
  applyResolution(STAGING_DIR, currentAgents, GITHUB_DIR, changes, resolutions);

  // Phase 4: Offer to save
  if (hasChanges) {
    await promptSaveConfig(resolutions, changes, config);
  }

  // Phase 5: Cleanup
  rmSync(STAGING_DIR, { recursive: true, force: true });

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
  build      Copy src/ → .github/ (agents, prompts, skills) with interactive tool review
  install    Symlink .github/ to ~/.copilot/engagent/ + register VS Code settings
  uninstall  Remove symlinks and VS Code settings entries
`);
  process.exit(command ? 1 : 0);
}

await commands[command]();
