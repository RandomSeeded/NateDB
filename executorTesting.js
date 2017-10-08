'use strict';

const executor = require('./executor');

const testProjection = [
  // ["DISTINCT", []],
  // ["LIMIT", ["10"]],
  // ["PROJECTION", ["movieId", "title"]],
  ["SELECTION", ["movieId", "EQUALS", "5000"]],
  ["SORT", ["title"]],
  // ["LIMIT", ["5196"]],
  ["FILESCAN", ["movies"]]
];

const schema = ['movieId', 'title', 'genres'];

executor.execute(testProjection, schema);
