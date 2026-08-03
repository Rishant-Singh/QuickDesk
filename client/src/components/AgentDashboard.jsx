import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, User, MessageSquare } from 'lucide-react';

export default function AgentDashboard() {
    const [socket, setSocket] = useState(null);
    const [activeChats, setActiveChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        try {
            const newSocket = io('http://localhost:3000');
            setSocket(newSocket);

            newSocket.on('connect', () => {
                newSocket.emit('agent_join');
            });

            newSocket.on('agent_update_chats', (chats) => {
                if (Array.isArray(chats)) {
                    setActiveChats(chats);
                } else if (chats && typeof chats === 'object') {
                    // Handle case where server might verify object instead of array
                    setActiveChats(Object.values(chats));
                } else {
                    console.warn('Received invalid chats data:', chats);
                    setActiveChats([]);
                }
            });

            return () => newSocket.close();
        } catch (err) {
            console.error('Socket connection error:', err);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeChats, selectedChatId]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim() && selectedChatId && socket) {
            socket.emit('agent_message', {
                chatId: selectedChatId,
                message: messageInput
            });
            setMessageInput('');
        }
    };

    const selectedChat = Array.isArray(activeChats) ? activeChats.find(c => c.id === selectedChatId) : null;

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: 'white' }}>
            {/* Sidebar */}
            <div style={{ width: '300px', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #334155', backgroundColor: '#1e293b' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Admin Dashboard</h2>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {(!activeChats || activeChats.length === 0) ? (
                        <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>No active chats</div>
                    ) : (
                        activeChats.filter(c => c && c.id).map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChatId(chat.id)}
                                style={{
                                    padding: '16px',
                                    borderBottom: '1px solid #334155',
                                    cursor: 'pointer',
                                    backgroundColor: selectedChatId === chat.id ? '#334155' : 'transparent',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{chat.name || 'Visitor'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                                            {chat.messages && chat.messages.length > 0 ? (
                                                typeof chat.messages[chat.messages.length - 1].text === 'object'
                                                    ? JSON.stringify(chat.messages[chat.messages.length - 1].text)
                                                    : chat.messages[chat.messages.length - 1].text
                                            ) : 'Started a chat'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedChat ? (
                    <>
                        <div style={{ padding: '20px', borderBottom: '1px solid #334155', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                            <h3 style={{ margin: 0 }}>{selectedChat.name || 'Visitor'}</h3>
                        </div>

                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {selectedChat.messages && selectedChat.messages.map((msg, idx) => (
                                <div key={idx} style={{
                                    alignSelf: msg.sender === 'agent' ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%'
                                }}>
                                    <div style={{
                                        backgroundColor: msg.sender === 'agent' ? '#8b5cf6' : '#334155',
                                        padding: '10px 16px',
                                        borderRadius: '12px',
                                        borderBottomRightRadius: msg.sender === 'agent' ? '4px' : '12px',
                                        borderBottomLeftRadius: msg.sender === 'agent' ? '12px' : '4px',
                                    }}>
                                        {typeof msg.text === 'object' ? JSON.stringify(msg.text) : msg.text}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', textAlign: msg.sender === 'agent' ? 'right' : 'left' }}>
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={sendMessage} style={{ padding: '20px', borderTop: '1px solid #334155', backgroundColor: '#1e293b', display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type your reply..."
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    borderRadius: '24px',
                                    border: '1px solid #334155',
                                    backgroundColor: '#0f172a',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                            <button type="submit" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#8b5cf6', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <MessageSquare size={64} style={{ marginBottom: '20px', opacity: 0.5 }} />
                        <h2>Select a conversation to start chatting</h2>
                    </div>
                )}
            </div>
        </div>
    )
}
