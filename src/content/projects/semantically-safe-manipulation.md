---
title: "Semantically Safe Robot Manipulation"
summary: >-
  A safety framework that lets a manipulator work in human-centric spaces by
  certifying its inputs against semantic constraints — unsafe spatial
  relationships, behaviours and poses inferred by a language model — alongside
  ordinary geometric collision constraints.
role: >-
  Deployed the object detection and 3D segmentation pipeline, contributed to the
  safety-filter framework certifying robot inputs against semantic constraints,
  and integrated those constraints into the control flow.
collaborators:
  - Lukas Brunke
  - Yanni Zhang
  - Ralf Römer
  - Jack Naimer
  - Siqi Zhou
  - Angela P. Schoellig
result: >-
  Certifies robot inputs against semantic constraints — unsafe spatial
  relationships, behaviours and poses inferred by a language model from a
  semantic 3D map — simultaneously with geometric collision and self-collision
  constraints, rather than treating the two as separate checks.
hardPart: >-
  Language-model-inferred constraints are not trustworthy in the way geometric
  ones are: they arrive as natural-language judgements about a scene, and a
  safety filter needs something it can actually certify against. Getting from a
  semantic map to constraints a control-barrier formulation can consume — without
  the semantic layer either dominating the geometric one or being silently
  ignored by it — is the substance of the problem.
stack: [SLAM, "Control Barrier Functions", Python, ROS, "3D Segmentation"]
links:
  paper: "https://arxiv.org/abs/2410.15185"
  demo: "https://utiasdsl.github.io/semantic-manipulation/"
startDate: 2024-10-19
featured: true
order: 2
---

Published in **IEEE Robotics and Automation Letters**. Work with the
[Dynamic Systems Lab](https://www.dynsyslab.org/) at UTIAS.

<!-- TODO(nikola): `hardPart` above is drafted from the paper's framing, NOT from
     your account of the work. Rewrite it in your own words — what was non-obvious
     to *you* on the detection/segmentation and safety-filter integration. That is
     the single highest-signal paragraph on this page and it has to be yours.
     Also: confirm the real start date (currently anchored to the arXiv date). -->
