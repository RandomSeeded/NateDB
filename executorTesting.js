'use strict';

const executor = require('./executor');

const testProjection = [
  ["DISTINCT", []],
  ["LIMIT", ["10"]],
  ["PROJECTION", ["movieId", "title"]],
  // ["SELECTION", ["movieId", "EQUALS", "5000"]],
  ["SORT", ["title"]],
  ["FILESCAN", ["movies"]]
];

const schema = ['movieId', 'title', 'genres'];

executor.execute(testProjection, schema);
