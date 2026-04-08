# Upgrading Custom ClawX Changes

This repo contains custom ClawX work that was ported forward from the older
multi-agent/sidebar branch into the `0.3.5` codebase.

The goal of this file is to make future upgrades repeatable and low-stress.

## Source of Truth

Do not treat a built `.exe` as the source of truth.

Use Git as the source of truth:

- Upstream repo: `origin`
- Personal writable fork: `userfork`
- Current custom integration branch: `codex/port-pr-611-to-0.3.5`

Important historical branches:

- `pr-611`
  - original feature branch snapshot
- `codex/pr-611-fixes`
  - restored older fixes on the old code line
- `codex/port-pr-611-to-0.3.5`
  - the branch to port forward from for future upgrades

## What To Carry Forward

When moving to a newer ClawX release, the branch to preserve is:

- `codex/port-pr-611-to-0.3.5`

That branch contains the custom work we care about:

- multi-agent chat attachment
- chat toolbar add-agent UI
- agent-labeled responses
- sidebar/project folder behavior
- follow-up test stabilizations needed on the newer codebase

## Recommended Upgrade Flow

When a new upstream version arrives, do not copy files by hand.

Use this workflow instead:

1. Fetch the latest upstream and fork refs.
2. Create a new upgrade branch from upstream `main`.
3. Cherry-pick or merge the custom branch onto that new branch.
4. Resolve conflicts in chat/store/sidebar/test files.
5. Run tests and build.
6. Package the new installer.

## Commands

Example for a future upgrade:

```powershell
git fetch origin --prune
git fetch userfork --prune
git checkout main
git pull --ff-only origin main
git checkout -b codex/port-custom-to-3.7
git cherry-pick 653d9b3
git cherry-pick 482bdc2
```

If the newer version has drifted a lot, use a merge instead of cherry-picking:

```powershell
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git checkout -b codex/port-custom-to-3.7
git merge --no-ff codex/port-pr-611-to-0.3.5
```

## Which Approach To Prefer

Prefer `cherry-pick` when:

- you want a smaller, clearer history
- you know which custom commits matter
- you want conflict resolution commit-by-commit

Prefer `merge` when:

- the custom branch has accumulated more fixes
- you want to preserve branch history exactly
- there are many related commits that belong together

## High-Risk Files During Upgrades

Expect conflicts or behavior drift in these areas first:

- `src/stores/chat.ts`
- `src/stores/chatMeta.ts`
- `src/stores/projectStore.ts`
- `src/components/layout/Sidebar.tsx`
- `src/pages/Chat/ChatToolbar.tsx`
- `src/pages/Chat/ChatInput.tsx`
- `src/pages/Chat/ChatMessage.tsx`
- `src/pages/Chat/index.tsx`
- `src/lib/routing.ts`
- `tests/setup.ts`
- `tests/unit/chat-target-routing.test.ts`
- `tests/unit/chat-input.test.tsx`

## Validation Checklist

After conflict resolution, run:

```powershell
pnpm install --force
pnpm run typecheck
pnpm exec vitest run
pnpm run build:vite
pnpm run package:win
```

If the full test suite is noisy after an upstream upgrade, still verify these
first because they are closest to the custom feature:

```powershell
pnpm exec vitest run tests\\unit\\chat-target-routing.test.ts tests\\unit\\chat-input.test.tsx
```

## Packaging Output To Check

After a successful Windows package build, confirm these exist:

- `release/ClawX-<version>-win-x64.exe`
- `release/latest.yml`
- `release/win-unpacked/ClawX.exe`

## Recovery Rule

If an installed ClawX update replaces the app on your machine, that does not
mean the custom work is lost as long as this Git branch still exists locally or
on GitHub.

The recovery path is:

1. get the new source tree
2. create a new port branch from upstream
3. reapply this custom branch
4. rebuild the installer

## Practical Advice

- Push the custom branch to a writable remote after meaningful changes.
- Avoid making the built installer your only backup.
- Keep package artifacts in `release/`, but keep the code in Git.
- Before major upgrades, tag the last known-good custom port if desired.

## Last Known Custom Port

At the time this file was written:

- base app version: `0.3.5`
- custom branch: `codex/port-pr-611-to-0.3.5`
- key port commits:
  - `653d9b3`
  - `482bdc2`
