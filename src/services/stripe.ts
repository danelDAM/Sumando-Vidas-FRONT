const API_BASE_URL = import.meta.env.VITE_STRIPE_API_URL || "http://localhost:4242";

export type DonationCheckoutResponse = {
  url?: string;
  error?: string;
};

export async function createDonationCheckoutSession(
  amount: number,
  campaignName: string,
  location?: string,
): Promise<string> {
  const normalizedAmount = Number(amount);

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error("La cantidad debe ser mayor que 0.");
  }

  const response = await fetch(`${API_BASE_URL}/api/payments/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: location
                ? `Donación ${campaignName} - ${location}`
                : `Donación ${campaignName}`,
            },
            unit_amount: Math.round(normalizedAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${window.location.origin}/donaciones/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/donaciones/cancelado`,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as DonationCheckoutResponse;

  if (!response.ok || !data.url) {
    throw new Error(data.error || "No se pudo iniciar la donación. Inténtalo de nuevo.");
  }

  return data.url;
}
