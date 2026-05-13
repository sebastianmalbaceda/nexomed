export function buildDoctorPrescriptionUrl(patientId: string) {
  return `/doctor?patientId=${encodeURIComponent(patientId)}&prescribe=1`;
}
