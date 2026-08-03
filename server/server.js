const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// Health check route & Admin Dashboard
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Live Chat Server Panel</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; text-align: center; }
            .container { max-width: 800px; margin: 0 auto; }
            h1 { color: #8b5cf6; margin-bottom: 30px; }
            
            .card { background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: left; }
            
            summary { cursor: pointer; font-weight: bold; color: #38bdf8; padding: 10px; font-size: 1.1rem; outline: none; }
            summary:hover { color: #0ea5e9; }
            
            .json-box { background: #020617; padding: 15px; border-radius: 8px; overflow: auto; max-height: 60vh; white-space: pre-wrap; margin-top: 10px; color: #a5f3fc; font-family: monospace; }
            
            .danger-zone { border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.1); }
            .btn-reset { background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; width: 100%; transition: background 0.2s; }
            .btn-reset:hover { background: #dc2626; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>SERVER DASHBOARD (Port 3000)</h1>
            
            <div class="card">
                <details open>
                    <summary>📁 Admin Data (Click to Toggle)</summary>
                    <div class="json-box">
${JSON.stringify(activeChats, null, 2)}
                    </div>
                </details>
            </div>

            <div class="card danger-zone">
                <h3>Danger Zone</h3>
                <form action="/api/reset" method="POST" onsubmit="return confirm('Are you sure you want to WIP ALL CHAT DATA? This cannot be undone.');">
                    <button type="submit" class="btn-reset">⚠️ RESET ALL SERVER DATA</button>
                </form>
            </div>
        </div>
        
        <script>
            // Auto-refresh every 5 seconds to show latest data
            // We save the state of the details element to restore it after reload
            document.querySelector('details').addEventListener('toggle', (e) => {
                localStorage.setItem('adminDetailsOpen', e.target.open);
            });
            
            if (localStorage.getItem('adminDetailsOpen') === 'false') {
                document.querySelector('details').removeAttribute('open');
            }

            setTimeout(() => window.location.reload(), 5000);
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// API to reset all data
app.post('/api/reset', (req, res) => {
    activeChats = {};
    saveChats();
    io.emit('agent_update_chats', []);
    console.log('WARNING: ALL DATA RESET via Server Panel');
    res.redirect('/');
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const DATA_FILE = path.join(__dirname, 'data', 'chats.json');

// Load chats from file
let activeChats = {};
if (fs.existsSync(DATA_FILE)) {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        activeChats = JSON.parse(data);
        // Sanitize data
        for (const id in activeChats) {
            if (!activeChats[id].messages) {
                activeChats[id].messages = [];
            }
        }
        console.log('Loaded chats from file');
    } catch (err) {
        console.error('Error loading chats:', err);
    }
}

// Helper to save chats
const saveChats = () => {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(activeChats, null, 2));
    } catch (err) {
        console.error('Error saving chats:', err);
    }
};

// API to delete a chat
app.delete('/api/chats/:id', (req, res) => {
    const { id } = req.params;
    if (activeChats[id]) {
        delete activeChats[id];
        saveChats();
        io.emit('agent_update_chats', Object.values(activeChats));
        res.json({ success: true, message: 'Chat deleted' });
    } else {
        res.status(404).json({ success: false, message: 'Chat not found' });
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // VISITOR EVENTS
    socket.on('visitor_join', (data) => {
        // Data should contain a persistent sessionId
        const sessionId = (data && data.sessionId) ? data.sessionId : socket.id;

        // If this session exists, recover it. If not, create new.
        if (!activeChats[sessionId]) {
            const chatData = {
                id: sessionId,
                name: 'Visitor ' + sessionId.substr(0, 5),
                messages: [],
                timestamp: new Date()
            };
            activeChats[sessionId] = chatData;
            saveChats();
            console.log(`New Visitor Session: ${sessionId}`);
        } else {
            console.log(`Recovered Visitor Session: ${sessionId}`);
            // Send history back to visitor
            socket.emit('visitor_history', activeChats[sessionId].messages);
        }

        // Join the room for this session so we can message them specifically
        socket.join(sessionId);

        // Notify agents
        io.emit('agent_update_chats', Object.values(activeChats));
    });

    socket.on('visitor_message', (data) => {
        console.log('DEBUG: Received visitor_message RAW:', typeof data, data);

        const sessionId = data.sessionId || socket.id;

        // Robust message extraction to prevent object injection
        let messageText = '';
        if (data && data.message) {
            console.log('DEBUG: data.message found:', typeof data.message, data.message);
            if (typeof data.message === 'object') {
                messageText = JSON.stringify(data.message);
                console.log('DEBUG: data.message was object, stringified to:', messageText);
            } else {
                messageText = String(data.message);
                console.log('DEBUG: data.message was primitive, cast to:', messageText);
            }
        } else if (typeof data === 'string') {
            messageText = data;
            console.log('DEBUG: data was string, using directly:', messageText);
        } else {
            messageText = 'Message Error: Invalid Format';
            console.log('DEBUG: Invalid format fallback');
        }

        if (activeChats[sessionId]) {
            const msgData = {
                sender: 'visitor',
                text: messageText,
                timestamp: new Date()
            };
            activeChats[sessionId].messages.push(msgData);
            saveChats();

            io.emit('agent_update_chats', Object.values(activeChats));
            socket.emit('message_sent', msgData);
        }
    });

    // AGENT EVENTS
    socket.on('agent_join', () => {
        console.log('Agent joined');
        socket.emit('agent_update_chats', Object.values(activeChats));
    });

    socket.on('agent_message', ({ chatId, message }) => {
        if (activeChats[chatId]) {
            const msgData = {
                sender: 'agent',
                text: message, // Agent message is trusted to be string from dashboard
                timestamp: new Date()
            };
            activeChats[chatId].messages.push(msgData);
            saveChats();

            // Send to the room matching the chatId (which is the sessionId)
            io.to(chatId).emit('visitor_receive_message', msgData);

            io.emit('agent_update_chats', Object.values(activeChats));
        }
    });

    socket.on('disconnect', () => {
        // Do nothing on disconnect to preserve persistence
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
