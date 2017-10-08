'use strict';

const _ = require('lodash');

const { 
  FileScan,
  Selection,
  Projection,
  Limit,
  Distinct,
  Sort,
} = require('./iterators');

const iteratorMappings = {
  'PROJECTION': Projection,
  'SELECTION': Selection,
  'FILESCAN': FileScan,
  'LIMIT': Limit,
  'DISTINCT': Distinct,
  'SORT': Sort,
};

function execute(representation, originalSchema) {
  // Initialize all of the iterators
  const reversedRepresentation = _.reverse(representation);
  let parentNode = null;
  let schema = originalSchema;
  _.each(reversedRepresentation, ([operator, params]) => {
    const Iterator = iteratorMappings[operator];
    const node = new Iterator(parentNode, params, schema);

    parentNode = node;
    // Update the schema for any nodes downstream of a projection
    if (node instanceof Projection) {
      schema = params;
    }
  });

  // After all the iterators have been initialized, start grabbing tuples from the root node
  let next = parentNode.next();
  while (next !== 'EOF') {
    console.log(next);
    next = parentNode.next();
  }
}

module.exports = {
  execute,
};