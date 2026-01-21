import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { chatWithAI } from '../api';

const Chat = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I matched some jobs for you. Ask me anything like "Find remote roles" or "How to improve my resume?".' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        // Scroll to bottom whenever messages change
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await chatWithAI(input);
            setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid hsla(0,0%,100%,0.1)' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bot size={20} color="hsl(var(--primary))" /> AI Assistant
                </h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        background: m.role === 'user' ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.1)',
                        padding: '0.8rem',
                        borderRadius: '12px',
                        borderBottomRightRadius: m.role === 'user' ? '2px' : '12px',
                        borderBottomLeftRadius: m.role === 'assistant' ? '2px' : '12px',
                        fontSize: '0.9rem',
                        lineHeight: '1.4'
                    }}>
                        {m.content}
                    </div>
                ))}
                {loading && <div style={{ alignSelf: 'flex-start', color: 'hsl(var(--text-muted))', fontSize: '0.8rem' }}>Thinking...</div>}
                <div ref={endRef} />
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid hsla(0,0%,100%,0.1)' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask AI..."
                        style={{ width: '100%', paddingRight: '2.5rem' }}
                    />
                    <button
                        onClick={handleSend}
                        style={{
                            position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
