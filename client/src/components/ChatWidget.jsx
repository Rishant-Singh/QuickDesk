import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, X, Send } from 'lucide-react';
import '../styles/index.css';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Connect to server
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        // Get or Create Session ID
        let sessionId = localStorage.getItem('chatSessionId');
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            localStorage.setItem('chatSessionId', sessionId);
        }

        newSocket.on('connect', () => {
            console.log('Connected to server with session:', sessionId);
            // Send sessionId to identify ourselves
            newSocket.emit('visitor_join', { sessionId });
        });

        newSocket.on('visitor_receive_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        newSocket.on('visitor_history', (history) => {
            if (Array.isArray(history)) {
                setMessages(history);
            }
        });

        newSocket.on('message_sent', (msg) => {
            // Confirmation that my message was sent
            setMessages((prev) => [...prev, msg]);
        });

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (inputValue.trim() && socket) {
            const sessionId = localStorage.getItem('chatSessionId');
            socket.emit('visitor_message', { sessionId, message: inputValue });
            setInputValue('');
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {isOpen ? (
                <div style={{
                    width: '350px',
                    height: '500px',
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{ padding: '16px', background: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Customer Support</h3>
                            <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Connected</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Array.isArray(messages) && messages.map((msg, index) => (
                            <div key={index} style={{
                                alignSelf: msg.sender === 'visitor' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.sender === 'visitor' ? '#8b5cf6' : '#334155',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                maxWidth: '80%',
                                wordWrap: 'break-word',
                                borderBottomRightRadius: msg.sender === 'visitor' ? '4px' : '12px',
                                borderBottomLeftRadius: msg.sender === 'visitor' ? '12px' : '4px',
                            }}>
                                {typeof msg.text === 'object' ? JSON.stringify(msg.text) : msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} style={{ padding: '12px', borderTop: '1px solid #334155', display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '20px',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                        <button type="submit" style={{ background: '#8b5cf6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#8b5cf6',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.5)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s'
                    }}
                    className="chat-toggle"
                >
                    <MessageCircle size={32} />
                </button>
            )}
        </div>
    );
}
