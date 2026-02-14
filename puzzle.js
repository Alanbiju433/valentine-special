window.initPuzzle = function () {
  const puzzleBoard = document.getElementById("puzzle-board");
  const puzzleInstruction = document.getElementById("puzzle-instruction");
  const puzzleContinueBtn = document.getElementById("puzzle-continue-btn");

  if (!puzzleBoard) return;
  if (puzzleBoard.dataset.initialized === "true") return;

  puzzleBoard.dataset.initialized = "true";
  puzzleBoard.innerHTML = "";

  const GRID_SIZE = 8; // 💖 8x8 puzzle
  const IMAGE_URL = "fatii.png";

  const img = new Image();
  img.onload = function () {

    const parentWidth = puzzleBoard.parentElement.getBoundingClientRect().width;
    const boardSize = Math.min(600, parentWidth - 20);
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

    // ===== Grid Board =====
    const board = document.createElement("div");
    board.style.width = finalSize + "px";
    board.style.height = finalSize + "px";
    board.style.display = "grid";
    board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;
    board.style.border = "3px solid #ff69b4";
    board.style.borderRadius = "14px";
    board.style.overflow = "hidden";
    board.style.background = "rgba(255,255,255,0.05)";
    wrapper.appendChild(board);

    // ===== Tray =====
    const tray = document.createElement("div");
    tray.style.display = "flex";
    tray.style.flexWrap = "wrap";
    tray.style.gap = "8px";
    tray.style.justifyContent = "center";
    wrapper.appendChild(tray);

    const pieces = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {

        // create drop slot
        const slot = document.createElement("div");
        slot.dataset.row = row;
        slot.dataset.col = col;
        slot.style.width = pieceSize + "px";
        slot.style.height = pieceSize + "px";
        slot.style.boxSizing = "border-box";
        board.appendChild(slot);

        // create piece
        const piece = document.createElement("div");
        piece.className = "puzzle-piece";
        piece.draggable = true;
        piece.dataset.row = row;
        piece.dataset.col = col;

        const bgX = (col / (GRID_SIZE - 1)) * 100;
        const bgY = (row / (GRID_SIZE - 1)) * 100;

        Object.assign(piece.style, {
          width: pieceSize + "px",
          height: pieceSize + "px",
          backgroundImage: `url('${IMAGE_URL}')`,
          backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
          backgroundPosition: `${bgX}% ${bgY}%`,
          borderRadius: "8px",
          cursor: "grab"
        });

        tray.appendChild(piece);
        pieces.push(piece);
      }
    }

    // shuffle
    pieces.sort(() => Math.random() - 0.5).forEach(p => tray.appendChild(p));

    let dragged = null;

    wrapper.addEventListener("dragstart", e => {
      if (e.target.classList.contains("puzzle-piece")) {
        dragged = e.target;
      }
    });

    wrapper.addEventListener("dragover", e => {
      e.preventDefault();
    });

    wrapper.addEventListener("drop", e => {
      e.preventDefault();
      if (!dragged) return;

      const slot = e.target;
      if (!slot.dataset.row) return;

      const correctRow = dragged.dataset.row;
      const correctCol = dragged.dataset.col;

      if (
        slot.dataset.row === correctRow &&
        slot.dataset.col === correctCol &&
        !slot.hasChildNodes()
      ) {
        slot.appendChild(dragged);
        dragged.draggable = false;
        dragged.style.cursor = "default";
        dragged.style.boxShadow = "none";
        checkComplete();
      }
    });

    function checkComplete() {
      const placed = board.querySelectorAll(".puzzle-piece").length;
      if (placed === GRID_SIZE * GRID_SIZE) {

        if (puzzleInstruction) {
          puzzleInstruction.textContent = "You solved it ❤️";
          puzzleInstruction.style.color = "#ff69b4";
        }

        if (window.confetti) {
          confetti({ particleCount: 200, spread: 90 });
        }

        if (puzzleContinueBtn) {
          puzzleContinueBtn.classList.remove("hidden");
        }
      }
    }
  };

  img.src = IMAGE_URL;
};
