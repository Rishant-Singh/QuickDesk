import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import AgentDashboard from './components/AgentDashboard'
import ProductsPage from './components/ProductsPage'
import SupportPage from './components/SupportPage'
import ServerPanel from './components/ServerPanel'
import Layout from './components/Layout'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/support" element={<SupportPage />} />
                </Route>
                <Route path="/agent" element={<AgentDashboard />} />
                <Route path="/server-panel" element={<ServerPanel />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
