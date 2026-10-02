type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="page-section placeholder-page page-hero">
      <div className="container page-hero-content">
        <p className="eyebrow">Página preparada</p>
        <h1>{title}</h1>
        <p>
          Esta ruta queda creada para desarrollar contenido, componentes y funcionalidades
          específicas en una fase posterior.
        </p>
      </div>
    </section>
  );
}
