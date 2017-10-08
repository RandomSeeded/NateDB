'use strict';

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

module.exports = Limit;
