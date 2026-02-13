// Advanced Vertical Reel Switcher (FIXED)
function showScreen(id) {
  const target = document.getElementById(id);
  const current = document.querySelector('.screen.active');
  if (!target || target === current) return;

  const currentIndex = current ? parseInt(current.dataset.index || "-1", 10) : -1;
  const targetIndex = parseInt(target.dataset.index || "0", 10);

  // Prep target screen
  target.classList.remove('next', 'prev');
  if (targetIndex > currentIndex) target.classList.add('next');
  else target.classList.add('prev');

  // Trigger reflow
  void target.offsetHeight;

  // Transition current out
  if (current) {
    current.classList.remove('active');
    if (targetIndex > currentIndex) current.classList.add('prev');
    else current.classList.add('next');
  }

  // Transition target in
  target.classList.add('active');
  target.classList.remove('next', 'prev');

  // Update Story Bar
  updateProgressBar(targetIndex);

  // Screen-specific logic
  handleScreenSpecifics(id, target);
}

// Screen Specifics (FIXED and separated)
function handleScreenSpecifics(id, target) {
  const video = document.getElementById('memory-video');
  const youtubeOverlay = document.getElementById('youtube-overlay');
  const youtubeIframe = document.getElementById('youtube-video');

  if (id === 'video-memory') {
    const useYouTube = false; // change to true if using YouTube
    const youtubeURL = "";    // put embed url if using YouTube

    if (useYouTube && youtubeURL) {
      if (video) video.style.display = 'none';
      if (youtubeOverlay) {
        youtubeOverlay.classList.remove('hidden');
        if (youtubeIframe) youtubeIframe.src = youtubeURL;
      }
      if (bgMusic) bgMusic.pause();
    } else {
      if (youtubeOverlay) youtubeOverlay.classList.add('hidden');
      if (youtubeIframe) youtubeIframe.src = "";

      if (video) {
        video.style.display = 'block';
        video.currentTime = 0;
        video.play().catch(() => {
          console.log("Video failed (maybe missing file).");
          showToast("Video loading... ⏳");
        });

        if (bgMusic) bgMusic.pause();

        video.onended = () => {
          showScreen('picture-reveal');
          if (bgMusic) bgMusic.play().catch(() => {});
        };
      }
    }
  }

  if (id === 'picture-reveal') {
    // ✅ only init puzzle once
    if (!window.isPuzzleInitialized && typeof window.initPuzzle === 'function') {
      window.initPuzzle();
      window.isPuzzleInitialized = true;
    }
    if (bgMusic && bgMusic.paused) bgMusic.play().catch(() => {});
  }

  if (id === 'day-7') {
    target.classList.add('heartbeat-mode');
  }

  // Animate frame
  const frame = target.querySelector('.frame, .video-container, .puzzle-wrapper');
  if (frame && window.gsap) {
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
