import { getCollection } from 'astro:content';

/**
 * Só retorna pessoas com consentimento registrado. Quem não tiver `consentimento: true`
 * é omitido do sítio e gera um aviso no build (Proposta §9.2; Regimento, Art. 26).
 */
export async function getEquipePublica() {
  const todas = await getCollection('equipe');
  const sem = todas.filter((p) => p.data.consentimento !== true);
  for (const p of sem) {
    console.warn(`[equipe] "${p.id}" omitido: sem consentimento registrado (consentimento: true).`);
  }
  return todas.filter((p) => p.data.consentimento === true);
}
