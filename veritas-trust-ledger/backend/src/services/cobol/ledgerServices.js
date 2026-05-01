const ffi = require('ffi-napi');
const ref = require('ref-napi');

const int = ref.types.int;

const ledger = ffi.Library('./cobol/ledger', {
  'LEDGER': [ 'void', [ int, int, ref.refType(int) ] ]
});

function add(a, b) {
  const result = ref.alloc(int);
  ledger.LEDGER(a, b, result);
  return result.deref();
}

module.exports = { add };
