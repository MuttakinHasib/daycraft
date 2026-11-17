import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { checkContrast, generateTailwindCss, generateUniwindCss } from '../src/index';

const failures = checkContrast().filter((result) => !result.passes);
if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`Contrast too low: ${failure.pair} is ${failure.ratio.toFixed(2)}:1, needs ${failure.minimum}:1`);
  }
  process.exit(1);
}

const out = (name: string): string => fileURLToPath(new URL(`../generated/${name}`, import.meta.url));
writeFileSync(out('uniwind.css'), generateUniwindCss());
writeFileSync(out('tailwind.css'), generateTailwindCss());
console.log('Generated uniwind.css and tailwind.css; every contrast pair passes.');
