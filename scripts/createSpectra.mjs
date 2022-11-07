import { writeFileSync } from 'fs';

import { predictProton, rangesToXY } from 'nmr-processing';
import OCL from 'openchemlib';

const structures = [
  { label: 'benzene', smiles: 'c1ccccc1' },
  {
    label: 'methylvinylether',
    smiles: 'COC=C',
  },
  { label: 'toluene', smiles: 'c1ccccc1C' },
];

const simulations = [
  {
    shape: { kind: 'gaussian', fwhm: 10 },
    shift: 0, // in pixels
    height: 0,
  },
  {
    shape: { kind: 'gaussian', fwhm: 0.1 },
    shift: 10, // in pixels
    height: 0.5,
  },
];

const { Molecule } = OCL;
const entries = [];

for (const structure of structures) {
  const molecule = Molecule.fromSmiles(structure.smiles);

  const ranges = (await predictProton(molecule)).ranges;

  for (const simulation of simulations) {
    console.log(simulation.shape);
    const data = rangesToXY(ranges, {
      shape: simulation.shape,
    });

    if (simulation.shift) {
      const absShift = Math.abs(simulation.shift);
      const newY = data.y.slice(0);
      for (let i = absShift; i < data.x.length - absShift; i++) {
        newY[i] += data.y[i + simulation.shift] * simulation.height;
      }
      data.y = newY;
    }

    const name = `${structure.label}_${simulation.shape.kind}_${simulation.shape.fwhm}_${simulation.shift}_${simulation.height}.json`;
    entries.push({ filename: name, structure, simulation });
    writeFileSync(
      new URL(`../data/${name}`, import.meta.url),
      JSON.stringify(
        { data, simulation },
        (key, value) => (ArrayBuffer.isView(value) ? Array.from(value) : value),
        2,
      ),
      'utf8',
    );
  }
}

writeFileSync(
  new URL(`../data/entries.json`, import.meta.url),
  JSON.stringify(entries, undefined, 2),
  'utf8',
);
