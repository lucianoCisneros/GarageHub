/**
 * WhatsApp link utilities for Argentina (+54) format.
 *
 * The mechanic enters a raw Argentine phone (e.g., "1122334455" or "11 2233-4455").
 * We normalize it to international format for wa.me links.
 *
 * Argentine mobile format: +54 9 <area> <number>
 * Example: +54 9 11 2233-4455 -> 5491122334455
 */

export interface WhatsAppMessageData {
  customerName: string;
  vehicleModel: string;
  licensePlate: string;
  statusLabel: string;
}

/**
 * Normalizes an Argentine phone number to wa.me format.
 * Handles: "1122334455", "11 2233-4455", "+54 9 11 22334455", etc.
 */
export function normalizeArgentinePhone(raw: string): string {
  // Strip everything except digits
  const digits = raw.replace(/\D/g, "");

  // If it already includes country code
  if (digits.startsWith("549") && digits.length === 12) {
    return digits;
  }
  if (digits.startsWith("54") && digits.length === 12) {
    return digits; // Already 54 + 9 + area + number
  }
  if (digits.startsWith("54") && digits.length === 11) {
    // Missing the 9
    return digits.slice(0, 2) + "9" + digits.slice(2);
  }

  // If it's a local number without country code
  // Argentine mobile: 11 (area for Capital) + 8 digits, or 3-digit area + 7 digits
  if (digits.length === 10) {
    // e.g., "1122334455" -> "5491122334455"
    return "549" + digits;
  }
  if (digits.length === 11 && digits.startsWith("11")) {
    // This might be "11 22334455" without area code handling differently
    // Actually 11 is the area code for Buenos Aires, so 11 digits total
    return "549" + digits;
  }
  if (digits.length === 8) {
    // Just the number without area code — prepend 11 as default area
    return "54911" + digits;
  }

  // Fallback: return as-is, the link might still work
  return digits;
}

/**
 * Generates a WhatsApp deep link with pre-formatted message.
 */
export function generateWhatsAppLink(
  phoneRaw: string,
  messageData: WhatsAppMessageData,
): string {
  const normalized = normalizeArgentinePhone(phoneRaw);
  const message = buildStatusMessage(messageData);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encodedMessage}`;
}

/**
 * Builds the pre-formatted status update message.
 */
export function buildStatusMessage(data: WhatsAppMessageData): string {
  return (
    `Hola ${data.customerName}, te escribimos de GarageHub. ` +
    `Tu ${data.vehicleModel} con patente ${data.licensePlate} ` +
    `ya cambió de estado a: ${data.statusLabel}.`
  );
}

/**
 * Status label mapping (Spanish).
 */
export const STATUS_LABELS: Record<string, string> = {
  waiting: "En Espera",
  in_repair: "En Reparación",
  waiting_parts: "Esperando Repuestos",
  ready_for_pickup: "Listo para Retirar",
};