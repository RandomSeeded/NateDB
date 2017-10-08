'use strict';

const Distinct = require('./Distinct');
const FileScan = require('./FileScan');
const Limit = require('./Limit');
const Projection = require('./Projection');
const Selection = require('./Selection');
const Sort = require('./Sort');

module.exports = {
  FileScan,
  Selection,
  Projection,
  Limit,
  Distinct,
  Sort,
};

