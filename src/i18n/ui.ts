/**
 * Textos de interface. pt-BR é a fonte; toda chave precisa existir em todas as línguas
 * (o tipo `Dict` garante isso no `astro check`). Para acrescentar `es`: criar o
 * dicionário, incluí-lo em `ui` e em `locales`, e em `astro.config.mjs`.
 */
export const locales = ['pt-BR', 'en'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'pt-BR';

const pt = {
  'site.name': 'Centro de Estudos Econômicos',
  'site.tagline': 'Iniciativa estudantil de análise econômica empírica sobre a economia brasileira',
  'skip': 'Pular para o conteúdo',
  'nav.label': 'Navegação principal',
  'nav.inicio': 'Início',
  'nav.pesquisa': 'Pesquisa',
  'nav.publicacoes': 'Publicações',
  'nav.observatorio': 'Observatório',
  'nav.metodologia': 'Metodologia',
  'nav.sobre': 'Sobre',
  'nav.participe': 'Participe',
  'nav.equipe': 'Equipe',
  'nav.eventos': 'Eventos',
  'nav.busca': 'Buscar',
  'lang.switch': 'English',
  'lang.switch.short': 'EN',
  'lang.switch.label': 'Read this page in English',
  'preview': 'Versão preliminar. Conteúdo em discussão, ainda não lançado; páginas não indexadas por buscadores.',
  'disclaimer.short':
    'O CEE é uma iniciativa estudantil. Suas publicações não representam a posição da PUC Minas nem de qualquer outra instituição.',
  'footer.licenses': 'Textos e dados sob CC BY 4.0; código sob licença MIT, ressalvadas as restrições das fontes.',
  'footer.institucional': 'Institucional',
  'footer.politicas': 'Políticas',
  'footer.abertos': 'Dados e código',
  'footer.erratas': 'Erratas',
  'footer.privacidade': 'Privacidade',
  'footer.termos': 'Termos e licenças',
  'footer.acessibilidade': 'Acessibilidade',
  'footer.contato': 'Contato',
  'footer.repo': 'Repositório no GitHub',
  'footer.rss': 'RSS',
  'footer.catalogo': 'Catálogo de dados',
  'theme.label': 'Tema',
  'theme.system': 'Sistema',
  'theme.light': 'Claro',
  'theme.dark': 'Escuro',
  'status.prevista': 'Prevista (ano 1)',
  'status.ativa': 'Ativa',
  'status.latente': 'Latente',
  'status.planejada': 'Planejada (ano 2)',
  'status.construcao': 'Em construção',
  'table.source': 'Fonte',
  'table.scroll': 'Tabela com rolagem horizontal',
  'box.limits': 'O que a evidência não permite concluir',
  'box.note': 'Nota',
  'box.placeholder': 'Conteúdo de exemplo',
} as const;

export type UIKey = keyof typeof pt;
type Dict = Record<UIKey, string>;

const en: Dict = {
  'site.name': 'Centro de Estudos Econômicos',
  'site.tagline': 'A student-run initiative for empirical economic analysis of the Brazilian economy',
  'skip': 'Skip to content',
  'nav.label': 'Main navigation',
  'nav.inicio': 'Home',
  'nav.pesquisa': 'Research',
  'nav.publicacoes': 'Publications',
  'nav.observatorio': 'Data Observatory',
  'nav.metodologia': 'Methodology',
  'nav.sobre': 'About',
  'nav.participe': 'Get involved',
  'nav.equipe': 'Team',
  'nav.eventos': 'Events',
  'nav.busca': 'Search',
  'lang.switch': 'Português',
  'lang.switch.short': 'PT',
  'lang.switch.label': 'Ler esta página em português',
  'preview': 'Preliminary version. Content under discussion and not yet launched; pages are not indexed by search engines.',
  'disclaimer.short':
    'CEE is a student initiative. Its publications do not represent the position of PUC Minas or any other institution.',
  'footer.licenses': 'Text and data under CC BY 4.0; code under the MIT licence, subject to the terms of the original sources.',
  'footer.institucional': 'About',
  'footer.politicas': 'Policies',
  'footer.abertos': 'Data and code',
  'footer.erratas': 'Errata',
  'footer.privacidade': 'Privacy',
  'footer.termos': 'Terms and licences',
  'footer.acessibilidade': 'Accessibility',
  'footer.contato': 'Contact',
  'footer.repo': 'GitHub repository',
  'footer.rss': 'RSS',
  'footer.catalogo': 'Data catalogue',
  'theme.label': 'Theme',
  'theme.system': 'System',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'status.prevista': 'Planned for year 1',
  'status.ativa': 'Active',
  'status.latente': 'Dormant',
  'status.planejada': 'Planned for year 2',
  'status.construcao': 'Under construction',
  'table.source': 'Source',
  'table.scroll': 'Horizontally scrollable table',
  'box.limits': 'What the evidence does not allow us to conclude',
  'box.note': 'Note',
  'box.placeholder': 'Sample content',
};

export const ui: Record<Lang, Dict> = { 'pt-BR': pt, en };

export function useTranslations(lang: Lang) {
  return (key: UIKey): string => ui[lang][key];
}
