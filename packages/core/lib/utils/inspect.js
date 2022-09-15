import { inspect as i } from 'node:util'

i.defaultOptions.depth = 4;
i.defaultOptions.colors = true;

export const inspect = i