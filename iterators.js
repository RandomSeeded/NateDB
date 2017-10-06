'use strict';

const _ = require('lodash');

// Standard input will be:
// Children, { options }

const selectionOperatorMappings = {
  "EQUALS": (a, b) => a === b,
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

const pretendFileData = {
  'movies': [
    ['5000', 'of data', 'can go here'],
    ['5000', 'of data', 'or here too'],
    ['5000', 'of data', 'can go here'],
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

class Projection {
  constructor(input, newSchema, originalSchema) {
    this.input = input;
    this.newSchema = newSchema;
    this.originalSchema = originalSchema;
    // Don't recalculate for every single record. Instead create a mapping at this point of the fields you want
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
      return _.has(this.fieldsToKeep, index);
    });
    return projectedRecord;
  }

  close() {
  }
};

module.exports = {
  Scan,
  Selection,
  Projection,
};
