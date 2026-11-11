export type ProjectContentBlockType = 'Text' | 'Image' | 'YouTube' | 'Document' | 'Link';

export type ProjectContentBlockDraft = {
  id: string;
  type: ProjectContentBlockType;
  text?: string;
  url?: string;
  caption?: string;
  sortOrder: number;
};

const YOUTUBE_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'youtu.be',
]);

export const getYouTubeEmbedUrl = (value: string): string | null => {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' || url.port || url.username || url.password || !YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) {
    return null;
  }

  let videoId = '';
  if (url.hostname.toLowerCase() === 'youtu.be') {
    videoId = url.pathname.split('/').filter(Boolean)[0] ?? '';
  } else if (url.pathname.toLowerCase() === '/watch') {
    videoId = url.searchParams.get('v') ?? '';
  } else {
    const [, kind, id] = url.pathname.split('/');
    if (['embed', 'shorts', 'live'].includes(kind)) videoId = id ?? '';
  }

  return YOUTUBE_VIDEO_ID.test(videoId)
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : null;
};

const isHttpsUrl = (value: string | undefined): boolean => {
  if (!value) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
};

export const getSafeExternalUrl = (value: string | null | undefined): string | null => {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : null;
  } catch {
    return null;
  }
};

export const validateProjectContentBlock = (block: Partial<ProjectContentBlockDraft>): string | null => {
  if (block.sortOrder != null && block.sortOrder < 0) return 'A posição do conteúdo é inválida.';
  if (block.caption && block.caption.length > 300) return 'A legenda pode ter no máximo 300 caracteres.';

  switch (block.type) {
    case 'Text':
      if (!block.text?.trim()) return 'Escreva o conteúdo deste bloco.';
      if (block.text.length > 5000) return 'O texto pode ter no máximo 5000 caracteres.';
      return null;
    case 'Image':
    case 'Document':
    case 'Link':
      return isHttpsUrl(block.url) ? null : 'Informe um link HTTPS válido.';
    case 'YouTube':
      return block.url && getYouTubeEmbedUrl(block.url)
        ? null
        : 'Informe um link válido de vídeo do YouTube.';
    default:
      return 'Escolha um tipo de conteúdo.';
  }
};

export const moveProjectContentBlock = <T extends ProjectContentBlockDraft>(
  blocks: readonly T[],
  index: number,
  direction: -1 | 1,
): T[] => {
  const reordered = [...blocks];
  const target = index + direction;
  if (index < 0 || index >= reordered.length || target < 0 || target >= reordered.length) return reordered;

  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  return reordered.map((block, sortOrder) => ({ ...block, sortOrder }));
};
