'use strict';

const _ = require('lodash');
const fs = require('fs');

const csvUtils = require('../util/csvUtils');
const csvString = require('csv-string');

class Sort {
  // TODO (nw): handle multiple fields to sort by
  constructor(input, [sortField], schema) {
    this.schema = schema;
    this.input = input;
    this.buffer = [];
    this.cacheIndex = 0;
    this.maxCachedRows = 1024;
    this.dirPrefix = `./tmp/`
    if (!fs.existsSync(this.dirPrefix)) {
      fs.mkdirSync(this.dirPrefix);
    }
    const fieldPositionInRecord = _.findIndex(schema, schemaField => schemaField === sortField);
    this.fieldPositionInRecord = fieldPositionInRecord;

    this.sortedFileReader;
  }

  sortFn(a, b) {
    const fieldA = _.trim(a[this.fieldPositionInRecord], "\"");
    const fieldB = _.trim(b[this.fieldPositionInRecord], "\"");

    if (fieldA <= fieldB) {
      return -1;
    }
    return 1;
  }

  writeBufferToFile() {
    this.buffer.sort(this.sortFn.bind(this));
    const filename = `${this.dirPrefix}${this.cacheIndex}`;
    const fd = fs.openSync(filename, 'w');
    _.each(this.buffer, row => {
      fs.writeSync(fd, csvString.stringify(row));
    });
    fs.closeSync(fd);
    this.cacheIndex++;
    this.buffer = [];
  }

  next() {
    // If we have already sorted, just read from sorted file
    if (this.sortedFileReader) {
      return this.sortedFileReader.getNextRecord() || 'EOF';
    }

    // Create initial small cache files
    let nextInput = this.input.next();
    while (nextInput !== 'EOF') {
      this.buffer.push(nextInput);
      if (_.size(this.buffer) === this.maxCachedRows) {
        this.writeBufferToFile();
      }
      nextInput = this.input.next();
    }
    this.writeBufferToFile();

    // Merge caches together into final sorted file
    const sortedFilename = this.mergeCaches(_.range(this.cacheIndex));
    this.isSorted = true;

    // Open a reader to the sorted file and return first record
    this.sortedFileReader = new csvUtils.csvReader(`${this.dirPrefix}${sortedFilename}`, _.size(this.schema));
    return this.sortedFileReader.getNextRecord() || 'EOF';
  }

  close() {
    this.rmdirSync(this.dirPrefix);
  }

  mergeCaches(filenames) {
    const numFiles = _.size(filenames);
    if (numFiles === 1) {
      return _.first(filenames);
    }

    const totalIterations = Math.ceil(numFiles / 2);
    const outFilenames = [];
    _.times(totalIterations, iter => {
      const f1 = filenames[iter*2];
      const f2 = filenames[iter*2+1];

      if (!f2) {
        return outFilenames.push(f1);
      }

      const fullFilename1 = `${this.dirPrefix}${f1}`;
      const fullFilename2 = `${this.dirPrefix}${f2}`;
      const outFilename = `${f1}-${f2}`;
      const fd = fs.openSync(`${this.dirPrefix}${outFilename}`, 'w');

      const f1Reader = new csvUtils.csvReader(fullFilename1, _.size(this.schema));
      const f2Reader = new csvUtils.csvReader(fullFilename2, _.size(this.schema));
      let record1 = f1Reader.getNextRecord();
      let record2 = f2Reader.getNextRecord();
      while (record1 || record2) {
        const sortOrder = this.sortFn(record1 || [], record2 || []);
        if (record2 && (!record1 || sortOrder === 1)) {
          fs.writeSync(fd, csvString.stringify(record2));
          record2 = f2Reader.getNextRecord();
        } else {
          fs.writeSync(fd, csvString.stringify(record1));
          record1 = f1Reader.getNextRecord();
        }
      }

      fs.closeSync(fd);
      outFilenames.push(outFilename);
    });

    return this.mergeCaches(outFilenames);
  }
}

module.exports = Sort;
