import { generateSpectrum } from 'spectrum-generator';
import { xMaxValue, hilbertTransform } from 'ml-spectra-processing';
import { getSignalReference } from './utilities/getSignalReference';
import * as lib from 'ml-fft';

export function referenceDeconvolution(data: Data, options: Options = {}) {
  const {
    reference = { from: 0, to: 0.5 },
    ideal = {
      shape: {
        kind: 'gaussian',
        fwhm: 1,
      },
    },
  } = options;

  const { x, y } = data;

  const generatedSpectrum = generateSpectrum([{ x: 0, y: xMaxValue(y) }], {
    generator: {
      from: x[0],
      to: x[x.length - 1],
      nbPoints: x.length,
      peakWidthFct: () => 0.001,
    },
  });

  const idealSignal = Array.from(generatedSpectrum.y);
  const referenceSignal = getSignalReference(reference, x, y);
  const fExpIm = hilbertTransform(y, { inClockwise: false });
  const fIdealIm = hilbertTransform(idealSignal, { inClockwise: false });
  const fRefIm = hilbertTransform(referenceSignal, { inClockwise: false });

  return 42;
}

interface Data {
  x: number[];
  y: number[];
}

interface Options {
  reference?: { from: number; to: number };
  ideal?: {
    shape: {
      kind: string;
      fwhm: number;
    };
  };
}
