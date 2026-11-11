import test from 'node:test';
import assert from 'node:assert/strict';
import { formatThematicArea } from '../../shared/utils/formatters.ts';

test('thematic area enum names display as readable Portuguese labels', () => {
  assert.equal(formatThematicArea('SaudeBiotecnologia'), 'Saúde e Biotecnologia');
  assert.equal(formatThematicArea('HumanidadesSociedadeDireito'), 'Humanidades, Sociedade e Direito');
});
