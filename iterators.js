'use strict';

const _ = require('lodash');

// Standard input will be:
// Children, { options }

// TODO (nw): put this on the selection class
const operatorMappings = {
  "EQUALS": (a, b) => a === b,
};
class Selection {
  constructor(input, [field, operator, quantity], schema) {
    this.input = input;
    this.predicate = record => {
      const pos = _.findIndex(schema, schemaField => schemaField === field);
      const fieldInRecord = record[pos];
      return operatorMappings[operator](fieldInRecord, quantity);
    };
  }

  next() {
    var nextFromInput = this.input.next();
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
    ['anything sorts', 'whatevs yo', 'yoooo'],
  ],
};
class Scan {
  constructor(_input, [fileName], schema) {
    this.nextRecordIndex = 0;
    this.pretendFileData = pretendFileData[fileName];
  }

  next() {
    return this.pretendFileData[this.nextRecordIndex++] || 'EOF';
  }

  close() {
    delete this.nextRecordIndex;
  }
};

module.exports = {
  Scan,
  Selection,
};
