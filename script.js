document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  if (app) app.style.opacity = "1";

  const screens = document.querySelectorAll(".screen");
  const startBtn = document.getElementById("start-btn");
  const nextBtns = document.querySelectorAll(".btn-next");
  const storyProgress = document.getElementById("story-progress");
  const bgMusic = document.getElementById("bg-music");

  // --- Progress bar ---
  function initProgressBar() {
    if (!storyProgress) return;
    storyProgress.innerHTML = "";
    screens.forEach((s) => {
      if (!s.id) return;
      const seg = document.createElement("div");
      seg.className = "progress-segment";
      seg.innerHTML = '<div class="progress-inner"></div>';
      storyProgress.appendChild(seg);
    });
  }

  function updateProgressBar(index) {
    const inners = document.querySelectorAll(".progress-inner");
    inners.forEach((inner, i) => {
      inner.style.transition = "none";
      inner.style.width = i <= index ? "100%" : "0%";
      if (i === index) inner.style.transition = "width .8s ease";
    });
  }

  // --- Screen switcher ---
  function showScreen(id) {
    const target = document.getElementById(id);
    const current = document.querySelector(".screen.active");
    if (!target || target === current) return;

    const currentIndex = current ? parseInt(current.dataset.index || -1) : -1;
    const targetIndex = parseInt(target.dataset.index || 0);

    // slide prep
    target.classList.remove("next", "prev");
    target.classList.add(targetIndex > currentIndex ? "next" : "prev");
    target.offsetHeight;

    if (current) {
      current.classList.remove("active");
      current.classList.add(targetIndex > currentIndex ? "prev" : "next");
    }

    target.classList.add("active");
    target.classList.remove("next", "prev");

    updateProgressBar(targetIndex);

    // screen-specific
    handleScreenSpecifics(id);
  }

  function handleScreenSpecifics(id) {
    const video = document.getElementById("memory-video");
    const bg = document.getElementById("bg-music");

    if (id === "video-memory") {
      // On your page you use YouTube, so just pause bg music
      if (bg) bg.pause();
      if (video) video.pause();
    }

    if (id === "picture-reveal") {
      if (typeof initPuzzle === "function" && !window.isPuzzleInitialized) {
        initPuzzle();
        window.isPuzzleInitialized = true;
      }
      if (bg && bg.paused) bg.play().catch(() => {});
    }
  }

  initProgressBar();

  // --- Start button ---
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      showScreen("day-1");
      if (bgMusic) {
        bgMusic.volume = 0.5;
        bgMusic.play().catch(() => {});
      }
    });
  } else {
    console.warn("start-btn not found");
  }

  // --- Next buttons ---
  nextBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const nextId = e.currentTarget.getAttribute("data-next");
      if (nextId) showScreen(nextId);
    });
  });
});


  // --- Riddle Unlock Logic ---
  const funnyWrongAnswers = [
    "Not quite, darling! 🤭",
    "Try again, my love! ❤️",
    "Nope! Are you guessing? 🤨",
    "Close... (maybe?) 🤏",
    "I know you know this! 😉",
    "Think harder! 🧠",
    "One more try 😌"
  ];

  function showToast(message) {
    let toast = document.querySelector(".toast-msg");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast-msg";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  const checkBtns = document.querySelectorAll(".btn-check");

  checkBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const box = btn.closest(".riddle-box");
      if (!box) return;

      const input = box.querySelector(".riddle-input");
      const acceptedAnswers = (box.dataset.answer || "")
        .split(",")
        .map((s) => s.trim().toLowerCase());

      const screen = btn.closest(".screen");
      const nextBtn = screen ? screen.querySelector(".btn-next") : null;

      const userVal = input ? input.value.trim().toLowerCase() : "";

      let isCorrect = false;

      // wildcard means always correct
      if (acceptedAnswers.includes("*")) {
        isCorrect = true;
      } else {
        for (const ans of acceptedAnswers) {
          if (!ans) continue;
          if (userVal.includes(ans)) {
            isCorrect = true;
            break;
          }
        }
      }

      if (isCorrect) {
        btn.textContent = "Unlocked ❤️";
        btn.style.background = "#4CAF50";
        btn.style.color = "#fff";

        if (nextBtn) nextBtn.classList.remove("hidden");
      } else {
        // allow progress anyway after a cute message
        input && input.classList.add("shake-it");
        setTimeout(() => input && input.classList.remove("shake-it"), 450);

        showToast(
          funnyWrongAnswers[Math.floor(Math.random() * funnyWrongAnswers.length)]
        );

        btn.textContent = "Saved anyway ✨";
        btn.style.background = "#f7d56b";
        btn.style.color = "#000";

        if (nextBtn) nextBtn.classList.remove("hidden");
      }
    });
  });
