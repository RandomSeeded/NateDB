'use strict';

const _ = require('lodash');

class Projection {
  constructor(input, newSchema, originalSchema) {
    this.input = input;

    this.projection = _.map(newSchema, (fieldName, index) => {
      return _.findIndex(originalSchema, schemaField => schemaField === fieldName);
    });
  }

  next() {
    const nextRecord = this.input.next();
    if (nextRecord === 'EOF') {
      return nextRecord;
    }

    const projectedRecord = _.map(this.projection, fieldIndex => {
      return nextRecord[fieldIndex];
    });
    return projectedRecord;
  }

  close() {
  }
};

module.exports = Projection;
