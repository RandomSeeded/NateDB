'use strict';

const _ = require('lodash');

const selectionOperatorMappings = {
  "EQUALS": (a, b) => a === b,
  "GREATER_THAN": (a, b) => a >= b,
  "LESS_THAN": (a, b) => a <= b,
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

module.exports = Selection;
