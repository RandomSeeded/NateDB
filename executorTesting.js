'use strict';

const executor = require('./executor');

const testProjection = [
  ["LIMIT", ["10"]],
  // ["PROJECTION", ["title"]],
  // ["SELECTION", ["movieId", "EQUALS", "5000"]],
  // ["DISTINCT", []],
  ["SORT", ["title"]],
  ["FILESCAN", ["movies"]]
];

const schema = ['movieId', 'title', 'genres'];

executor.execute(testProjection, schema);
