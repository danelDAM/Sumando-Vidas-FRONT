import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "./components/layout/Layout";
import { legalNavigation, futurePages } from "./data/navigation";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { HomePage } from "./pages/HomePage";
import { useScrollReveal } from "./hooks/useScrollReveal";

// The home page ships in the main bundle; every other page is downloaded when visited.
const page = <Name extends string>(name: Name, load: () => Promise<Record<Name, React.ComponentType>>) =>
  lazy(() => load().then((module) => ({ default: module[name] })));
const AboutPage = page("AboutPage", () => import("./pages/AboutPage"));
const ProjectsPage = page("ProjectsPage", () => import("./pages/ProjectsPage"));
const PorEllosProjectPage = page("PorEllosProjectPage", () => import("./pages/PorEllosProjectPage"));
const HeroesQueSumanPage = page("HeroesQueSumanPage", () => import("./pages/HeroesQueSumanPage"));
const StoriesPage = page("StoriesPage", () => import("./pages/StoriesPage"));
const ContactPage = page("ContactPage", () => import("./pages/ContactPage"));
const DonationsPage = page("DonationsPage", () => import("./pages/DonationsPage"));
const DonationStatusPage = page("DonationStatusPage", () => import("./pages/DonationStatusPage"));
const EventsPage = page("EventsPage", () => import("./pages/EventsPage"));
const TransparencyPage = page("TransparencyPage", () => import("./pages/TransparencyPage"));

export default function App() {
  const { t } = useTranslation();
  useScrollReveal();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="sobre-nosotros" element={<AboutPage />} />
        <Route path="proyectos" element={<ProjectsPage />} />
        <Route path="proyectos/por-ellos" element={<PorEllosProjectPage />} />
        <Route path="proyectos/heroes-que-suman" element={<HeroesQueSumanPage />} />
        <Route path="historias" element={<StoriesPage />} />
        <Route path="contacto" element={<ContactPage />} />
        <Route path="donaciones" element={<DonationsPage />} />
        <Route path="eventos" element={<EventsPage />} />
        <Route path="transparencia" element={<TransparencyPage />} />
        <Route path="donaciones/estado" element={<DonationStatusPage />} />
        {futurePages.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={<PlaceholderPage title={t(page.key)} />}
          />
        ))}
        {legalNavigation.map((page) => (
          <Route
            key={page.href}
            path={page.href.replace("/", "")}
            element={<PlaceholderPage title={t(page.key)} />}
          />
        ))}
      </Route>
    </Routes>
  );
}
