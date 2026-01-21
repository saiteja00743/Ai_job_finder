import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Briefcase, LayoutDashboard, FileText, Menu, X } from 'lucide-react';
import Chat from './Chat';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const linkStyle = ({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.8rem 1rem',
        color: isActive ? 'white' : 'hsl(var(--text-muted))',
        background: isActive ? 'hsla(var(--primary), 0.2)' : 'transparent',
        borderRight: isActive ? '3px solid hsl(var(--primary))' : '3px solid transparent',
        textDecoration: 'none',
        fontWeight: 500,
        marginBottom: '0.5rem',
        borderRadius: '0 8px 8px 0',
        transition: 'all 0.2s'
    });

    return (
        <>
            {/* Mobile Toggle Button - Only visible when closed */}
            {!isOpen && (
                <button className="mobile-toggle" onClick={() => setIsOpen(true)}>
                    <Menu size={24} />
                </button>
            )}

            {/* Overlay */}
            {isOpen && (
                <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
            )}

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>JobAI</h1>
                    <button className="mobile-close" onClick={() => setIsOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/" style={linkStyle} onClick={() => setIsOpen(false)}>
                        <Briefcase size={20} /> Jobs Feed
                    </NavLink>
                    <NavLink to="/dashboard" style={linkStyle} onClick={() => setIsOpen(false)}>
                        <LayoutDashboard size={20} /> Dashboard
                    </NavLink>
                    <NavLink to="/upload" style={linkStyle} onClick={() => setIsOpen(false)}>
                        <FileText size={20} /> Resume
                    </NavLink>
                </nav>

                <div className="sidebar-chat-container">
                    <Chat />
                </div>
            </div>
        </>
    );
};

export default Sidebar;
