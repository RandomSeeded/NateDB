'use strict';

const csvString = require('csv-string');

const testCsv = 'a,b,"c,d",e,f';

const arr = csvString.parse(testCsv, ',');
console.log('arr', arr);

