import assert from 'node:assert/strict';
import { test } from 'node:test';

test('portfolio design normalization accepts the richer media composition contract', async () => {
  const { normalizePortfolioDesignSpec } = await import('./types.ts');
  const normalized = normalizePortfolioDesignSpec({
    version: 2,
    direction: 'gallery-led',
    heroLayout: 'feature',
    sections: ['projects', 'about', 'skills'],
    typography: 'modern',
    colors: 'ocean',
    imageTreatment: 'cover',
    mediaLayout: 'gallery',
    projectCards: [{ projectId: 12, cardVariant: 'feature' }],
  });

  assert.equal(normalized.direction, 'gallery-led');
  assert.equal(normalized.mediaLayout, 'gallery');
  assert.equal(normalized.projectCards[0].cardVariant, 'feature');
});

test('portfolio design normalization falls back for unknown media and direction values', async () => {
  const { normalizePortfolioDesignSpec } = await import('./types.ts');
  const candidate = {
    version: 2,
    direction: 'model-html',
    heroLayout: 'stacked',
    sections: ['about', 'skills', 'projects'],
    typography: 'editorial',
    colors: 'forest',
    imageTreatment: 'natural',
    mediaLayout: 'unsafe-css',
    projectCards: [],
  };

  const normalized = normalizePortfolioDesignSpec(candidate);
  assert.equal(normalized.direction, 'classic-editorial');
  assert.equal(normalized.mediaLayout, 'inline');
});

test('legacy version-one designs receive the stable version-two default', async () => {
  const { normalizePortfolioDesignSpec } = await import('./types.ts');
  const normalized = normalizePortfolioDesignSpec({
    version: 1,
    direction: 'classic-editorial',
    heroLayout: 'stacked',
    sections: ['about', 'skills', 'projects'],
    typography: 'editorial',
    colors: 'forest',
    imageTreatment: 'natural',
    projectCards: [],
  });

  assert.equal(normalized.version, 2);
  assert.equal(normalized.mediaLayout, 'inline');
});
