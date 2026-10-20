/**
 * Envolve cada <table> do Markdown/MDX em um contêiner rolável, focável por teclado
 * e rotulado, para tabelas largas em telas pequenas (WCAG 2.1.1 e 1.4.10).
 */
export default function rehypeTableScroll() {
  return (tree, file) => {
    // Rótulo único por tabela (axe: landmark-unique), na língua da página.
    const en = /[\\/]en[\\/]/.test(file?.path ?? '');
    let n = 0;
    const visit = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-scroll'], role: 'region', tabIndex: 0, ariaLabel: `${en ? 'Table' : 'Tabela'} ${++n}` },
            children: [child],
          };
        }
        visit(child);
        return child;
      });
    };
    visit(tree);
  };
}
