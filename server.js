const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '/')));
app.use(express.json()); // Enable JSON body parsing

const CHAT_FILE = path.join(__dirname, 'chat_history.json');
const RESPONSES_FILE = path.join(__dirname, 'user_responses.json');

// --- Helper Functions ---
function loadChatHistory() {
    try {
        if (fs.existsSync(CHAT_FILE)) {
            const data = fs.readFileSync(CHAT_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) { console.error("Error loading chat:", err); }
    return [];
}

function saveChatMessage(msg) {
    const history = loadChatHistory();
    history.push(msg);
    // Limit to last 100 messages to prevent infinite growth
    if (history.length > 100) history.shift();
    fs.writeFileSync(CHAT_FILE, JSON.stringify(history, null, 2));
}

function saveResponse(data) {
    let responses = [];
    try {
        if (fs.existsSync(RESPONSES_FILE)) {
            responses = JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
        }
    } catch (err) { }

    responses.push({
        ...data,
        timestamp: new Date().toISOString()
    });

    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2));
}

// --- Routes ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Save Riddle Response
app.post('/api/save-response', (req, res) => {
    const data = req.body; // { question, answer, isCorrect ... }
    console.log("Received Response:", data);
    saveResponse(data);
    res.json({ status: 'success' });
});

// View Responses (Dev/Admin)
app.get('/api/view-responses', (req, res) => {
    if (fs.existsSync(RESPONSES_FILE)) {
        res.sendFile(RESPONSES_FILE);
    } else {
        res.json([]);
    }
});

// --- Socket.io ---
io.on('connection', (socket) => {
    console.log('a user connected');

    // Send history on connect
    const history = loadChatHistory();
    socket.emit('chat history', history);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        // Save and Broadcast
        saveChatMessage(msg);
        io.emit('chat message', msg);
    });
});

const PORT = process.env.PORT || 3000;
const startServer = (port) => {
    server.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error(err);
        }
    });
};

startServer(PORT);
