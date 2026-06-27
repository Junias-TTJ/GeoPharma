import { Routes, Route } from "react-router-dom";
import DashboardLivreur from "./pages/livreur/DashboardLivreur.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLivreur />} />
      <Route path="/dashboard-livreur" element={<DashboardLivreur />} />
      <Route path="*" element={<p>Page en construction</p>} />
    </Routes>
  );
}
