'use strict';

const executor = require('./executor');

const testProjection = [
  ["PROJECTION", ["id", "field4"]],
  ["SELECTION", ["id", "EQUALS", "5000"]],
  ["FILESCAN", ["movies"]]
];

const schema = ['id', 'field2', 'field3', 'field4'];

// Open question: how do we get the schema to the various nodes?
// Stupid answer: you can do it right at the start
//
// You'll have to change this when you deal with projections, though...

executor.execute(testProjection, schema);
