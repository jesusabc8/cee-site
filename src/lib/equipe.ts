import { getCollection } from 'astro:content';

/**
 * Só retorna pessoas com consentimento registrado e não revogado (Estatuto, art. 60; LGPD).
 * Quem não cumprir é omitido do sítio e gera um aviso no build. O sítio mostra só nome, função e instância.
 */
export async function getEquipePublica() {
  const todas = await getCollection('equipe');
  const publicas = todas.filter((p) => p.data.consentimento === true && !p.data.revogado);
  for (const p of todas.filter((x) => !publicas.includes(x))) {
    console.warn(`[equipe] "${p.id}" omitido: sem consentimento registrado ou consentimento revogado.`);
  }
  return publicas;
}
