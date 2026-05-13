export interface CimaDrug {
  nregistro: string;
  nombre: string;
  labtitular?: string;
}

type CimaDrugCandidate = Partial<CimaDrug> | null | undefined;

export interface CimaSearchResponse {
  resultados?: CimaDrugCandidate[];
}

export function normalizeCimaSearchResults(response: CimaSearchResponse | CimaDrugCandidate[]): CimaDrug[] {
  const rawResults = Array.isArray(response) ? response : response.resultados ?? [];

  return rawResults
    .filter((drug): drug is Partial<CimaDrug> => Boolean(drug))
    .filter((drug): drug is CimaDrug => Boolean(drug.nregistro && drug.nombre))
    .map((drug) => ({
      nregistro: drug.nregistro,
      nombre: drug.nombre,
      labtitular: drug.labtitular,
    }));
}
