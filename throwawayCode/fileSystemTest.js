'use strict';

const fs = require('fs');

const filename = './ml-20m/movies.csv';

const bufferSize = 2048;
const buffer = Buffer.alloc(bufferSize);

const fd = fs.openSync(filename, 'r');
const test = fs.readSync(fd, buffer, 0, bufferSize, 0);


console.log('buffer', buffer.toString());
