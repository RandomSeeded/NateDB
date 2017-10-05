'use strict';

const { Scan, Selection } = require('./iterators');

const fileNode = new Scan();

const firstColumnIsOdd = record => record[0] % 2 === 1;
const selectionNode = new Selection(fileNode, firstColumnIsOdd);

console.log('selectionNode.next()', selectionNode.next());
console.log('selectionNode.next()', selectionNode.next());
console.log('selectionNode.next()', selectionNode.next());

// console.log('FileScan.next', FileScan.next());
// console.log('FileScan.next', FileScan.next());
// console.log('FileScan.next', FileScan.next());
// console.log('FileScan.close', FileScan.close());
// console.log('FileScan.next', FileScan.next());



