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
  constructor(_input, [filename], _schema) {
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

class Limit {
  constructor(input, [limit], _schema) {
    this.returned = 0;
    this.input = input;
    this.limit = +limit;
  }

  next() {
    if (this.returned === this.limit) {
      return 'EOF';
    }

    this.returned++;
    return this.input.next();
  }

  close() {
  }
};

class Distinct {
  constructor(input, _params, _schema) {
    this.input = input;
  }

  next() {
    let nextRecord = this.input.next();
    while (_.isEqual(nextRecord, this.lastRecord)) {
      nextRecord = this.input.next();
    }
    this.lastRecord = nextRecord;
    return nextRecord;
  }
}

const RecordsInMemory = 24;
class Sort {
  // We're going to do a sorta jacked up merge sort
  constructor(input, _params, _schema) {
    this.input = input;
    this.isSorted = false;
    this.buffer = [];
    this.cacheIndex = 0;
    this.maxCachedRows = 64;
    this.dirPrefix = './tmp/';
  }

  next() {
    // Strategy here:
    // If we're not sorted, first time we call next we have to sort everything
    // If we are sorted, we just return the next thing
    //
    // What does sorting look like?
    // We call next repeatedly, and dump things into a bunch of files
    // After we've dumped, then we merge into single master file
    // After we merge, then we start yielding from the file
    // Does this basically mean re-implementing file-scan? Yeah basically. FML.
    // BUT we could read chunks of exactly the size we write which would make reading easier but be space-inefficient...
    if (this.isSorted) {
      return;
    }

    let nextInput = this.input.next();
    while (nextInput !== 'EOF') {
      this.buffer.push(nextInput);
      if (_.size(this.buffer) === this.maxCachedRows) {
        const filename = `${this.dirPrefix}${this.cacheIndex}`;
        const fd = fs.openSync(filename, 'w');
        _.each(this.buffer, row => {
          const rowStr = row.toString() + '\n';
          fs.writeSync(fd, rowStr);
        });
        fs.closeSync(fd);
        this.cacheIndex++;
        this.buffer = [];
      }
      nextInput = this.input.next();
    }

    // How to merge files? Reading things in is such a PITA. SO MUCH EASIER if you had fixed widths; you could read in a set number of rows...
    // I'm going to make this the case! We are going to write each row to disc at a given offset
    return 'EOF';
  }

  // Should probably clean up all my temporary files...
  close() {
  }
}

module.exports = {
  FileScan,
  Selection,
  Projection,
  Limit,
  Distinct,
  Sort,
};

