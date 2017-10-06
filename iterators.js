'use strict';

const _ = require('lodash');
const fs = require('fs');

// Standard input will be:
// Children, { options }

const selectionOperatorMappings = {
  "EQUALS": (a, b) => a === b,
};
class Selection {
  constructor(input, [field, operator, quantity], schema) {
    this.input = input;
    this.predicate = record => {
      const pos = _.findIndex(schema, schemaField => schemaField === field);
      const fieldInRecord = record[pos];
      return selectionOperatorMappings[operator](fieldInRecord, quantity);
    };
  }

  next() {
    let nextFromInput = this.input.next();
    while (nextFromInput !== 'EOF' && !this.predicate(nextFromInput)) {
      nextFromInput = this.input.next();
    }
    return nextFromInput;
  }

  close() {
  }
};

const pretendFileData = {
  'movies': [
    ['5000', 'of data', 'can go here'],
    ['5000', 'of data', 'or here too'],
    ['5000', 'of data', 'can go here'],
    ['5000', 'of data', 'can go here'],
    ['anything sorts', 'whatevs yo', 'yoooo'],
  ],
};

const bufferSize = 1024;
class FileScan {
  constructor(_input, [filename], schema) {
    // const fullFilePath = './whatevs.csv';
    const fullFilePath = './ml-20m/movies.csv';
    this.fd = fs.openSync(fullFilePath, 'r');
    this.nextRecordIndex = 0;
    this.pretendFileData = pretendFileData[filename];

    this.parsedRecords = [];
    this.parsedRecordsOffset = 0;
    this.fileOffset = 0;
  }

  static isValidRecord(record) {
    // const isValid = _.indexOf(record, '\n') !== -1;
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

class Projection {
  constructor(input, newSchema, originalSchema) {
    this.input = input;
    this.newSchema = newSchema;
    this.originalSchema = originalSchema;
    // Don't recalculate for every single record. Instead create a mapping at this point of the fields you want
    const newSchemaByField = _.keyBy(newSchema);
    this.fieldsToKeep = _.reduce(originalSchema, (acc, fieldName, index) => {
      if (newSchemaByField[fieldName]) {
        acc.push(index);
      }
      return acc;
    }, []);
  }

  next() {
    const nextRecord = this.input.next();
    if (nextRecord === 'EOF') {
      return nextRecord;
    }

    const projectedRecord = _.filter(nextRecord, (_value, index) => {
      return _.has(this.fieldsToKeep, index);
    });
    return projectedRecord;
  }

  close() {
  }
};

module.exports = {
  FileScan,
  Selection,
  Projection,
};
