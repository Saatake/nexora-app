import assert from 'node:assert/strict';
import { test } from 'node:test';

type Helpers = typeof import('./projectContent.ts');

async function loadHelpers(): Promise<Helpers> {
  try {
    return await import('./projectContent.ts');
  } catch {
    throw new Error('Project content helpers should exist before they are used');
  }
}

test('YouTube watch, short, and youtu.be URLs become privacy-enhanced embed URLs', async () => {
  const { getYouTubeEmbedUrl } = await loadHelpers();

  assert.equal(
    getYouTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  );
  assert.equal(
    getYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'),
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  );
  assert.equal(
    getYouTubeEmbedUrl('https://youtube.com/shorts/dQw4w9WgXcQ'),
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  );
});

test('YouTube embeds reject deceptive hosts and unsafe schemes', async () => {
  const { getYouTubeEmbedUrl } = await loadHelpers();

  assert.equal(getYouTubeEmbedUrl('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(getYouTubeEmbedUrl('https://example.org/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(getYouTubeEmbedUrl('javascript:alert(1)'), null);
});

test('external media URLs render only over HTTPS and reject credentials', async () => {
  const { getSafeExternalUrl } = await loadHelpers();
  assert.equal(getSafeExternalUrl('https://cdn.example.org/photo.jpg'), 'https://cdn.example.org/photo.jpg');
  assert.equal(getSafeExternalUrl('http://cdn.example.org/photo.jpg'), null);
  assert.equal(getSafeExternalUrl('https://user:secret@cdn.example.org/photo.jpg'), null);
});

test('content blocks require text or a safe URL for their selected type', async () => {
  const { validateProjectContentBlock } = await loadHelpers();

  assert.equal(validateProjectContentBlock({ type: 'Text', text: 'Processo criativo', sortOrder: 0 }), null);
  assert.ok(validateProjectContentBlock({ type: 'Text', text: '  ', sortOrder: 0 }));
  assert.ok(validateProjectContentBlock({ type: 'Link', url: 'javascript:alert(1)', sortOrder: 0 }));
  assert.equal(validateProjectContentBlock({ type: 'Link', url: 'https://example.org/trabalho', sortOrder: 0 }), null);
});

test('moving a content block updates the full display order', async () => {
  const { moveProjectContentBlock } = await loadHelpers();
  const blocks = [
    { id: 'a', type: 'Text' as const, text: 'Introdução', sortOrder: 0 },
    { id: 'b', type: 'Image' as const, url: 'https://cdn.example.org/foto.jpg', sortOrder: 1 },
    { id: 'c', type: 'Link' as const, url: 'https://example.org', sortOrder: 2 },
  ];

  const reordered = moveProjectContentBlock(blocks, 2, -1);

  assert.deepEqual(reordered.map((block) => [block.id, block.sortOrder]), [
    ['a', 0],
    ['c', 1],
    ['b', 2],
  ]);
  assert.deepEqual(blocks.map((block) => block.id), ['a', 'b', 'c']);
});
