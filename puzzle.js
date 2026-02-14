// Puzzle initialization (Normal layout + tray + sticky snap)
window.initPuzzle = function () {
  const puzzleBoard = document.getElementById("puzzle-board");
  const puzzleInstruction = document.getElementById("puzzle-instruction");
  const puzzleContinueBtn = document.getElementById("puzzle-continue-btn");

  if (!puzzleBoard) return;
  puzzleBoard.innerHTML = "";

  const GRID_SIZE = 4;        // change number of pieces here
  const IMAGE_URL = "fatii.png";

  const img = new Image();
  img.onload = function () {
    // ✅ use parent width so it fits your page container
    const parent = puzzleBoard.parentElement || document.body;
    const parentWidth = parent.getBoundingClientRect().width;

    const boardSize = Math.min(560, parentWidth - 16);
    const pieceSize = Math.floor(boardSize / GRID_SIZE);
    const finalBoardSize = pieceSize * GRID_SIZE;

    // wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "puzzle-wrapper";
    Object.assign(wrapper.style, {
      width: finalBoardSize + "px",
      margin: "18px auto",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    });
    puzzleBoard.appendChild(wrapper);

    // board
    const board = document.createElement("div");
    board.id = "puzzle-grid";
    Object.assign(board.style, {
      width: finalBoardSize + "px",
      height: finalBoardSize + "px",
      position: "relative",
      border: "3px solid #ff69b4",
      borderRadius: "16px",
      boxShadow: "0 8px 32px rgba(255,105,180,0.30)",
      overflow: "hidden",
      touchAction: "none",
      background: "rgba(255,255,255,0.05)",
    });
    wrapper.appendChild(board);

    // tray
    const tray = document.createElement("div");
    tray.id = "puzzle-tray";
    Object.assign(tray.style, {
      width: finalBoardSize + "px",
      minHeight: Math.max(pieceSize * 1.4, 130) + "px",
      borderRadius: "16px",
      border: "2px dashed rgba(255,105,180,0.55)",
      background: "rgba(255,255,255,0.04)",
      padding: "10px",
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
    });
    wrapper.appendChild(tray);

    // faint hint image (optional)
    

    // create pieces
    const pieces = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const piece = document.createElement("div");
        piece.className = "puzzle-piece";
        piece.dataset.row = String(row);
        piece.dataset.col = String(col);
        piece.dataset.placed = "false";

        const bgPosX = (col / (GRID_SIZE - 1)) * 100;
        const bgPosY = (row / (GRID_SIZE - 1)) * 100;

        Object.assign(piece.style, {
          width: pieceSize + "px",
          height: pieceSize + "px",
          backgroundImage: `url('${IMAGE_URL}')`,
          backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
          backgroundPosition: `${bgPosX}% ${bgPosY}%`,
          borderRadius: "12px",
          border: "1px solid rgba(255,105,180,0.55)",
          boxShadow: "0 10px 22px rgba(0,0,0,0.25)",
          cursor: "grab",
          position: "relative",
          userSelect: "none",
          touchAction: "none",
          transition: "transform 0.15s ease",
        });

        tray.appendChild(piece);
        pieces.push(piece);
      }
    }

    // shuffle in tray
    pieces.sort(() => Math.random() - 0.5).forEach((p) => tray.appendChild(p));

    // pointer drag (works on mobile + desktop)
    let active = null;
    let offsetX = 0;
    let offsetY = 0;

    function resetToTray(el) {
      el.style.position = "relative";
      el.style.left = "";
      el.style.top = "";
      el.style.zIndex = "";
      tray.appendChild(el);
    }

    function lockToBoard(el, row, col) {
      el.dataset.placed = "true";
      el.style.cursor = "default";
      el.style.position = "absolute";
      el.style.left = col * pieceSize + "px";
      el.style.top = row * pieceSize + "px";
      el.style.zIndex = "5";
      el.style.pointerEvents = "none"; // ✅ STICK / JOIN feel
      el.style.boxShadow = "none";
      board.appendChild(el);
    }

    function checkComplete() {
      if (!pieces.every((p) => p.dataset.placed === "true")) return;

      if (puzzleInstruction) {
        puzzleInstruction.textContent = "You did it! ❤️";
        puzzleInstruction.style.color = "#ff69b4";
        puzzleInstruction.style.fontSize = "1.5em";
        puzzleInstruction.style.fontWeight = "bold";
        puzzleInstruction.style.animation = "pulse 1s infinite";
      }

      if (window.confetti) confetti({ particleCount: 140, spread: 80, origin: { y: 0.65 } });

      if (puzzleContinueBtn) {
        puzzleContinueBtn.classList.remove("hidden");
        puzzleContinueBtn.style.zIndex = "20";
        if (window.gsap) gsap.fromTo(puzzleContinueBtn, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2)" });
      }
    }

    function trySnap(el, clientX, clientY) {
      const boardRect = board.getBoundingClientRect();

      // dropped outside board => return to tray
      const inside =
        clientX >= boardRect.left &&
        clientX <= boardRect.right &&
        clientY >= boardRect.top &&
        clientY <= boardRect.bottom;

      if (!inside) return resetToTray(el);

      const targetRow = parseInt(el.dataset.row, 10);
      const targetCol = parseInt(el.dataset.col, 10);

      const x = clientX - boardRect.left - offsetX;
      const y = clientY - boardRect.top - offsetY;

      const expectedX = targetCol * pieceSize;
      const expectedY = targetRow * pieceSize;

      const tolerance = pieceSize * 0.45; // ✅ stronger magnet
      if (Math.abs(x - expectedX) < tolerance && Math.abs(y - expectedY) < tolerance) {
        lockToBoard(el, targetRow, targetCol);
        checkComplete();
      } else {
        resetToTray(el);
      }
    }

    wrapper.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(".puzzle-piece");
      if (!el) return;
      if (el.dataset.placed === "true") return;

      active = el;
      active.setPointerCapture(e.pointerId);

      active.style.transform = "scale(1.05)";
      active.style.cursor = "grabbing";

      const r = active.getBoundingClientRect();
      offsetX = e.clientX - r.left;
      offsetY = e.clientY - r.top;

      // float
      active.style.position = "fixed";
      active.style.left = r.left + "px";
      active.style.top = r.top + "px";
      active.style.zIndex = "9999";
    });

    wrapper.addEventListener("pointermove", (e) => {
      if (!active) return;
      active.style.left = e.clientX - offsetX + "px";
      active.style.top = e.clientY - offsetY + "px";
    });

    wrapper.addEventListener("pointerup", (e) => {
      if (!active) return;

      active.style.transform = "scale(1)";
      active.style.cursor = "grab";

      trySnap(active, e.clientX, e.clientY);
      active = null;
    });

    wrapper.addEventListener("pointercancel", () => {
      if (!active) return;
      resetToTray(active);
      active = null;
    });
  };

  img.onerror = function () {
    puzzleBoard.innerHTML =
      "<p style='color:#ff69b4;padding:20px;'>Unable to load puzzle image. Please ensure <b>fatii.png</b> exists in the same folder.</p>";
  };

  img.src = IMAGE_URL;
};

// styles once
if (!document.getElementById("puzzle-styles")) {
  const style = document.createElement("style");
  style.id = "puzzle-styles";
  style.textContent = `
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
    .puzzle-piece:hover { filter: brightness(1.06); }
  `;
  document.head.appendChild(style);
}
