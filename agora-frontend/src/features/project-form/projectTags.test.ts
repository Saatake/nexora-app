import assert from 'node:assert/strict';
import { test } from 'node:test';

type Helpers = typeof import('./projectTags.ts');
type Option = { value: string; group: string };

async function loadHelpers(): Promise<Helpers> {
  try {
    return await import('./projectTags.ts');
  } catch {
    throw new Error('Project tag selection helpers should exist before they are used');
  }
}

const options: Option[] = [
  { value: 'História', group: 'Humanidades' },
  { value: 'Fotografia', group: 'Artes' },
  { value: 'Programação', group: 'Tecnologia' },
];

test('tag search matches accent-insensitive canonical options', async () => {
  const { searchProjectTags } = await loadHelpers();

  assert.deepEqual(searchProjectTags(options, 'historia'), [options[0]]);
});

test('tag selection only adds catalog values and removes duplicates', async () => {
  const { toggleProjectTag } = await loadHelpers();

  assert.deepEqual(toggleProjectTag('História', ['História'], options), []);
  assert.deepEqual(toggleProjectTag('História', ['Fotografia'], options), ['Fotografia', 'História']);
  assert.deepEqual(toggleProjectTag('Projeto inventado', [], options), []);
});

test('an unknown legacy tag already selected can still be removed', async () => {
  const { toggleProjectTag } = await loadHelpers();
  assert.deepEqual(toggleProjectTag('Tag antiga', ['Tag antiga'], []), []);
});
