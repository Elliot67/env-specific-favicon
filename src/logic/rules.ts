import { AppDataRule } from '~/types/app';
import { generateId } from '~/utils';

export function getEmptyRule(): AppDataRule {
  return {
    id: generateId(),
    active: true,
    type: 'url',
    testPattern: '.',
    filter: 'cover',
    color: '#ff00ff',
  };
}
