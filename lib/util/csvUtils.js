'use strict';

const _ = require('lodash');
const csvString = require('csv-string');
const fs = require('fs');

const BUFFER_SIZE = 1024;

const splitRecord = record => {
  return _.flatten(csvString.parse(record));
}

class csvReader {
  constructor(fullFilePath, fieldsPerRecord) {
    this.fd = fs.openSync(fullFilePath, 'r');
    this.nextRecordIndex = 0;
    this.fieldsPerRecord = fieldsPerRecord;

    this.parsedRecords = [];
    this.parsedRecordsOffset = 0;
    this.fileOffset = 0;
  }

  isValidRecord(record) {
    const splitRecord = _.flatten(csvString.parse(record));
    return _.size(splitRecord) === this.fieldsPerRecord && record.indexOf('\r') !== -1;
  }

  getNextRecord() {
    const nextRecord = this.parsedRecords[this.parsedRecordsOffset] || '';
    const nextRecordIsValid = this.isValidRecord(nextRecord);

    if (nextRecordIsValid) {
      this.parsedRecordsOffset++;
      return splitRecord(nextRecord);
    }
    
    const buffer = Buffer.alloc(BUFFER_SIZE);
    fs.readSync(this.fd, buffer, 0, BUFFER_SIZE, this.fileOffset);
    const nextBlock = nextRecord + buffer.toString();
    this.parsedRecords = _.compact(nextBlock.split('\n'));
    this.parsedRecordsOffset = 0;
    this.fileOffset += BUFFER_SIZE;

    const nextRecord2 = this.parsedRecords[this.parsedRecordsOffset] || '';
    const nextRecordIsValid2 = this.isValidRecord(nextRecord2);

    if (nextRecordIsValid2) {
      this.parsedRecordsOffset++;
      return splitRecord(nextRecord2);
    }

    return undefined;
  }
}

module.exports = {
  csvReader,
};
