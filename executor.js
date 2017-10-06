'use strict';

const _ = require('lodash');

const { Scan, Selection } = require('./iterators');

// Representation will be an array along the lines of:
//
// [
// ["PROJECTION", ["name"]],
// ["SELECTION", ["id", "EQUALS", "5000"]],
// ["FILESCAN", ["movies"]]
// ]
//
// A few interesting things about this:
// 1) We're going to have to change our Selection iterator.
//   Right now it takes an actual function as a predicate, instead it will support an operator and a value.
// 2) Our general API is iterator -> arguments
// 3) Given that children need to be initialized with references to their parents, we'll want to start at the end and init them all.
// 4) We will then call next() on our top-most iterator until we are out of tuples, and call it a day

// Open question: where are we reading the data from? Fuck it, for now we're hardcoded

const pretendFileData = [
  [1,'a',2,'whatevs yo'],
  [2,'b',2,'whatevs yo'],
  [3,'c',2,'whatevs yo'],
  [4,'d',2,'whatevs yo'],
];
const iteratorMappings = {
  'PROJECTION': 'not yet implemented',
  'SELECTION': Selection,
  'FILESCAN': Scan,
};

function execute(representation, schema) {
  // Initialize all of the iterators
  const reversedRepresentation = _.reverse(representation);
  let parentNode = null;
  _.each(reversedRepresentation, ([operator, params]) => {
    const Iterator = iteratorMappings[operator];
    const node = new Iterator(parentNode, params, schema);
    parentNode = node;
  });

  // After all the iterators have been initialized, start grabbing tuples from the root node
  const next = parentNode.next();
  console.log('next', next);
}

module.exports = {
  execute,
};
