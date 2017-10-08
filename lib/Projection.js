'use strict';

const _ = require('lodash');

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
      return _.includes(this.fieldsToKeep, index);
    });
    return projectedRecord;
  }

  close() {
  }
};

module.exports = Projection;
