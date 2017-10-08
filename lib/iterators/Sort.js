'use strict';

const _ = require('lodash');
const fs = require('fs');

const csvUtils = require('../util/csvUtils');

const RecordsInMemory = 24;
class Sort {
  // TODO (nw): handle multiple fields to sort by
  constructor(input, [sortField], schema) {
    this.input = input;
    this.isSorted = false;
    this.buffer = [];
    this.cacheIndex = 0;
    this.maxCachedRows = 256;
    this.dirPrefix = `./tmp/`
    if (!fs.existsSync(this.dirPrefix)) {
      fs.mkdirSync(this.dirPrefix);
    }
    const fieldPositionInRecord = _.findIndex(schema, schemaField => schemaField === sortField);
    this.fieldPositionInRecord = fieldPositionInRecord;

    this.isSorted = false;
    this.sortedOffset = 0;
    this.sortedCache;
  }

  sortFn(a, b) {
    const fieldA = _.trim(a[this.fieldPositionInRecord], "\"");
    const fieldB = _.trim(b[this.fieldPositionInRecord], "\"");

    if (fieldA <= fieldB) {
      return -1;
    }
    return 1;
  }

  next() {
    if (this.isSorted) {
      // TODO (nw): you can't just cache the final result :laughing:
      const nextRecord = this.sortedCache[this.sortedOffset++];
      if (nextRecord) {
        return _.split(nextRecord, ',');
      }
      return 'EOF';
    }

    // Factor out common code you fuck
    let nextInput = this.input.next();
    while (nextInput !== 'EOF') {
      this.buffer.push(nextInput);
      if (_.size(this.buffer) === this.maxCachedRows) {
        this.buffer.sort(this.sortFn.bind(this));
        const filename = `${this.dirPrefix}${this.cacheIndex}`;
        const fd = fs.openSync(filename, 'w');
        _.each(this.buffer, row => {
          const rowStr = row.toString() + '\r\n';
          fs.writeSync(fd, rowStr);
        });
        fs.closeSync(fd);
        this.cacheIndex++;
        this.buffer = [];
      }
      nextInput = this.input.next();
    }

    // The repeated code down here handles leftovers
    const filename = `${this.dirPrefix}${this.cacheIndex}`;
    const fd = fs.openSync(filename, 'w');
    this.buffer.sort(this.sortFn.bind(this));
    _.each(this.buffer, row => {
      const rowStr = row.toString() + '\n';
      fs.writeSync(fd, rowStr);
    });
    fs.closeSync(fd);
    this.cacheIndex++;

    const sortedFilename = this.mergeCaches(_.range(this.cacheIndex));
    this.isSorted = true;

    // TODO (nw): transition this to not be read into buffer
    this.sortedCache = fs.readFileSync(`${this.dirPrefix}${sortedFilename}`).toString().split('\n');
    return _.split(this.sortedCache[this.sortedOffset++], ',');
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

      const f1Reader = new csvUtils.csvReader(fullFilename1);
      const f2Reader = new csvUtils.csvReader(fullFilename2);
      let record1 = f1Reader.getNextRecord();
      let record2 = f1Reader.getNextRecord();
      while (record1 || record2) {
        const sortOrder = this.sortFn(record1 || [], record2 || []);
        if (record2 && (!record1 || sortOrder === -1)) {
          fs.writeSync(fd, record2 + '\n');
          record2 = f2Reader.getNextRecord();
        } else {
          fs.writeSync(fd, record1 + '\n');
          record1 = f1Reader.getNextRecord();
        }
      }

      outFilenames.push(outFilename);
    });

    return this.mergeCaches(outFilenames);
  }
}

module.exports = Sort;
