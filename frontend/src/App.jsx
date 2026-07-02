import Carte from "./pages/Carte";
import { Routes, Route } from "react-router-dom";
import Connexion from "./pages/Connexion.jsx";
import Inscription from "./pages/Inscription.jsx";
import DashboardLivreur from "./pages/livreur/DashboardLivreur.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/carte" element={<Carte />} />
      <Route path="/" element={<Connexion />} />
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/dashboard-livreur" element={<DashboardLivreur />} />
      <Route path="*" element={<p>Page en construction</p>} />
    </Routes>
  );
}
