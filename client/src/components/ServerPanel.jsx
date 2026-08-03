import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function ServerPanel() {
    const [activeChats, setActiveChats] = useState([]);
    const [socket, setSocket] = useState(null);
    const [deleteStatus, setDeleteStatus] = useState(null);

    useEffect(() => {
        try {
            const newSocket = io('http://localhost:3000');
            setSocket(newSocket);

            newSocket.on('connect', () => {
                newSocket.emit('agent_join'); // Join as agent to receive updates
            });

            newSocket.on('agent_update_chats', (chats) => {
                if (Array.isArray(chats)) {
                    setActiveChats(chats);
                } else if (chats && typeof chats === 'object') {
                    setActiveChats(Object.values(chats));
                } else {
                    setActiveChats([]);
                }
            });

            return () => newSocket.close();
        } catch (err) {
            console.error(err);
        }
    }, []);

    const deleteChat = async (chatId) => {
        if (!window.confirm('Are you sure you want to delete this chat history? This cannot be undone.')) return;

        try {
            const res = await fetch(`http://localhost:3000/api/chats/${chatId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setDeleteStatus('Chat deleted successfully');
                // Socket update will handle the list refresh
            } else {
                setDeleteStatus('Error deleting chat');
            }
        } catch (err) {
            console.error(err);
            setDeleteStatus('Network error deleting chat');
        }

        setTimeout(() => setDeleteStatus(null), 3000);
    };

    return (
        <div style={{ padding: '2rem', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Server Panel</h1>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Manage chat persistence and history</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                    <RefreshCw size={16} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Live Sync</span>
                </div>
            </header>

            {deleteStatus && (
                <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: deleteStatus.includes('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', borderRadius: '0.5rem', border: deleteStatus.includes('Error') ? '1px solid #ef4444' : '1px solid #10b981' }}>
                    {deleteStatus}
                </div>
            )}

            <div style={{ backgroundColor: '#1e293b', borderRadius: '1rem', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#334155', color: '#cbd5e1' }}>
                            <th style={{ padding: '1rem' }}>Chat ID / Visitor</th>
                            <th style={{ padding: '1rem' }}>Last Message</th>
                            <th style={{ padding: '1rem' }}>Started</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(!activeChats || activeChats.length === 0) ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <AlertTriangle size={32} />
                                        <span>No chat history found on server.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            activeChats.filter(c => c && c.id).map(chat => (
                                <tr key={chat.id} style={{ borderBottom: '1px solid #334155' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                        <div style={{ color: '#a78bfa' }}>{chat.name || 'Visitor'}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{chat.id}</div>
                                    </td>
                                    <td style={{ padding: '1rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#cbd5e1' }}>
                                        {chat.messages && chat.messages.length > 0 ? (
                                            typeof chat.messages[chat.messages.length - 1].text === 'object'
                                                ? JSON.stringify(chat.messages[chat.messages.length - 1].text)
                                                : chat.messages[chat.messages.length - 1].text
                                        ) : <i>No messages</i>}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                        {chat.timestamp ? new Date(chat.timestamp).toLocaleString() : ''}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => deleteChat(chat.id)}
                                            style={{
                                                padding: '0.5rem',
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Delete Chat History"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
