import { SectionHeader } from "../components/ui/SectionHeader";
import { PublicDataStatus } from "../components/ui/PublicDataStatus";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicTransparencyReports } from "../services/publicData";

const reportTypeLabels: Record<string, string> = {
  annual_report: "Memoria anual",
  financial_report: "Informe económico",
  donation_use: "Destino de donaciones",
  other: "Informe",
};

export function TransparencyPage() {
  const { data: reports, loading, error } = usePublicQuery("transparency-reports", getPublicTransparencyReports, null);

  return (
    <>
      <section className="page-section page-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">Transparencia</p>
          <h1>Informes y memorias</h1>
          <p>Documentación pública sobre la actividad y el uso de las aportaciones.</p>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container">
          <SectionHeader eyebrow="Documentación" title="Informes publicados" />
          <PublicDataStatus
            loading={loading}
            error={error}
            empty={!loading && !error && (reports?.length ?? 0) === 0}
            emptyMessage="Todavía no hay informes publicados."
          />
          {reports && reports.length > 0 && (
            <div className="card-grid">
              {reports.map((report) => (
                <article className="card" key={report.id}>
                  <p className="card-meta">
                    {reportTypeLabels[report.report_type] ?? reportTypeLabels.other}
                    {report.fiscal_year ? ` · ${report.fiscal_year}` : ""}
                  </p>
                  <h2>{report.title}</h2>
                  {report.summary && <p>{report.summary}</p>}
                  <a className="card-link" href={report.file_url} target="_blank" rel="noreferrer">
                    Abrir informe
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}