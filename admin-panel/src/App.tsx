import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login.tsx";
import Dashboard from "./pages/dashboard/Dashboard";
import PrivateRoutes from "./components/PrivateRoutes.tsx";
import Layout from "./components/Layout.tsx";
import Techniciens from "./pages/technicien/Techniciens.tsx";
import Materiel from "./pages/materiels/Materiel.tsx";
import Interventions from "./pages/Interventions/Interventions.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<PrivateRoutes />}>
                    {/* 2. Si oui, on affiche le Layout (Menu + Contenu) */}
                    <Route element={<Layout />}>
                        {/* 3. Et dedans, on met nos pages */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/techniciens" element={<Techniciens />} />
                        <Route path="/materiels" element={<Materiel />} />
                        <Route path="/interventions" element= { <Interventions />} />
                    </Route>
                </Route>
                <Route path="*" element={<h1>404</h1>} />
            </Routes>
        </Router>
    )
}

export default App;