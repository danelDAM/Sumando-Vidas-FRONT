const API_BASE_URL = import.meta.env.VITE_STRIPE_API_URL || "http://localhost:4242";

export type ContactMessagePayload = {
  name: string;
  email: string;
  reason: string;
  message: string;
};

type ContactMessageResponse = {
  message?: string;
  error?: string;
};

export async function sendContactMessage(payload: ContactMessagePayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as ContactMessageResponse;

  if (!response.ok) {
    throw new Error(data.error || "No se pudo enviar el mensaje. Inténtalo de nuevo.");
  }
}
