import { inspect as i } from 'util'

i.defaultOptions.depth = 4;
i.defaultOptions.colors = true;

export const inspect = i