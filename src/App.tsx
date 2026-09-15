import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { legalNavigation, futurePages } from "./data/navigation";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { HomePage } from "./pages/HomePage";
import { useScrollReveal } from "./hooks/useScrollReveal";
import { ProjectsPage } from "./pages/ProjectsPage";
import { PorEllosProjectPage } from "./pages/PorEllosProjectPage";
import { StoriesPage } from "./pages/StoriesPage";
import { DonationStatusPage } from "./pages/DonationStatusPage";
import { HeroesQueSumanPage } from "./pages/HeroesQueSumanPage";
import { ContactPage } from "./pages/ContactPage";
import { DonationsPage } from "./pages/DonationsPage";

export default function App() {
  useScrollReveal();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="proyectos" element={<ProjectsPage />} />
        <Route path="proyectos/por-ellos" element={<PorEllosProjectPage />} />
        <Route path="proyectos/heroes-que-suman" element={<HeroesQueSumanPage />} />
        <Route path="historias" element={<StoriesPage />} />
        <Route path="contacto" element={<ContactPage />} />
        <Route path="donaciones" element={<DonationsPage />} />
        <Route path="donaciones/exito" element={<DonationStatusPage status="success" />} />
        <Route path="donaciones/cancelado" element={<DonationStatusPage status="cancel" />} />
        {futurePages.filter((page) => !["proyectos", "historias", "contacto", "donaciones"].includes(page.path)).map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={<PlaceholderPage title={page.label} />}
          />
        ))}
        {legalNavigation.map((page) => (
          <Route
            key={page.href}
            path={page.href.replace("/", "")}
            element={<PlaceholderPage title={page.label} />}
          />
        ))}
      </Route>
    </Routes>
  );
}
