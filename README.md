# ml-reference-deconvolution

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Reference deconvolution.

## Installation

`$ npm i ml-reference-deconvolution`

## Reference

https://doi.org/10.1016/S0079-6565(97)00011-3
https://doi.org/10.1002/(SICI)1099-0534(2000)12:1<21::AID-CMR4>3.0.CO;2-R
http://nmr-analysis.blogspot.com/2014/01/reference-deconvolution.html

## Usage

```js
import { referenceDeconvolution } from 'ml-reference-deconvolution';

const result = referenceDeconvolution(
  { x, y },
  {
    experimental: { fromTo: { fromIndex, toIndex } },
    ideal: {
      shape: {
        kind: 'gaussian',
        fwhm: 1,
      },
    },
  },
);
// {data: {x,y} + some other parameters ?}
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ml-reference-deconvolution.svg
[npm-url]: https://www.npmjs.com/package/ml-reference-deconvolution
[ci-image]: https://github.com/mljs/ml-reference-deconvolution/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/mljs/ml-reference-deconvolution/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/mljs/ml-reference-deconvolution.svg
[codecov-url]: https://codecov.io/gh/mljs/ml-reference-deconvolution
[download-image]: https://img.shields.io/npm/dm/ml-reference-deconvolution.svg
[download-url]: https://www.npmjs.com/package/ml-reference-deconvolution
