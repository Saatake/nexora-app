import test from 'node:test';
import assert from 'node:assert/strict';
import { createProjectSubmission } from './projectSubmission.ts';
import type { ProjectContentBlockDraft } from './projectContent.ts';

const block = (type: ProjectContentBlockDraft['type'], url: string, sortOrder = 0): ProjectContentBlockDraft => ({
  id: `block-${sortOrder}`,
  type,
  url,
  sortOrder,
});

test('createProjectSubmission sends content blocks, canonical tags and individual contributions', () => {
  const payload = createProjectSubmission({
    title: 'Pesquisa sobre memória',
    category: 'PesquisaCientifica',
    description: 'Pesquisa interdisciplinar',
    tags: ['História', 'Pesquisa qualitativa'],
    authorContribution: 'Conduzi as entrevistas e analisei os dados.',
    collaborators: [{ id: 'member-1', name: 'Ana', contribution: 'Revisão bibliográfica' }],
    contentBlocks: [block('YouTube', 'https://youtu.be/abcdefghijk')],
    githubLink: '',
    fileUrl: '',
  });

  assert.deepEqual(payload.selectedTags, ['História', 'Pesquisa qualitativa']);
  assert.equal(payload.authorContribution, 'Conduzi as entrevistas e analisei os dados.');
  assert.deepEqual(payload.collaborators, [{ id: 'member-1', contribution: 'Revisão bibliográfica' }]);
  assert.equal(payload.contentBlocks[0].sortOrder, 0);
  assert.equal(payload.githubLink, '');
});

test('createProjectSubmission rejects unsafe or invalid content before request', () => {
  assert.throws(() => createProjectSubmission({
    title: 'Projeto', category: 'Tcc', description: 'Descrição', tags: [],
    authorContribution: '', collaborators: [],
    contentBlocks: [block('YouTube', 'https://youtube.com.evil.test/watch?v=abcdefghijk')],
    githubLink: '', fileUrl: '',
  }), /YouTube/);
});

test('legacy Github and PDF links remain represented when editing old projects', () => {
  const payload = createProjectSubmission({
    title: 'Projeto legado', category: 'Tcc', description: 'Descrição', tags: [],
    authorContribution: '', collaborators: [], contentBlocks: [],
    githubLink: 'https://github.com/agora/projeto', fileUrl: 'https://files.example.test/paper.pdf',
  });
  assert.equal(payload.githubLink, 'https://github.com/agora/projeto');
  assert.equal(payload.fileUrl, 'https://files.example.test/paper.pdf');
  assert.deepEqual(payload.contentBlocks, []);
});
