type RichNode = {
  type?: string;
  tag?: string;
  attributes?: Record<string, unknown>;
  children?: RichNode[];
};

type RichTitle = {
  node?: RichNode;
} | null | undefined;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const children = (node: RichNode) => node.children || [];

const renderNode = (node: RichNode): string => {
  const inner = () => children(node).map(renderNode).join('');

  if (node.type === 'text') {
    return escapeHtml(String(node.attributes?.content || ''));
  }

  if (node.type === 'softbreak') return ' ';
  if (node.type === 'hardbreak') return '<br />';
  if (node.type === 'strong') return `<strong>${inner()}</strong>`;
  if (node.type === 'em') return `<em>${inner()}</em>`;
  if (node.type === 's') return `<s>${inner()}</s>`;
  if (node.type === 'tag' && node.tag === 'u') return `<u>${inner()}</u>`;
  if (node.type === 'code') return escapeHtml(String(node.attributes?.content || ''));

  return inner();
};

const textNode = (node: RichNode): string => {
  if (node.type === 'text' || node.type === 'code') {
    return String(node.attributes?.content || '');
  }
  if (node.type === 'softbreak' || node.type === 'hardbreak') return ' ';
  return children(node).map(textNode).join('');
};

export const richTitleText = (rich: RichTitle, fallback = '') => {
  const text = rich?.node ? textNode(rich.node).trim() : '';
  return text || fallback || '';
};

export const richTitleHtml = (rich: RichTitle, fallback = '') => {
  const text = richTitleText(rich, '');
  if (!text) return escapeHtml(fallback || '');
  return renderNode(rich?.node || {}).trim();
};

export const richTitlePair = (
  en?: string | null,
  es?: string | null,
  richEn?: RichTitle,
  richEs?: RichTitle
) => {
  const fallbackEn = en || es || '';
  const fallbackEs = es || en || '';

  return {
    en: fallbackEn,
    es: fallbackEs,
    enText: richTitleText(richEn, fallbackEn),
    esText: richTitleText(richEs, fallbackEs),
    enHtml: richTitleHtml(richEn, fallbackEn),
    esHtml: richTitleHtml(richEs, fallbackEs),
  };
};
