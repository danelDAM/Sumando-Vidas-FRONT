import { FormEvent, useState } from "react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { sendContactMessage } from "../services/contact";

type ContactFormState = {
  name: string;
  email: string;
  reason: string;
  message: string;
};

const initialForm: ContactFormState = {
  name: "",
  email: "",
  reason: "",
  message: "",
};

export function ContactPage() {
  const [form, setForm] = useState<ContactFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const updateField = (field: keyof ContactFormState, value: string) => {
    setFeedback(null);
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await sendContactMessage(form);
      setForm(initialForm);
      setFeedback({
        type: "success",
        message: "Tu mensaje se ha enviado correctamente. Te responderemos lo antes posible.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo enviar el mensaje.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-section contact-hero">
        <div className="container contact-hero-content">
          <p className="eyebrow">Estamos para escucharte</p>
          <h1>Hablemos de cómo sumar</h1>
          <p>
            Si tienes una pregunta, una propuesta o quieres formar parte de la comunidad, escríbenos.
            Cada conversación puede abrir una nueva forma de acompañar.
          </p>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container contact-layout">
          <div className="contact-aside">
            <SectionHeader
              eyebrow="Contacto"
              title="Una puerta abierta"
              description="Cuéntanos qué necesitas y encontraremos la mejor manera de ayudarte."
            />

            <div className="contact-details">
              <a className="contact-detail" href="mailto:info@sumandovidas.org">
                <span className="contact-detail-label">Email</span>
                <strong>info@sumandovidas.org</strong>
              </a>
              <a className="contact-detail" href="tel:+34000000000">
                <span className="contact-detail-label">Teléfono</span>
                <strong>+34 000 000 000</strong>
              </a>
              <div className="contact-detail">
                <span className="contact-detail-label">Dónde estamos</span>
                <strong>España</strong>
              </div>
            </div>

          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-heading">
              <p className="card-meta">Escríbenos</p>
              <h2>¿En qué podemos ayudarte?</h2>
            </div>

            <div className="contact-form-grid">
              <label>
                Nombre
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Tu nombre"
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="tu@email.com"
                />
              </label>
            </div>

            <label>
              Motivo del contacto
              <select
                required
                value={form.reason}
                onChange={(event) => updateField("reason", event.target.value)}
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                <option value="general">Consulta general</option>
                <option value="volunteer">Quiero colaborar</option>
                <option value="company">Soy una empresa</option>
                <option value="project">Sobre Por Ellos</option>
                <option value="press">Prensa y comunicación</option>
              </select>
            </label>

            <label>
              Mensaje
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                placeholder="Cuéntanos un poco más..."
              />
            </label>

            <div className="contact-form-footer">
              <p>
                Al escribirnos aceptas que usemos tus datos únicamente para responder a tu consulta.
              </p>
              <button className="button button-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando mensaje…" : "Enviar mensaje"}
              </button>
            </div>

            {feedback && (
              <div className={`contact-form-feedback is-${feedback.type}`} role="status">
                {feedback.message}
              </div>
            )}
          </form>
        </div>
      </section>

    </>
  );
}
