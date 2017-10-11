'use strict';

const _ = require('lodash');
const assert = require('assert');

const { 
  FileScan,
  Selection,
  Projection,
  Limit,
  Distinct,
  Sort,
  Average,
} = require('./iterators');

const iteratorMappings = {
  'PROJECTION': Projection,
  'SELECTION': Selection,
  'FILESCAN': FileScan,
  'LIMIT': Limit,
  'DISTINCT': Distinct,
  'SORT': Sort,
  'AVERAGE': Average,
};

function execute(representation) {
  const { node } = initNode(representation);
  let next = node.next();
  while (next !== 'EOF') {
    console.log(next);
    next = node.next();
  }
}

function initNode({ operator, params, children }) {
  const Iterator = iteratorMappings[operator];

  // Base case: filescan, init and quit
  if (_.isEmpty(children)) {
    assert(Iterator === FileScan);
    const [filename, schema] = params;
    const node = new Iterator([], [filename], schema);
    return { node, schema };
  }

  // Otherwise, init children and retrieve new schema
  let schemaFromChild;
  const childNodes = _.map(children, child => {
    const { node, schema } = initNode(child);
    schemaFromChild = schema;
    return node;
  });

  // Then init itself
  const node = new Iterator(childNodes, params, schemaFromChild);
  const schema = node instanceof Projection ? params : schemaFromChild;
  return { node, schema };
}

module.exports = {
  execute,
};
