'use strict';

const _ = require('lodash');

class Average {
  constructor([input], params, schema) {
    this.input = input;
    this.sum = 0;
    this.length = 0;
    this.finished = false;
  }

  next() {
    if (this.finished) {
      return 'EOF';
    }

    let nextRecord = this.input.next();
    while (nextRecord !== 'EOF') {
      const val = parseFloat(_.first(nextRecord));

      // TODO (nw): this special case only exists because we have fieldnames in our csv
      if (!isNaN(val)) {
        this.sum += val;
        this.length += 1;
      }
      nextRecord = this.input.next();
    }

    this.finished = true;
    return [`${this.sum / this.length}`];
  }

  close() {
  }
};

module.exports = Average;
