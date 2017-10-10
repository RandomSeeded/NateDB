'use strict';

const _ = require('lodash');

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

// TODO (nw): this.
function execute(representation, originalSchema) {
  // General strategy:
  // init each and recurse to its children
  // each child will return a schema when it's init'd?
  // That should work but is jacked AF
  // const [operator, params, children] = _.first(representation);
  const topLevelNode = _.first(representation);
  // const Iterator = new iteratorMappings[operator];
  initNode(topLevelNode, originalSchema);
}

function initNode([operator, params, children], baseSchema) {

  if (_.isEmpty(children)) {
    // Init base child here, don't recurse.
    // May be able to switch the if vs else
  }

  let schema;
  _.each(children, child => {
    // Dont have to worry about schema overwrites. 
    // That happens only when there is a single child of projection
    schema = initNode(child, baseSchema);
  });

  // Init this node

  if (node instanceof Projection) {
    schema = params;
  }


  return schema;
}

// function execute(representation, originalSchema) {
//   // Initialize all of the iterators
//   const reversedRepresentation = _.reverse(representation);
//   let parentNode = null;
//   let schema = originalSchema;
//   _.each(reversedRepresentation, ([operator, params]) => {
//     const Iterator = iteratorMappings[operator];
//     const node = new Iterator(parentNode, params, schema);
// 
//     parentNode = node;
//     // Update the schema for any nodes downstream of a projection
//     if (node instanceof Projection) {
//       schema = params;
//     }
//   });
// 
//   // After all the iterators have been initialized, start grabbing tuples from the root node
//   let next = parentNode.next();
//   while (next !== 'EOF') {
//     console.log(next);
//     next = parentNode.next();
//   }
// }

module.exports = {
  execute,
};
