function init() {
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  function setWindowSize() {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  }
  window.addEventListener("resize", setWindowSize);

  const eyes = document.querySelectorAll(".eyes");
  let cursorPos = { x: 0, y: 0 };

  window.addEventListener("mousemove", mousemove);
  window.addEventListener("touchmove", touchmove);

  function mousemove(e) {
    cursorPos = { x: e.clientX, y: e.clientY };
    if (!clicked) {
      eyes.forEach(el => eyeFollow.init(el));
    }
  }
  function touchmove(e) {
    cursorPos = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    if (!clicked) {
      eyes.forEach(el => eyeFollow.init(el));
    }
  }

  const eyeFollow = (() => {
    function getOffset(el) {
      el = el.getBoundingClientRect();
      return { x: el.left + window.scrollX, y: el.top + window.scrollY };
    }

    function moveEye(eye) {
      const eyeOffset = getOffset(eye);
      const bBox = eye.getBBox();
      const centerX = eyeOffset.x + bBox.width / 2;
      const centerY = eyeOffset.y + bBox.height / 2;

      const percentTop = ((cursorPos.y - centerY) * 100) / windowHeight;
      const percentLeft = ((cursorPos.x - centerX) * 100) / windowWidth;

      eye.style.transform = `translate(${percentLeft / 5}px, ${percentTop / 5}px)`;
    }

    return {
      init: el => moveEye(el)
    };
  })();

  let clicked, cancelled;

  const animate = (() => {
    const select = id => document.getElementById(id);

    const svg = select("svg");
    const blob1 = select("blob-1");
    const blob3 = select("blob-3");
    const envelope = select("envelope");
    const eyeGroup = select("eye-group");
    const paper = select("paper-group");
    const mouth = select("mouth");

    const mouthHappy = select("mouth-happy");
    const mouthScared = select("mouth-scared");
    const mouthSad = select("mouth-sad");
    const mouthWorry = select("mouth-worry");

    const eyeLeft = MorphSVGPlugin.convertToPath(select("eye-left"));
    const eyeRight = MorphSVGPlugin.convertToPath(select("eye-right"));
    const eyeLaughingLeft = select("eye-laughing-left");
    const eyeLaughingRight = select("eye-laughing-right");

    const eyebrowHappyLeft = select("eyebrow-happy-left");
    const eyebrowHappyRight = select("eyebrow-happy-right");
    const eyebrowSadLeft = select("eyebrow-sad-left");
    const eyebrowSadRight = select("eyebrow-sad-right");

    const openMouth = select("open-mouth");
    const tongue = select("tongue");

    const unsubscribeButton = select("unsubscribe");
    const cancelButton = select("cancel");
    const goBackButton = select("go-back");

    const confettis = document.querySelectorAll("#confetti > *");
    const title = document.querySelector(".title");
    const subtitle = document.querySelector(".subtitle");

    const masterTl = gsap.timeline();

    unsubscribeButton.addEventListener("mouseover", willUnsubscribe);
    cancelButton.addEventListener("mouseover", willCancel);
    unsubscribeButton.addEventListener("touchstart", willUnsubscribe);
    cancelButton.addEventListener("touchstart", willCancel);
    unsubscribeButton.addEventListener("click", hasUnsubscribed);
    cancelButton.addEventListener("click", hasCancelled);
    unsubscribeButton.addEventListener("mouseout", initFace);
    cancelButton.addEventListener("mouseout", initFace);
    unsubscribeButton.addEventListener("touchleave", initFace);
    cancelButton.addEventListener("touchleave", initFace);
    goBackButton.addEventListener("click", goBack);

    // 🟣 Blob animation
    function animateBlob() {
      gsap.timeline({ repeat: -1 })
        .to(blob1, { duration: 10, morphSVG: blob3, ease: "none" })
        .to(blob1, { duration: 10, morphSVG: blob1, ease: "none" });
    }

    // 🎉 Confetti
    function makeConfetti() {
      const confettiTl = gsap.timeline({ paused: true });

      confettis.forEach(el => {
        const angle = random(0, 360);
        const delay = random(0, 6);
        const posX = Math.cos(angle * Math.PI / 180) * 250;
        const posY = Math.sin(angle * Math.PI / 180) * 250;

        gsap.set(el, { autoAlpha: 1 });
        confettiTl.to(el, {
          duration: 3,
          x: posX,
          y: posY,
          rotation: 360,
          ease: "none",
          repeat: -1,
          delay
        }, 0);
      });

      return confettiTl;
    }

    // 💌 Envelope happy jump
    function happyJump() {
      return gsap.timeline({ repeat: -1, repeatDelay: 1, paused: true })
        .to(envelope, { duration: 0.15, y: -20 })
        .to(envelope, { duration: 0.15, y: 0 })
        .to(envelope, { duration: 0.15, y: -10 })
        .to(envelope, { duration: 0.15, y: 0 })
        .to(envelope, { duration: 0.15, y: -5 })
        .to(envelope, { duration: 0.15, y: 0 });
    }

    // 😧 Shake when scared
    function shake() {
      return gsap.timeline({ repeat: -1, paused: true })
        .to(envelope, { duration: 0.1, x: -1 })
        .to(envelope, { duration: 0.1, x: 1 });
    }

    const doJump = happyJump();
    const doShake = shake();
    const addConfetti = makeConfetti();

    // 🟠 Hover unsubscribe → scared
    function willUnsubscribe() {
      masterTl.add(doShake.play());
      gsap.to(mouthWorry, { duration: 0.2, morphSVG: mouthScared });
      gsap.to(paper, { duration: 0.2, y: 15 });
      gsap.to(eyeGroup, { duration: 0.2, y: 5 });
      gsap.to(mouth, { duration: 0.2, y: 5 });
      gsap.to(eyebrowSadLeft, { duration: 0.2, y: 5 });
      gsap.to(eyebrowSadRight, { duration: 0.2, y: 5 });
    }

    // 🟢 Hover yes → happy
    function willCancel() {
      gsap.to(mouthWorry, { duration: 0.2, morphSVG: mouthHappy });
      gsap.to(eyebrowSadLeft, { duration: 0.2, morphSVG: eyebrowHappyLeft, y: -10 });
      gsap.to(eyebrowSadRight, { duration: 0.2, morphSVG: eyebrowHappyRight, y: -10 });
      gsap.to(mouth, { duration: 0.2, y: 10 });
    }

    // ❌ Click "No molestes"
    function hasUnsubscribed() {
      gsap.to(mouthWorry, { duration: 0.2, morphSVG: mouthSad });
      gsap.to(eyeGroup, { duration: 0.2, y: 15 });
      gsap.to(eyebrowSadLeft, { duration: 0.2, y: 10 });
      gsap.to(eyebrowSadRight, { duration: 0.2, y: 10 });

      title.innerHTML = "Ya me puse triste 😔";
      subtitle.innerHTML =
        "Por favor reconsidera tu respuesta, no dejes que mi corazón de pollo lo hagan chicharrón 💔.";

      unsubscribeButton.style.display = "none";
      cancelButton.style.display = "none";
      goBackButton.style.display = "block";

      clicked = true;
      masterTl.remove(doShake);
    }

    // ❤️ Click "Claro amor"
    function hasCancelled() {
      masterTl.add(doJump.play());
      masterTl.add(addConfetti.play());

      gsap.to(eyeLeft, { duration: 0.1, morphSVG: eyeLaughingLeft, fill: "none", stroke: "#543093" });
      gsap.to(eyeRight, { duration: 0.1, morphSVG: eyeLaughingRight, fill: "none", stroke: "#543093" });
      gsap.to(mouthWorry, { duration: 0.1, morphSVG: openMouth, fill: "#543093", stroke: "none" });
      gsap.to(tongue, { duration: 0.1, display: "block" });
      gsap.to(eyeGroup, { duration: 0.1, y: 10 });

      title.innerHTML = "Gracias, sabía que dirías que sí, te amo ♡";
      subtitle.innerHTML =
        "Eres lo más bonito que tengo, la luz que vuelve habitable cada esquina de mi alma. 💖";

      unsubscribeButton.style.display = "none";
      cancelButton.style.display = "none";
      goBackButton.style.display = "block";

      clicked = true;
      cancelled = true;
    }

    // 🔄 Volver a inicio
    function goBack() {
      clicked = false;
      cancelled = false;

      initAnimations();

      masterTl.remove(doJump);
      masterTl.remove(addConfetti);

      confettis.forEach(el =>
        gsap.set(el, { x: 0, y: 0, rotation: 0 })
      );

      title.innerHTML = "Do you love me?";
      subtitle.innerHTML = "If you say no, you will stop receiving calls from me.";

      unsubscribeButton.style.display = "block";
      cancelButton.style.display = "block";
      goBackButton.style.display = "none";
    }

    // 🔧 Reset face
    function initFace() {
      masterTl.remove(doShake);

      if (!clicked) {
        gsap.to(mouthWorry, { duration: 0.1, morphSVG: mouthWorry, fill: "none", stroke: "#543093" });
        gsap.to(tongue, { duration: 0.1, display: "none" });
        gsap.to(paper, { duration: 0.1, y: 0 });
        gsap.to(eyeGroup, { duration: 0.1, y: 0 });
        gsap.to(mouth, { duration: 0.1, y: 0 });
        gsap.to(eyebrowSadLeft, { duration: 0.1, morphSVG: eyebrowSadLeft, y: 0 });
        gsap.to(eyebrowSadRight, { duration: 0.1, morphSVG: eyebrowSadRight, y: 0 });

        gsap.to(eyeLeft, { duration: 0.1, morphSVG: eyeLeft, fill: "#543093", stroke: "none" });
        gsap.to(eyeRight, { duration: 0.1, morphSVG: eyeRight, fill: "#543093", stroke: "none" });
      }
    }

    function initAnimations() {
      clicked = false;
      initFace();
      animateBlob();
    }

    return {
      init: () => initAnimations()
    };
  })();

  document.addEventListener("DOMContentLoaded", animate.init());

  function random(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return Math.random() * (max - min) + min;
  }
}

init();
