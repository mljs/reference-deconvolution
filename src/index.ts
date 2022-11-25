import fs from 'fs';
import { join } from 'path';
import { generateSpectrum } from 'spectrum-generator';
import { xMaxValue, xHilbertTransform, reimFFT } from 'ml-spectra-processing';
import { getSignalReference } from './utilities/getSignalReference';

/**
 * My module
 * @returns A very important number
 */
export function referenceDeconvolution(data: DataXY, options: Options = {}) {
  const {
    referenceRange = { from: 0, to: 0.5 },
    idealSpectrumPeak = { x: [], y: [] },
    ideal = {
      shape: {
        kind: 'gaussian',
        fwhm: 0.5,
      },
    },
    // ideal,
  } = options;

  const { x, y } = data;
  const reExperimentalSpectrum = [...y];

  const reReferenceSpectrumPeak = getSignalReference(referenceRange, x, y);

  // const idealSpectrumPeak = generateSpectrum(
  //   [{ x: 3.667, y: xMaxValue(reReferenceSpectrumPeak) }],
  //   {
  //     generator: {
  //       from: x[0],
  //       to: x[x.length - 1],
  //       nbPoints: x.length,
  //       shape: ideal.shape,
  //       peakWidthFct: () => 0.003,
  //     },
  //   },
  // );

  const reIdealSpectrumPeak = Array.from(idealSpectrumPeak.y);
  const imExperimentalSpectrum = xHilbertTransform(reExperimentalSpectrum, {
    inClockwise: false,
  });
  const imIdealSpectrumPeak = xHilbertTransform(reIdealSpectrumPeak, {
    inClockwise: false,
  });
  const imReferenceSpectrumPeak = xHilbertTransform(reReferenceSpectrumPeak, {
    inClockwise: false,
  });

  const { re: reExperimentalFid, im: imExperimentalFid } = reimFFT(
    { re: reExperimentalSpectrum, im: imExperimentalSpectrum },
    { inverse: true },
  );

  const { re: reIdealPeakFid, im: imIdealPeakFid } = reimFFT(
    { re: reIdealSpectrumPeak, im: imIdealSpectrumPeak },
    { inverse: true },
  );

  const { re: reReferencePeakFid, im: imReferencePeakFid } = reimFFT(
    { re: reReferenceSpectrumPeak, im: imReferenceSpectrumPeak },
    { inverse: true },
  );

  const reCompensatedFid = [];
  const imCompensatedFid = [];

  for (let i = 0; i < reExperimentalSpectrum.length; i++) {
    const realQuotient =
      (reExperimentalFid[i] * reReferencePeakFid[i] +
        imExperimentalFid[i] * imReferencePeakFid[i]) /
      (reReferencePeakFid[i] ** 2 + imReferencePeakFid[i] ** 2);

    const imagQuotient =
      (imExperimentalFid[i] * reReferencePeakFid[i] -
        reExperimentalFid[i] * imReferencePeakFid[i]) /
      (reReferencePeakFid[i] ** 2 + imReferencePeakFid[i] ** 2);

    reCompensatedFid[i] =
      realQuotient * reIdealPeakFid[i] - imagQuotient * imIdealPeakFid[i];
    imCompensatedFid[i] =
      realQuotient * imIdealPeakFid[i] + imagQuotient * reIdealPeakFid[i];
  }
  let { re: reCompensatedSpectrum, im: imCompensatedSpectrum } = reimFFT(
    { re: reCompensatedFid, im: imCompensatedFid },
    { inverse: false },
  );

  return {
    x,
    y: reCompensatedSpectrum,
    // re: reCompensatedSpectrum,
    // im: imCompensatedSpectrum,
  };
}

interface DataXY {
  x: number[];
  y: number[];
}

interface Options {
  reference?: DataXY;
  referenceRange?: { from: number; to: number };
  idealSpectrumPeak?: DataXY;
  ideal?: any;
}
