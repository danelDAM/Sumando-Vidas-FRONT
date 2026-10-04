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
    return <p role="status">Cargando información…</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (empty) {
    return <p role="status">{emptyMessage}</p>;
  }

  return null;
}