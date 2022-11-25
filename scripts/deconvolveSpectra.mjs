import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { referenceDeconvolution } from '../dist/ml-reference-deconvolution.js';
import { signalsToXY } from 'nmr-processing';

const fileName = 'toluene_gaussian';

const rawReference = JSON.parse(
  readFileSync(
    new URL(`../data/${fileName}_0.5.json`, import.meta.url),
    'utf8',
  ),
).data;

const rawSpectrum = JSON.parse(
  readFileSync(new URL(`../data/${fileName}_2.json`, import.meta.url), 'utf8'),
).data;

const x = rawSpectrum.x;
const w = 1;
const idealSpectrumPeak = signalsToXY(
  [
    {
      id: '8c89a3d8-b4b8-408d-a090-77d1cb023153',
      atoms: [1],
      diaIDs: ['gOpHALiLkW@@@OtbADj`'],
      nbAtoms: 6,
      delta: 2.239,
      js: [],
    },
  ],
  {
    shape: {
      kind: 'gaussian',
      fwhm: 1,
    },
  },
);

console.time('deconvolution time');
const result = referenceDeconvolution(
  { x: rawSpectrum.x, y: rawSpectrum.y },
  {
    referenceRange: {
      from: 2.23,
      to: 2.25,
    },
    idealSpectrumPeak: {
      x: Array.from(idealSpectrumPeak.x),
      y: Array.from(idealSpectrumPeak.y),
    },
  },
);
console.timeEnd('deconvolution time');

const resultsFolderPath = new URL(`../results`, import.meta.url);
if (!existsSync(resultsFolderPath)) {
  mkdirSync(resultsFolderPath);
}

writeFileSync(
  new URL(`../results/deconv_${fileName}.json`, import.meta.url),
  JSON.stringify(
    { data: result },
    (key, value) =>
      // @ts-ignore
      ArrayBuffer.isView(value) ? Array.from(value) : value,
    2,
  ),
);

console.log(result);

const difference = getDifference(rawReference.y, result.y);

writeFileSync(
  new URL(`../results/_result.json`, import.meta.url),
  JSON.stringify(
    [
      {
        filename: `../data/${fileName}_2.json`,
        structure: {
          label: `Spectrum ${fileName}`,
        },
      },
      {
        filename: `../results/deconv_${fileName}.json`,
        structure: {
          label: `Result ${fileName} diff = ${difference.toFixed(2)}`,
        },
      },
      {
        filename: `../data/${fileName}_0.5.json`,
        structure: {
          label: `Target ${fileName}`,
        },
      },
    ],
    undefined,
    2,
  ),
  'utf8',
);

console.log(difference);

function getDifference(array1, array2) {
  let result = 0;
  for (let i = 0; i < array1.length; i++) {
    result += Math.abs(array1[i] - array2[i]);
  }
  return result;
}
