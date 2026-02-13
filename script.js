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
    const chatSection = document.getElementById('chat-section');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');

    // Socket.io initialization
    let socket;
    try {
        socket = io();
    } catch (e) {
        console.log("Socket.io not found, chat won't work without server.");
    }

    // --- Instagram Story Progress Bar ---
    function initProgressBar() {
        if (!storyProgress) return;
        storyProgress.innerHTML = '';
        screens.forEach((_, i) => {
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

    // Advanced Vertical Reel Switcher
    function showScreen(id) {
        const target = document.getElementById(id);
        const current = document.querySelector('.screen.active');
        if (!target || target === current) return;

        const currentIndex = current ? parseInt(current.dataset.index || -1) : -1;
        const targetIndex = parseInt(target.dataset.index || 0);

        // Prep target screen
        target.classList.remove('next', 'prev');
        if (targetIndex > currentIndex) {
            target.classList.add('next');
        } else {
            target.classList.add('prev');
        }

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
        function handleScreenSpecifics(id) {
            const video = document.getElementById('memory-video');
            const youtubeOverlay = document.getElementById('youtube-overlay');
            const youtubeIframe = document.getElementById('youtube-video');
            const bgMusic = document.getElementById('bg-music');
            const canvas = document.getElementById('particle-canvas');

            if (id === 'video-memory') {
                // Logic to check if we should use local video or YouTube
                // If video.mp4 is missing or if user provides a YouTube URL
                // FOR NOW: Let's make it easy for the user to switch
                const useYouTube = false; // The user can change this to true
                const youtubeURL = ""; // Paste unlisted YouTube embed URL here if needed

                if (useYouTube && youtubeURL) {
                    if (video) video.style.display = 'none';
                    if (youtubeOverlay) {
                        youtubeOverlay.classList.remove('hidden');
                        if (youtubeIframe) youtubeIframe.src = youtubeURL;
                    }
                    if (bgMusic) bgMusic.pause();
                } else if (video) {
                    video.currentTime = 0;
                    video.play().catch(e => {
                        console.log("Video fail, maybe file missing from GitHub?");
                        showToast("Video loading... ⏳");
                    });
                    if (bgMusic) bgMusic.pause();
                    video.onended = () => { showScreen('picture-reveal'); if (bgMusic) bgMusic.play(); };
                }
            } else if (id === 'picture-reveal') {
                if (!window.isPuzzleInitialized && typeof initPuzzle === 'function') {
                    initPuzzle();
                    window.isPuzzleInitialized = true;
                }
                if (bgMusic && bgMusic.paused) bgMusic.play();
            } else if (id === 'day-7') {
                target.classList.add('heartbeat-mode');
            }
        }

        // Update Story Bar
        updateProgressBar(targetIndex);

        // Logic for specific screens
        initPuzzle();
        window.isPuzzleInitialized = true;
    }
    if (bgMusic && bgMusic.paused) bgMusic.play();
} else if (id === 'day-7') {
    target.classList.add('heartbeat-mode');
}

// Animate Frame
const frame = target.querySelector('.frame, .video-container, .puzzle-wrapper');
if (frame) {
    gsap.fromTo(frame,
        { opacity: 0, scale: 0.8, y: 100, filter: "blur(20px)" },
        { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "expo.out" }
    );
}

// Typewriter
const typeWriterEl = target.querySelector('.typewriter-text');
if (typeWriterEl) startTypewriter(typeWriterEl);
    }

initProgressBar();

// --- Typewriter Effect ---
function startTypewriter(element) {
    const text = element.getAttribute('data-text'); // Get the text to type (with \n handling)
    if (!text) return;

    // Clear and prepare
    element.textContent = "";
    element.classList.add('typewriter-cursor');

    let i = 0;
    const speed = 50; // ms per char

    function type() {
        if (i < text.length) {
            // Handle newlines encoded as \n in attribute
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

    // Random slight rotation for fun
    const rot = Math.random() * 10 - 5;
    toast.style.transform = `translateX(-50%) translateY(0) rotate(${rot}deg)`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// --- Funny Quotes for Wrong Answers ---
const funnyWrongAnswers = [
    "Not quite, darling! 🤭",
    "Try again, my love! ❤️",
    "Nope! Are you guessing? 🤨",
    "Close... (maybe?) 🤏",
    "I know you know this! 😉",
    "Think harder! 🧠",
    "Is that your final answer? 🐜"
];

// --- Tap to Advance Navigation ---
document.addEventListener('mousedown', (e) => {
    // Don't advance if clicking on buttons, inputs, or interactive elements
    if (e.target.closest('button, input, textarea, a, video, .puzzle-piece')) return;

    const currentActive = document.querySelector('.screen.active');
    if (!currentActive || currentActive.id === 'landing') return;

    // Only advance if a Next button is ALREADY visible (meaning riddle solved)
    const nextBtn = currentActive.querySelector('.btn-next');
    if (nextBtn && !nextBtn.classList.contains('hidden')) {
        const nextId = nextBtn.getAttribute('data-next');
        if (nextId) showScreen(nextId);
    } else {
        // Shake the frame to indicate they need to solve the riddle first
        const frame = currentActive.querySelector('.frame');
        if (frame) {
            frame.classList.add('shake-it');
            setTimeout(() => frame.classList.remove('shake-it'), 500);
            showToast("Solve the riddle to continue! ✨");
        }
    }
});

// Start Journey
startBtn.addEventListener('click', () => {
    showScreen('day-1');
    // Try to play music
    if (bgMusic) {
        bgMusic.volume = 0.5;
        bgMusic.play().catch(e => console.log("Music play failed:", e));
    }
});

// Next Buttons
nextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const nextId = e.currentTarget.getAttribute('data-next');
        showScreen(nextId);
    });
});

// Music Control
const musicToggle = document.getElementById('music-toggle');
if (bgMusic) {
    bgMusic.volume = 0.4;
    // Start muted by default as requested
    bgMusic.muted = true;
}

if (musicToggle && bgMusic) {
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Music play failed:", e));
            bgMusic.muted = false;
            musicToggle.textContent = "🔊";
        } else {
            if (bgMusic.muted) {
                bgMusic.muted = false;
                musicToggle.textContent = "🔊";
            } else {
                bgMusic.muted = true;
                musicToggle.textContent = "🔇";
            }
        }
    });
}

// --- Easter Egg: Konami / Rapid Click ---
const title = document.querySelector('h1.title');
let titleClicks = 0;
if (title) {
    title.addEventListener('click', () => {
        titleClicks++;
        if (titleClicks === 5) {
            showToast("🎉 You found the secret party mode! 🎉");
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            titleClicks = 0;
        }
        setTimeout(() => titleClicks = 0, 2000); // Reset if not fast enough
    });
}

// Whispers Logic
const whispers = [
    "I made this slowly.",
    "You don’t have to rush.",
    "Some feelings are quiet.",
    "You matter to me.",
    "Just breathe."
];
const whisperText = document.getElementById('whisper-text');

if (whisperText) {
    setInterval(() => {
        // Remove class to reset
        whisperText.classList.remove('animate');

        // Wait a tiny bit then swap text and animate
        setTimeout(() => {
            const randomText = whispers[Math.floor(Math.random() * whispers.length)];
            whisperText.textContent = randomText;
            whisperText.classList.add('animate');
        }, 100);

    }, 6000); // Faster interval for dynamic feel
}

// Cursor Hearts Logic
let lastHeartTime = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastHeartTime > 100) { // Throttle creation
        createHeart(e.clientX, e.clientY);
        lastHeartTime = now;
    }
});

function createHeart(x, y) {
    const heart = document.createElement('div');
    heart.classList.add('cursor-heart');
    heart.textContent = '✨';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.color = 'var(--primary-color)';
    heart.style.textShadow = '0 0 10px var(--accent-pink)';
    // Random slight variation
    heart.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
    document.body.appendChild(heart);

    // Clean up
    setTimeout(() => {
        heart.remove();
    }, 1000);
}

// Gentle Proposal Logic: "I understand" (formerly Yes)
yesBtn.addEventListener('click', () => {
    // No confetti, just gentle confirmation
    proposalActions.style.display = 'none';
    bigQuestion.textContent = "";
    celebrationMsg.classList.remove('hidden');

    // Hide particles
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        canvas.style.opacity = 0;
        setTimeout(() => { canvas.style.display = 'none'; }, 1000);
    }

    // Ensure music is gentle if it's playing
    if (bgMusic) bgMusic.volume = 0.3;
});

// Gentle Proposal Logic: "I need time" (New)
const timeBtn = document.getElementById('time-btn');
const timeMsg = document.getElementById('time-msg');

if (timeBtn) {
    timeBtn.addEventListener('click', () => {
        proposalActions.style.display = 'none';
        bigQuestion.textContent = "";
        timeMsg.classList.remove('hidden');

        // Hide particles
        const canvas = document.getElementById('particle-canvas');
        if (canvas) {
            canvas.style.opacity = 0;
            setTimeout(() => { canvas.style.display = 'none'; }, 1000);
        }
    });
}

// Chat Logic
if (chatBtn) {
    chatBtn.addEventListener('click', () => {
        showScreen('chat-section');
    });
}

if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (socket && chatInput.value) {
            const msg = chatInput.value;
            socket.emit('chat message', msg);
            chatInput.value = '';
            // Optimistically show sent message
            addMessage(msg, 'sent');
        } else if (!socket) {
            console.warn("Socket.io not visible/connected. Message not sent.");
            alert("Chat server is not connected. Please ensure the server is running.");
        }
    });
}

if (socket) {
    // Load History
    socket.on('chat history', (history) => {
        chatBox.innerHTML = '';
        history.forEach(msg => addMessage(msg, 'received'));
    });

    socket.on('chat message', (msg) => {
        // Server now broadcasts to everyone including sender
        addMessage(msg, 'received');
    });
}

function addMessage(msg, type) {
    const div = document.createElement('div');
    div.classList.add('message', type);
    div.textContent = msg;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- Advanced Riddle Logic ---
const checkBtns = document.querySelectorAll('.btn-check');
checkBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const container = e.target.parentElement;
        const input = container.querySelector('.riddle-input');
        const acceptedAnswers = container.dataset.answer.split(',').map(s => s.trim().toLowerCase());
        const questionText = container.dataset.question || "Unknown Riddle";
        const nextBtn = container.parentElement.parentElement.querySelector('.btn-next');

        if (input) {
            const userVal = input.value.trim();
            const userValLower = userVal.toLowerCase();

            // Determine correctness
            let isCorrect = false;

            // Check if any accepted answer is in the user input OR if wildcard '*'
            if (acceptedAnswers.includes('*')) {
                isCorrect = true;
            } else {
                // Check if user input CONTAINs the answer (more forgiving)
                acceptedAnswers.forEach(ans => {
                    if (userValLower.includes(ans)) isCorrect = true;
                });
            }

            // UI Feedback
            if (isCorrect) {
                btn.textContent = "Correct! ❤️";
                btn.style.background = "#4CAF50";
                btn.style.color = "white";

                // Send to Backend
                if (window.location.protocol.startsWith('http')) {
                    try {
                        await fetch('/api/save-response', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                question: questionText,
                                answer: userVal,
                                isCorrect: isCorrect
                            })
                        });
                    } catch (err) {
                        console.log("Error saving response:", err);
                    }
                } else {
                    console.log("Running locally (file://), skipping server save.");
                }

                // ALWAYS Show Next Button (User Request)
                if (nextBtn) {
                    nextBtn.classList.remove('hidden');
                    gsap.fromTo(nextBtn, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2)" });
                }

            } else {
                // WRONG ANSWER GIMMICK
                // Shake input
                input.classList.add('shake-it');
                setTimeout(() => input.classList.remove('shake-it'), 500);

                // Show funny toast
                const randomMsg = funnyWrongAnswers[Math.floor(Math.random() * funnyWrongAnswers.length)];
                showToast(randomMsg);

                // Reset button
                btn.textContent = "Try Again 🔄";

                // Allow retry (don't disable)
                btn.disabled = false;
                return; // Don't proceed or save yet if we want them to get it right? 
                // Actually user previous request said "Ensuring users can progress regardless of their riddle answer."
                // But for "Gimmicks" let's make them try at least once or provide a "Skip" button? 
                // Let's stick to the previous behavior "Proceed anyway" but AFTER the gimmick.
                // Let's make it so they HAVE to get it right or click a new "Skip" button? 
                // Or just let them retry.
                // For now, let's keep the "Save & Proceed" behavior but make it visually distinct ONLY if they enter "skip" or something?
                // Re-reading: "Ensuring users can progress regardless of their riddle answer."

                // UPDATED LOGIC:
                // 1. Shake & Toast
                // 2. Button says "Saved anyway" after 1s?
                // Let's just do the shake, wait 1s, then let them proceed as "Saved"

                setTimeout(() => {
                    btn.textContent = "Saved ✨";
                    btn.style.background = "var(--gold)";
                    btn.style.color = "black";
                    btn.disabled = true;

                    if (nextBtn) {
                        nextBtn.classList.remove('hidden');
                        gsap.fromTo(nextBtn, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2)" });
                    }
                }, 1500);
            }
        }
    });
});

// --- Dev Mode Shortcuts ---
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        console.log("Dev Mode: Jumping to Puzzle");
        showScreen('picture-reveal');
    }
});

// --- Puzzle Logic (6x6) ---
let puzzlePieces = [];
let selectedPiece = null;
const ROWS = 6;
const COLS = 6;

window.initPuzzle = function () {
    const board = document.getElementById('puzzle-board');
    if (!board) return;

    board.innerHTML = '';
    puzzlePieces = [];
    selectedPiece = null;

    // Create correct order [0...35]
    let order = Array.from({ length: ROWS * COLS }, (_, i) => i);

    // Shuffle
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }

    // Render
    order.forEach((correctIndex, slotIndex) => {
        const piece = document.createElement('div');
        piece.classList.add('puzzle-piece');
        piece.dataset.correctIndex = correctIndex;

        // Calculate Background Position based on CORRECT Index
        const correctRow = Math.floor(correctIndex / COLS);
        const correctCol = correctIndex % COLS;

        // 6x6 grid -> 100% / 5 steps
        const xPercent = (correctCol / (COLS - 1)) * 100;
        const yPercent = (correctRow / (ROWS - 1)) * 100;

        piece.style.backgroundPosition = `${xPercent}% ${yPercent}%`;

        piece.addEventListener('click', () => handlePieceClick(piece));
        board.appendChild(piece);
        puzzlePieces.push(piece);
    });

    updateLockedState(); // Initial lock check

    // Add continue button listener
    const contBtn = document.getElementById('puzzle-continue-btn');
    if (contBtn) {
        contBtn.addEventListener('click', () => showScreen('day-7'));
    }

    // Cheat
    let cheatClicks = 0;
    const instruction = document.getElementById('puzzle-instruction');
    if (instruction) {
        instruction.addEventListener('click', () => {
            cheatClicks++;
            if (cheatClicks >= 5) solvePuzzle();
        });
    }
}

function handlePieceClick(clickedPiece) {
    if (clickedPiece.classList.contains('locked')) return;

    if (selectedPiece === clickedPiece) {
        // Deselect
        clickedPiece.classList.remove('selected');
        selectedPiece = null;
        return;
    }

    if (selectedPiece) {
        // Swap
        swapPieces(selectedPiece, clickedPiece);
        selectedPiece.classList.remove('selected');
        selectedPiece = null;
    } else {
        // Select
        selectedPiece = clickedPiece;
        clickedPiece.classList.add('selected');
    }
}

function swapPieces(pieceA, pieceB) {
    // Swap visual styles ONLY
    const tempBg = pieceA.style.backgroundPosition;
    pieceA.style.backgroundPosition = pieceB.style.backgroundPosition;
    pieceB.style.backgroundPosition = tempBg;

    const tempIndex = pieceA.dataset.correctIndex;
    pieceA.dataset.correctIndex = pieceB.dataset.correctIndex;
    pieceB.dataset.correctIndex = tempIndex;

    updateLockedState();
    checkWin();
}

function updateLockedState() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    pieces.forEach((p, index) => {
        // If the piece responsible for this slot (correctIndex) IS in this slot (index)
        if (parseInt(p.dataset.correctIndex) === index) {
            if (!p.classList.contains('locked')) {
                p.classList.add('locked');
            }
        } else {
            p.classList.remove('locked');
        }
    });
}

function checkWin() {
    const currentPieces = document.querySelectorAll('.puzzle-piece');
    let isWin = true;
    currentPieces.forEach((p) => {
        if (!p.classList.contains('locked')) {
            isWin = false;
        }
    });

    if (isWin) {
        document.getElementById('puzzle-instruction').textContent = "My Heart is Yours ❤️";
        const btn = document.getElementById('puzzle-continue-btn');
        btn.classList.remove('hidden');
        gsap.fromTo(btn, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2)" });

        const board = document.getElementById('puzzle-board');
        board.style.border = "5px solid #fff";
        board.style.boxShadow = "0 0 50px white";
    }
}

function solvePuzzle() {
    const board = document.getElementById('puzzle-board');
    if (!board) return;
    board.innerHTML = '';
    for (let i = 0; i < ROWS * COLS; i++) {
        const piece = document.createElement('div');
        piece.classList.add('puzzle-piece', 'locked');
        piece.dataset.correctIndex = i;
        const correctRow = Math.floor(i / COLS);
        const correctCol = i % COLS;
        const xPercent = (correctCol / (COLS - 1)) * 100;
        const yPercent = (correctRow / (ROWS - 1)) * 100;
        piece.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
        board.appendChild(piece);
    }
    checkWin();
}
});
