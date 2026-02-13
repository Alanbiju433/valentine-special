const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];

// Handle mouse
const mouse = {
    x: null,
    y: null,
    radius: 100
}

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

class Particle {
    constructor(x, y, color) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = x;
        this.baseY = y;
        this.size = 2; // small particles
        this.density = (Math.random() * 30) + 1;
        this.color = color;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }
    }
}

function init(text) {
    particlesArray = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw text to sample
    ctx.fillStyle = 'white';
    ctx.font = 'bold 150px "Great Vibes"'; // Use the fancy font
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Scan data
    const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Clear after scanning
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0, y2 = textCoordinates.height; y < y2; y += 4) { // Sample every 4th pixel for performance
        for (let x = 0, x2 = textCoordinates.width; x < x2; x += 4) {
            if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                let positionX = x;
                let positionY = y;
                // Add particle - Cyber Barbie Pink
                particlesArray.push(new Particle(positionX, positionY, 'rgba(255, 20, 147, 0.8)'));
            }
        }
    }
}


// Expose init function globally
window.initParticles = init;


function initImageWithText(imageSrc, text) {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
        particlesArray = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Image
        const aspect = image.width / image.height;
        // make it responsive: max 300px or 80% of screen width
        let drawWidth = Math.min(300, canvas.width * 0.8);
        let drawHeight = drawWidth / aspect;

        // Center horizontally, bit higher up vertically to make room for text
        const xOffset = (canvas.width - drawWidth) / 2;
        const yOffset = (canvas.height - drawHeight) / 2 - 50;

        ctx.drawImage(image, xOffset, yOffset, drawWidth, drawHeight);

        // 2. Draw Text below image
        ctx.fillStyle = 'white';
        // Responsive font size
        const fontSize = Math.min(60, canvas.width * 0.15);
        ctx.font = `bold ${fontSize}px "Great Vibes"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top'; // Draw from top down

        // Position text 20px below the image
        ctx.fillText(text, canvas.width / 2, yOffset + drawHeight + 20);

        // 3. Scan Data
        try {
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear to draw particles instead

            for (let y = 0, y2 = data.height; y < y2; y += 4) {
                for (let x = 0, x2 = data.width; x < x2; x += 4) {
                    const idx = (y * 4 * data.width) + (x * 4);
                    const r = data.data[idx];
                    const g = data.data[idx + 1];
                    const b = data.data[idx + 2];
                    const alpha = data.data[idx + 3];

                    // Brightness check (to skip white-ish or black-ish backgrounds if not transparent)
                    const brightness = (r + g + b) / 3;

                    // If it's transparent OR if it's not too dark/too bright (optional heuristic)
                    // Let's stick to alpha for now, but use REAL colors
                    if (alpha > 128) {
                        // Soft Barbie Tint: Mix original color with 30% pink
                        const finalR = Math.floor(r * 0.7 + 255 * 0.3);
                        const finalG = Math.floor(g * 0.7 + 20 * 0.3);
                        const finalB = Math.floor(b * 0.7 + 147 * 0.3);

                        const color = `rgba(${finalR}, ${finalG}, ${finalB}, ${alpha / 255})`;
                        particlesArray.push(new Particle(x, y, color));
                    }
                }
            }
        } catch (e) {
            console.error("SecurityError: Unable to access canvas data. Ensure you are running on a server (http://localhost:3000) and not opening the file directly.", e);
            // Fallback: Just keep the image/text drawn without particles?
            // Actually, if we failed at getImageData, the canvas still has the drawing on it.
            // But we wanted to clear it and replace with particles.
            // If we catch error, we skip clearing and presumably just leave the static drawing?
            // But we already drew it. The `ctx.clearRect` is *inside* the try block after getImageData succeeds.
            // So if `getImageData` fails, `clearRect` is skipped, and the original static image remains visible. This is a good graceful degradation.
        }
    }
}
// Expose globally
window.initImageWithText = initImageWithText;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw();
        particlesArray[i].update();
    }
    requestAnimationFrame(animate);
}

// Start sequence
init('Fatii');
animate();

// Sequence logic
setTimeout(() => {
    // Transition to Image + Text separately
    // "My Love" is now part of the image particle system
    initImageWithText('fatii.png', 'My Love');
}, 4000);

setTimeout(() => {
    // Fade out canvas and start main app
    const canvasEl = document.getElementById('particle-canvas');
    canvasEl.style.transition = 'opacity 2s';
    canvasEl.style.opacity = 0;
    setTimeout(() => {
        canvasEl.style.display = 'none';
        document.getElementById('app').style.opacity = 1; // Show main app
        // Trigger landing page animation if needed
        const landing = document.getElementById('landing');
        if (landing) landing.classList.add('active');
    }, 2000);
}, 15000); // Give it a lot more time to be admired (4s text + 11s image)

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Debounce or just re-init current state? 
    // For simplicity, just re-init text to avoid broken state
    // init('Fatii'); 
});

