// Puzzle initialization for the valentine special
window.initPuzzle = function() {
  const puzzleBoard = document.getElementById('puzzle-board');
  const puzzleInstruction = document.getElementById('puzzle-instruction');
  const puzzleContinueBtn = document.getElementById('puzzle-continue-btn');

  if (!puzzleBoard) return;

  // Clear the board
  puzzleBoard.innerHTML = '';

  // Configuration
  const GRID_SIZE = 4; // 4x4 puzzle
  const IMAGE_URL = 'fatii.png';

  // Create and load the image
  const img = new Image();
  img.onload = function() {
    const containerWidth = Math.min(600, window.innerWidth - 40);
    const containerHeight = containerWidth;

    // Set board dimensions
    puzzleBoard.style.width = containerWidth + 'px';
    puzzleBoard.style.height = containerHeight + 'px';
    puzzleBoard.style.position = 'relative';
    puzzleBoard.style.border = '3px solid #ff69b4';
    puzzleBoard.style.borderRadius = '15px';
    puzzleBoard.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    puzzleBoard.style.margin = '20px auto';
    puzzleBoard.style.boxShadow = '0 8px 32px rgba(255, 105, 180, 0.3)';
    puzzleBoard.style.overflow = 'hidden';

    const pieceSize = containerWidth / GRID_SIZE;

    // Create puzzle pieces
    const pieces = [];
    const piecesContainer = document.createElement('div');
    piecesContainer.id = 'pieces-container';
    piecesContainer.style.position = 'absolute';
    piecesContainer.style.width = '100%';
    piecesContainer.style.height = '100%';
    piecesContainer.style.top = '0';
    piecesContainer.style.left = '0';
    puzzleBoard.appendChild(piecesContainer);

    // Create a drop zone
    const dropZone = document.createElement('div');
    dropZone.id = 'drop-zone';
    dropZone.style.position = 'absolute';
    dropZone.style.width = '100%';
    dropZone.style.height = '100%';
    dropZone.style.top = '0';
    dropZone.style.left = '0';
    dropZone.style.zIndex = '1';
    puzzleBoard.appendChild(dropZone);

    // Create pieces array
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.draggable = true;

        const bgPosX = (col / GRID_SIZE) * 100;
        const bgPosY = (row / GRID_SIZE) * 100;

        piece.style.position = 'absolute';
        piece.style.width = pieceSize + 'px';
        piece.style.height = pieceSize + 'px';
        piece.style.backgroundImage = `url('${IMAGE_URL}')`;
        piece.style.backgroundSize = (GRID_SIZE * 100) + '% ' + (GRID_SIZE * 100) + '%';
        piece.style.backgroundPosition = bgPosX + '% ' + bgPosY + '%';
        piece.style.cursor = 'grab';
        piece.style.border = '1px solid rgba(255, 105, 180, 0.5)';
        piece.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        piece.style.borderRadius = '8px';
        piece.style.transition = 'transform 0.2s ease';
        piece.dataset.row = row;
        piece.dataset.col = col;
        piece.dataset.placed = 'false';

        pieces.push({
          element: piece,
          row: row,
          col: col,
          placed: false
        });

        piecesContainer.appendChild(piece);
      }
    }

    // Shuffle pieces
    shufflePieces(pieces, pieceSize, containerWidth, containerHeight, piecesContainer);

    // Add drag and drop events
    let draggedPiece = null;
    let offsetX = 0;
    let offsetY = 0;

    piecesContainer.addEventListener('dragstart', (e) => {
      if (!e.target.classList.contains('puzzle-piece')) return;
      draggedPiece = e.target;
      e.target.style.opacity = '0.7';
      e.target.style.cursor = 'grabbing';
      offsetX = e.clientX - e.target.getBoundingClientRect().left;
      offsetY = e.clientY - e.target.getBoundingClientRect().top;
      e.dataTransfer.effectAllowed = 'move';
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!draggedPiece) return;

      const rect = puzzleBoard.getBoundingClientRect();
      const x = e.clientX - rect.left - offsetX;
      const y = e.clientY - rect.top - offsetY;

      const row = Math.round(y / pieceSize);
      const col = Math.round(x / pieceSize);

      const targetRow = parseInt(draggedPiece.dataset.row);
      const targetCol = parseInt(draggedPiece.dataset.col);

      // Check if piece is placed correctly (with some tolerance)
      const tolerance = pieceSize * 0.3;
      const expectedX = targetCol * pieceSize;
      const expectedY = targetRow * pieceSize;

      if (Math.abs(x - expectedX) < tolerance && Math.abs(y - expectedY) < tolerance) {
        // Piece placed correctly
        draggedPiece.style.position = 'absolute';
        draggedPiece.style.left = expectedX + 'px';
        draggedPiece.style.top = expectedY + 'px';
        draggedPiece.style.opacity = '1';
        draggedPiece.dataset.placed = 'true';
        draggedPiece.style.cursor = 'default';
        draggedPiece.style.zIndex = '10';

        // Check if all pieces are placed
        const allPlaced = pieces.every(p => p.element.dataset.placed === 'true');
        if (allPlaced) {
          completeP uzzle();
        }
      } else {
        draggedPiece.style.opacity = '1';
        draggedPiece.style.cursor = 'grab';
      }

      draggedPiece = null;
    });

    piecesContainer.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('puzzle-piece')) {
        e.target.style.opacity = '1';
        e.target.style.cursor = 'grab';
      }
    });

    // Complete puzzle function
    function completePuzzle() {
      puzzleInstruction.textContent = 'You did it! ❤️';
      puzzleInstruction.style.color = '#ff69b4';
      puzzleInstruction.style.fontSize = '1.5em';
      puzzleInstruction.style.fontWeight = 'bold';
      puzzleInstruction.style.animation = 'pulse 1s infinite';

      // Show complete image
      const completeImage = document.createElement('div');
      completeImage.style.position = 'absolute';
      completeImage.style.width = '100%';
      completeImage.style.height = '100%';
      completeImage.style.backgroundImage = `url('${IMAGE_URL}')`;
      completeImage.style.backgroundSize = 'cover';
      completeImage.style.backgroundPosition = 'center';
      completeImage.style.borderRadius = '15px';
      completeImage.style.zIndex = '5';
      completeImage.style.opacity = '0';
      completeImage.style.transition = 'opacity 0.6s ease';
      completeImage.insertAdjacentHTML('afterbegin', '<div style="position: absolute; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(255,105,180,0.3) 0%, rgba(255,192,203,0.2) 100%);"></div>');
      
      puzzleBoard.appendChild(completeImage);
      setTimeout(() => {
        completeImage.style.opacity = '1';
      }, 100);

      // Trigger confetti if available
      if (window.confetti) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff69b4', '#ff1493', '#ffb6c1', '#ffc0cb']
        });
      }

      // Show continue button
      if (puzzleContinueBtn) {
        puzzleContinueBtn.classList.remove('hidden');
        if (window.gsap) {
          gsap.fromTo(puzzleContinueBtn, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' });
        }
      }
    }
  };

  img.onerror = function() {
    puzzleBoard.innerHTML = '<p style="color: #ff69b4; padding: 20px;">Unable to load puzzle image. Please ensure fatii.png exists in the root directory.</p>';
  };

  img.src = IMAGE_URL;

  // Shuffle pieces randomly
  function shufflePieces(pieces, pieceSize, containerWidth, containerHeight, container) {
    const padding = 20;
    const maxX = containerWidth + 200;
    const maxY = containerHeight + 200;

    pieces.forEach((piece) => {
      let randomX, randomY;
      let attempts = 0;
      
      do {
        randomX = Math.random() * maxX - 100;
        randomY = Math.random() * maxY - 100;
        attempts++;
      } while (isOverlapping(randomX, randomY, pieceSize, pieces) && attempts < 10);

      piece.element.style.left = randomX + 'px';
      piece.element.style.top = randomY + 'px';
      piece.element.style.zIndex = '2';
    });
  }

  // Check if piece overlaps with others
  function isOverlapping(x, y, size, pieces) {
    return pieces.some(p => {
      const px = parseFloat(p.element.style.left) || 0;
      const py = parseFloat(p.element.style.top) || 0;
      return !(x + size < px || x > px + size || y + size < py || y > py + size);
    });
  }
};

// CSS for animations (add to style.css if not already present)
if (!document.getElementById('puzzle-styles')) {
  const style = document.createElement('style');
  style.id = 'puzzle-styles';
  style.textContent = `
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    .puzzle-piece {
      user-select: none;
      transition: all 0.2s ease;
    }

    .puzzle-piece:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(255, 105, 180, 0.5) !important;
    }

    .puzzle-piece:active {
      cursor: grabbing !important;
    }

    #puzzle-board {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;
  document.head.appendChild(style);
}