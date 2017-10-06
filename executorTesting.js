'use strict';

const executor = require('./executor');

const testProjection = [
  // ["PROJECTION", ["name"]],
  ["SELECTION", ["id", "EQUALS", "5000"]],
  ["FILESCAN", ["movies"]]
];

executor.execute(testProjection);
