---
title: "Director's Monitor Interactive Demo Enhancement"
description: "Transform auto-running pipeline into step-by-step interactive demo with upload, style selection, character setup, and user-driven progression"
status: pending
priority: P1
effort: 16h
branch: main
tags: [monitor, prototype, interactive, demo, ux]
created: 2026-03-05
---

# Director's Monitor Interactive Demo Enhancement

## Overview

Transform the `/monitor` prototype from an auto-starting pipeline simulator into a step-by-step interactive demo. Users should manually drive each step: upload track, review analysis, pick style/mood/category, set up characters, choose storyline, review storyboard, watch generation, and export.

## Current Architecture

- `MonitorPage` → `MonitorLayout` (40/60 split: chat + workspace)
- `MonitorWorkspace` switches views based on `currentLayerId` from Zustand pipeline store
- `PipelineSimulator` auto-runs 5 layers with timed progress + quality gates
- Journey orchestrator has 12 states mapped to 5 pipeline layers
- Chat streams contextual responses per journey state

## Core Problem

Pipeline auto-starts on mount (`sim.start()` in useEffect). No user upload step, no style picker, no character setup. The workspace view switching is driven by pipeline layer ID, not by granular sub-steps within layers.

## Architecture Decision

**Approach**: Extend the journey state machine with sub-states. Decouple workspace view switching from pipeline layer — use `viewHint` from journey states instead. Pipeline simulator starts only when user triggers each phase.

Key changes:
1. Journey states get new sub-states for each interactive step
2. `MonitorWorkspace` switches on `viewHint` string, not `currentLayerId`
3. Pipeline simulator runs in segments (per-layer), not all-at-once
4. `MonitorPage` exposes `viewHint` to layout via props or a new Zustand slice

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 1 | [Foundation: State Machine + View Routing](./phase-01-foundation.md) | pending | 2h |
| 2 | [Upload View](./phase-02-upload-view.md) | pending | 2h |
| 3 | [Enhanced Analysis View](./phase-03-analysis-view.md) | pending | 1.5h |
| 4 | [Style & Creative Preferences](./phase-04-style-selection.md) | pending | 2.5h |
| 5 | [Character Setup](./phase-05-character-setup.md) | pending | 2h |
| 6 | [Storyline Generation](./phase-06-storyline-generation.md) | pending | 2h |
| 7 | [Storyboard + Generation + Export Polish](./phase-07-polish.md) | pending | 2h |
| 8 | [Chat Responses + Integration Testing](./phase-08-integration.md) | pending | 2h |

## Dependencies

- All phases depend on Phase 1 (state machine foundation)
- Phases 2-7 can be built incrementally after Phase 1
- Phase 8 integrates and tests everything
