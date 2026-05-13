import { describe, expect, it } from 'vitest';
import { normalizeCimaSearchResults } from './cima';

describe('normalizeCimaSearchResults', () => {
  it('keeps valid CIMA results and discards incomplete records', () => {
    const results = normalizeCimaSearchResults({
      resultados: [
        { nregistro: '12345', nombre: 'PARACETAMOL 1G', labtitular: 'Lab Norte' },
        { nregistro: '67890' },
        null,
      ],
    });

    expect(results).toEqual([
      { nregistro: '12345', nombre: 'PARACETAMOL 1G', labtitular: 'Lab Norte' },
    ]);
  });

  it('accepts direct array responses', () => {
    expect(normalizeCimaSearchResults([{ nregistro: 'ABC', nombre: 'IBUPROFENO' }])).toEqual([
      { nregistro: 'ABC', nombre: 'IBUPROFENO', labtitular: undefined },
    ]);
  });
});
