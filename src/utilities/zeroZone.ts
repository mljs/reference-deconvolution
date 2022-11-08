import { xFindClosestIndex, xMaxValue } from 'ml-spectra-processing';

function zeroZone(
  spectra: number[],
  x: number[],
  from: number,
  to: number,
  options: { real?: boolean } = {},
) {
  const { real = true } = options;
  const result = spectra.slice();
  const fromIndex = xFindClosestIndex(x, from);
  const toIndex = xFindClosestIndex(x, to);
  // console.log({from, to, fromIndex, toIndex})
  const maxV = xMaxValue(result);
  result[0] = real ? maxV : 0;
  for (let i = fromIndex; i < toIndex + 1; i++) {
    result[i] = 0;
  }
  return result;
}
