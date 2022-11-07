import { writeFileSync } from 'fs';

import { predictProton, rangesToXY } from 'nmr-processing';
import OCL from 'openchemlib';

const structures = [
  { label: 'benzene', smiles: 'c1ccccc1' },
  {
    label: 'ethylvinylether',
    smiles: 'CCOC=C',
  },
  { label: 'toluene', smiles: 'c1ccccc1C' },
];

const simulations = [
  {
    shape: { kind: 'gaussian', fwhm: 0.01 },
    shift: 0,
    height: 0,
  },
  {
    shape: { kind: 'gaussian', fwhm: 0.01 },
    shift: 0.01,
    height: 0.5,
  },
];

const { Molecule } = OCL;

for (const structure of structures) {
  const molecule = Molecule.fromSmiles(structure.smiles);

  const ranges = (await predictProton(molecule)).ranges;

  for (const simulation of simulations) {
    const data = rangesToXY(ranges, {
      shape: simulation.shape,
    });
    const name = `${structure.label}_${simulation.shape.kind}_${simulation.shape.fwhm}_${simulation.shift}_${simulation.height}.json`;
    writeFileSync(
      new URL(name, import.meta.url),
      JSON.stringify(
        { data, simulation },
        (key, value) => (ArrayBuffer.isView(value) ? Array.from(value) : value),
        2,
      ),
      'utf8',
    );
  }
}
