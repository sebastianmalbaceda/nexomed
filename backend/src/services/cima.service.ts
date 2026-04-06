// src/services/cima.service.ts
import axios from 'axios';

const CIMA_API_BASE_URL = 'https://cima.aemps.es/cima/rest';

export async function searchMedicines(query: string) {
  try {
    const response = await axios.get(`${CIMA_API_BASE_URL}/medicamentos`, {
      params: { nombre: query },
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al buscar en CIMA: ${error.message}`);
    }
    throw error;
  }
}

export async function getMedicineDetails(nregistro: string) {
  try {
    const response = await axios.get(`${CIMA_API_BASE_URL}/medicamentos/${nregistro}`, {
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al obtener detalles de CIMA: ${error.message}`);
    }
    throw error;
  }
}
