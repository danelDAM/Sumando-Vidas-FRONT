import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function Layout() {
  return (
    <>
      <Header />
      <main id="contenido-principal">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
