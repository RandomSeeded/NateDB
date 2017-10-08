'use strict';

const _ = require('lodash');
const fs = require('fs');

const bufferSize = 1024;
class FileScan {
  constructor(_input, [filename], _schema) {
    // const fullFilePath = './whatevs.csv';
    const fullFilePath = `../ml-20m/${filename}.csv`;
    this.fd = fs.openSync(fullFilePath, 'r');
    this.nextRecordIndex = 0;

    this.parsedRecords = [];
    this.parsedRecordsOffset = 0;
    this.fileOffset = 0;
  }

  static isValidRecord(record) {
    const isValid = record.indexOf('\n') !== -1 || record.indexOf('\r') !== -1;
    return isValid;
  }

  next() {
    const nextRecord = this.parsedRecords[this.parsedRecordsOffset] || '';
    const nextRecordIsValid = FileScan.isValidRecord(nextRecord);

    if (nextRecordIsValid) {
      this.parsedRecordsOffset++;
      return nextRecord.split(',');
    }
    
    const buffer = Buffer.alloc(bufferSize);
    fs.readSync(this.fd, buffer, 0, bufferSize, this.fileOffset);
    const nextBlock = nextRecord + buffer.toString();
    this.parsedRecords = _.compact(nextBlock.split('\n'));
    this.parsedRecordsOffset = 0;
    this.fileOffset += bufferSize;

    const nextRecord2 = this.parsedRecords[this.parsedRecordsOffset] || '';
    const nextRecordIsValid2 = FileScan.isValidRecord(nextRecord2);

    if (nextRecordIsValid2) {
      this.parsedRecordsOffset++;
      return nextRecord2.split(',');
    }

    return 'EOF';
  }

  close() {
    delete this.nextRecordIndex;
  }
};

module.exports = FileScan;
