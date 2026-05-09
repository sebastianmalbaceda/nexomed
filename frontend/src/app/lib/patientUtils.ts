// Utility functions for patient data

/**
 * Normalize allergies array — filter out empty strings
 */
export function parseAllergies(allergies: string[] | null | undefined): string[] {
  if (!allergies) return [];
  return allergies.map(a => a.trim()).filter(a => a !== '');
}

/**
 * Get allergies count from array
 */
export function getAllergiesCount(allergies: string[] | null | undefined): number {
  return parseAllergies(allergies).length;
}
