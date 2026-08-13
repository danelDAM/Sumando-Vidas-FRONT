import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { legalNavigation, futurePages } from "./data/navigation";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { HomePage } from "./pages/HomePage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        {futurePages.map((page) => (
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
