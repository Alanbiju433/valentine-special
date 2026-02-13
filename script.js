document.addEventListener('DOMContentLoaded', () => {
  const screens = document.querySelectorAll('.screen');
  const startBtn = document.getElementById('start-btn');
  const nextBtns = document.querySelectorAll('.btn-next');

  const noBtn = document.getElementById('no-btn');
  const yesBtn = document.getElementById('yes-btn');

  const storyProgress = document.getElementById('story-progress');
  const bgMusic = document.getElementById('bg-music');

  const celebrationMsg = document.getElementById('celebration-msg');
  const proposalActions = document.querySelector('.proposal-actions');
  const bigQuestion = document.querySelector('.big-question');

  // Chat elements
  const chatBtn = document.getElementById('chat-btn');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatBox = document.getElementById('chat-box');

  // Socket.io initialization (GitHub pages won't have it)
  let socket = null;
  try {
    if (typeof io !== "undefined") socket = io();
  } catch (e) {
    console.log("Socket.io not found, chat won't work without server.");
  }

  // --- Instagram Story Progress Bar ---
  function initProgressBar() {
    if (!storyProgress) return;
    storyProgress.innerHTML = '';
    screens.forEach(() => {
      const segment = document.createElement('div');
      segment.className = 'progress-segment';
      segment.innerHTML = '<div class="progress-inner"></div>';
      storyProgress.appendChild(segment);
    });
  }

  function updateProgressBar(index) {
    const inners = document.querySelectorAll('.progress-inner');
    inners.forEach((inner, i) => {
      if (i < index) {
        inner.style.width = '100%';
        inner.style.transition = 'none';
      } else if (i === index) {
        inner.style.width = '100%';
        inner.style.transition = 'width 0.8s ease-in-out';
      } else {
        inner.style.width = '0%';
        inner.style.transition = 'none';
      }
    });
  }

  // --- Typewriter Effect ---
  function startTypewriter(element) {
    const text = element.getAttribute('data-text');
    if (!text) return;

    element.textContent = "";
    element.classList.add('typewriter-cursor');

    let i = 0;
    const speed = 50;

    function type() {
      if (i < text.length) {
        if (text.substring(i, i + 2) === '\\n') {
          element.innerHTML += '<br>';
          i += 2;
        } else {
          element.innerHTML += text.charAt(i);
          i++;
        }
        setTimeout(type, speed);
      } else {
        element.classList.remove('typewriter-cursor');
      }
    }
    type();
  }

  // --- Toast Notification ---
  function showToast(message) {
    let toast = document.querySelector('.toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');

    const rot = Math.random() * 10 - 5;
    toast.style.transform = `translateX(-50%) translateY(0) rotate(${rot}deg)`;

    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // --- Screen switcher ---
  function showScreen(id) {
    const target = document.getElementById(id);
    const current = document.querySelector('.screen.active');
    if (!target || target === current) return;

    const currentIndex = current ? parseInt(current.dataset.index || -1) : -1;
    const targetIndex = parseInt(target.dataset.index || 0);

    // Prep target screen
    target.classList.remove('next', 'prev');
    if (targetIndex > currentIndex) target.classList.add('next');
    else target.classList.add('prev');

    // Trigger reflow
    target.offsetHeight;

    // Transition logic
    if (current) {
      current.classList.remove('active');
      if (targetIndex > currentIndex) current.classList.add('prev');
      else current.classList.add('next');
    }

    target.classList.add('active');
    target.classList.remove('next', 'prev');

    // Update progress
    updateProgressBar(targetIndex);

    // Screen-specific logic ✅
    handleScreenSpecifics(id, target);

    // Animate frame
    const frame = target.querySelector('.frame, .video-container, .puzzle-wrapper');
    if (frame && typeof gsap !== "undefined") {
      gsap.fromTo(
        frame,
        { opacity: 0, scale: 0.8, y: 100, filter: "blur(20px)" },
        { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "expo.out" }
      );
    }

    // Typewriter
    const typeWriterEl = target.querySelector('.typewriter-text');
    if (typeWriterEl) startTypewriter(typeWriterEl);
  }

  function handleScreenSpecifics(id, target) {
    const video = document.getElementById('memory-video');
    const youtubeOverlay = document.getElementById('youtube-overlay');
    const youtubeIframe = document.getElementById('youtube-video');

    if (id === 'video-memory') {
      const useYouTube = false;
      const youtubeURL = "";

      if (useYouTube && youtubeURL) {
        if (video) video.style.display = 'none';
        if (youtubeOverlay) {
          youtubeOverlay.classList.remove('hidden');
          if (youtubeIframe) youtubeIframe.src = youtubeURL;
        }
        if (bgMusic) bgMusic.pause();
      } else if (video) {
        video.currentTime = 0;
        video.play().catch(() => {
          console.log("Video fail, maybe file missing from GitHub?");
          showToast("Video loading... ⏳");
        });
        if (bgMusic) bgMusic.pause();
        video.onended = () => {
          showScreen('picture-reveal');
          if (bgMusic) bgMusic.play().catch(()=>{});
        };
      }
    }

    if (id === 'picture-reveal') {
      if (!window.isPuzzleInitialized && typeof initPuzzle === 'function') {
        initPuzzle();
        window.isPuzzleInitialized = true;
      }
      if (bgMusic && bgMusic.paused) bgMusic.play().catch(()=>{});
    }

    if (id === 'day-7') {
      if (target) target.classList.add('heartbeat-mode');
    }
  }

  // init progress bar
  initProgressBar();

  // --- Start Journey (Take your time button) ✅
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      console.log("✅ Start clicked");
      showScreen('day-1');

      if (bgMusic) {
        bgMusic.volume = 0.5;
        bgMusic.play().catch(() => console.log("Music play blocked until user interacts."));
      }
    });
  } else {
    console.warn("❌ start-btn not found. Check your HTML id='start-btn'");
  }

  // Next Buttons
  nextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const nextId = e.currentTarget.getAttribute('data-next');
      if (nextId) showScreen(nextId);
    });
  });

  // --- Gentle Proposal Logic ---
  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      if (proposalActions) proposalActions.style.display = 'none';
      if (bigQuestion) bigQuestion.textContent = "";
      if (celebrationMsg) celebrationMsg.classList.remove('hidden');

      const canvas = document.getElementById('particle-canvas');
      if (canvas) {
        canvas.style.opacity = 0;
        setTimeout(() => { canvas.style.display = 'none'; }, 1000);
      }

      if (bgMusic) bgMusic.volume = 0.3;
    });
  }

  const timeBtn = document.getElementById('time-btn');
  const timeMsg = document.getElementById('time-msg');

  if (timeBtn) {
    timeBtn.addEventListener('click', () => {
      if (proposalActions) proposalActions.style.display = 'none';
      if (bigQuestion) bigQuestion.textContent = "";
      if (timeMsg) timeMsg.classList.remove('hidden');

      const canvas = document.getElementById('particle-canvas');
      if (canvas) {
        canvas.style.opacity = 0;
        setTimeout(() => { canvas.style.display = 'none'; }, 1000);
      }
    });
  }

  // --- Chat Logic ---
  if (chatBtn) chatBtn.addEventListener('click', () => showScreen('chat-section'));

  function addMessage(msg, type) {
    if (!chatBox) return;
    const div = document.createElement('div');
    div.classList.add('message', type);
    div.textContent = msg;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (socket && chatInput && chatInput.value) {
        const msg = chatInput.value;
        socket.emit('chat message', msg);
        chatInput.value = '';
        addMessage(msg, 'sent');
      } else if (!socket) {
        alert("Chat server is not connected (GitHub pages can't run socket.io).");
      }
    });
  }

  if (socket) {
    socket.on('chat history', (history) => {
      if (!chatBox) return;
      chatBox.innerHTML = '';
      history.forEach(msg => addMessage(msg, 'received'));
    });

    socket.on('chat message', (msg) => addMessage(msg, 'received'));
  }

  // ✅ Keep your existing puzzle code BELOW this line (it will work now)
});
