/** Taxonomia CRediT (Contributor Roles Taxonomy, NISO Z39.104-2022), com rótulos pt-BR e en. */
export const CREDIT = {
  conceituacao: { pt: 'Conceituação', en: 'Conceptualization' },
  curadoria: { pt: 'Curadoria de dados', en: 'Data curation' },
  analise: { pt: 'Análise formal', en: 'Formal analysis' },
  financiamento: { pt: 'Obtenção de financiamento', en: 'Funding acquisition' },
  investigacao: { pt: 'Investigação', en: 'Investigation' },
  metodologia: { pt: 'Metodologia', en: 'Methodology' },
  administracao: { pt: 'Administração do projeto', en: 'Project administration' },
  recursos: { pt: 'Recursos', en: 'Resources' },
  software: { pt: 'Software', en: 'Software' },
  supervisao: { pt: 'Supervisão', en: 'Supervision' },
  validacao: { pt: 'Validação', en: 'Validation' },
  visualizacao: { pt: 'Visualização', en: 'Visualization' },
  redacao: { pt: 'Escrita – rascunho original', en: 'Writing – original draft' },
  revisao: { pt: 'Escrita – revisão e edição', en: 'Writing – review & editing' },
} as const;
export type CreditRole = keyof typeof CREDIT;
export const CREDIT_ROLES = Object.keys(CREDIT) as [CreditRole, ...CreditRole[]];
