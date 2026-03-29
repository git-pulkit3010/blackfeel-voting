/**
 * Format phone number to international format (E.164)
 */
export function formatPhoneNumber(phoneNumber: string, defaultCountryCode: string = '91'): string {
  if (!phoneNumber) return phoneNumber;

  let cleaned = phoneNumber.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '+' + defaultCountryCode + cleaned.substring(1);
  }

  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return '+' + defaultCountryCode + cleaned;
  }

  if (cleaned.startsWith(defaultCountryCode) && cleaned.length === 12) {
    return '+' + cleaned;
  }

  return cleaned;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false;
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  return e164Regex.test(phoneNumber);
}
