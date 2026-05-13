import { describe, expect, it } from 'vitest';
import { buildDoctorPrescriptionUrl } from './prescriptionNavigation';

describe('buildDoctorPrescriptionUrl', () => {
  it('targets the doctor prescription flow for a patient', () => {
    expect(buildDoctorPrescriptionUrl('patient-123')).toBe('/doctor?patientId=patient-123&prescribe=1');
  });
});
