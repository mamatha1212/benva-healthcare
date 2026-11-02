/**
 * Centralized Date Formatting Utilities for Benva Healthcare
 * Standard format: DD/MM/YYYY throughout the website
 */

/**
 * Formats any date string, Date object, or timestamp to DD/MM/YYYY format.
 * Returns fallback (default '-') if invalid or empty.
 */
export function formatDate(
  dateInput: string | Date | number | null | undefined,
  fallback = '-'
): string {
  if (!dateInput) return fallback;

  // If already a DD/MM/YYYY string
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed) return fallback;

    // Matches DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      const d = dmyMatch[1].padStart(2, '0');
      const m = dmyMatch[2].padStart(2, '0');
      const y = dmyMatch[3];
      return `${d}/${m}/${y}`;
    }

    // Matches YYYY-MM-DD or YYYY/MM/DD (ISO date part)
    const ymdMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (ymdMatch) {
      const y = ymdMatch[1];
      const m = ymdMatch[2].padStart(2, '0');
      const d = ymdMatch[3].padStart(2, '0');
      return `${d}/${m}/${y}`;
    }
  }

  // Parse as Date object
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return fallback;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formats date and time to DD/MM/YYYY, hh:mm A
 */
export function formatDateTime(
  dateInput: string | Date | number | null | undefined,
  fallback = '-'
): string {
  if (!dateInput) return fallback;

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return fallback;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');

  return `${day}/${month}/${year}, ${hoursStr}:${minutes} ${ampm}`;
}

/**
 * Converts any date representation to YYYY-MM-DD (ISO format for HTML date inputs/DB)
 */
export function toISODateString(
  dateInput: string | Date | number | null | undefined
): string {
  if (!dateInput) return '';

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // If already YYYY-MM-DD
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
      return `${ymdMatch[1]}-${ymdMatch[2].padStart(2, '0')}-${ymdMatch[3].padStart(2, '0')}`;
    }
    // If DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${year}-${month}-${day}`;
}

/**
 * Converts DD/MM/YYYY to YYYY-MM-DD
 */
export function dmyToYmd(dmy: string): string {
  const match = dmy.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!match) return '';
  return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}

/**
 * Converts YYYY-MM-DD to DD/MM/YYYY
 */
export function ymdToDmy(ymd: string): string {
  const match = ymd.trim().match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (!match) return '';
  return `${match[3].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[1]}`;
}
