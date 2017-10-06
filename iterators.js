'use strict';

class Selection {
  constructor(input, predicate) {
    this.input = input;
    this.predicate = predicate;
  }

  // How do you deal with this potentially having multiple inputs? I'm going to assume only one for now;
  // desired output if you had two inputs is unclear to me
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

const pretendFileData = [
  [1,'a',2,'whatevs yo'],
  [2,'b',2,'whatevs yo'],
  [3,'c',2,'whatevs yo'],
  [4,'d',2,'whatevs yo'],
];

class Scan {
  // What would this take as its inputs? Would it take in a location from which to read data or would it take in the data itself?
  //
  // Would it have the data or would it need to query it from its children?
  // Assume this is roughly equivalent to FileScan.
  // It's the lowest thing on the chain. Its next is responsible for reading from disc.
  // In our case we don't have disc.
  // We can assume that data will NOT be passed in by its parent though. Instead we'll just hardcode it.

  // One interesting additional note here: would this ever take in children / inputs? Seems like no.
  constructor() {
    this.nextRecordIndex = 0;
  }

  // TODO (nw): you could dick around with iterators here if you really wanted to
  next() {
    // This isn't quite right in one case; it will EOF after close instead of giving a better error.
    // Not the end of the world
    return pretendFileData[this.nextRecordIndex++] || 'EOF';
  }

  // What would we want to do on close? Clean up after ourselves. We wouldn't remove the data from memory, instead we'd remove any pointers we were storing...
  // Does this even make sense in javascript land?
  // What if it WAS a file? We'd have some buffers pointing to aspects of it that we could remove but they would be auto-GC'd anyways.
  close() {
    delete this.nextRecordIndex;
  }
};

module.exports = {
  Scan,
  Selection,
};
