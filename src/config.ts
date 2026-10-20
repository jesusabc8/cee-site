/**
 * Configuração institucional do sítio. Toda bandeira tem efeito visível;
 * alterá-las exige registro em docs/DECISIONES.md.
 */
export const config = {
  nome: 'Centro de Estudos Econômicos',
  sigla: 'CEE',
  /** Só passa a true com autorização escrita da Universidade (Proposta §8.5). */
  useUniversityName: false,
  /** Eventos só aparecem após os critérios de consolidação (Proposta §5.4). */
  showEvents: false,
  /** false = versão preliminar: noindex, robots Disallow e faixa de aviso. */
  lancado: false,
  /** [PLACEHOLDER] — conta em nome do Centro, não de pessoa (Proposta §8.5). */
  contato: 'contato@[PLACEHOLDER]',
  repoUrl: 'https://github.com/jesusabc8/cee-site',
} as const;
