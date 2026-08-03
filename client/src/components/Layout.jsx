import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import ChatWidget from './ChatWidget'

export default function Layout() {
    const location = useLocation();

    return (
        <div className="landing-container">
            <header style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
                    <h1 style={{ margin: 0, fontWeight: 'bold' }}>TechStore</h1>
                </Link>
                <nav>
                    <Link to="/products">
                        <button style={{ marginRight: '1rem', background: 'none', border: 'none', color: location.pathname === '/products' ? '#a78bfa' : 'white', cursor: 'pointer', fontWeight: location.pathname === '/products' ? 'bold' : 'normal' }}>Products</button>
                    </Link>
                    <Link to="/support">
                        <button style={{ background: 'none', border: 'none', color: location.pathname === '/support' ? '#a78bfa' : 'white', cursor: 'pointer', fontWeight: location.pathname === '/support' ? 'bold' : 'normal' }}>Support</button>
                    </Link>
                </nav>
            </header>
            <Outlet />
            <ChatWidget />
        </div>
    )
}
