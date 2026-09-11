---
title: "Policy Analyzer"
summary: >-
  A browser dashboard for inspecting trained dexterous-manipulation policies.
  Point it at a MuJoCo Playground log directory and it rolls out checkpoints
  across available GPUs, records every observation and action, and streams the
  results back live. Plots are grouped by the policy's real I/O schema — rebuilt
  from the environment itself, so labels cannot drift out of sync with the network.
result: >-
  Turns an ablation study from a scripting exercise into a filter-and-click
  workflow: policies are grouped by overrides file with training-seed replicates
  pooled automatically, and evaluated over a deterministic grid sweeping the
  run's own randomization ranges — cube size, force target, goal angle, friction.
hardPart: >-
  The failure mode worth designing against is silent, not loud: a plot axis
  labelled with the wrong degree of freedom looks entirely plausible and quietly
  invalidates the conclusion drawn from it. Deriving the I/O schema from the obs
  registry and the compiled MuJoCo model — rather than maintaining a parallel
  list in the frontend — means Python and the environment cannot disagree about
  vector layout. Streaming rollouts over SSE was the other constraint: results
  had to appear as they finished, not after the slowest one.
role: "Sole author. Research tooling built alongside the proprioception work."
collaborators: []
stack: ["MuJoCo Playground", Python, JAX, "Server-Sent Events", "Multi-GPU"]
links: {}
# TODO(nikola): dashboard screen recording -> thumb
startDate: 2025-11-01
featured: true
order: 2
---

<!-- TODO(nikola): can this repo be public? If yes, add links.code.
     A 10s screen recording — policy picker, then the rollout grid filling in
     live over SSE — is the second-strongest media asset available after a
     rollout clip. Also confirm the start date. -->
