const bloomFlower = document.getElementById("landing-bloom-flower");
const bloomTrigger = bloomFlower?.closest(".landing-bloom");

if (bloomFlower && bloomTrigger) {
  const finalFrameWidth = 302;
  const finalStemAnchor = 135;
  const frames = [
    { path: "Assets/Blooming%20flower%20ORG/1.png", width: 40, stemAnchor: 15.5 },
    { path: "Assets/Blooming%20flower%20ORG/2.png", width: 63, stemAnchor: 17 },
    { path: "Assets/Blooming%20flower%20ORG/3.png", width: 71, stemAnchor: 32 },
    { path: "Assets/Blooming%20flower%20ORG/4.png", width: 64, stemAnchor: 24 },
    { path: "Assets/Blooming%20flower%20ORG/5.png", width: 71, stemAnchor: 24 },
    { path: "Assets/Blooming%20flower%20ORG/6.png", width: 141, stemAnchor: 70 },
    { path: "Assets/Blooming%20flower%20ORG/7.png", width: 197, stemAnchor: 92 },
    { path: "Assets/Blooming%20flower%20ORG/8.png", width: 258, stemAnchor: 124 },
    { path: "Assets/Blooming%20flower%20ORG/9.png", width: 258, stemAnchor: 124 },
    { path: "Assets/Blooming%20flower%20ORG/10.png", width: 258, stemAnchor: 124 },
    { path: "Assets/Blooming%20flower%20ORG/11.png", width: 258, stemAnchor: 124 },
    { path: "Assets/Blooming%20flower%20ORG/12.png", width: 258, stemAnchor: 124 },
    { path: "Assets/Blooming%20flower%20ORG/13.png", width: 302, stemAnchor: 135 },
    { path: "Assets/Blooming%20flower%20ORG/14.png", width: 302, stemAnchor: 135 }
  ];
  const frameDelay = 70;
  let currentFrame = 0;
  let targetFrame = 0;
  let animationTimer = null;

  frames.forEach(({ path }) => {
    const image = new Image();
    image.src = path;
  });

  function renderFrame() {
    const frame = frames[currentFrame];
    const widthPercent = (frame.width / finalFrameWidth) * 100;
    const leftPercent = ((finalStemAnchor - frame.stemAnchor) / finalFrameWidth) * 100;

    bloomFlower.src = frame.path;
    bloomFlower.style.setProperty("--bloom-frame-width", `${widthPercent}%`);
    bloomFlower.style.left = `${leftPercent}%`;
  }

  function stopAnimation() {
    if (!animationTimer) return;

    window.clearInterval(animationTimer);
    animationTimer = null;
  }

  function animateTowardTarget() {
    if (currentFrame === targetFrame) {
      stopAnimation();
      return;
    }

    currentFrame += currentFrame < targetFrame ? 1 : -1;
    renderFrame();
  }

  function setTargetFrame(frame) {
    targetFrame = frame;

    if (!animationTimer) {
      animationTimer = window.setInterval(animateTowardTarget, frameDelay);
    }

    animateTowardTarget();
  }

  bloomFlower.addEventListener("mouseenter", () => {
    setTargetFrame(frames.length - 1);
  });

  bloomFlower.addEventListener("mouseleave", () => {
    setTargetFrame(0);
  });

  bloomTrigger.addEventListener("focus", () => {
    setTargetFrame(frames.length - 1);
  });

  bloomTrigger.addEventListener("blur", () => {
    setTargetFrame(0);
  });

  renderFrame();
}
