import React from 'react'

export default function SupportPage() {
    const faqs = [
        { q: "How do I track my order?", a: "You can track your order status in the 'My Orders' section of your account or use the tracking link sent to your email." },
        { q: "What is your return policy?", a: "We offer a 30-day return policy for all our products. Items must be in original condition." },
        { q: "Do you offer international shipping?", a: "Yes, we ship to over 100 countries worldwide. Shipping costs vary by location." },
        { q: "How can I contact customer support?", a: "You can use the live chat widget at the bottom right of this page for immediate assistance." },
    ];

    return (
        <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>Support & FAQs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {faqs.map((faq, index) => (
                    <div key={index} style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '1rem' }}>
                        <h3 style={{ margin: '0 0 0.5rem', color: '#a78bfa' }}>{faq.q}</h3>
                        <p style={{ margin: 0, color: '#94a3b8', lineHeight: '1.6' }}>{faq.a}</p>
                    </div>
                ))}
            </div>
        </main>
    )
}
