Drop media here:

  public/media/<project-slug>.mp4     # muted, looping, web-optimised h264/webm
  public/media/<project-slug>.jpg     # poster frame

Then reference it from the project's frontmatter:

  media:
    video: /media/proprioception-dexterous-manipulation.mp4
    alt: "In-hand reorientation of a cube, MuJoCo rollout"

Keep clips short (5–12s) and under ~3 MB. A poster frame is required so the
layout reserves space and CLS stays at zero.
