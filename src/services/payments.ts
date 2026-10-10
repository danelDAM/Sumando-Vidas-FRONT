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
  participant_type?: "person" | "company";
  isAnonymous?: boolean;
  donorName?: string;
  donor_name?: string;
  is_anonymous?: boolean;
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

  const payload = {
    ...payment,
    participantType: payment.participantType ?? payment.participant_type ?? "person",
    participant_type: payment.participant_type ?? payment.participantType ?? "person",
    isAnonymous: payment.isAnonymous ?? true,
    is_anonymous: payment.is_anonymous ?? payment.isAnonymous ?? true,
    donorName: payment.donorName?.trim() || payment.donor_name?.trim() || undefined,
    donor_name: payment.donor_name?.trim() || payment.donorName?.trim() || undefined,
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