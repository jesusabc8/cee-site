/**
 * Configuração institucional do sítio. Toda bandeira tem efeito visível;
 * alterá-las exige registro em docs/DECISIONES.md.
 */

export interface Social {
  name: 'LinkedIn' | 'Instagram' | 'X' | 'YouTube';
  /** null enquanto a conta não existir: o ícone aparece sem link ("Em breve"). */
  url: string | null;
}

/**
 * Nome da Universidade na faixa institucional superior.
 * ATENÇÃO: o uso do nome e da filiação à Universidade exige autorização específica (Estatuto, art. 62);
 * até lá, nada deve sugerir chancela institucional. A coordenação decidiu exibir o nome por extenso nesta faixa (ADR-012),
 * sem escudo, logotipo ou cores da Universidade. Para retirar, basta `useUniversityName: false`.
 */
const useUniversityName = true;
const UNIVERSIDADE = 'Pontifícia Universidade Católica de Minas Gerais';

export const config = {
  nome: 'Centro de Estudos Econômicos',
  sigla: 'CEE',
  descritor: 'Análise empírica da economia brasileira',
  useUniversityName,
  /** Texto da faixa institucional (esquerda). */
  institutionalLine: useUniversityName ? UNIVERSIDADE : 'Liga acadêmica estudantil · Ciências Econômicas',
  /** Redes do CEE (ainda não criadas). */
  socials: [
    { name: 'LinkedIn', url: null },
    { name: 'Instagram', url: null },
    { name: 'X', url: null },
    { name: 'YouTube', url: null },
  ] as Social[],
  /** Seção de eventos desativada até haver eventos realizados (nada inventado). */
  showEvents: false,
  /**
   * false = versão preliminar: meta noindex e robots.txt com Disallow (sem faixa de aviso visível).
   * CEE_LANCADO=1 simula o lançamento só em builds de QA (Lighthouse mede SEO sem o noindex).
   * Para lançar de fato, mude para true (ver docs/LANCAMENTO.md).
   */
  launched: process.env.CEE_LANCADO === '1' ? true : false,
  /** [PLACEHOLDER] — conta em nome do Centro, não de pessoa (Regimento Interno, art. 61). */
  contato: 'contato@[PLACEHOLDER]',
  repoUrl: 'https://github.com/jesusabc8/cee-site',
};
