'use strict';

const executor = require('./executor');

// const testProjection = [
//   ["LIMIT", ["10"]],
//   ["PROJECTION", ["title"]],
//   ["SELECTION", ["title", "GREATER_THAN", "N"]],
//   ["DISTINCT", []],
//   ["SORT", ["title"]],
//   ["FILESCAN", ["movies"]]
// ];

const testProjection = [
  // ["AVERAGE"],
  ["PROJECTION", ["rating"]],
  ["SELECTION", ["movieId", "EQUALS", "5000"]],
  ["FILESCAN", ["ratings"]]
];

// const schema = ['movie_id', 'title', 'genres'];
const schema = ['userId', 'movieId', 'rating', 'timestamp'];

executor.execute(testProjection, schema);
