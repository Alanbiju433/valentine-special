document.addEventListener("DOMContentLoaded", () => {
  // ---------- Elements ----------
  const app = document.getElementById("app");
  const screens = Array.from(document.querySelectorAll(".screen"));
  const startBtn = document.getElementById("start-btn");
  const nextBtns = document.querySelectorAll(".btn-next");

  const storyProgress = document.getElementById("story-progress");
  const bgMusic = document.getElementById("bg-music");
  const musicToggle = document.getElementById("music-toggle");

  const yesBtn = document.getElementById("yes-btn");
  const timeBtn = document.getElementById("time-btn");
  const timeMsg = document.getElementById("time-msg");
  const celebrationMsg = document.getElementById("celebration-msg");
  const proposalActions = document.querySelector(".proposal-actions");
  const bigQuestion = document.querySelector(".big-question");

  const chatBtn = document.getElementById("chat-btn");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatBox = document.getElementById("chat-box");

  // ---------- Optional Socket ----------
  let socket = null;
  try {
    socket = io();
  } catch (e) {
    console.log("Socket.io not found. Chat works only with server running.");
  }

  // ---------- Config ----------
  // If you want YouTube ONLY, keep true.
  // If you want local video.mp4, set false and ensure /video.mp4 exists.
  const USE_YOUTUBE = true;
  const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/5_p3jcSsZCw";

  // ---------- Helpers ----------
  const funnyWrongAnswers = [
    "Not quite, darling! 🤭",
    "Try again, my love! ❤️",
    "Nope! Are you guessing? 🤨",
    "Close... (maybe?) 🤏",
    "I know you know this! 😉",
    "Think harder! 🧠",
    "Is that your final answer? 🐜",
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

    const rot = Math.random() * 10 - 5;
    toast.style.transform = `translateX(-50%) translateY(0) rotate(${rot}deg)`;

    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function startTypewriter(element) {
    const text = element.getAttribute("data-text");
    if (!text) return;

    element.textContent = "";
    element.classList.add("typewriter-cursor");

    let i = 0;
    const speed = 45;

    function type() {
      if (i < text.length) {
        if (text.substring(i, i + 2) === "\\n") {
          element.innerHTML += "<br>";
          i += 2;
        } else {
          element.innerHTML += text.charAt(i);
          i++;
        }
        setTimeout(type, speed);
      } else {
        element.classList.remove("typewriter-cursor");
      }
    }
    type();
  }

  // ---------- Progress Bar ----------
  // Only build progress for screens that have data-index
  const progressScreens = screens.filter((s) => s.dataset.index !== undefined);

  function initProgressBar() {
    if (!storyProgress) return;
    storyProgress.innerHTML = "";

    progressScreens.forEach(() => {
      const seg = document.createElement("div");
      seg.className = "progress-segment";
      seg.innerHTML = `<div class="progress-inner"></div>`;
      storyProgress.appendChild(seg);
    });
  }

  function updateProgressBar(targetIndex) {
    const inners = document.querySelectorAll(".progress-inner");
    inners.forEach((inner, i) => {
      if (i < targetIndex) {
        inner.style.width = "100%";
        inner.style.transition = "none";
      } else if (i === targetIndex) {
        inner.style.width = "100%";
        inner.style.transition = "width 0.8s ease-in-out";
      } else {
        inner.style.width = "0%";
        inner.style.transition = "none";
      }
    });
  }

  // ---------- Screen Switcher ----------
  function stopVideoIfAny() {
    const video = document.getElementById("memory-video");
    if (video) {
      try {
        video.pause();
        video.currentTime = 0;
      } catch {}
    }

    const yt = document.getElementById("youtube-video");
    if (yt && yt.src) {
      // reset to stop playback
      const src = yt.src;
      yt.src = src;
    }
  }

  function handleScreenSpecifics(id) {
    const video = document.getElementById("memory-video");
    const youtubeOverlay = document.getElementById("youtube-overlay");
    const youtubeIframe = document.getElementById("youtube-video");
    const canvas = document.getElementById("particle-canvas");

    if (id === "video-memory") {
      // pause bg music during video
      if (bgMusic) bgMusic.pause();

      if (USE_YOUTUBE) {
        if (video) video.style.display = "none";
        if (youtubeOverlay) youtubeOverlay.style.display = "block";
        if (youtubeIframe) youtubeIframe.src = YOUTUBE_EMBED_URL;
      } else {
        if (youtubeOverlay) youtubeOverlay.style.display = "none";
        if (video) {
          video.style.display = "block";
          video.currentTime = 0;
          video.play().catch(() => showToast("Video loading... ⏳"));
          video.onended = () => showScreen("picture-reveal");
        }
      }

      // fade particles a bit
      if (canvas) canvas.style.opacity = 0.25;
    } else {
      // leaving video slide => stop playback
      stopVideoIfAny();
      if (bgMusic && !bgMusic.muted) bgMusic.play().catch(() => {});
      const canvas = document.getElementById("particle-canvas");
      if (canvas) canvas.style.opacity = 1;
    }

    if (id === "picture-reveal") {
      if (!window.isPuzzleInitialized && typeof window.initPuzzle === "function") {
        window.initPuzzle();
        window.isPuzzleInitialized = true;
      }
    }
  }

  function animateScreen(target) {
    const frame = target.querySelector(".frame, .video-container, .puzzle-wrapper");
    if (frame && window.gsap) {
      gsap.fromTo(
        frame,
        { opacity: 0, scale: 0.9, y: 70, filter: "blur(18px)" },
        { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "expo.out" }
      );
    }

    const typeWriterEl = target.querySelector(".typewriter-text");
    if (typeWriterEl) startTypewriter(typeWriterEl);
  }

  function showScreen(id) {
    const target = document.getElementById(id);
    const current = document.querySelector(".screen.active");
    if (!target || target === current) return;

    const currentIndex = current ? parseInt(current.dataset.index ?? "-1", 10) : -1;
    const targetIndex = parseInt(target.dataset.index ?? "0", 10);

    // transition classes
    target.classList.remove("next", "prev");
    target.classList.add(targetIndex > currentIndex ? "next" : "prev");
    target.offsetHeight; // reflow

    if (current) {
      current.classList.remove("active");
      current.classList.add(targetIndex > currentIndex ? "prev" : "next");
    }

    target.classList.add("active");
    target.classList.remove("next", "prev");

    // progress bar index based on data-index
    if (!Number.isNaN(targetIndex)) updateProgressBar(targetIndex);

    handleScreenSpecifics(id);
    animateScreen(target);

    if (id === "day-7") {
      target.classList.add("heartbeat-mode");
    }
  }

  // ---------- Start ----------
  initProgressBar();
  if (app) requestAnimationFrame(() => (app.style.opacity = 1));

  if (bgMusic) {
    bgMusic.volume = 0.4;
    bgMusic.muted = true; // start muted
  }

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      showScreen("day-1");
      if (bgMusic) bgMusic.play().catch(() => {});
    });
  }

  nextBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const nextId = e.currentTarget.getAttribute("data-next");
      if (nextId) showScreen(nextId);
    });
  });

  // Tap / click to advance if next button visible
  document.addEventListener("mousedown", (e) => {
    if (e.target.closest("button, input, textarea, a, video, iframe, .puzzle-piece")) return;

    const currentActive = document.querySelector(".screen.active");
    if (!currentActive || currentActive.id === "landing") return;

    const nextBtn = currentActive.querySelector(".btn-next");
    if (nextBtn && !nextBtn.classList.contains("hidden")) {
      const nextId = nextBtn.getAttribute("data-next");
      if (nextId) showScreen(nextId);
    } else {
      const frame = currentActive.querySelector(".frame");
      if (frame) {
        frame.classList.add("shake-it");
        setTimeout(() => frame.classList.remove("shake-it"), 500);
        showToast("Solve the riddle to continue! ✨");
      }
    }
  });

  // ---------- Music Toggle ----------
  if (musicToggle && bgMusic) {
    musicToggle.addEventListener("click", () => {
      if (bgMusic.paused) {
        bgMusic.muted = false;
        bgMusic.play().catch(() => {});
        musicToggle.textContent = "🔊";
        return;
      }
      bgMusic.muted = !bgMusic.muted;
      musicToggle.textContent = bgMusic.muted ? "🔇" : "🔊";
    });
  }

  // ---------- Whispers ----------
  const whispers = ["I made this slowly.", "You don’t have to rush.", "Some feelings are quiet.", "You matter to me.", "Just breathe."];
  const whisperText = document.getElementById("whisper-text");
  if (whisperText) {
    setInterval(() => {
      whisperText.classList.remove("animate");
      setTimeout(() => {
        whisperText.textContent = whispers[Math.floor(Math.random() * whispers.length)];
        whisperText.classList.add("animate");
      }, 100);
    }, 6000);
  }

  // ---------- Cursor Hearts ----------
  let lastHeartTime = 0;
  document.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - lastHeartTime < 100) return;
    lastHeartTime = now;

    const heart = document.createElement("div");
    heart.className = "cursor-heart";
    heart.textContent = "✨";
    heart.style.left = `${e.clientX}px`;
    heart.style.top = `${e.clientY}px`;
    heart.style.color = "var(--primary-color)";
    heart.style.textShadow = "0 0 10px var(--accent-pink)";
    heart.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 1000);
  });

  // ---------- Riddle Logic (forgiving) ----------
  document.querySelectorAll(".btn-check").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const box = e.currentTarget.closest(".riddle-box");
      if (!box) return;

      const input = box.querySelector(".riddle-input");
      const acceptedAnswers = (box.dataset.answer || "").split(",").map((s) => s.trim().toLowerCase());
      const questionText = box.dataset.question || "Unknown Riddle";

      const screen = e.currentTarget.closest(".screen");
      const nextBtn = screen ? screen.querySelector(".btn-next") : null;

      const userVal = input ? input.value.trim() : "";
      const userValLower = userVal.toLowerCase();

      let isCorrect = false;
      if (acceptedAnswers.includes("*")) {
        isCorrect = true;
      } else {
        for (const ans of acceptedAnswers) {
          if (ans && userValLower.includes(ans)) {
            isCorrect = true;
            break;
          }
        }
      }

      if (isCorrect) {
        btn.textContent = "Correct! ❤️";
        btn.style.background = "#4CAF50";
        btn.style.color = "white";
      } else {
        if (input) {
          input.classList.add("shake-it");
          setTimeout(() => input.classList.remove("shake-it"), 500);
        }
        showToast(funnyWrongAnswers[Math.floor(Math.random() * funnyWrongAnswers.length)]);

        btn.textContent = "Saved ✨";
        btn.style.background = "var(--gold)";
        btn.style.color = "black";
      }

      // Save response (only if on http(s))
      if (window.location.protocol.startsWith("http")) {
        try {
          await fetch("/api/save-response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: questionText, answer: userVal, isCorrect }),
          });
        } catch {}
      }

      // Always unlock Next (your requirement)
      if (nextBtn) {
        nextBtn.classList.remove("hidden");
        if (window.gsap) gsap.fromTo(nextBtn, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2)" });
      }

      // Disable button to prevent spam
      btn.disabled = true;
    });
  });

  // ---------- Proposal Buttons ----------
  if (yesBtn && proposalActions && celebrationMsg && bigQuestion) {
    yesBtn.addEventListener("click", () => {
      proposalActions.style.display = "none";
      bigQuestion.textContent = "";
      celebrationMsg.classList.remove("hidden");

      const canvas = document.getElementById("particle-canvas");
      if (canvas) {
        canvas.style.opacity = 0;
        setTimeout(() => (canvas.style.display = "none"), 900);
      }

      if (bgMusic) bgMusic.volume = 0.3;
    });
  }

  if (timeBtn && proposalActions && timeMsg && bigQuestion) {
    timeBtn.addEventListener("click", () => {
      proposalActions.style.display = "none";
      bigQuestion.textContent = "";
      timeMsg.classList.remove("hidden");

      const canvas = document.getElementById("particle-canvas");
      if (canvas) {
        canvas.style.opacity = 0;
        setTimeout(() => (canvas.style.display = "none"), 900);
      }
    });
  }

  // ---------- Chat ----------
  if (chatBtn) chatBtn.addEventListener("click", () => showScreen("chat-section"));

  function addMessage(msg, type) {
    if (!chatBox) return;
    const div = document.createElement("div");
    div.classList.add("message", type);
    div.textContent = msg;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!chatInput || !chatInput.value.trim()) return;

      const msg = chatInput.value.trim();
      chatInput.value = "";

      if (socket) {
        socket.emit("chat message", msg);
        addMessage(msg, "sent");
      } else {
        alert("Chat server not connected. Run the server to enable chat.");
      }
    });
  }

  if (socket) {
    socket.on("chat history", (history) => {
      if (!chatBox) return;
      chatBox.innerHTML = "";
      (history || []).forEach((msg) => addMessage(msg, "received"));
    });

    socket.on("chat message", (msg) => addMessage(msg, "received"));
  }

  // ---------- Dev Shortcut ----------
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "p") {
      e.preventDefault();
      showScreen("picture-reveal");
    }
  });
});
