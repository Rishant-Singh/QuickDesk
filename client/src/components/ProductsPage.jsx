import React from 'react'


export default function ProductsPage() {
    const products = [
        { id: 1, name: "Pro Noise Cancelling", price: "₹2,999", color: "#8b5cf6" },
        { id: 2, name: "Bass Boosted X1", price: "₹1,499", color: "#10b981" },
        { id: 3, name: "Studio Reference", price: "₹5,999", color: "#f59e0b" },
        { id: 4, name: "Sport Wireless", price: "₹999", color: "#ef4444" },
    ];

    return (
        <main style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Our Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                {products.map(product => (
                    <div key={product.id} style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}>
                        <div style={{ width: '100%', height: '150px', backgroundColor: product.color, borderRadius: '0.5rem', marginBottom: '1rem', opacity: 0.5 }}></div>
                        <h3 style={{ margin: '0.5rem 0' }}>{product.name}</h3>
                        <p style={{ color: '#94a3b8' }}>{product.price}</p>
                        <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#334155', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}>Add to Cart</button>
                    </div>
                ))}
            </div>
        </main>
    )
}
