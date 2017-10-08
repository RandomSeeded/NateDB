'use strict';

const _ = require('lodash');

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

module.exports = Distinct;
