window.initPuzzle = function () {
  const puzzleBoard = document.getElementById("puzzle-board");
  const puzzleInstruction = document.getElementById("puzzle-instruction");
  const puzzleContinueBtn = document.getElementById("puzzle-continue-btn");

  if (!puzzleBoard) return;
  if (puzzleBoard.dataset.initialized === "true") return;

  puzzleBoard.dataset.initialized = "true";
  puzzleBoard.innerHTML = "";

  const GRID_SIZE = 4; // 💖 4x4
  const IMAGE_URL = "fatii.png";

  const img = new Image();
  img.onload = function () {

    const parentWidth = puzzleBoard.parentElement.getBoundingClientRect().width;
    const boardSize = Math.min(560, parentWidth - 20);
    const pieceSize = Math.floor(boardSize / GRID_SIZE);
    const finalSize = pieceSize * GRID_SIZE;

    // ===== Wrapper =====
    const wrapper = document.createElement("div");
    wrapper.style.width = finalSize + "px";
    wrapper.style.margin = "20px auto";
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.gap = "20px";
    puzzleBoard.appendChild(wrapper);

    // ===== Board =====
    const board = document.createElement("div");
    board.style.width = finalSize + "px";
    board.style.height = finalSize + "px";
    board.style.position = "relative";
    board.style.border = "3px solid #ff69b4";
    board.style.borderRadius = "14px";
    board.style.background = "rgba(255,255,255,0.05)";
    wrapper.appendChild(board);

    // ===== Tray =====
    const tray = document.createElement("div");
    tray.style.display = "flex";
    tray.style.flexWrap = "wrap";
    tray.style.gap = "10px";
    tray.style.justifyContent = "center";
    wrapper.appendChild(tray);

    const pieces = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {

        const piece = document.createElement("div");
        piece.className = "puzzle-piece";
        piece.dataset.row = row;
        piece.dataset.col = col;
        piece.dataset.placed = "false";

        const bgX = (col / (GRID_SIZE - 1)) * 100;
        const bgY = (row / (GRID_SIZE - 1)) * 100;

        Object.assign(piece.style, {
          width: pieceSize + "px",
          height: pieceSize + "px",
          backgroundImage: `url('${IMAGE_URL}')`,
          backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
          backgroundPosition: `${bgX}% ${bgY}%`,
          borderRadius: "10px",
          cursor: "grab",
          userSelect: "none",
          position: "relative",
          touchAction: "none",
          boxShadow: "0 6px 15px rgba(0,0,0,0.25)"
        });

        tray.appendChild(piece);
        pieces.push(piece);
      }
    }

    // shuffle
    pieces.sort(() => Math.random() - 0.5).forEach(p => tray.appendChild(p));

    let active = null;
    let offsetX = 0;
    let offsetY = 0;

    wrapper.addEventListener("pointerdown", e => {
      const el = e.target.closest(".puzzle-piece");
      if (!el || el.dataset.placed === "true") return;

      active = el;
      active.setPointerCapture(e.pointerId);

      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      el.style.position = "fixed";
      el.style.left = rect.left + "px";
      el.style.top = rect.top + "px";
      el.style.zIndex = "9999";
      el.style.cursor = "grabbing";
    });

    wrapper.addEventListener("pointermove", e => {
      if (!active) return;
      active.style.left = e.clientX - offsetX + "px";
      active.style.top = e.clientY - offsetY + "px";
    });

    wrapper.addEventListener("pointerup", e => {
      if (!active) return;

      const boardRect = board.getBoundingClientRect();
      const row = parseInt(active.dataset.row);
      const col = parseInt(active.dataset.col);

      const expectedX = boardRect.left + col * pieceSize;
      const expectedY = boardRect.top + row * pieceSize;

      const distance =
        Math.abs(e.clientX - expectedX - pieceSize / 2) +
        Math.abs(e.clientY - expectedY - pieceSize / 2);

      if (distance < pieceSize) {
        active.style.position = "absolute";
        active.style.left = col * pieceSize + "px";
        active.style.top = row * pieceSize + "px";
        active.style.zIndex = "1";
        active.style.cursor = "default";
        active.dataset.placed = "true";
        active.style.boxShadow = "none";
        board.appendChild(active);
        checkComplete();
      } else {
        active.style.position = "relative";
        active.style.left = "";
        active.style.top = "";
        active.style.zIndex = "";
        tray.appendChild(active);
      }

      active = null;
    });

    function checkComplete() {
      if (pieces.every(p => p.dataset.placed === "true")) {
        if (puzzleInstruction) {
          puzzleInstruction.textContent = "You solved it ❤️";
        }
        if (window.confetti) {
          confetti({ particleCount: 150, spread: 80 });
        }
        if (puzzleContinueBtn) {
          puzzleContinueBtn.classList.remove("hidden");
        }
      }
    }
  };

  img.src = IMAGE_URL;
};
