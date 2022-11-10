import { generateSpectrum } from 'spectrum-generator';
import { xMaxValue, hilbertTransform, reimFFT } from 'ml-spectra-processing';
import { getSignalReference } from './utilities/getSignalReference';

/**
 * My module
 * @returns A very important number
 */
export function referenceDeconvolution(data: DataXY, options: Options = {}) {
  const {
    referenceRange = { from: 0, to: 0.5 },
    ideal = {
      shape: {
        kind: 'gaussian',
        fwhm: 1,
        peakWidth: 0.001,
      },
    },
  } = options;

  const { x, reExperimentalSpectrum } = data;

  const reReferenceSpectrumPeak = getSignalReference(
    referenceRange,
    x,
    reExperimentalSpectrum,
  );
  const idealSpectrumPeak = generateSpectrum(
    [{ x: 0, y: xMaxValue(reReferenceSpectrumPeak) }],
    {
      generator: {
        from: x[0],
        to: x[x.length - 1],
        nbPoints: x.length,
        peakWidthFct: () => ideal.shape.peakWidth,
      },
    },
  );

  const reIdealSpectrumPeak = Array.from(idealSpectrumPeak.y);
  const imExperimentalSpectrum = hilbertTransform(reExperimentalSpectrum, {
    inClockwise: false,
  });
  const imIdealSpectrumPeak = hilbertTransform(reIdealSpectrumPeak, {
    inClockwise: false,
  });
  const imReferenceSpectrumPeak = hilbertTransform(reReferenceSpectrumPeak, {
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
      (reReferencePeakFid[i] ** 2 + reReferencePeakFid[i] ** 2);

    const imagQuotient =
      (imExperimentalFid[i] * reReferencePeakFid[i] +
        reExperimentalFid[i] * imReferencePeakFid[i]) /
      (reReferencePeakFid[i] ** 2 + reReferencePeakFid[i] ** 2);

    reCompensatedFid[i] =
      realQuotient * reIdealPeakFid[i] - imagQuotient * imIdealPeakFid[i];
    imCompensatedFid[i] =
      realQuotient * imIdealPeakFid[i] + imagQuotient * reIdealPeakFid[i];
  }
  const { re: reCompensatedSpectrum, im: imCompensatedSpectrum } = reimFFT(
    { re: reCompensatedFid, im: imCompensatedFid },
    { inverse: true },
  );
  return {
    re: reCompensatedSpectrum,
    im: imCompensatedSpectrum
  };
}

interface DataXY {
  x: number[];
  reExperimentalSpectrum: number[];
}

interface Options {
  referenceRange?: { from: number; to: number };
  ideal?: {
    shape: {
      kind: string;
      fwhm: number;
      peakWidth: number;
    };
  };
}
