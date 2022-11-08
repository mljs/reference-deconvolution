import { xFindClosestIndex } from 'ml-spectra-processing';

export function getSignalReference(
  range: {
    from: number;
    to: number;
  },
  x: number[],
  y: number[],
) {
  const init = xFindClosestIndex(x, range.from);
  const end = xFindClosestIndex(x, range.to);
  const result: number[] = new Array(x.length).fill(0);
  for (let i = init; i < end; i++) {
    result[i] = y[i];
  }
  return result;
}
