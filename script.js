document.addEventListener("DOMContentLoaded", () => {
  const screens = document.querySelectorAll(".screen");
  const startBtn = document.getElementById("start-btn");
  const nextBtns = document.querySelectorAll(".btn-next");
  const bgMusic = document.getElementById("bg-music");
  const musicToggle = document.getElementById("music-toggle");

  // ---------------- Toast ----------------
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

  const funnyWrongAnswers = [
    "Not quite, darling! 🤭",
    "Try again, my love! ❤️",
    "Nope! Are you guessing? 🤨",
    "Close... (maybe?) 🤏",
    "I know you know this! 😉",
    "Think harder! 🧠",
    "One more try 😌",
  ];

  // ---------------- Screen Switcher ----------------
  function showScreen(id) {
    const target = document.getElementById(id);
    const current = document.querySelector(".screen.active");
    if (!target || target === current) return;

    if (current) current.classList.remove("active");
    target.classList.add("active");

    // Puzzle init only when entering puzzle screen
    if (id === "picture-reveal" && typeof window.initPuzzle === "function") {
      if (!window.isPuzzleInitialized) {
        window.initPuzzle();
        window.isPuzzleInitialized = true;
      }
    }
  }

  // ---------------- Start Button ----------------
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      showScreen("day-1");
      if (bgMusic) {
        bgMusic.volume = 0.4;
        bgMusic.muted = true; // start muted
        bgMusic.play().catch(() => {});
      }
    });
  }

  // ---------------- Next Buttons ----------------
  nextBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const nextId = e.currentTarget.getAttribute("data-next");
      if (nextId) showScreen(nextId);
    });
  });

  // ---------------- Music Toggle ----------------
  if (musicToggle && bgMusic) {
    musicToggle.addEventListener("click", () => {
      if (bgMusic.paused) {
        bgMusic.muted = false;
        bgMusic.play().catch(() => {});
        musicToggle.textContent = "🔊";
      } else {
        bgMusic.muted = !bgMusic.muted;
        musicToggle.textContent = bgMusic.muted ? "🔇" : "🔊";
      }
    });
  }

  // ---------------- Unlock / Riddle Logic ----------------
  document.querySelectorAll(".btn-check").forEach((btn) => {
    btn.addEventListener("click", () => {
      const box = btn.closest(".riddle-box");
      if (!box) return;

      const input = box.querySelector(".riddle-input");
      const accepted = (box.dataset.answer || "")
        .split(",")
        .map((s) => s.trim().toLowerCase());

      const userVal = input ? input.value.trim().toLowerCase() : "";

      const screen = btn.closest(".screen");
      const nextBtn = screen ? screen.querySelector(".btn-next") : null;

      let ok = false;
      if (accepted.includes("*")) ok = true;
      else {
        for (const ans of accepted) {
          if (ans && userVal.includes(ans)) {
            ok = true;
            break;
          }
        }
      }

      if (ok) {
        btn.textContent = "Unlocked ❤️";
        btn.style.background = "#4CAF50";
        btn.style.color = "#fff";
        if (nextBtn) nextBtn.classList.remove("hidden");
      } else {
        if (input) {
          input.classList.add("shake-it");
          setTimeout(() => input.classList.remove("shake-it"), 400);
        }
        showToast(funnyWrongAnswers[Math.floor(Math.random() * funnyWrongAnswers.length)]);

        // still allow next
        btn.textContent = "Saved anyway ✨";
        btn.style.background = "#f7d56b";
        btn.style.color = "#000";
        if (nextBtn) nextBtn.classList.remove("hidden");
      }
    });
  });

  console.log("✅ script.js loaded & running");
});
