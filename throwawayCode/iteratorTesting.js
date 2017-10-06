'use strict';

const { Scan, Selection } = require('./iterators');

const pretendFileData = [
  [1,'a',2,'whatevs yo'],
  [2,'b',2,'whatevs yo'],
  [3,'c',2,'whatevs yo'],
  [4,'d',2,'whatevs yo'],
];
const fileNode = new Scan(null, { pretendFileData });

const firstColumnIsOdd = record => record[0] % 2 === 1;
const selectionNode = new Selection(fileNode, { predicate: firstColumnIsOdd });

console.log('selectionNode.next()', selectionNode.next());
console.log('selectionNode.next()', selectionNode.next());
console.log('selectionNode.next()', selectionNode.next());

// console.log('FileScan.next', FileScan.next());
// console.log('FileScan.next', FileScan.next());
// console.log('FileScan.next', FileScan.next());
// console.log('FileScan.close', FileScan.close());
// console.log('FileScan.next', FileScan.next());



