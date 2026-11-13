/**
 * Location-based Cash on Delivery (COD) charges configuration for AHK Bridal Studio:
 * - Karachi: Free COD (Rs. 0)
 * - Outside Karachi: Rs. 350 COD charges (including Lahore, Islamabad, and all other cities in Pakistan).
 */

export const OUTSIDE_KARACHI_COD_FEE_PKR = 350;

/**
 * Checks if the specified delivery city is within Karachi.
 */
export function isKarachiLocation(city: string | null | undefined): boolean {
  if (!city || !city.trim()) return true; // Default fallback to Karachi flagship city
  const normalized = city.trim().toLowerCase();
  return (
    normalized === 'karachi' ||
    normalized.includes('karachi') ||
    normalized === 'khi' ||
    normalized.startsWith('karachi,') ||
    normalized.endsWith(', karachi')
  );
}

/**
 * Calculates the exact COD shipping fee in PKR based on the delivery city.
 * Returns 0 for Karachi, 350 for all locations outside Karachi.
 */
export function calculateCodFee(city: string | null | undefined): number {
  return isKarachiLocation(city) ? 0 : OUTSIDE_KARACHI_COD_FEE_PKR;
}

/**
 * Returns structured COD details and badges for checkout display and admin auditing.
 */
export function getCodFeeDetails(city: string | null | undefined) {
  const isKhi = isKarachiLocation(city);
  const feePKR = isKhi ? 0 : OUTSIDE_KARACHI_COD_FEE_PKR;
  const feeUSD = Math.round(feePKR / 280);
  const cleanCity = city?.trim() || (isKhi ? 'Karachi' : 'Outside Karachi');

  return {
    isKarachi: isKhi,
    feePKR,
    feeUSD,
    cleanCity,
    displayText: isKhi ? 'FREE (Karachi Rs. 0)' : `Rs. ${feePKR.toLocaleString()} (${cleanCity})`,
    badgeText: isKhi ? 'Free COD (Rs. 0)' : `Rs. ${feePKR} COD Fee`,
    policySummary: isKhi
      ? 'Karachi Delivery: Free Cash on Delivery (Rs. 0)'
      : `Outside Karachi Delivery: Rs. ${feePKR} COD Charges Applied`,
  };
}
