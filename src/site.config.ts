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
 * ATENÇÃO: a Proposta (§8.5) prevê que, antes de autorização escrita da Universidade, nada sugira
 * chancela institucional. A coordenação decidiu exibir o nome por extenso nesta faixa (ADR-012),
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
  institutionalLine: useUniversityName ? UNIVERSIDADE : 'Iniciativa estudantil · Ciências Econômicas',
  /** Redes do CEE (ainda não criadas). */
  socials: [
    { name: 'LinkedIn', url: null },
    { name: 'Instagram', url: null },
    { name: 'X', url: null },
    { name: 'YouTube', url: null },
  ] as Social[],
  /** Eventos só aparecem após os critérios de consolidação (Proposta §5.4). */
  showEvents: false,
  /**
   * false = versão preliminar: meta noindex e robots.txt com Disallow (sem faixa de aviso visível).
   * CEE_LANCADO=1 simula o lançamento só em builds de QA (Lighthouse mede SEO sem o noindex).
   * Para lançar de fato, mude para true (ver docs/LANCAMENTO.md).
   */
  launched: process.env.CEE_LANCADO === '1' ? true : false,
  /** [PLACEHOLDER] — conta em nome do Centro, não de pessoa (Proposta §8.5). */
  contato: 'contato@[PLACEHOLDER]',
  repoUrl: 'https://github.com/jesusabc8/cee-site',
};
