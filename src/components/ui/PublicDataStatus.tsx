type PublicDataStatusProps = {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage?: string;
};

export function PublicDataStatus({
  loading,
  error,
  empty,
  emptyMessage = "Todavía no hay contenido publicado.",
}: PublicDataStatusProps) {
  if (loading) {
    return <p className="public-data-status is-loading" role="status">Cargando información…</p>;
  }

  if (error) {
    return <p className="public-data-status is-error" role="alert">{error}</p>;
  }

  if (empty) {
    return <p className="public-data-status" role="status">{emptyMessage}</p>;
  }

  return null;
}