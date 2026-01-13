import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login.tsx";
import Dashboard from "./pages/dashboard/Dashboard";


function App() {
    return (
        <Router>
            <Routes>
                {/* Route Connexion */}
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<h1>Erreur 404 : Page introuvable</h1>} />
            </Routes>
        </Router>
    )
}

export default App;