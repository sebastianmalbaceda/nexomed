// Utility functions for patient data

/**
 * Parse allergies from comma-separated string to array
 * Backend stores allergies as comma-separated string for SQLite compatibility
 */
export function parseAllergies(allergies: string | null): string[] {
  if (!allergies || allergies.trim() === '') return [];
  return allergies.split(',').map(a => a.trim()).filter(a => a !== '');
}

/**
 * Get allergies count from comma-separated string
 */
export function getAllergiesCount(allergies: string | null): number {
  return parseAllergies(allergies).length;
}
