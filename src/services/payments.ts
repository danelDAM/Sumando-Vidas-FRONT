const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4242";

export type DonationPayment = {
  donationId: string;
  status: "pending" | "paid" | "cancelled" | "failed";
  amount: number;
  currency: string;
  paidAt: string | null;
  provider: string;
  paymentReference: string | null;
  statusUrl?: string;
  simulationUrl?: string;
};

export type DonationPaymentInput = {
  amount?: number;
  currency?: string;
  campaignId?: string;
  campaignStopId?: string;
  productId?: string;
  participantId?: string;
  participantType?: "person" | "company";
  isAnonymous?: boolean;
  donorName?: string;
};

type ApiError = { error?: string };

let retryKey: { fingerprint: string; key: string } | null = null;

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & ApiError;
  if (!response.ok) {
    throw new Error(data.error || "No se pudo completar la operación de pago.");
  }
  return data;
}

export async function createDonationCheckoutSession(
  payment: DonationPaymentInput,
): Promise<DonationPayment> {
  if (payment.productId === undefined && (!Number.isFinite(payment.amount) || (payment.amount ?? 0) <= 0)) {
    throw new Error("La cantidad debe ser mayor que 0.");
  }

  const fingerprint = JSON.stringify(payment);
  if (!retryKey || retryKey.fingerprint !== fingerprint) {
    retryKey = { fingerprint, key: crypto.randomUUID() };
  }

  // The backend accepts camelCase and snake_case participant fields; both are sent with the same values.
  const participantType = payment.participantType ?? "person";
  const isAnonymous = payment.isAnonymous ?? true;
  const donorName = payment.donorName?.trim() || undefined;
  const payload = {
    ...payment,
    participantType,
    participant_type: participantType,
    isAnonymous,
    is_anonymous: isAnonymous,
    donorName,
    donor_name: donorName,
  };

  const response = await fetch(`${API_BASE_URL}/api/payments/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": retryKey.key,
    },
    body: JSON.stringify(payload),
  });
  const result = await parseResponse<DonationPayment>(response);
  retryKey = null;
  return result;
}

export async function getDonationStatus(donationId: string): Promise<DonationPayment> {
  const response = await fetch(`${API_BASE_URL}/api/payments/${encodeURIComponent(donationId)}`);
  return parseResponse<DonationPayment>(response);
}

export async function simulateFakeMoneyOutcome(
  donationId: string,
  outcome: "approved" | "cancelled" | "failed",
): Promise<DonationPayment> {
  const response = await fetch(`${API_BASE_URL}/api/payments/${encodeURIComponent(donationId)}/fake-money`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outcome }),
  });
  return parseResponse<DonationPayment>(response);
}