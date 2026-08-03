import React from 'react'
import ChatWidget from './ChatWidget'

export default function LandingPage() {
    return (
        <div className="landing-container">
            <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <span style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>NEW ARRIVAL</span>
                <h2 style={{ fontSize: '4rem', margin: '1rem 0', background: 'linear-gradient(to right, white, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>The Future of<br />Headphones.</h2>
                <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto 2rem' }}>Experience high-fidelity sound with our latest noise-cancelling technology. Complete with a 2-year warranty and 24/7 support.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button style={{ padding: '1rem 2rem', background: '#8b5cf6', border: 'none', borderRadius: '2rem', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Buy Now ₹2,999</button>
                    <button style={{ padding: '1rem 2rem', background: 'transparent', border: '1px solid #334155', borderRadius: '2rem', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Learn More</button>
                </div>

                <div style={{ marginTop: '6rem' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '3rem' }}>Featured Products</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                        {[
                            { id: 1, name: "Pro Noise Cancelling", price: "₹2,999", color: "#8b5cf6" },
                            { id: 2, name: "Bass Boosted X1", price: "₹1,499", color: "#10b981" },
                            { id: 3, name: "Studio Reference", price: "₹5,999", color: "#f59e0b" }
                        ].map(product => (
                            <div key={product.id} style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '1rem', transition: 'transform 0.2s', cursor: 'pointer', textAlign: 'left' }}>
                                <div style={{ width: '100%', height: '150px', backgroundColor: product.color, borderRadius: '0.5rem', marginBottom: '1rem', opacity: 0.5 }}></div>
                                <h4 style={{ margin: '0.5rem 0', fontSize: '1.2rem' }}>{product.name}</h4>
                                <p style={{ color: '#94a3b8', margin: 0 }}>{product.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
