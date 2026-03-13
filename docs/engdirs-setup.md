# EngDirs Setup

Instructions for setting up `.eng/` version control with a centralized EngDirs repo.

## Prerequisites

1. Create a **private** repo on your git host (e.g., `<owner>/EngDirs` on GitHub).
2. Push an empty `main` branch as the default. This branch holds docs only — project content lives on orphan branches.

```bash
mkdir engdirs-tmp && cd engdirs-tmp
git init
git checkout -b main
echo "# EngDirs" > README.md
git add README.md
git commit -m "Initialize main"
git remote add origin https://github.com/<owner>/EngDirs.git
git push -u origin main
cd .. && rm -rf engdirs-tmp
```

3. Set `main` as the default branch on your git host (GitHub: Settings → General → Default branch).

## Adding a project

Each project gets its own orphan branch under `projects/`. Run these commands from your project root:

```bash
cd .eng
git init
git checkout --orphan projects/<project-name>
git add -A
git commit -m "Initialize <project-name>"
git remote add origin https://github.com/<owner>/EngDirs.git
git push -u origin projects/<project-name>
```

Replace `<owner>`, `<project-name>`, and the URL to match your setup.

After this, `.eng/` is a git repo tracking its own orphan branch. The parent project's `.gitignore` should already have `.eng/` — the nested `.git/` is invisible to it.

## Pushing changes

Manual for now:

```bash
cd .eng
git add -A
git commit -m "Update findings"
git push
```

## Branch structure

Each project branch has the same layout as a local `.eng/` directory:

```
projects/<project-name> (orphan branch)
├── objectives/
├── findings/
├── retros/
├── archive/
└── scratch/
```

## Resuming on a new machine

Clone the project branch directly into `.eng/`:

```bash
git clone --branch projects/<project-name> --single-branch \
  https://github.com/<owner>/EngDirs.git .eng
```

## Notes

- Orphan branches have no shared history with `main`. GitHub will show "ahead/behind" comparisons — this is cosmetic noise, ignore it.
- Everything is committed. The repo is private so there's no reason to gitignore anything within branches.
- If a push fails partway through, re-running the same commands is safe — git will skip steps that already succeeded.
