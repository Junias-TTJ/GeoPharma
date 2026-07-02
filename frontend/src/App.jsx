import { Routes, Route } from "react-router-dom";
import Connexion from "./pages/Connexion.jsx";
import Inscription from "./pages/Inscription.jsx";
import DashboardLivreur from "./pages/livreur/DashboardLivreur.jsx";
import DashboardPharmacien from "./pages/pharmacien/DashboardPharmacien.jsx";
import DashboardAdmin from "./pages/admin/DashboardAdmin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Connexion />} />
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/dashboard-livreur" element={<DashboardLivreur />} />
      <Route path="/dashboard-pharmacien" element={<DashboardPharmacien />} />
      <Route path="/dashboard-admin" element={<DashboardAdmin />} />
      <Route path="*" element={<p>Page en construction</p>} />
    </Routes>
  );
}
