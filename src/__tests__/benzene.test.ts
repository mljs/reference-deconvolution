import fs from 'fs';
import { join } from 'path';
import { referenceDeconvolution } from '../index';
import { signalsToXY } from 'nmr-processing';

describe('this is a test', () => {
  it('item of the test', () => {
    const fileName = 'benzene_gaussian';
    const rawReference = JSON.parse(
      fs.readFileSync(join(__dirname, `/../../data/${fileName}_0.5.json`), {
        encoding: 'utf8',
      }),
    ).data;

    const rawSpectrum = JSON.parse(
      fs.readFileSync(join(__dirname, `/../../data/${fileName}_2.json`), {
        encoding: 'utf8',
      }),
    ).data;

    const x = rawSpectrum.x;
    const idealSpectrumPeak = signalsToXY(
      [
        {
          id: '8c89a3d8-b4b8-408d-a090-77d1cb023153',
          atoms: [1],
          diaIDs: ['gOpHALiLkW@@@OtbADj`'],
          nbAtoms: 6,
          delta: 7.377,
          js: [],
        },
      ],
      {
        shape: {
          kind: 'gaussian',
          fwhm: 0.5,
        },
        lineWidth: 0.5,
        from: x[0],
        to: x[x.length - 1],
      },
    );

    console.time('deconvolution time');
    const result = referenceDeconvolution(
      { x: rawSpectrum.x, y: rawSpectrum.y },
      {
        referenceRange: {
          from: 7.36,
          to: 7.39,
        },
        idealSpectrumPeak: {
          x: Array.from(idealSpectrumPeak.x),
          y: Array.from(idealSpectrumPeak.y),
        },
      },
    );
    console.timeEnd('deconvolution time');

    fs.writeFileSync(
      join(__dirname, `../../data/deconv_${fileName}.json`),
      JSON.stringify({
        x: Array.from(result.x),
        re: Array.from(result.y),
        im: Array.from(result.y),
      }), //JSON.stringify(result, undefined, 2),
    );

    const difference = getDifference(rawReference.y, Array.from(result.y));
    expect(difference).toBeCloseTo(0, 2);
  });
});

function getDifference(array1: number[], array2: number[]) {
  let result = 0;
  for (let i = 0; i < array1.length; i++) {
    result += Math.abs(array1[i] - array2[i]);
  }
  return result;
}
