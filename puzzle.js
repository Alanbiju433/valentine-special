// Puzzle initialization for the valentine special
window.initPuzzle = function () {
  const puzzleBoard = document.getElementById("puzzle-board");
  const puzzleInstruction = document.getElementById("puzzle-instruction");
  const puzzleContinueBtn = document.getElementById("puzzle-continue-btn");

  if (!puzzleBoard) return;

  puzzleBoard.innerHTML = "";

  const GRID_SIZE = 4;
  const IMAGE_URL = "fatii.png";

  const img = new Image();
  img.onload = function () {
    const parent = puzzleBoard.parentElement || document.body;
const parentWidth = parent.getBoundingClientRect().width;

// keep some padding so it doesn't touch edges
const containerWidth = Math.min(600, parentWidth - 20);
const containerHeight = containerWidth;

    const pieceSize = containerWidth / GRID_SIZE;

    // Board styles
    Object.assign(puzzleBoard.style, {
      width: containerWidth + "px",
      height: containerHeight + "px",
      position: "relative",
      border: "3px solid #ff69b4",
      borderRadius: "15px",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      margin: "20px auto",
      boxShadow: "0 8px 32px rgba(255, 105, 180, 0.3)",
      overflow: "hidden",
      touchAction: "none", // helps mobile pointer events
    });

    // Containers
    const piecesContainer = document.createElement("div");
    piecesContainer.id = "pieces-container";
    Object.assign(piecesContainer.style, {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: "0",
      left: "0",
      zIndex: "2",
    });
    puzzleBoard.appendChild(piecesContainer);

    const dropZone = document.createElement("div");
    dropZone.id = "drop-zone";
    Object.assign(dropZone.style, {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: "0",
      left: "0",
      zIndex: "1",
    });
    puzzleBoard.appendChild(dropZone);

    // Create pieces
    const pieces = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const piece = document.createElement("div");
        piece.className = "puzzle-piece";
        piece.draggable = true;

        const bgPosX = (col / (GRID_SIZE - 1)) * 100;
        const bgPosY = (row / (GRID_SIZE - 1)) * 100;

        Object.assign(piece.style, {
          position: "absolute",
          width: pieceSize + "px",
          height: pieceSize + "px",
          backgroundImage: `url('${IMAGE_URL}')`,
          backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
          backgroundPosition: `${bgPosX}% ${bgPosY}%`,
          cursor: "grab",
          border: "1px solid rgba(255, 105, 180, 0.5)",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
          borderRadius: "8px",
          transition: "transform 0.2s ease",
          zIndex: "2",
        });

        piece.dataset.row = String(row);
        piece.dataset.col = String(col);
        piece.dataset.placed = "false";

        pieces.push({ element: piece, row, col });
        piecesContainer.appendChild(piece);
      }
    }

    // Shuffle correctly (no self-overlap bug)
    shufflePieces(pieces, pieceSize, containerWidth, containerHeight);

    // ---------- Drag & Drop (Desktop) ----------
    let draggedPiece = null;
    let offsetX = 0;
    let offsetY = 0;

    piecesContainer.addEventListener("dragstart", (e) => {
      const el = e.target;
      if (!el.classList.contains("puzzle-piece")) return;
      if (el.dataset.placed === "true") return; // don't drag placed ones

      draggedPiece = el;
      el.style.opacity = "0.7";
      el.style.cursor = "grabbing";
      offsetX = e.clientX - el.getBoundingClientRect().left;
      offsetY = e.clientY - el.getBoundingClientRect().top;
      e.dataTransfer.effectAllowed = "move";
    });

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedPiece) return;

      placePieceAtEvent(draggedPiece, e.clientX, e.clientY);
      draggedPiece = null;
    });

    piecesContainer.addEventListener("dragend", (e) => {
      const el = e.target;
      if (el.classList.contains("puzzle-piece")) {
        el.style.opacity = "1";
        el.style.cursor = el.dataset.placed === "true" ? "default" : "grab";
      }
    });

    // ---------- Pointer fallback (Mobile + also works on desktop) ----------
    let pointerPiece = null;

    piecesContainer.addEventListener("pointerdown", (e) => {
      const el = e.target;
      if (!el.classList.contains("puzzle-piece")) return;
      if (el.dataset.placed === "true") return;

      pointerPiece = el;
      el.setPointerCapture(e.pointerId);
      el.style.opacity = "0.8";
      el.style.cursor = "grabbing";

      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    });

    piecesContainer.addEventListener("pointermove", (e) => {
      if (!pointerPiece) return;
      const boardRect = puzzleBoard.getBoundingClientRect();
      const x = e.clientX - boardRect.left - offsetX;
      const y = e.clientY - boardRect.top - offsetY;
      pointerPiece.style.left = x + "px";
      pointerPiece.style.top = y + "px";
    });

    piecesContainer.addEventListener("pointerup", (e) => {
      if (!pointerPiece) return;
      placePieceAtEvent(pointerPiece, e.clientX, e.clientY);
      pointerPiece.style.opacity = "1";
      pointerPiece.style.cursor = "grab";
      pointerPiece = null;
    });

    function placePieceAtEvent(pieceEl, clientX, clientY) {
      const rect = puzzleBoard.getBoundingClientRect();
      const x = clientX - rect.left - offsetX;
      const y = clientY - rect.top - offsetY;

      // Use floor + clamp (better than round)
      let row = Math.floor(y / pieceSize);
      let col = Math.floor(x / pieceSize);
      row = Math.max(0, Math.min(GRID_SIZE - 1, row));
      col = Math.max(0, Math.min(GRID_SIZE - 1, col));

      const targetRow = parseInt(pieceEl.dataset.row, 10);
      const targetCol = parseInt(pieceEl.dataset.col, 10);

      const tolerance = pieceSize * 0.35;
      const expectedX = targetCol * pieceSize;
      const expectedY = targetRow * pieceSize;

      if (Math.abs(x - expectedX) < tolerance && Math.abs(y - expectedY) < tolerance) {
        pieceEl.style.left = expectedX + "px";
        pieceEl.style.top = expectedY + "px";
        pieceEl.style.opacity = "1";
        pieceEl.dataset.placed = "true";
        pieceEl.style.cursor = "default";
        pieceEl.style.zIndex = "10";
        pieceEl.draggable = false;

        // Prevent further touching
        pieceEl.style.pointerEvents = "none";

        const allPlaced = pieces.every((p) => p.element.dataset.placed === "true");
        if (allPlaced) completePuzzle();
      } else {
        pieceEl.style.opacity = "1";
        pieceEl.style.cursor = "grab";
      }
    }

    function completePuzzle() {
      if (puzzleInstruction) {
        puzzleInstruction.textContent = "You did it! ❤️";
        puzzleInstruction.style.color = "#ff69b4";
        puzzleInstruction.style.fontSize = "1.5em";
        puzzleInstruction.style.fontWeight = "bold";
        puzzleInstruction.style.animation = "pulse 1s infinite";
      }

      const completeImage = document.createElement("div");
      Object.assign(completeImage.style, {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundImage: `url('${IMAGE_URL}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "15px",
        zIndex: "4",
        opacity: "0",
        transition: "opacity 0.6s ease",
        pointerEvents: "none",
      });
      puzzleBoard.appendChild(completeImage);

      setTimeout(() => (completeImage.style.opacity = "1"), 80);

      if (window.confetti) {
        confetti({
          particleCount: 120,
          spread: 75,
          origin: { y: 0.65 },
        });
      }

      if (puzzleContinueBtn) {
        puzzleContinueBtn.classList.remove("hidden");
        puzzleContinueBtn.style.position = "relative";
        puzzleContinueBtn.style.zIndex = "20"; // ensure above image
        if (window.gsap) {
          gsap.fromTo(
            puzzleContinueBtn,
            { scale: 0 },
            { scale: 1, duration: 0.5, ease: "back.out(2)" }
          );
        }
      }
    }

    function shufflePieces(pieces, pieceSize, containerWidth, containerHeight) {
      const placedRects = [];
      const maxX = containerWidth - pieceSize;
      const maxY = containerHeight - pieceSize;

      pieces.forEach((p) => {
        let tries = 0;
        let x, y;

        do {
          x = Math.random() * maxX;
          y = Math.random() * maxY;
          tries++;
        } while (overlapsAny(x, y, pieceSize, placedRects) && tries < 50);

        p.element.style.left = x + "px";
        p.element.style.top = y + "px";
        placedRects.push({ x, y });
      });
    }

    function overlapsAny(x, y, size, rects) {
      return rects.some((r) => {
        return !(x + size < r.x || x > r.x + size || y + size < r.y || y > r.y + size);
      });
    }
  };

  img.onerror = function () {
    puzzleBoard.innerHTML =
      "<p style='color:#ff69b4;padding:20px;'>Unable to load puzzle image. Please ensure <b>fatii.png</b> exists in the same folder.</p>";
  };

  img.src = IMAGE_URL;
};

// Add puzzle styles once
if (!document.getElementById("puzzle-styles")) {
  const style = document.createElement("style");
  style.id = "puzzle-styles";
  style.textContent = `
    @keyframes pulse {
      0%,100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .puzzle-piece { user-select:none; }
    .puzzle-piece:hover { transform: scale(1.05); }
  `;
  document.head.appendChild(style);
}
