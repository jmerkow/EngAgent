#!/usr/bin/env python3
"""Work journal — append-only event log with auto-commit and push reminders."""

import argparse, logging, os, subprocess, sys
from pathlib import Path

LEVELS = {"DEBUG": 10, "INFO": 20, "WARNING": 30, "ERROR": 40, "CRITICAL": 50}

EXAMPLES = """\
examples:
  %(prog)s INFO -m "Weekly sync — agreed on Q3 timeline" -t meeting --project myproject
  %(prog)s WARNING -m "Dependency blocked for 2 weeks" -t blocked --project infra
  %(prog)s INFO -m "Chose option B for API design" -t decision --tag architecture
  %(prog)s INFO -m "Met with customer last Tuesday" -t meeting --project ce --at 2026-03-04

batch mode (log several events, commit once):
  %(prog)s INFO -m "event 1" -t meeting --no-commit
  %(prog)s INFO -m "event 2" -t decision --no-commit
  %(prog)s commit -m "standup recap"
"""


def resolve_journal_dir():
    """Resolve journal directory: .journal file → .eng/ detect → .journals/ fallback."""
    cfg = Path(".journal")
    if cfg.exists():
        return Path(cfg.read_text().strip())
    if Path(".eng").is_dir():
        journal_dir = Path(".eng/journal")
    else:
        journal_dir = Path(".journals")
    # Pin the choice for stability
    try:
        cfg.write_text(str(journal_dir) + "\n")
    except OSError:
        pass
    return journal_dir


def _run_git(*args, cwd):
    """Run a git command, return (success, stdout)."""
    try:
        r = subprocess.run(
            ["git", *args], cwd=cwd, capture_output=True, text=True, timeout=10
        )
        return r.returncode == 0, r.stdout.strip()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False, ""


def _git_repo_root(path):
    """Find the git repo root containing path, or None."""
    ok, root = _run_git("rev-parse", "--show-toplevel", cwd=path)
    return Path(root) if ok else None


def auto_commit(journal_dir, message_summary):
    """Auto-commit journal changes if inside a git repo."""
    repo_root = _git_repo_root(journal_dir)
    if not repo_root:
        return
    rel = journal_dir.resolve().relative_to(repo_root.resolve())
    _run_git("add", str(rel), cwd=repo_root)
    ok, _ = _run_git("diff", "--cached", "--quiet", cwd=repo_root)
    if not ok:  # there are staged changes
        _run_git("commit", "-m", f"journal: {message_summary}", cwd=repo_root)


def check_push_status(journal_dir):
    """Print a reminder if there are unpushed commits."""
    repo_root = _git_repo_root(journal_dir)
    if not repo_root:
        return
    ok, branch = _run_git("rev-parse", "--abbrev-ref", "HEAD", cwd=repo_root)
    if not ok or branch == "HEAD":
        return
    ok, remote_ref = _run_git(
        "rev-parse", "--abbrev-ref", f"{branch}@{{upstream}}", cwd=repo_root
    )
    if not ok:
        return
    ok, count = _run_git(
        "rev-list", "--count", f"{remote_ref}..{branch}", cwd=repo_root
    )
    if ok and count and int(count) > 0:
        print(
            f"\u26a0 {repo_root.name}/ has {count} unpushed commit(s). "
            f"Run: cd {repo_root} && git push",
            file=sys.stderr,
        )


def setup_logger(log_file):
    """Configure file + stderr logging."""
    log_file.parent.mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger("journal")
    logger.setLevel(logging.DEBUG)
    fmt = logging.Formatter(
        "%(asctime)s \u2502 %(levelname)-8s \u2502 %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    fh = logging.FileHandler(log_file, encoding="utf-8")
    fh.setFormatter(fmt)
    logger.addHandler(fh)
    ch = logging.StreamHandler(sys.stderr)
    ch.setFormatter(fmt)
    logger.addHandler(ch)
    return logger


def commit_main():
    """Commit accumulated journal changes in one shot."""
    p = argparse.ArgumentParser(
        prog="journal commit",
        description="Commit pending journal changes.",
    )
    p.add_argument("-m", "--message", default="batch update")
    p.add_argument(
        "--project",
        default=None,
        help="Project subdirectory (matches --project used during logging)",
    )
    args = p.parse_args(sys.argv[2:])

    journal_root = resolve_journal_dir()
    if not journal_root.exists():
        print(f"Nothing to commit — {journal_root} does not exist.", file=sys.stderr)
        return

    auto_commit(journal_root, args.message)
    print(f"Committed journal changes: {args.message}")
    check_push_status(journal_root)


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "commit":
        return commit_main()

    p = argparse.ArgumentParser(
        prog="journal",
        description="Log work events.",
        epilog=EXAMPLES,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("level", choices=LEVELS)
    p.add_argument("-m", "--message", required=True)
    p.add_argument("-t", "--type", default="note")
    p.add_argument("--project", default=None, help="Project subdirectory (omit for single-project repos)")
    p.add_argument("--entity")
    p.add_argument("--at", help="When it happened (free text, prefixed to message)")
    p.add_argument("--tag", action="append", default=[])
    p.add_argument(
        "--no-commit",
        action="store_true",
        help="Log the event but skip git commit (use with 'commit' subcommand for batch mode)",
    )
    args = p.parse_args()

    if args.project and (".." in args.project or args.project.startswith(("/", "\\"))):
        p.error("Invalid project name: must not contain '..' or absolute paths")

    journal_root = resolve_journal_dir()
    if args.project:
        log_file = journal_root / args.project / "events.log"
    else:
        log_file = journal_root / "events.log"
    logger = setup_logger(log_file)

    parts = []
    if args.at:
        parts.append(f"@{args.at}")
    parts.append(f"[{args.type}]")
    if args.entity:
        parts.append(f"<{args.entity}>")
    parts.append(args.message)
    if args.tag:
        parts.extend(f"#{t}" for t in args.tag)

    formatted = " ".join(parts)
    logger.log(LEVELS[args.level], formatted)

    # Echo to stdout so the calling agent sees confirmation
    print(formatted)

    # Auto-commit + push reminder (unless --no-commit)
    if not args.no_commit:
        truncated = args.message[:60] + ("..." if len(args.message) > 60 else "")
        auto_commit(journal_root, f"{args.type} — {truncated}")
        check_push_status(journal_root)


if __name__ == "__main__":
    main()
