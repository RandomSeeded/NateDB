'use strict';

const executor = require('./executor');

const testProjection = [
  ["PROJECTION", ["movieId", "title"]],
  ["SELECTION", ["movieId", "EQUALS", "5000"]],
  ["FILESCAN", ["movies"]]
];

const schema = ['movieId', 'title', 'genres'];

executor.execute(testProjection, schema);
