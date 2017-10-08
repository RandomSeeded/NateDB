'use strict';

const _ = require('lodash');
const fs = require('fs');

const csvUtils = require('../util/csvUtils');

class FileScan {
  constructor(_input, [filename], schema) {
    const fullFilePath = `../ml-20m/${filename}.csv`;
    this.csvReader = new csvUtils.csvReader(fullFilePath, _.size(schema));
  }

  next() {
    const nextRecord = this.csvReader.getNextRecord() || 'EOF';
    return nextRecord;
  }

  close() {
    delete this.nextRecordIndex;
  }
};

module.exports = FileScan;
