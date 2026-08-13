import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { legalNavigation, futurePages } from "./data/navigation";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { HomePage } from "./pages/HomePage";
import { useScrollReveal } from "./hooks/useScrollReveal";
import { ProjectsPage } from "./pages/ProjectsPage";
import { PorEllosProjectPage } from "./pages/PorEllosProjectPage";

export default function App() {
  useScrollReveal();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="proyectos" element={<ProjectsPage />} />
        <Route path="proyectos/por-ellos" element={<PorEllosProjectPage />} />
        {futurePages.filter((page) => page.path !== "proyectos").map((page) => (
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
