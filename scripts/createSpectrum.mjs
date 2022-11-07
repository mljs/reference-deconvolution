import { predictProton, rangesToXY } from 'nmr-processing';
import OCL from 'openchemlib';

const { Molecule } = OCL;

const molecule = Molecule.fromSmiles('CCOC=C');

const result = await predictProton(molecule);

const data = rangesToXY(result.ranges);

console.log(data);
