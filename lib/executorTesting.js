'use strict';

const executor = require('./executor');

const testProjection = [
  // ["LIMIT", ["100"]],
  // ["PROJECTION", ["title"]],
  // ["DISTINCT", []],
  // ["SORT", ["title"]],
  // ["SELECTION", ["title", "LESS_THAN", "N"]],
  // ["SELECTION", ["title", "GREATER_THAN", "M"]],
  ["LIMIT", ["1000"]],
  ["FILESCAN", ["movies"]]
];
const schema = ['movie_id', 'title', 'genres'];

// const testProjection = [
//   // ["AVERAGE"],
//   ["DISTINCT", []],
//   ["SORT", ["rating"]],
//   ["PROJECTION", ["rating", "movieId"]],
//   ["SELECTION", ["movieId", "EQUALS", "5000"]],
//   // ["LIMIT", ["10"]],
//   ["FILESCAN", ["ratings"]]
// ];
// const schema = ['userId', 'movieId', 'rating', 'timestamp'];


executor.execute(testProjection, schema);
