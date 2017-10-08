'use strict';

const _ = require('lodash');
const fs = require('fs');

const RecordsInMemory = 24;
class Sort {
  // TODO (nw): handle multiple fields to sort by
  constructor(input, [sortField], schema) {
    this.input = input;
    this.isSorted = false;
    this.buffer = [];
    this.cacheIndex = 0;
    this.maxCachedRows = 65536;
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
          const rowStr = row.toString() + '\n';
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

    // We now have all our small files and need to merge them into one big sorted file
    // Grab two files, merge em together. Do that until you reach the end, then do it again
    // Gonna be recursive
    const sortedFile = this.mergeCaches(_.range(this.cacheIndex));
    this.isSorted = true;

    // TODO (nw): transition this to not be read into buffer
    this.sortedCache = fs.readFileSync(`${this.dirPrefix}${sortedFile}`).toString().split('\n');
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

      // TODO (nw): handle questions around files to big to fit into memory here, aka read by chunk
      const records1 = _.split(fs.readFileSync(`${this.dirPrefix}${f1}`).toString(), '\r\n');
      const records2 = _.split(fs.readFileSync(`${this.dirPrefix}${f2}`).toString(), '\r\n');

      const outFilename = `${f1}-${f2}`;
      const fd = fs.openSync(`${this.dirPrefix}${outFilename}`, 'w');

      let r1Index = 0;
      let r2Index = 0;
      let record1 = _.trim(records1[r1Index]);
      let record2 = _.trim(records2[r2Index]);
      while (record1 || record2) {
        const splitR1 = _.split(record2, ',');
        const splitR2 = _.split(record1, ',');
        const sortOrder = this.sortFn(splitR1, splitR2);
        if (record2 && (!record1 || sortOrder === -1)) {
          r2Index++;
          fs.writeSync(fd, record2 + '\n');
        } else {
          r1Index++;
          fs.writeSync(fd, record1 + '\n');
        }

        record1 = _.trim(records1[r1Index]);
        record2 = _.trim(records2[r2Index]);
      }

      outFilenames.push(outFilename);
    });

    return this.mergeCaches(outFilenames);
  }
}

module.exports = Sort;
