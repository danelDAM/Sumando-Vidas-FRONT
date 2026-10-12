import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function Layout() {
  return (
    <>
      <Header />
      <main id="contenido-principal">
        {/* Keeps the footer in place while a page's code is downloading. */}
        <Suspense fallback={<div className="page-loading" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
