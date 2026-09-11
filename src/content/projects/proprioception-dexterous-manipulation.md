---
title: "Proprioception for Dexterous Manipulation"
summary: >-
  An investigation of how much a robotic hand can recover about contact and
  applied force from proprioception alone — joint positions, velocities and
  torques — and where that signal stops being sufficient for dexterous tasks.
result: >-
  Joint positions and velocities alone are already informative about contact
  force under a quasi-static assumption. An explicit force-carrying signal helps
  in proportion to task difficulty — but once tasks become dynamic and the goal
  is no longer defined by contact force, that advantage vanishes and every
  proprioceptive policy tested collapses to the same performance level.
hardPart: >-
  The negative result is the finding. It would have been easy to report only the
  regime where added force signal helps and stop there. Establishing the boundary
  meant showing the quasi-static assumption is what carries the mapping from PD
  error to contact force — and that it breaks in two distinct ways: during
  approach, before a grasp exists, other dynamics dominate the error term; and
  per-finger during in-hand reorientation, where contact genuinely drops out.
  Both are invisible if you only look at aggregate success rates.
role: "Sole author. MSc research at ETH Zürich."
collaborators: []
stack: [MuJoCo, "MuJoCo Playground", Python, "Reinforcement Learning", "Force Estimation"]
links: {}
thumb: "/media/proprio-rotation.png"
media:
  video: ""
  alt: "Tesollo hand performing a contact-rich pinch task in MuJoCo"
startDate: 2025-09-01
featured: true
order: 1
---

Supervised by Prof. Christoforos Mavrogiannis and Prof. Stelian Coros.

![Pinch force reconstruction from proprioceptive PD error](/media/proprio-pinch-force.png)

![Fingertip force tracking under sinusoidal targets](/media/proprio-pinch-sinusoid-forces.png)

<!-- TODO(nikola): `result` states the finding qualitatively. If you have the
     success-rate delta on force-intensive tasks, put the number in — a number
     lands harder than a claim. Also: a rollout clip belongs at the top of this
     page and in the hero (media.video is stubbed, ready for the file). -->
