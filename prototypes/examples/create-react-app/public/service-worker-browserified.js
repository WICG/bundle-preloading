(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
;(function (globalObject) {
  'use strict';

/*
 *      bignumber.js v9.0.1
 *      A JavaScript library for arbitrary-precision arithmetic.
 *      https://github.com/MikeMcl/bignumber.js
 *      Copyright (c) 2020 Michael Mclaughlin <M8ch88l@gmail.com>
 *      MIT Licensed.
 *
 *      BigNumber.prototype methods     |  BigNumber methods
 *                                      |
 *      absoluteValue            abs    |  clone
 *      comparedTo                      |  config               set
 *      decimalPlaces            dp     |      DECIMAL_PLACES
 *      dividedBy                div    |      ROUNDING_MODE
 *      dividedToIntegerBy       idiv   |      EXPONENTIAL_AT
 *      exponentiatedBy          pow    |      RANGE
 *      integerValue                    |      CRYPTO
 *      isEqualTo                eq     |      MODULO_MODE
 *      isFinite                        |      POW_PRECISION
 *      isGreaterThan            gt     |      FORMAT
 *      isGreaterThanOrEqualTo   gte    |      ALPHABET
 *      isInteger                       |  isBigNumber
 *      isLessThan               lt     |  maximum              max
 *      isLessThanOrEqualTo      lte    |  minimum              min
 *      isNaN                           |  random
 *      isNegative                      |  sum
 *      isPositive                      |
 *      isZero                          |
 *      minus                           |
 *      modulo                   mod    |
 *      multipliedBy             times  |
 *      negated                         |
 *      plus                            |
 *      precision                sd     |
 *      shiftedBy                       |
 *      squareRoot               sqrt   |
 *      toExponential                   |
 *      toFixed                         |
 *      toFormat                        |
 *      toFraction                      |
 *      toJSON                          |
 *      toNumber                        |
 *      toPrecision                     |
 *      toString                        |
 *      valueOf                         |
 *
 */


  var BigNumber,
    isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,
    mathceil = Math.ceil,
    mathfloor = Math.floor,

    bignumberError = '[BigNumber Error] ',
    tooManyDigits = bignumberError + 'Number primitive has more than 15 significant digits: ',

    BASE = 1e14,
    LOG_BASE = 14,
    MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
    // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
    POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
    SQRT_BASE = 1e7,

    // EDITABLE
    // The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
    // the arguments to toExponential, toFixed, toFormat, and toPrecision.
    MAX = 1E9;                                   // 0 to MAX_INT32


  /*
   * Create and return a BigNumber constructor.
   */
  function clone(configObject) {
    var div, convertBase, parseNumeric,
      P = BigNumber.prototype = { constructor: BigNumber, toString: null, valueOf: null },
      ONE = new BigNumber(1),


      //----------------------------- EDITABLE CONFIG DEFAULTS -------------------------------


      // The default values below must be integers within the inclusive ranges stated.
      // The values can also be changed at run-time using BigNumber.set.

      // The maximum number of decimal places for operations involving division.
      DECIMAL_PLACES = 20,                     // 0 to MAX

      // The rounding mode used when rounding to the above decimal places, and when using
      // toExponential, toFixed, toFormat and toPrecision, and round (default value).
      // UP         0 Away from zero.
      // DOWN       1 Towards zero.
      // CEIL       2 Towards +Infinity.
      // FLOOR      3 Towards -Infinity.
      // HALF_UP    4 Towards nearest neighbour. If equidistant, up.
      // HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
      // HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
      // HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
      // HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
      ROUNDING_MODE = 4,                       // 0 to 8

      // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

      // The exponent value at and beneath which toString returns exponential notation.
      // Number type: -7
      TO_EXP_NEG = -7,                         // 0 to -MAX

      // The exponent value at and above which toString returns exponential notation.
      // Number type: 21
      TO_EXP_POS = 21,                         // 0 to MAX

      // RANGE : [MIN_EXP, MAX_EXP]

      // The minimum exponent value, beneath which underflow to zero occurs.
      // Number type: -324  (5e-324)
      MIN_EXP = -1e7,                          // -1 to -MAX

      // The maximum exponent value, above which overflow to Infinity occurs.
      // Number type:  308  (1.7976931348623157e+308)
      // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
      MAX_EXP = 1e7,                           // 1 to MAX

      // Whether to use cryptographically-secure random number generation, if available.
      CRYPTO = false,                          // true or false

      // The modulo mode used when calculating the modulus: a mod n.
      // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
      // The remainder (r) is calculated as: r = a - n * q.
      //
      // UP        0 The remainder is positive if the dividend is negative, else is negative.
      // DOWN      1 The remainder has the same sign as the dividend.
      //             This modulo mode is commonly known as 'truncated division' and is
      //             equivalent to (a % n) in JavaScript.
      // FLOOR     3 The remainder has the same sign as the divisor (Python %).
      // HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
      // EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
      //             The remainder is always positive.
      //
      // The truncated division, floored division, Euclidian division and IEEE 754 remainder
      // modes are commonly used for the modulus operation.
      // Although the other rounding modes can also be used, they may not give useful results.
      MODULO_MODE = 1,                         // 0 to 9

      // The maximum number of significant digits of the result of the exponentiatedBy operation.
      // If POW_PRECISION is 0, there will be unlimited significant digits.
      POW_PRECISION = 0,                    // 0 to MAX

      // The format specification used by the BigNumber.prototype.toFormat method.
      FORMAT = {
        prefix: '',
        groupSize: 3,
        secondaryGroupSize: 0,
        groupSeparator: ',',
        decimalSeparator: '.',
        fractionGroupSize: 0,
        fractionGroupSeparator: '\xA0',      // non-breaking space
        suffix: ''
      },

      // The alphabet used for base conversion. It must be at least 2 characters long, with no '+',
      // '-', '.', whitespace, or repeated character.
      // '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
      ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';


    //------------------------------------------------------------------------------------------


    // CONSTRUCTOR


    /*
     * The BigNumber constructor and exported function.
     * Create and return a new instance of a BigNumber object.
     *
     * v {number|string|BigNumber} A numeric value.
     * [b] {number} The base of v. Integer, 2 to ALPHABET.length inclusive.
     */
    function BigNumber(v, b) {
      var alphabet, c, caseChanged, e, i, isNum, len, str,
        x = this;

      // Enable constructor call without `new`.
      if (!(x instanceof BigNumber)) return new BigNumber(v, b);

      if (b == null) {

        if (v && v._isBigNumber === true) {
          x.s = v.s;

          if (!v.c || v.e > MAX_EXP) {
            x.c = x.e = null;
          } else if (v.e < MIN_EXP) {
            x.c = [x.e = 0];
          } else {
            x.e = v.e;
            x.c = v.c.slice();
          }

          return;
        }

        if ((isNum = typeof v == 'number') && v * 0 == 0) {

          // Use `1 / n` to handle minus zero also.
          x.s = 1 / v < 0 ? (v = -v, -1) : 1;

          // Fast path for integers, where n < 2147483648 (2**31).
          if (v === ~~v) {
            for (e = 0, i = v; i >= 10; i /= 10, e++);

            if (e > MAX_EXP) {
              x.c = x.e = null;
            } else {
              x.e = e;
              x.c = [v];
            }

            return;
          }

          str = String(v);
        } else {

          if (!isNumeric.test(str = String(v))) return parseNumeric(x, str, isNum);

          x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
        }

        // Decimal point?
        if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

        // Exponential form?
        if ((i = str.search(/e/i)) > 0) {

          // Determine exponent.
          if (e < 0) e = i;
          e += +str.slice(i + 1);
          str = str.substring(0, i);
        } else if (e < 0) {

          // Integer.
          e = str.length;
        }

      } else {

        // '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
        intCheck(b, 2, ALPHABET.length, 'Base');

        // Allow exponential notation to be used with base 10 argument, while
        // also rounding to DECIMAL_PLACES as with other bases.
        if (b == 10) {
          x = new BigNumber(v);
          return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
        }

        str = String(v);

        if (isNum = typeof v == 'number') {

          // Avoid potential interpretation of Infinity and NaN as base 44+ values.
          if (v * 0 != 0) return parseNumeric(x, str, isNum, b);

          x.s = 1 / v < 0 ? (str = str.slice(1), -1) : 1;

          // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
          if (BigNumber.DEBUG && str.replace(/^0\.0*|\./, '').length > 15) {
            throw Error
             (tooManyDigits + v);
          }
        } else {
          x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
        }

        alphabet = ALPHABET.slice(0, b);
        e = i = 0;

        // Check that str is a valid base b number.
        // Don't use RegExp, so alphabet can contain special characters.
        for (len = str.length; i < len; i++) {
          if (alphabet.indexOf(c = str.charAt(i)) < 0) {
            if (c == '.') {

              // If '.' is not the first character and it has not be found before.
              if (i > e) {
                e = len;
                continue;
              }
            } else if (!caseChanged) {

              // Allow e.g. hexadecimal 'FF' as well as 'ff'.
              if (str == str.toUpperCase() && (str = str.toLowerCase()) ||
                  str == str.toLowerCase() && (str = str.toUpperCase())) {
                caseChanged = true;
                i = -1;
                e = 0;
                continue;
              }
            }

            return parseNumeric(x, String(v), isNum, b);
          }
        }

        // Prevent later check for length on converted number.
        isNum = false;
        str = convertBase(str, b, 10, x.s);

        // Decimal point?
        if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');
        else e = str.length;
      }

      // Determine leading zeros.
      for (i = 0; str.charCodeAt(i) === 48; i++);

      // Determine trailing zeros.
      for (len = str.length; str.charCodeAt(--len) === 48;);

      if (str = str.slice(i, ++len)) {
        len -= i;

        // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
        if (isNum && BigNumber.DEBUG &&
          len > 15 && (v > MAX_SAFE_INTEGER || v !== mathfloor(v))) {
            throw Error
             (tooManyDigits + (x.s * v));
        }

         // Overflow?
        if ((e = e - i - 1) > MAX_EXP) {

          // Infinity.
          x.c = x.e = null;

        // Underflow?
        } else if (e < MIN_EXP) {

          // Zero.
          x.c = [x.e = 0];
        } else {
          x.e = e;
          x.c = [];

          // Transform base

          // e is the base 10 exponent.
          // i is where to slice str to get the first element of the coefficient array.
          i = (e + 1) % LOG_BASE;
          if (e < 0) i += LOG_BASE;  // i < 1

          if (i < len) {
            if (i) x.c.push(+str.slice(0, i));

            for (len -= LOG_BASE; i < len;) {
              x.c.push(+str.slice(i, i += LOG_BASE));
            }

            i = LOG_BASE - (str = str.slice(i)).length;
          } else {
            i -= len;
          }

          for (; i--; str += '0');
          x.c.push(+str);
        }
      } else {

        // Zero.
        x.c = [x.e = 0];
      }
    }


    // CONSTRUCTOR PROPERTIES


    BigNumber.clone = clone;

    BigNumber.ROUND_UP = 0;
    BigNumber.ROUND_DOWN = 1;
    BigNumber.ROUND_CEIL = 2;
    BigNumber.ROUND_FLOOR = 3;
    BigNumber.ROUND_HALF_UP = 4;
    BigNumber.ROUND_HALF_DOWN = 5;
    BigNumber.ROUND_HALF_EVEN = 6;
    BigNumber.ROUND_HALF_CEIL = 7;
    BigNumber.ROUND_HALF_FLOOR = 8;
    BigNumber.EUCLID = 9;


    /*
     * Configure infrequently-changing library-wide settings.
     *
     * Accept an object with the following optional properties (if the value of a property is
     * a number, it must be an integer within the inclusive range stated):
     *
     *   DECIMAL_PLACES   {number}           0 to MAX
     *   ROUNDING_MODE    {number}           0 to 8
     *   EXPONENTIAL_AT   {number|number[]}  -MAX to MAX  or  [-MAX to 0, 0 to MAX]
     *   RANGE            {number|number[]}  -MAX to MAX (not zero)  or  [-MAX to -1, 1 to MAX]
     *   CRYPTO           {boolean}          true or false
     *   MODULO_MODE      {number}           0 to 9
     *   POW_PRECISION       {number}           0 to MAX
     *   ALPHABET         {string}           A string of two or more unique characters which does
     *                                       not contain '.'.
     *   FORMAT           {object}           An object with some of the following properties:
     *     prefix                 {string}
     *     groupSize              {number}
     *     secondaryGroupSize     {number}
     *     groupSeparator         {string}
     *     decimalSeparator       {string}
     *     fractionGroupSize      {number}
     *     fractionGroupSeparator {string}
     *     suffix                 {string}
     *
     * (The values assigned to the above FORMAT object properties are not checked for validity.)
     *
     * E.g.
     * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
     *
     * Ignore properties/parameters set to null or undefined, except for ALPHABET.
     *
     * Return an object with the properties current values.
     */
    BigNumber.config = BigNumber.set = function (obj) {
      var p, v;

      if (obj != null) {

        if (typeof obj == 'object') {

          // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
          // '[BigNumber Error] DECIMAL_PLACES {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'DECIMAL_PLACES')) {
            v = obj[p];
            intCheck(v, 0, MAX, p);
            DECIMAL_PLACES = v;
          }

          // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
          // '[BigNumber Error] ROUNDING_MODE {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'ROUNDING_MODE')) {
            v = obj[p];
            intCheck(v, 0, 8, p);
            ROUNDING_MODE = v;
          }

          // EXPONENTIAL_AT {number|number[]}
          // Integer, -MAX to MAX inclusive or
          // [integer -MAX to 0 inclusive, 0 to MAX inclusive].
          // '[BigNumber Error] EXPONENTIAL_AT {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'EXPONENTIAL_AT')) {
            v = obj[p];
            if (v && v.pop) {
              intCheck(v[0], -MAX, 0, p);
              intCheck(v[1], 0, MAX, p);
              TO_EXP_NEG = v[0];
              TO_EXP_POS = v[1];
            } else {
              intCheck(v, -MAX, MAX, p);
              TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
            }
          }

          // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
          // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
          // '[BigNumber Error] RANGE {not a primitive number|not an integer|out of range|cannot be zero}: {v}'
          if (obj.hasOwnProperty(p = 'RANGE')) {
            v = obj[p];
            if (v && v.pop) {
              intCheck(v[0], -MAX, -1, p);
              intCheck(v[1], 1, MAX, p);
              MIN_EXP = v[0];
              MAX_EXP = v[1];
            } else {
              intCheck(v, -MAX, MAX, p);
              if (v) {
                MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
              } else {
                throw Error
                 (bignumberError + p + ' cannot be zero: ' + v);
              }
            }
          }

          // CRYPTO {boolean} true or false.
          // '[BigNumber Error] CRYPTO not true or false: {v}'
          // '[BigNumber Error] crypto unavailable'
          if (obj.hasOwnProperty(p = 'CRYPTO')) {
            v = obj[p];
            if (v === !!v) {
              if (v) {
                if (typeof crypto != 'undefined' && crypto &&
                 (crypto.getRandomValues || crypto.randomBytes)) {
                  CRYPTO = v;
                } else {
                  CRYPTO = !v;
                  throw Error
                   (bignumberError + 'crypto unavailable');
                }
              } else {
                CRYPTO = v;
              }
            } else {
              throw Error
               (bignumberError + p + ' not true or false: ' + v);
            }
          }

          // MODULO_MODE {number} Integer, 0 to 9 inclusive.
          // '[BigNumber Error] MODULO_MODE {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'MODULO_MODE')) {
            v = obj[p];
            intCheck(v, 0, 9, p);
            MODULO_MODE = v;
          }

          // POW_PRECISION {number} Integer, 0 to MAX inclusive.
          // '[BigNumber Error] POW_PRECISION {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'POW_PRECISION')) {
            v = obj[p];
            intCheck(v, 0, MAX, p);
            POW_PRECISION = v;
          }

          // FORMAT {object}
          // '[BigNumber Error] FORMAT not an object: {v}'
          if (obj.hasOwnProperty(p = 'FORMAT')) {
            v = obj[p];
            if (typeof v == 'object') FORMAT = v;
            else throw Error
             (bignumberError + p + ' not an object: ' + v);
          }

          // ALPHABET {string}
          // '[BigNumber Error] ALPHABET invalid: {v}'
          if (obj.hasOwnProperty(p = 'ALPHABET')) {
            v = obj[p];

            // Disallow if less than two characters,
            // or if it contains '+', '-', '.', whitespace, or a repeated character.
            if (typeof v == 'string' && !/^.?$|[+\-.\s]|(.).*\1/.test(v)) {
              ALPHABET = v;
            } else {
              throw Error
               (bignumberError + p + ' invalid: ' + v);
            }
          }

        } else {

          // '[BigNumber Error] Object expected: {v}'
          throw Error
           (bignumberError + 'Object expected: ' + obj);
        }
      }

      return {
        DECIMAL_PLACES: DECIMAL_PLACES,
        ROUNDING_MODE: ROUNDING_MODE,
        EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
        RANGE: [MIN_EXP, MAX_EXP],
        CRYPTO: CRYPTO,
        MODULO_MODE: MODULO_MODE,
        POW_PRECISION: POW_PRECISION,
        FORMAT: FORMAT,
        ALPHABET: ALPHABET
      };
    };


    /*
     * Return true if v is a BigNumber instance, otherwise return false.
     *
     * If BigNumber.DEBUG is true, throw if a BigNumber instance is not well-formed.
     *
     * v {any}
     *
     * '[BigNumber Error] Invalid BigNumber: {v}'
     */
    BigNumber.isBigNumber = function (v) {
      if (!v || v._isBigNumber !== true) return false;
      if (!BigNumber.DEBUG) return true;

      var i, n,
        c = v.c,
        e = v.e,
        s = v.s;

      out: if ({}.toString.call(c) == '[object Array]') {

        if ((s === 1 || s === -1) && e >= -MAX && e <= MAX && e === mathfloor(e)) {

          // If the first element is zero, the BigNumber value must be zero.
          if (c[0] === 0) {
            if (e === 0 && c.length === 1) return true;
            break out;
          }

          // Calculate number of digits that c[0] should have, based on the exponent.
          i = (e + 1) % LOG_BASE;
          if (i < 1) i += LOG_BASE;

          // Calculate number of digits of c[0].
          //if (Math.ceil(Math.log(c[0] + 1) / Math.LN10) == i) {
          if (String(c[0]).length == i) {

            for (i = 0; i < c.length; i++) {
              n = c[i];
              if (n < 0 || n >= BASE || n !== mathfloor(n)) break out;
            }

            // Last element cannot be zero, unless it is the only element.
            if (n !== 0) return true;
          }
        }

      // Infinity/NaN
      } else if (c === null && e === null && (s === null || s === 1 || s === -1)) {
        return true;
      }

      throw Error
        (bignumberError + 'Invalid BigNumber: ' + v);
    };


    /*
     * Return a new BigNumber whose value is the maximum of the arguments.
     *
     * arguments {number|string|BigNumber}
     */
    BigNumber.maximum = BigNumber.max = function () {
      return maxOrMin(arguments, P.lt);
    };


    /*
     * Return a new BigNumber whose value is the minimum of the arguments.
     *
     * arguments {number|string|BigNumber}
     */
    BigNumber.minimum = BigNumber.min = function () {
      return maxOrMin(arguments, P.gt);
    };


    /*
     * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
     * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
     * zeros are produced).
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp}'
     * '[BigNumber Error] crypto unavailable'
     */
    BigNumber.random = (function () {
      var pow2_53 = 0x20000000000000;

      // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
      // Check if Math.random() produces more than 32 bits of randomness.
      // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
      // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
      var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
       ? function () { return mathfloor(Math.random() * pow2_53); }
       : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
         (Math.random() * 0x800000 | 0); };

      return function (dp) {
        var a, b, e, k, v,
          i = 0,
          c = [],
          rand = new BigNumber(ONE);

        if (dp == null) dp = DECIMAL_PLACES;
        else intCheck(dp, 0, MAX);

        k = mathceil(dp / LOG_BASE);

        if (CRYPTO) {

          // Browsers supporting crypto.getRandomValues.
          if (crypto.getRandomValues) {

            a = crypto.getRandomValues(new Uint32Array(k *= 2));

            for (; i < k;) {

              // 53 bits:
              // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
              // 11111 11111111 11111111 11111111 11100000 00000000 00000000
              // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
              //                                     11111 11111111 11111111
              // 0x20000 is 2^21.
              v = a[i] * 0x20000 + (a[i + 1] >>> 11);

              // Rejection sampling:
              // 0 <= v < 9007199254740992
              // Probability that v >= 9e15, is
              // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
              if (v >= 9e15) {
                b = crypto.getRandomValues(new Uint32Array(2));
                a[i] = b[0];
                a[i + 1] = b[1];
              } else {

                // 0 <= v <= 8999999999999999
                // 0 <= (v % 1e14) <= 99999999999999
                c.push(v % 1e14);
                i += 2;
              }
            }
            i = k / 2;

          // Node.js supporting crypto.randomBytes.
          } else if (crypto.randomBytes) {

            // buffer
            a = crypto.randomBytes(k *= 7);

            for (; i < k;) {

              // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
              // 0x100000000 is 2^32, 0x1000000 is 2^24
              // 11111 11111111 11111111 11111111 11111111 11111111 11111111
              // 0 <= v < 9007199254740992
              v = ((a[i] & 31) * 0x1000000000000) + (a[i + 1] * 0x10000000000) +
                 (a[i + 2] * 0x100000000) + (a[i + 3] * 0x1000000) +
                 (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];

              if (v >= 9e15) {
                crypto.randomBytes(7).copy(a, i);
              } else {

                // 0 <= (v % 1e14) <= 99999999999999
                c.push(v % 1e14);
                i += 7;
              }
            }
            i = k / 7;
          } else {
            CRYPTO = false;
            throw Error
             (bignumberError + 'crypto unavailable');
          }
        }

        // Use Math.random.
        if (!CRYPTO) {

          for (; i < k;) {
            v = random53bitInt();
            if (v < 9e15) c[i++] = v % 1e14;
          }
        }

        k = c[--i];
        dp %= LOG_BASE;

        // Convert trailing digits to zeros according to dp.
        if (k && dp) {
          v = POWS_TEN[LOG_BASE - dp];
          c[i] = mathfloor(k / v) * v;
        }

        // Remove trailing elements which are zero.
        for (; c[i] === 0; c.pop(), i--);

        // Zero?
        if (i < 0) {
          c = [e = 0];
        } else {

          // Remove leading elements which are zero and adjust exponent accordingly.
          for (e = -1 ; c[0] === 0; c.splice(0, 1), e -= LOG_BASE);

          // Count the digits of the first element of c to determine leading zeros, and...
          for (i = 1, v = c[0]; v >= 10; v /= 10, i++);

          // adjust the exponent accordingly.
          if (i < LOG_BASE) e -= LOG_BASE - i;
        }

        rand.e = e;
        rand.c = c;
        return rand;
      };
    })();


    /*
     * Return a BigNumber whose value is the sum of the arguments.
     *
     * arguments {number|string|BigNumber}
     */
    BigNumber.sum = function () {
      var i = 1,
        args = arguments,
        sum = new BigNumber(args[0]);
      for (; i < args.length;) sum = sum.plus(args[i++]);
      return sum;
    };


    // PRIVATE FUNCTIONS


    // Called by BigNumber and BigNumber.prototype.toString.
    convertBase = (function () {
      var decimal = '0123456789';

      /*
       * Convert string of baseIn to an array of numbers of baseOut.
       * Eg. toBaseOut('255', 10, 16) returns [15, 15].
       * Eg. toBaseOut('ff', 16, 10) returns [2, 5, 5].
       */
      function toBaseOut(str, baseIn, baseOut, alphabet) {
        var j,
          arr = [0],
          arrL,
          i = 0,
          len = str.length;

        for (; i < len;) {
          for (arrL = arr.length; arrL--; arr[arrL] *= baseIn);

          arr[0] += alphabet.indexOf(str.charAt(i++));

          for (j = 0; j < arr.length; j++) {

            if (arr[j] > baseOut - 1) {
              if (arr[j + 1] == null) arr[j + 1] = 0;
              arr[j + 1] += arr[j] / baseOut | 0;
              arr[j] %= baseOut;
            }
          }
        }

        return arr.reverse();
      }

      // Convert a numeric string of baseIn to a numeric string of baseOut.
      // If the caller is toString, we are converting from base 10 to baseOut.
      // If the caller is BigNumber, we are converting from baseIn to base 10.
      return function (str, baseIn, baseOut, sign, callerIsToString) {
        var alphabet, d, e, k, r, x, xc, y,
          i = str.indexOf('.'),
          dp = DECIMAL_PLACES,
          rm = ROUNDING_MODE;

        // Non-integer.
        if (i >= 0) {
          k = POW_PRECISION;

          // Unlimited precision.
          POW_PRECISION = 0;
          str = str.replace('.', '');
          y = new BigNumber(baseIn);
          x = y.pow(str.length - i);
          POW_PRECISION = k;

          // Convert str as if an integer, then restore the fraction part by dividing the
          // result by its base raised to a power.

          y.c = toBaseOut(toFixedPoint(coeffToString(x.c), x.e, '0'),
           10, baseOut, decimal);
          y.e = y.c.length;
        }

        // Convert the number as integer.

        xc = toBaseOut(str, baseIn, baseOut, callerIsToString
         ? (alphabet = ALPHABET, decimal)
         : (alphabet = decimal, ALPHABET));

        // xc now represents str as an integer and converted to baseOut. e is the exponent.
        e = k = xc.length;

        // Remove trailing zeros.
        for (; xc[--k] == 0; xc.pop());

        // Zero?
        if (!xc[0]) return alphabet.charAt(0);

        // Does str represent an integer? If so, no need for the division.
        if (i < 0) {
          --e;
        } else {
          x.c = xc;
          x.e = e;

          // The sign is needed for correct rounding.
          x.s = sign;
          x = div(x, y, dp, rm, baseOut);
          xc = x.c;
          r = x.r;
          e = x.e;
        }

        // xc now represents str converted to baseOut.

        // THe index of the rounding digit.
        d = e + dp + 1;

        // The rounding digit: the digit to the right of the digit that may be rounded up.
        i = xc[d];

        // Look at the rounding digits and mode to determine whether to round up.

        k = baseOut / 2;
        r = r || d < 0 || xc[d + 1] != null;

        r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
              : i > k || i == k &&(rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
               rm == (x.s < 0 ? 8 : 7));

        // If the index of the rounding digit is not greater than zero, or xc represents
        // zero, then the result of the base conversion is zero or, if rounding up, a value
        // such as 0.00001.
        if (d < 1 || !xc[0]) {

          // 1^-dp or 0
          str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0)) : alphabet.charAt(0);
        } else {

          // Truncate xc to the required number of decimal places.
          xc.length = d;

          // Round up?
          if (r) {

            // Rounding up may mean the previous digit has to be rounded up and so on.
            for (--baseOut; ++xc[--d] > baseOut;) {
              xc[d] = 0;

              if (!d) {
                ++e;
                xc = [1].concat(xc);
              }
            }
          }

          // Determine trailing zeros.
          for (k = xc.length; !xc[--k];);

          // E.g. [4, 11, 15] becomes 4bf.
          for (i = 0, str = ''; i <= k; str += alphabet.charAt(xc[i++]));

          // Add leading zeros, decimal point and trailing zeros as required.
          str = toFixedPoint(str, e, alphabet.charAt(0));
        }

        // The caller will add the sign.
        return str;
      };
    })();


    // Perform division in the specified base. Called by div and convertBase.
    div = (function () {

      // Assume non-zero x and k.
      function multiply(x, k, base) {
        var m, temp, xlo, xhi,
          carry = 0,
          i = x.length,
          klo = k % SQRT_BASE,
          khi = k / SQRT_BASE | 0;

        for (x = x.slice(); i--;) {
          xlo = x[i] % SQRT_BASE;
          xhi = x[i] / SQRT_BASE | 0;
          m = khi * xlo + xhi * klo;
          temp = klo * xlo + ((m % SQRT_BASE) * SQRT_BASE) + carry;
          carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
          x[i] = temp % base;
        }

        if (carry) x = [carry].concat(x);

        return x;
      }

      function compare(a, b, aL, bL) {
        var i, cmp;

        if (aL != bL) {
          cmp = aL > bL ? 1 : -1;
        } else {

          for (i = cmp = 0; i < aL; i++) {

            if (a[i] != b[i]) {
              cmp = a[i] > b[i] ? 1 : -1;
              break;
            }
          }
        }

        return cmp;
      }

      function subtract(a, b, aL, base) {
        var i = 0;

        // Subtract b from a.
        for (; aL--;) {
          a[aL] -= i;
          i = a[aL] < b[aL] ? 1 : 0;
          a[aL] = i * base + a[aL] - b[aL];
        }

        // Remove leading zeros.
        for (; !a[0] && a.length > 1; a.splice(0, 1));
      }

      // x: dividend, y: divisor.
      return function (x, y, dp, rm, base) {
        var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
          yL, yz,
          s = x.s == y.s ? 1 : -1,
          xc = x.c,
          yc = y.c;

        // Either NaN, Infinity or 0?
        if (!xc || !xc[0] || !yc || !yc[0]) {

          return new BigNumber(

           // Return NaN if either NaN, or both Infinity or 0.
           !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN :

            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            xc && xc[0] == 0 || !yc ? s * 0 : s / 0
         );
        }

        q = new BigNumber(s);
        qc = q.c = [];
        e = x.e - y.e;
        s = dp + e + 1;

        if (!base) {
          base = BASE;
          e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
          s = s / LOG_BASE | 0;
        }

        // Result exponent may be one less then the current value of e.
        // The coefficients of the BigNumbers from convertBase may have trailing zeros.
        for (i = 0; yc[i] == (xc[i] || 0); i++);

        if (yc[i] > (xc[i] || 0)) e--;

        if (s < 0) {
          qc.push(1);
          more = true;
        } else {
          xL = xc.length;
          yL = yc.length;
          i = 0;
          s += 2;

          // Normalise xc and yc so highest order digit of yc is >= base / 2.

          n = mathfloor(base / (yc[0] + 1));

          // Not necessary, but to handle odd bases where yc[0] == (base / 2) - 1.
          // if (n > 1 || n++ == 1 && yc[0] < base / 2) {
          if (n > 1) {
            yc = multiply(yc, n, base);
            xc = multiply(xc, n, base);
            yL = yc.length;
            xL = xc.length;
          }

          xi = yL;
          rem = xc.slice(0, yL);
          remL = rem.length;

          // Add zeros to make remainder as long as divisor.
          for (; remL < yL; rem[remL++] = 0);
          yz = yc.slice();
          yz = [0].concat(yz);
          yc0 = yc[0];
          if (yc[1] >= base / 2) yc0++;
          // Not necessary, but to prevent trial digit n > base, when using base 3.
          // else if (base == 3 && yc0 == 1) yc0 = 1 + 1e-15;

          do {
            n = 0;

            // Compare divisor and remainder.
            cmp = compare(yc, rem, yL, remL);

            // If divisor < remainder.
            if (cmp < 0) {

              // Calculate trial digit, n.

              rem0 = rem[0];
              if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

              // n is how many times the divisor goes into the current remainder.
              n = mathfloor(rem0 / yc0);

              //  Algorithm:
              //  product = divisor multiplied by trial digit (n).
              //  Compare product and remainder.
              //  If product is greater than remainder:
              //    Subtract divisor from product, decrement trial digit.
              //  Subtract product from remainder.
              //  If product was less than remainder at the last compare:
              //    Compare new remainder and divisor.
              //    If remainder is greater than divisor:
              //      Subtract divisor from remainder, increment trial digit.

              if (n > 1) {

                // n may be > base only when base is 3.
                if (n >= base) n = base - 1;

                // product = divisor * trial digit.
                prod = multiply(yc, n, base);
                prodL = prod.length;
                remL = rem.length;

                // Compare product and remainder.
                // If product > remainder then trial digit n too high.
                // n is 1 too high about 5% of the time, and is not known to have
                // ever been more than 1 too high.
                while (compare(prod, rem, prodL, remL) == 1) {
                  n--;

                  // Subtract divisor from product.
                  subtract(prod, yL < prodL ? yz : yc, prodL, base);
                  prodL = prod.length;
                  cmp = 1;
                }
              } else {

                // n is 0 or 1, cmp is -1.
                // If n is 0, there is no need to compare yc and rem again below,
                // so change cmp to 1 to avoid it.
                // If n is 1, leave cmp as -1, so yc and rem are compared again.
                if (n == 0) {

                  // divisor < remainder, so n must be at least 1.
                  cmp = n = 1;
                }

                // product = divisor
                prod = yc.slice();
                prodL = prod.length;
              }

              if (prodL < remL) prod = [0].concat(prod);

              // Subtract product from remainder.
              subtract(rem, prod, remL, base);
              remL = rem.length;

               // If product was < remainder.
              if (cmp == -1) {

                // Compare divisor and new remainder.
                // If divisor < new remainder, subtract divisor from remainder.
                // Trial digit n too low.
                // n is 1 too low about 5% of the time, and very rarely 2 too low.
                while (compare(yc, rem, yL, remL) < 1) {
                  n++;

                  // Subtract divisor from remainder.
                  subtract(rem, yL < remL ? yz : yc, remL, base);
                  remL = rem.length;
                }
              }
            } else if (cmp === 0) {
              n++;
              rem = [0];
            } // else cmp === 1 and n will be 0

            // Add the next digit, n, to the result array.
            qc[i++] = n;

            // Update the remainder.
            if (rem[0]) {
              rem[remL++] = xc[xi] || 0;
            } else {
              rem = [xc[xi]];
              remL = 1;
            }
          } while ((xi++ < xL || rem[0] != null) && s--);

          more = rem[0] != null;

          // Leading zero?
          if (!qc[0]) qc.splice(0, 1);
        }

        if (base == BASE) {

          // To calculate q.e, first get the number of digits of qc[0].
          for (i = 1, s = qc[0]; s >= 10; s /= 10, i++);

          round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);

        // Caller is convertBase.
        } else {
          q.e = e;
          q.r = +more;
        }

        return q;
      };
    })();


    /*
     * Return a string representing the value of BigNumber n in fixed-point or exponential
     * notation rounded to the specified decimal places or significant digits.
     *
     * n: a BigNumber.
     * i: the index of the last digit required (i.e. the digit that may be rounded up).
     * rm: the rounding mode.
     * id: 1 (toExponential) or 2 (toPrecision).
     */
    function format(n, i, rm, id) {
      var c0, e, ne, len, str;

      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);

      if (!n.c) return n.toString();

      c0 = n.c[0];
      ne = n.e;

      if (i == null) {
        str = coeffToString(n.c);
        str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS)
         ? toExponential(str, ne)
         : toFixedPoint(str, ne, '0');
      } else {
        n = round(new BigNumber(n), i, rm);

        // n.e may have changed if the value was rounded up.
        e = n.e;

        str = coeffToString(n.c);
        len = str.length;

        // toPrecision returns exponential notation if the number of significant digits
        // specified is less than the number of digits necessary to represent the integer
        // part of the value in fixed-point notation.

        // Exponential notation.
        if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {

          // Append zeros?
          for (; len < i; str += '0', len++);
          str = toExponential(str, e);

        // Fixed-point notation.
        } else {
          i -= ne;
          str = toFixedPoint(str, e, '0');

          // Append zeros?
          if (e + 1 > len) {
            if (--i > 0) for (str += '.'; i--; str += '0');
          } else {
            i += e - len;
            if (i > 0) {
              if (e + 1 == len) str += '.';
              for (; i--; str += '0');
            }
          }
        }
      }

      return n.s < 0 && c0 ? '-' + str : str;
    }


    // Handle BigNumber.max and BigNumber.min.
    function maxOrMin(args, method) {
      var n,
        i = 1,
        m = new BigNumber(args[0]);

      for (; i < args.length; i++) {
        n = new BigNumber(args[i]);

        // If any number is NaN, return NaN.
        if (!n.s) {
          m = n;
          break;
        } else if (method.call(m, n)) {
          m = n;
        }
      }

      return m;
    }


    /*
     * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
     * Called by minus, plus and times.
     */
    function normalise(n, c, e) {
      var i = 1,
        j = c.length;

       // Remove trailing zeros.
      for (; !c[--j]; c.pop());

      // Calculate the base 10 exponent. First get the number of digits of c[0].
      for (j = c[0]; j >= 10; j /= 10, i++);

      // Overflow?
      if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {

        // Infinity.
        n.c = n.e = null;

      // Underflow?
      } else if (e < MIN_EXP) {

        // Zero.
        n.c = [n.e = 0];
      } else {
        n.e = e;
        n.c = c;
      }

      return n;
    }


    // Handle values that fail the validity test in BigNumber.
    parseNumeric = (function () {
      var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
        dotAfter = /^([^.]+)\.$/,
        dotBefore = /^\.([^.]+)$/,
        isInfinityOrNaN = /^-?(Infinity|NaN)$/,
        whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

      return function (x, str, isNum, b) {
        var base,
          s = isNum ? str : str.replace(whitespaceOrPlus, '');

        // No exception on ±Infinity or NaN.
        if (isInfinityOrNaN.test(s)) {
          x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
        } else {
          if (!isNum) {

            // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
            s = s.replace(basePrefix, function (m, p1, p2) {
              base = (p2 = p2.toLowerCase()) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
              return !b || b == base ? p1 : m;
            });

            if (b) {
              base = b;

              // E.g. '1.' to '1', '.1' to '0.1'
              s = s.replace(dotAfter, '$1').replace(dotBefore, '0.$1');
            }

            if (str != s) return new BigNumber(s, base);
          }

          // '[BigNumber Error] Not a number: {n}'
          // '[BigNumber Error] Not a base {b} number: {n}'
          if (BigNumber.DEBUG) {
            throw Error
              (bignumberError + 'Not a' + (b ? ' base ' + b : '') + ' number: ' + str);
          }

          // NaN
          x.s = null;
        }

        x.c = x.e = null;
      }
    })();


    /*
     * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
     * If r is truthy, it is known that there are more digits after the rounding digit.
     */
    function round(x, sd, rm, r) {
      var d, i, j, k, n, ni, rd,
        xc = x.c,
        pows10 = POWS_TEN;

      // if x is not Infinity or NaN...
      if (xc) {

        // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
        // n is a base 1e14 number, the value of the element of array x.c containing rd.
        // ni is the index of n within x.c.
        // d is the number of digits of n.
        // i is the index of rd within n including leading zeros.
        // j is the actual index of rd within n (if < 0, rd is a leading zero).
        out: {

          // Get the number of digits of the first element of xc.
          for (d = 1, k = xc[0]; k >= 10; k /= 10, d++);
          i = sd - d;

          // If the rounding digit is in the first element of xc...
          if (i < 0) {
            i += LOG_BASE;
            j = sd;
            n = xc[ni = 0];

            // Get the rounding digit at index j of n.
            rd = n / pows10[d - j - 1] % 10 | 0;
          } else {
            ni = mathceil((i + 1) / LOG_BASE);

            if (ni >= xc.length) {

              if (r) {

                // Needed by sqrt.
                for (; xc.length <= ni; xc.push(0));
                n = rd = 0;
                d = 1;
                i %= LOG_BASE;
                j = i - LOG_BASE + 1;
              } else {
                break out;
              }
            } else {
              n = k = xc[ni];

              // Get the number of digits of n.
              for (d = 1; k >= 10; k /= 10, d++);

              // Get the index of rd within n.
              i %= LOG_BASE;

              // Get the index of rd within n, adjusted for leading zeros.
              // The number of leading zeros of n is given by LOG_BASE - d.
              j = i - LOG_BASE + d;

              // Get the rounding digit at index j of n.
              rd = j < 0 ? 0 : n / pows10[d - j - 1] % 10 | 0;
            }
          }

          r = r || sd < 0 ||

          // Are there any non-zero digits after the rounding digit?
          // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
          // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
           xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);

          r = rm < 4
           ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
           : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 &&

            // Check whether the digit to the left of the rounding digit is odd.
            ((i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10) & 1 ||
             rm == (x.s < 0 ? 8 : 7));

          if (sd < 1 || !xc[0]) {
            xc.length = 0;

            if (r) {

              // Convert sd to decimal places.
              sd -= x.e + 1;

              // 1, 0.1, 0.01, 0.001, 0.0001 etc.
              xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
              x.e = -sd || 0;
            } else {

              // Zero.
              xc[0] = x.e = 0;
            }

            return x;
          }

          // Remove excess digits.
          if (i == 0) {
            xc.length = ni;
            k = 1;
            ni--;
          } else {
            xc.length = ni + 1;
            k = pows10[LOG_BASE - i];

            // E.g. 56700 becomes 56000 if 7 is the rounding digit.
            // j > 0 means i > number of leading zeros of n.
            xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
          }

          // Round up?
          if (r) {

            for (; ;) {

              // If the digit to be rounded up is in the first element of xc...
              if (ni == 0) {

                // i will be the length of xc[0] before k is added.
                for (i = 1, j = xc[0]; j >= 10; j /= 10, i++);
                j = xc[0] += k;
                for (k = 1; j >= 10; j /= 10, k++);

                // if i != k the length has increased.
                if (i != k) {
                  x.e++;
                  if (xc[0] == BASE) xc[0] = 1;
                }

                break;
              } else {
                xc[ni] += k;
                if (xc[ni] != BASE) break;
                xc[ni--] = 0;
                k = 1;
              }
            }
          }

          // Remove trailing zeros.
          for (i = xc.length; xc[--i] === 0; xc.pop());
        }

        // Overflow? Infinity.
        if (x.e > MAX_EXP) {
          x.c = x.e = null;

        // Underflow? Zero.
        } else if (x.e < MIN_EXP) {
          x.c = [x.e = 0];
        }
      }

      return x;
    }


    function valueOf(n) {
      var str,
        e = n.e;

      if (e === null) return n.toString();

      str = coeffToString(n.c);

      str = e <= TO_EXP_NEG || e >= TO_EXP_POS
        ? toExponential(str, e)
        : toFixedPoint(str, e, '0');

      return n.s < 0 ? '-' + str : str;
    }


    // PROTOTYPE/INSTANCE METHODS


    /*
     * Return a new BigNumber whose value is the absolute value of this BigNumber.
     */
    P.absoluteValue = P.abs = function () {
      var x = new BigNumber(this);
      if (x.s < 0) x.s = 1;
      return x;
    };


    /*
     * Return
     *   1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
     *   -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
     *   0 if they have the same value,
     *   or null if the value of either is NaN.
     */
    P.comparedTo = function (y, b) {
      return compare(this, new BigNumber(y, b));
    };


    /*
     * If dp is undefined or null or true or false, return the number of decimal places of the
     * value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
     *
     * Otherwise, if dp is a number, return a new BigNumber whose value is the value of this
     * BigNumber rounded to a maximum of dp decimal places using rounding mode rm, or
     * ROUNDING_MODE if rm is omitted.
     *
     * [dp] {number} Decimal places: integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.decimalPlaces = P.dp = function (dp, rm) {
      var c, n, v,
        x = this;

      if (dp != null) {
        intCheck(dp, 0, MAX);
        if (rm == null) rm = ROUNDING_MODE;
        else intCheck(rm, 0, 8);

        return round(new BigNumber(x), dp + x.e + 1, rm);
      }

      if (!(c = x.c)) return null;
      n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;

      // Subtract the number of trailing zeros of the last number.
      if (v = c[v]) for (; v % 10 == 0; v /= 10, n--);
      if (n < 0) n = 0;

      return n;
    };


    /*
     *  n / 0 = I
     *  n / N = N
     *  n / I = 0
     *  0 / n = 0
     *  0 / 0 = N
     *  0 / N = N
     *  0 / I = 0
     *  N / n = N
     *  N / 0 = N
     *  N / N = N
     *  N / I = N
     *  I / n = I
     *  I / 0 = I
     *  I / N = N
     *  I / I = N
     *
     * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
     * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
     */
    P.dividedBy = P.div = function (y, b) {
      return div(this, new BigNumber(y, b), DECIMAL_PLACES, ROUNDING_MODE);
    };


    /*
     * Return a new BigNumber whose value is the integer part of dividing the value of this
     * BigNumber by the value of BigNumber(y, b).
     */
    P.dividedToIntegerBy = P.idiv = function (y, b) {
      return div(this, new BigNumber(y, b), 0, 1);
    };


    /*
     * Return a BigNumber whose value is the value of this BigNumber exponentiated by n.
     *
     * If m is present, return the result modulo m.
     * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
     * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using ROUNDING_MODE.
     *
     * The modular power operation works efficiently when x, n, and m are integers, otherwise it
     * is equivalent to calculating x.exponentiatedBy(n).modulo(m) with a POW_PRECISION of 0.
     *
     * n {number|string|BigNumber} The exponent. An integer.
     * [m] {number|string|BigNumber} The modulus.
     *
     * '[BigNumber Error] Exponent not an integer: {n}'
     */
    P.exponentiatedBy = P.pow = function (n, m) {
      var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y,
        x = this;

      n = new BigNumber(n);

      // Allow NaN and ±Infinity, but not other non-integers.
      if (n.c && !n.isInteger()) {
        throw Error
          (bignumberError + 'Exponent not an integer: ' + valueOf(n));
      }

      if (m != null) m = new BigNumber(m);

      // Exponent of MAX_SAFE_INTEGER is 15.
      nIsBig = n.e > 14;

      // If x is NaN, ±Infinity, ±0 or ±1, or n is ±Infinity, NaN or ±0.
      if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {

        // The sign of the result of pow when x is negative depends on the evenness of n.
        // If +n overflows to ±Infinity, the evenness of n would be not be known.
        y = new BigNumber(Math.pow(+valueOf(x), nIsBig ? 2 - isOdd(n) : +valueOf(n)));
        return m ? y.mod(m) : y;
      }

      nIsNeg = n.s < 0;

      if (m) {

        // x % m returns NaN if abs(m) is zero, or m is NaN.
        if (m.c ? !m.c[0] : !m.s) return new BigNumber(NaN);

        isModExp = !nIsNeg && x.isInteger() && m.isInteger();

        if (isModExp) x = x.mod(m);

      // Overflow to ±Infinity: >=2**1e10 or >=1.0000024**1e15.
      // Underflow to ±0: <=0.79**1e10 or <=0.9999975**1e15.
      } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0
        // [1, 240000000]
        ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7
        // [80000000000000]  [99999750000000]
        : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {

        // If x is negative and n is odd, k = -0, else k = 0.
        k = x.s < 0 && isOdd(n) ? -0 : 0;

        // If x >= 1, k = ±Infinity.
        if (x.e > -1) k = 1 / k;

        // If n is negative return ±0, else return ±Infinity.
        return new BigNumber(nIsNeg ? 1 / k : k);

      } else if (POW_PRECISION) {

        // Truncating each coefficient array to a length of k after each multiplication
        // equates to truncating significant digits to POW_PRECISION + [28, 41],
        // i.e. there will be a minimum of 28 guard digits retained.
        k = mathceil(POW_PRECISION / LOG_BASE + 2);
      }

      if (nIsBig) {
        half = new BigNumber(0.5);
        if (nIsNeg) n.s = 1;
        nIsOdd = isOdd(n);
      } else {
        i = Math.abs(+valueOf(n));
        nIsOdd = i % 2;
      }

      y = new BigNumber(ONE);

      // Performs 54 loop iterations for n of 9007199254740991.
      for (; ;) {

        if (nIsOdd) {
          y = y.times(x);
          if (!y.c) break;

          if (k) {
            if (y.c.length > k) y.c.length = k;
          } else if (isModExp) {
            y = y.mod(m);    //y = y.minus(div(y, m, 0, MODULO_MODE).times(m));
          }
        }

        if (i) {
          i = mathfloor(i / 2);
          if (i === 0) break;
          nIsOdd = i % 2;
        } else {
          n = n.times(half);
          round(n, n.e + 1, 1);

          if (n.e > 14) {
            nIsOdd = isOdd(n);
          } else {
            i = +valueOf(n);
            if (i === 0) break;
            nIsOdd = i % 2;
          }
        }

        x = x.times(x);

        if (k) {
          if (x.c && x.c.length > k) x.c.length = k;
        } else if (isModExp) {
          x = x.mod(m);    //x = x.minus(div(x, m, 0, MODULO_MODE).times(m));
        }
      }

      if (isModExp) return y;
      if (nIsNeg) y = ONE.div(y);

      return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
    };


    /*
     * Return a new BigNumber whose value is the value of this BigNumber rounded to an integer
     * using rounding mode rm, or ROUNDING_MODE if rm is omitted.
     *
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {rm}'
     */
    P.integerValue = function (rm) {
      var n = new BigNumber(this);
      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);
      return round(n, n.e + 1, rm);
    };


    /*
     * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
     * otherwise return false.
     */
    P.isEqualTo = P.eq = function (y, b) {
      return compare(this, new BigNumber(y, b)) === 0;
    };


    /*
     * Return true if the value of this BigNumber is a finite number, otherwise return false.
     */
    P.isFinite = function () {
      return !!this.c;
    };


    /*
     * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
     * otherwise return false.
     */
    P.isGreaterThan = P.gt = function (y, b) {
      return compare(this, new BigNumber(y, b)) > 0;
    };


    /*
     * Return true if the value of this BigNumber is greater than or equal to the value of
     * BigNumber(y, b), otherwise return false.
     */
    P.isGreaterThanOrEqualTo = P.gte = function (y, b) {
      return (b = compare(this, new BigNumber(y, b))) === 1 || b === 0;

    };


    /*
     * Return true if the value of this BigNumber is an integer, otherwise return false.
     */
    P.isInteger = function () {
      return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
    };


    /*
     * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
     * otherwise return false.
     */
    P.isLessThan = P.lt = function (y, b) {
      return compare(this, new BigNumber(y, b)) < 0;
    };


    /*
     * Return true if the value of this BigNumber is less than or equal to the value of
     * BigNumber(y, b), otherwise return false.
     */
    P.isLessThanOrEqualTo = P.lte = function (y, b) {
      return (b = compare(this, new BigNumber(y, b))) === -1 || b === 0;
    };


    /*
     * Return true if the value of this BigNumber is NaN, otherwise return false.
     */
    P.isNaN = function () {
      return !this.s;
    };


    /*
     * Return true if the value of this BigNumber is negative, otherwise return false.
     */
    P.isNegative = function () {
      return this.s < 0;
    };


    /*
     * Return true if the value of this BigNumber is positive, otherwise return false.
     */
    P.isPositive = function () {
      return this.s > 0;
    };


    /*
     * Return true if the value of this BigNumber is 0 or -0, otherwise return false.
     */
    P.isZero = function () {
      return !!this.c && this.c[0] == 0;
    };


    /*
     *  n - 0 = n
     *  n - N = N
     *  n - I = -I
     *  0 - n = -n
     *  0 - 0 = 0
     *  0 - N = N
     *  0 - I = -I
     *  N - n = N
     *  N - 0 = N
     *  N - N = N
     *  N - I = N
     *  I - n = I
     *  I - 0 = I
     *  I - N = N
     *  I - I = N
     *
     * Return a new BigNumber whose value is the value of this BigNumber minus the value of
     * BigNumber(y, b).
     */
    P.minus = function (y, b) {
      var i, j, t, xLTy,
        x = this,
        a = x.s;

      y = new BigNumber(y, b);
      b = y.s;

      // Either NaN?
      if (!a || !b) return new BigNumber(NaN);

      // Signs differ?
      if (a != b) {
        y.s = -b;
        return x.plus(y);
      }

      var xe = x.e / LOG_BASE,
        ye = y.e / LOG_BASE,
        xc = x.c,
        yc = y.c;

      if (!xe || !ye) {

        // Either Infinity?
        if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber(yc ? x : NaN);

        // Either zero?
        if (!xc[0] || !yc[0]) {

          // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
          return yc[0] ? (y.s = -b, y) : new BigNumber(xc[0] ? x :

           // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
           ROUNDING_MODE == 3 ? -0 : 0);
        }
      }

      xe = bitFloor(xe);
      ye = bitFloor(ye);
      xc = xc.slice();

      // Determine which is the bigger number.
      if (a = xe - ye) {

        if (xLTy = a < 0) {
          a = -a;
          t = xc;
        } else {
          ye = xe;
          t = yc;
        }

        t.reverse();

        // Prepend zeros to equalise exponents.
        for (b = a; b--; t.push(0));
        t.reverse();
      } else {

        // Exponents equal. Check digit by digit.
        j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;

        for (a = b = 0; b < j; b++) {

          if (xc[b] != yc[b]) {
            xLTy = xc[b] < yc[b];
            break;
          }
        }
      }

      // x < y? Point xc to the array of the bigger number.
      if (xLTy) t = xc, xc = yc, yc = t, y.s = -y.s;

      b = (j = yc.length) - (i = xc.length);

      // Append zeros to xc if shorter.
      // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
      if (b > 0) for (; b--; xc[i++] = 0);
      b = BASE - 1;

      // Subtract yc from xc.
      for (; j > a;) {

        if (xc[--j] < yc[j]) {
          for (i = j; i && !xc[--i]; xc[i] = b);
          --xc[i];
          xc[j] += BASE;
        }

        xc[j] -= yc[j];
      }

      // Remove leading zeros and adjust exponent accordingly.
      for (; xc[0] == 0; xc.splice(0, 1), --ye);

      // Zero?
      if (!xc[0]) {

        // Following IEEE 754 (2008) 6.3,
        // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
        y.s = ROUNDING_MODE == 3 ? -1 : 1;
        y.c = [y.e = 0];
        return y;
      }

      // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
      // for finite x and y.
      return normalise(y, xc, ye);
    };


    /*
     *   n % 0 =  N
     *   n % N =  N
     *   n % I =  n
     *   0 % n =  0
     *  -0 % n = -0
     *   0 % 0 =  N
     *   0 % N =  N
     *   0 % I =  0
     *   N % n =  N
     *   N % 0 =  N
     *   N % N =  N
     *   N % I =  N
     *   I % n =  N
     *   I % 0 =  N
     *   I % N =  N
     *   I % I =  N
     *
     * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
     * BigNumber(y, b). The result depends on the value of MODULO_MODE.
     */
    P.modulo = P.mod = function (y, b) {
      var q, s,
        x = this;

      y = new BigNumber(y, b);

      // Return NaN if x is Infinity or NaN, or y is NaN or zero.
      if (!x.c || !y.s || y.c && !y.c[0]) {
        return new BigNumber(NaN);

      // Return x if y is Infinity or x is zero.
      } else if (!y.c || x.c && !x.c[0]) {
        return new BigNumber(x);
      }

      if (MODULO_MODE == 9) {

        // Euclidian division: q = sign(y) * floor(x / abs(y))
        // r = x - qy    where  0 <= r < abs(y)
        s = y.s;
        y.s = 1;
        q = div(x, y, 0, 3);
        y.s = s;
        q.s *= s;
      } else {
        q = div(x, y, 0, MODULO_MODE);
      }

      y = x.minus(q.times(y));

      // To match JavaScript %, ensure sign of zero is sign of dividend.
      if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;

      return y;
    };


    /*
     *  n * 0 = 0
     *  n * N = N
     *  n * I = I
     *  0 * n = 0
     *  0 * 0 = 0
     *  0 * N = N
     *  0 * I = N
     *  N * n = N
     *  N * 0 = N
     *  N * N = N
     *  N * I = N
     *  I * n = I
     *  I * 0 = N
     *  I * N = N
     *  I * I = I
     *
     * Return a new BigNumber whose value is the value of this BigNumber multiplied by the value
     * of BigNumber(y, b).
     */
    P.multipliedBy = P.times = function (y, b) {
      var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
        base, sqrtBase,
        x = this,
        xc = x.c,
        yc = (y = new BigNumber(y, b)).c;

      // Either NaN, ±Infinity or ±0?
      if (!xc || !yc || !xc[0] || !yc[0]) {

        // Return NaN if either is NaN, or one is 0 and the other is Infinity.
        if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
          y.c = y.e = y.s = null;
        } else {
          y.s *= x.s;

          // Return ±Infinity if either is ±Infinity.
          if (!xc || !yc) {
            y.c = y.e = null;

          // Return ±0 if either is ±0.
          } else {
            y.c = [0];
            y.e = 0;
          }
        }

        return y;
      }

      e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
      y.s *= x.s;
      xcL = xc.length;
      ycL = yc.length;

      // Ensure xc points to longer array and xcL to its length.
      if (xcL < ycL) zc = xc, xc = yc, yc = zc, i = xcL, xcL = ycL, ycL = i;

      // Initialise the result array with zeros.
      for (i = xcL + ycL, zc = []; i--; zc.push(0));

      base = BASE;
      sqrtBase = SQRT_BASE;

      for (i = ycL; --i >= 0;) {
        c = 0;
        ylo = yc[i] % sqrtBase;
        yhi = yc[i] / sqrtBase | 0;

        for (k = xcL, j = i + k; j > i;) {
          xlo = xc[--k] % sqrtBase;
          xhi = xc[k] / sqrtBase | 0;
          m = yhi * xlo + xhi * ylo;
          xlo = ylo * xlo + ((m % sqrtBase) * sqrtBase) + zc[j] + c;
          c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
          zc[j--] = xlo % base;
        }

        zc[j] = c;
      }

      if (c) {
        ++e;
      } else {
        zc.splice(0, 1);
      }

      return normalise(y, zc, e);
    };


    /*
     * Return a new BigNumber whose value is the value of this BigNumber negated,
     * i.e. multiplied by -1.
     */
    P.negated = function () {
      var x = new BigNumber(this);
      x.s = -x.s || null;
      return x;
    };


    /*
     *  n + 0 = n
     *  n + N = N
     *  n + I = I
     *  0 + n = n
     *  0 + 0 = 0
     *  0 + N = N
     *  0 + I = I
     *  N + n = N
     *  N + 0 = N
     *  N + N = N
     *  N + I = N
     *  I + n = I
     *  I + 0 = I
     *  I + N = N
     *  I + I = I
     *
     * Return a new BigNumber whose value is the value of this BigNumber plus the value of
     * BigNumber(y, b).
     */
    P.plus = function (y, b) {
      var t,
        x = this,
        a = x.s;

      y = new BigNumber(y, b);
      b = y.s;

      // Either NaN?
      if (!a || !b) return new BigNumber(NaN);

      // Signs differ?
       if (a != b) {
        y.s = -b;
        return x.minus(y);
      }

      var xe = x.e / LOG_BASE,
        ye = y.e / LOG_BASE,
        xc = x.c,
        yc = y.c;

      if (!xe || !ye) {

        // Return ±Infinity if either ±Infinity.
        if (!xc || !yc) return new BigNumber(a / 0);

        // Either zero?
        // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
        if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber(xc[0] ? x : a * 0);
      }

      xe = bitFloor(xe);
      ye = bitFloor(ye);
      xc = xc.slice();

      // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
      if (a = xe - ye) {
        if (a > 0) {
          ye = xe;
          t = yc;
        } else {
          a = -a;
          t = xc;
        }

        t.reverse();
        for (; a--; t.push(0));
        t.reverse();
      }

      a = xc.length;
      b = yc.length;

      // Point xc to the longer array, and b to the shorter length.
      if (a - b < 0) t = yc, yc = xc, xc = t, b = a;

      // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
      for (a = 0; b;) {
        a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
        xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
      }

      if (a) {
        xc = [a].concat(xc);
        ++ye;
      }

      // No need to check for zero, as +x + +y != 0 && -x + -y != 0
      // ye = MAX_EXP + 1 possible
      return normalise(y, xc, ye);
    };


    /*
     * If sd is undefined or null or true or false, return the number of significant digits of
     * the value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
     * If sd is true include integer-part trailing zeros in the count.
     *
     * Otherwise, if sd is a number, return a new BigNumber whose value is the value of this
     * BigNumber rounded to a maximum of sd significant digits using rounding mode rm, or
     * ROUNDING_MODE if rm is omitted.
     *
     * sd {number|boolean} number: significant digits: integer, 1 to MAX inclusive.
     *                     boolean: whether to count integer-part trailing zeros: true or false.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
     */
    P.precision = P.sd = function (sd, rm) {
      var c, n, v,
        x = this;

      if (sd != null && sd !== !!sd) {
        intCheck(sd, 1, MAX);
        if (rm == null) rm = ROUNDING_MODE;
        else intCheck(rm, 0, 8);

        return round(new BigNumber(x), sd, rm);
      }

      if (!(c = x.c)) return null;
      v = c.length - 1;
      n = v * LOG_BASE + 1;

      if (v = c[v]) {

        // Subtract the number of trailing zeros of the last element.
        for (; v % 10 == 0; v /= 10, n--);

        // Add the number of digits of the first element.
        for (v = c[0]; v >= 10; v /= 10, n++);
      }

      if (sd && x.e + 1 > n) n = x.e + 1;

      return n;
    };


    /*
     * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
     * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
     *
     * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {k}'
     */
    P.shiftedBy = function (k) {
      intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
      return this.times('1e' + k);
    };


    /*
     *  sqrt(-n) =  N
     *  sqrt(N) =  N
     *  sqrt(-I) =  N
     *  sqrt(I) =  I
     *  sqrt(0) =  0
     *  sqrt(-0) = -0
     *
     * Return a new BigNumber whose value is the square root of the value of this BigNumber,
     * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
     */
    P.squareRoot = P.sqrt = function () {
      var m, n, r, rep, t,
        x = this,
        c = x.c,
        s = x.s,
        e = x.e,
        dp = DECIMAL_PLACES + 4,
        half = new BigNumber('0.5');

      // Negative/NaN/Infinity/zero?
      if (s !== 1 || !c || !c[0]) {
        return new BigNumber(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
      }

      // Initial estimate.
      s = Math.sqrt(+valueOf(x));

      // Math.sqrt underflow/overflow?
      // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
      if (s == 0 || s == 1 / 0) {
        n = coeffToString(c);
        if ((n.length + e) % 2 == 0) n += '0';
        s = Math.sqrt(+n);
        e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);

        if (s == 1 / 0) {
          n = '5e' + e;
        } else {
          n = s.toExponential();
          n = n.slice(0, n.indexOf('e') + 1) + e;
        }

        r = new BigNumber(n);
      } else {
        r = new BigNumber(s + '');
      }

      // Check for zero.
      // r could be zero if MIN_EXP is changed after the this value was created.
      // This would cause a division by zero (x/t) and hence Infinity below, which would cause
      // coeffToString to throw.
      if (r.c[0]) {
        e = r.e;
        s = e + dp;
        if (s < 3) s = 0;

        // Newton-Raphson iteration.
        for (; ;) {
          t = r;
          r = half.times(t.plus(div(x, t, dp, 1)));

          if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {

            // The exponent of r may here be one less than the final result exponent,
            // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
            // are indexed correctly.
            if (r.e < e) --s;
            n = n.slice(s - 3, s + 1);

            // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
            // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
            // iteration.
            if (n == '9999' || !rep && n == '4999') {

              // On the first iteration only, check to see if rounding up gives the
              // exact result as the nines may infinitely repeat.
              if (!rep) {
                round(t, t.e + DECIMAL_PLACES + 2, 0);

                if (t.times(t).eq(x)) {
                  r = t;
                  break;
                }
              }

              dp += 4;
              s += 4;
              rep = 1;
            } else {

              // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
              // result. If not, then there are further digits and m will be truthy.
              if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

                // Truncate to the first rounding digit.
                round(r, r.e + DECIMAL_PLACES + 2, 1);
                m = !r.times(r).eq(x);
              }

              break;
            }
          }
        }
      }

      return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
    };


    /*
     * Return a string representing the value of this BigNumber in exponential notation and
     * rounded using ROUNDING_MODE to dp fixed decimal places.
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.toExponential = function (dp, rm) {
      if (dp != null) {
        intCheck(dp, 0, MAX);
        dp++;
      }
      return format(this, dp, rm, 1);
    };


    /*
     * Return a string representing the value of this BigNumber in fixed-point notation rounding
     * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
     *
     * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
     * but e.g. (-0.00001).toFixed(0) is '-0'.
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.toFixed = function (dp, rm) {
      if (dp != null) {
        intCheck(dp, 0, MAX);
        dp = dp + this.e + 1;
      }
      return format(this, dp, rm);
    };


    /*
     * Return a string representing the value of this BigNumber in fixed-point notation rounded
     * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
     * of the format or FORMAT object (see BigNumber.set).
     *
     * The formatting object may contain some or all of the properties shown below.
     *
     * FORMAT = {
     *   prefix: '',
     *   groupSize: 3,
     *   secondaryGroupSize: 0,
     *   groupSeparator: ',',
     *   decimalSeparator: '.',
     *   fractionGroupSize: 0,
     *   fractionGroupSeparator: '\xA0',      // non-breaking space
     *   suffix: ''
     * };
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     * [format] {object} Formatting options. See FORMAT pbject above.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     * '[BigNumber Error] Argument not an object: {format}'
     */
    P.toFormat = function (dp, rm, format) {
      var str,
        x = this;

      if (format == null) {
        if (dp != null && rm && typeof rm == 'object') {
          format = rm;
          rm = null;
        } else if (dp && typeof dp == 'object') {
          format = dp;
          dp = rm = null;
        } else {
          format = FORMAT;
        }
      } else if (typeof format != 'object') {
        throw Error
          (bignumberError + 'Argument not an object: ' + format);
      }

      str = x.toFixed(dp, rm);

      if (x.c) {
        var i,
          arr = str.split('.'),
          g1 = +format.groupSize,
          g2 = +format.secondaryGroupSize,
          groupSeparator = format.groupSeparator || '',
          intPart = arr[0],
          fractionPart = arr[1],
          isNeg = x.s < 0,
          intDigits = isNeg ? intPart.slice(1) : intPart,
          len = intDigits.length;

        if (g2) i = g1, g1 = g2, g2 = i, len -= i;

        if (g1 > 0 && len > 0) {
          i = len % g1 || g1;
          intPart = intDigits.substr(0, i);
          for (; i < len; i += g1) intPart += groupSeparator + intDigits.substr(i, g1);
          if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
          if (isNeg) intPart = '-' + intPart;
        }

        str = fractionPart
         ? intPart + (format.decimalSeparator || '') + ((g2 = +format.fractionGroupSize)
          ? fractionPart.replace(new RegExp('\\d{' + g2 + '}\\B', 'g'),
           '$&' + (format.fractionGroupSeparator || ''))
          : fractionPart)
         : intPart;
      }

      return (format.prefix || '') + str + (format.suffix || '');
    };


    /*
     * Return an array of two BigNumbers representing the value of this BigNumber as a simple
     * fraction with an integer numerator and an integer denominator.
     * The denominator will be a positive non-zero value less than or equal to the specified
     * maximum denominator. If a maximum denominator is not specified, the denominator will be
     * the lowest value necessary to represent the number exactly.
     *
     * [md] {number|string|BigNumber} Integer >= 1, or Infinity. The maximum denominator.
     *
     * '[BigNumber Error] Argument {not an integer|out of range} : {md}'
     */
    P.toFraction = function (md) {
      var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s,
        x = this,
        xc = x.c;

      if (md != null) {
        n = new BigNumber(md);

        // Throw if md is less than one or is not an integer, unless it is Infinity.
        if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
          throw Error
            (bignumberError + 'Argument ' +
              (n.isInteger() ? 'out of range: ' : 'not an integer: ') + valueOf(n));
        }
      }

      if (!xc) return new BigNumber(x);

      d = new BigNumber(ONE);
      n1 = d0 = new BigNumber(ONE);
      d1 = n0 = new BigNumber(ONE);
      s = coeffToString(xc);

      // Determine initial denominator.
      // d is a power of 10 and the minimum max denominator that specifies the value exactly.
      e = d.e = s.length - x.e - 1;
      d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
      md = !md || n.comparedTo(d) > 0 ? (e > 0 ? d : n1) : n;

      exp = MAX_EXP;
      MAX_EXP = 1 / 0;
      n = new BigNumber(s);

      // n0 = d1 = 0
      n0.c[0] = 0;

      for (; ;)  {
        q = div(n, d, 0, 1);
        d2 = d0.plus(q.times(d1));
        if (d2.comparedTo(md) == 1) break;
        d0 = d1;
        d1 = d2;
        n1 = n0.plus(q.times(d2 = n1));
        n0 = d2;
        d = n.minus(q.times(d2 = d));
        n = d2;
      }

      d2 = div(md.minus(d0), d1, 0, 1);
      n0 = n0.plus(d2.times(n1));
      d0 = d0.plus(d2.times(d1));
      n0.s = n1.s = x.s;
      e = e * 2;

      // Determine which fraction is closer to x, n0/d0 or n1/d1
      r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
          div(n0, d0, e, ROUNDING_MODE).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];

      MAX_EXP = exp;

      return r;
    };


    /*
     * Return the value of this BigNumber converted to a number primitive.
     */
    P.toNumber = function () {
      return +valueOf(this);
    };


    /*
     * Return a string representing the value of this BigNumber rounded to sd significant digits
     * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
     * necessary to represent the integer part of the value in fixed-point notation, then use
     * exponential notation.
     *
     * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
     */
    P.toPrecision = function (sd, rm) {
      if (sd != null) intCheck(sd, 1, MAX);
      return format(this, sd, rm, 2);
    };


    /*
     * Return a string representing the value of this BigNumber in base b, or base 10 if b is
     * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
     * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
     * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
     * TO_EXP_NEG, return exponential notation.
     *
     * [b] {number} Integer, 2 to ALPHABET.length inclusive.
     *
     * '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
     */
    P.toString = function (b) {
      var str,
        n = this,
        s = n.s,
        e = n.e;

      // Infinity or NaN?
      if (e === null) {
        if (s) {
          str = 'Infinity';
          if (s < 0) str = '-' + str;
        } else {
          str = 'NaN';
        }
      } else {
        if (b == null) {
          str = e <= TO_EXP_NEG || e >= TO_EXP_POS
           ? toExponential(coeffToString(n.c), e)
           : toFixedPoint(coeffToString(n.c), e, '0');
        } else if (b === 10) {
          n = round(new BigNumber(n), DECIMAL_PLACES + e + 1, ROUNDING_MODE);
          str = toFixedPoint(coeffToString(n.c), n.e, '0');
        } else {
          intCheck(b, 2, ALPHABET.length, 'Base');
          str = convertBase(toFixedPoint(coeffToString(n.c), e, '0'), 10, b, s, true);
        }

        if (s < 0 && n.c[0]) str = '-' + str;
      }

      return str;
    };


    /*
     * Return as toString, but do not accept a base argument, and include the minus sign for
     * negative zero.
     */
    P.valueOf = P.toJSON = function () {
      return valueOf(this);
    };


    P._isBigNumber = true;

    if (configObject != null) BigNumber.set(configObject);

    return BigNumber;
  }


  // PRIVATE HELPER FUNCTIONS

  // These functions don't need access to variables,
  // e.g. DECIMAL_PLACES, in the scope of the `clone` function above.


  function bitFloor(n) {
    var i = n | 0;
    return n > 0 || n === i ? i : i - 1;
  }


  // Return a coefficient array as a string of base 10 digits.
  function coeffToString(a) {
    var s, z,
      i = 1,
      j = a.length,
      r = a[0] + '';

    for (; i < j;) {
      s = a[i++] + '';
      z = LOG_BASE - s.length;
      for (; z--; s = '0' + s);
      r += s;
    }

    // Determine trailing zeros.
    for (j = r.length; r.charCodeAt(--j) === 48;);

    return r.slice(0, j + 1 || 1);
  }


  // Compare the value of BigNumbers x and y.
  function compare(x, y) {
    var a, b,
      xc = x.c,
      yc = y.c,
      i = x.s,
      j = y.s,
      k = x.e,
      l = y.e;

    // Either NaN?
    if (!i || !j) return null;

    a = xc && !xc[0];
    b = yc && !yc[0];

    // Either zero?
    if (a || b) return a ? b ? 0 : -j : i;

    // Signs differ?
    if (i != j) return i;

    a = i < 0;
    b = k == l;

    // Either Infinity?
    if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;

    // Compare exponents.
    if (!b) return k > l ^ a ? 1 : -1;

    j = (k = xc.length) < (l = yc.length) ? k : l;

    // Compare digit by digit.
    for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;

    // Compare lengths.
    return k == l ? 0 : k > l ^ a ? 1 : -1;
  }


  /*
   * Check that n is a primitive number, an integer, and in range, otherwise throw.
   */
  function intCheck(n, min, max, name) {
    if (n < min || n > max || n !== mathfloor(n)) {
      throw Error
       (bignumberError + (name || 'Argument') + (typeof n == 'number'
         ? n < min || n > max ? ' out of range: ' : ' not an integer: '
         : ' not a primitive number: ') + String(n));
    }
  }


  // Assumes finite n.
  function isOdd(n) {
    var k = n.c.length - 1;
    return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
  }


  function toExponential(str, e) {
    return (str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str) +
     (e < 0 ? 'e' : 'e+') + e;
  }


  function toFixedPoint(str, e, z) {
    var len, zs;

    // Negative exponent?
    if (e < 0) {

      // Prepend zeros.
      for (zs = z + '.'; ++e; zs += z);
      str = zs + str;

    // Positive exponent
    } else {
      len = str.length;

      // Append zeros.
      if (++e > len) {
        for (zs = z, e -= len; --e; zs += z);
        str += zs;
      } else if (e < len) {
        str = str.slice(0, e) + '.' + str.slice(e);
      }
    }

    return str;
  }


  // EXPORT


  BigNumber = clone();
  BigNumber['default'] = BigNumber.BigNumber = BigNumber;

  // AMD.
  if (typeof define == 'function' && define.amd) {
    define(function () { return BigNumber; });

  // Node.js and other environments that support module.exports.
  } else if (typeof module != 'undefined' && module.exports) {
    module.exports = BigNumber;

  // Browser.
  } else {
    if (!globalObject) {
      globalObject = typeof self != 'undefined' && self ? self : window;
    }

    globalObject.BigNumber = BigNumber;
  }
})(this);

},{}],3:[function(require,module,exports){
'use strict'

const Bignumber = require('bignumber.js').BigNumber

exports.MT = {
  POS_INT: 0,
  NEG_INT: 1,
  BYTE_STRING: 2,
  UTF8_STRING: 3,
  ARRAY: 4,
  MAP: 5,
  TAG: 6,
  SIMPLE_FLOAT: 7
}

exports.TAG = {
  DATE_STRING: 0,
  DATE_EPOCH: 1,
  POS_BIGINT: 2,
  NEG_BIGINT: 3,
  DECIMAL_FRAC: 4,
  BIGFLOAT: 5,
  BASE64URL_EXPECTED: 21,
  BASE64_EXPECTED: 22,
  BASE16_EXPECTED: 23,
  CBOR: 24,
  URI: 32,
  BASE64URL: 33,
  BASE64: 34,
  REGEXP: 35,
  MIME: 36
}

exports.NUMBYTES = {
  ZERO: 0,
  ONE: 24,
  TWO: 25,
  FOUR: 26,
  EIGHT: 27,
  INDEFINITE: 31
}

exports.SIMPLE = {
  FALSE: 20,
  TRUE: 21,
  NULL: 22,
  UNDEFINED: 23
}

exports.SYMS = {
  NULL: Symbol('null'),
  UNDEFINED: Symbol('undef'),
  PARENT: Symbol('parent'),
  BREAK: Symbol('break'),
  STREAM: Symbol('stream')
}

exports.SHIFT32 = Math.pow(2, 32)
exports.SHIFT16 = Math.pow(2, 16)

exports.MAX_SAFE_HIGH = 0x1fffff
exports.NEG_ONE = new Bignumber(-1)
exports.TEN = new Bignumber(10)
exports.TWO = new Bignumber(2)

exports.PARENT = {
  ARRAY: 0,
  OBJECT: 1,
  MAP: 2,
  TAG: 3,
  BYTE_STRING: 4,
  UTF8_STRING: 5
}

},{"bignumber.js":2}],4:[function(require,module,exports){
/* eslint-disable */

module.exports = function decodeAsm (stdlib, foreign, buffer) {
  'use asm'

  // -- Imports

  var heap = new stdlib.Uint8Array(buffer)
  // var log = foreign.log
  var pushInt = foreign.pushInt
  var pushInt32 = foreign.pushInt32
  var pushInt32Neg = foreign.pushInt32Neg
  var pushInt64 = foreign.pushInt64
  var pushInt64Neg = foreign.pushInt64Neg
  var pushFloat = foreign.pushFloat
  var pushFloatSingle = foreign.pushFloatSingle
  var pushFloatDouble = foreign.pushFloatDouble
  var pushTrue = foreign.pushTrue
  var pushFalse = foreign.pushFalse
  var pushUndefined = foreign.pushUndefined
  var pushNull = foreign.pushNull
  var pushInfinity = foreign.pushInfinity
  var pushInfinityNeg = foreign.pushInfinityNeg
  var pushNaN = foreign.pushNaN
  var pushNaNNeg = foreign.pushNaNNeg

  var pushArrayStart = foreign.pushArrayStart
  var pushArrayStartFixed = foreign.pushArrayStartFixed
  var pushArrayStartFixed32 = foreign.pushArrayStartFixed32
  var pushArrayStartFixed64 = foreign.pushArrayStartFixed64
  var pushObjectStart = foreign.pushObjectStart
  var pushObjectStartFixed = foreign.pushObjectStartFixed
  var pushObjectStartFixed32 = foreign.pushObjectStartFixed32
  var pushObjectStartFixed64 = foreign.pushObjectStartFixed64

  var pushByteString = foreign.pushByteString
  var pushByteStringStart = foreign.pushByteStringStart
  var pushUtf8String = foreign.pushUtf8String
  var pushUtf8StringStart = foreign.pushUtf8StringStart

  var pushSimpleUnassigned = foreign.pushSimpleUnassigned

  var pushTagStart = foreign.pushTagStart
  var pushTagStart4 = foreign.pushTagStart4
  var pushTagStart8 = foreign.pushTagStart8
  var pushTagUnassigned = foreign.pushTagUnassigned

  var pushBreak = foreign.pushBreak

  var pow = stdlib.Math.pow

  // -- Constants


  // -- Mutable Variables

  var offset = 0
  var inputLength = 0
  var code = 0

  // Decode a cbor string represented as Uint8Array
  // which is allocated on the heap from 0 to inputLength
  //
  // input - Int
  //
  // Returns Code - Int,
  // Success = 0
  // Error > 0
  function parse (input) {
    input = input | 0

    offset = 0
    inputLength = input

    while ((offset | 0) < (inputLength | 0)) {
      code = jumpTable[heap[offset] & 255](heap[offset] | 0) | 0

      if ((code | 0) > 0) {
        break
      }
    }

    return code | 0
  }

  // -- Helper Function

  function checkOffset (n) {
    n = n | 0

    if ((((offset | 0) + (n | 0)) | 0) < (inputLength | 0)) {
      return 0
    }

    return 1
  }

  function readUInt16 (n) {
    n = n | 0

    return (
      (heap[n | 0] << 8) | heap[(n + 1) | 0]
    ) | 0
  }

  function readUInt32 (n) {
    n = n | 0

    return (
      (heap[n | 0] << 24) | (heap[(n + 1) | 0] << 16) | (heap[(n + 2) | 0] << 8) | heap[(n + 3) | 0]
    ) | 0
  }

  // -- Initial Byte Handlers

  function INT_P (octet) {
    octet = octet | 0

    pushInt(octet | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function UINT_P_8 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushInt(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2) | 0

    return 0
  }

  function UINT_P_16 (octet) {
    octet = octet | 0

    if (checkOffset(2) | 0) {
      return 1
    }

    pushInt(
      readUInt16((offset + 1) | 0) | 0
    )

    offset = (offset + 3) | 0

    return 0
  }

  function UINT_P_32 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushInt32(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function UINT_P_64 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushInt64(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function INT_N (octet) {
    octet = octet | 0

    pushInt((-1 - ((octet - 32) | 0)) | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function UINT_N_8 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushInt(
      (-1 - (heap[(offset + 1) | 0] | 0)) | 0
    )

    offset = (offset + 2) | 0

    return 0
  }

  function UINT_N_16 (octet) {
    octet = octet | 0

    var val = 0

    if (checkOffset(2) | 0) {
      return 1
    }

    val = readUInt16((offset + 1) | 0) | 0
    pushInt((-1 - (val | 0)) | 0)

    offset = (offset + 3) | 0

    return 0
  }

  function UINT_N_32 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushInt32Neg(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function UINT_N_64 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushInt64Neg(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function BYTE_STRING (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var step = 0

    step = (octet - 64) | 0
    if (checkOffset(step | 0) | 0) {
      return 1
    }

    start = (offset + 1) | 0
    end = (((offset + 1) | 0) + (step | 0)) | 0

    pushByteString(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function BYTE_STRING_8 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(1) | 0) {
      return 1
    }

    length = heap[(offset + 1) | 0] | 0
    start = (offset + 2) | 0
    end = (((offset + 2) | 0) + (length | 0)) | 0

    if (checkOffset((length + 1) | 0) | 0) {
      return 1
    }

    pushByteString(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function BYTE_STRING_16 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(2) | 0) {
      return 1
    }

    length = readUInt16((offset + 1) | 0) | 0
    start = (offset + 3) | 0
    end = (((offset + 3) | 0) + (length | 0)) | 0


    if (checkOffset((length + 2) | 0) | 0) {
      return 1
    }

    pushByteString(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function BYTE_STRING_32 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(4) | 0) {
      return 1
    }

    length = readUInt32((offset + 1) | 0) | 0
    start = (offset + 5) | 0
    end = (((offset + 5) | 0) + (length | 0)) | 0


    if (checkOffset((length + 4) | 0) | 0) {
      return 1
    }

    pushByteString(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function BYTE_STRING_64 (octet) {
    // NOT IMPLEMENTED
    octet = octet | 0

    return 1
  }

  function BYTE_STRING_BREAK (octet) {
    octet = octet | 0

    pushByteStringStart()

    offset = (offset + 1) | 0

    return 0
  }

  function UTF8_STRING (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var step = 0

    step = (octet - 96) | 0

    if (checkOffset(step | 0) | 0) {
      return 1
    }

    start = (offset + 1) | 0
    end = (((offset + 1) | 0) + (step | 0)) | 0

    pushUtf8String(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function UTF8_STRING_8 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(1) | 0) {
      return 1
    }

    length = heap[(offset + 1) | 0] | 0
    start = (offset + 2) | 0
    end = (((offset + 2) | 0) + (length | 0)) | 0

    if (checkOffset((length + 1) | 0) | 0) {
      return 1
    }

    pushUtf8String(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function UTF8_STRING_16 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(2) | 0) {
      return 1
    }

    length = readUInt16((offset + 1) | 0) | 0
    start = (offset + 3) | 0
    end = (((offset + 3) | 0) + (length | 0)) | 0

    if (checkOffset((length + 2) | 0) | 0) {
      return 1
    }

    pushUtf8String(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function UTF8_STRING_32 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(4) | 0) {
      return 1
    }

    length = readUInt32((offset + 1) | 0) | 0
    start = (offset + 5) | 0
    end = (((offset + 5) | 0) + (length | 0)) | 0

    if (checkOffset((length + 4) | 0) | 0) {
      return 1
    }

    pushUtf8String(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function UTF8_STRING_64 (octet) {
    // NOT IMPLEMENTED
    octet = octet | 0

    return 1
  }

  function UTF8_STRING_BREAK (octet) {
    octet = octet | 0

    pushUtf8StringStart()

    offset = (offset + 1) | 0

    return 0
  }

  function ARRAY (octet) {
    octet = octet | 0

    pushArrayStartFixed((octet - 128) | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function ARRAY_8 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushArrayStartFixed(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2) | 0

    return 0
  }

  function ARRAY_16 (octet) {
    octet = octet | 0

    if (checkOffset(2) | 0) {
      return 1
    }

    pushArrayStartFixed(
      readUInt16((offset + 1) | 0) | 0
    )

    offset = (offset + 3) | 0

    return 0
  }

  function ARRAY_32 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushArrayStartFixed32(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function ARRAY_64 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushArrayStartFixed64(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function ARRAY_BREAK (octet) {
    octet = octet | 0

    pushArrayStart()

    offset = (offset + 1) | 0

    return 0
  }

  function MAP (octet) {
    octet = octet | 0

    var step = 0

    step = (octet - 160) | 0

    if (checkOffset(step | 0) | 0) {
      return 1
    }

    pushObjectStartFixed(step | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function MAP_8 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushObjectStartFixed(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2) | 0

    return 0
  }

  function MAP_16 (octet) {
    octet = octet | 0

    if (checkOffset(2) | 0) {
      return 1
    }

    pushObjectStartFixed(
      readUInt16((offset + 1) | 0) | 0
    )

    offset = (offset + 3) | 0

    return 0
  }

  function MAP_32 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushObjectStartFixed32(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function MAP_64 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushObjectStartFixed64(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function MAP_BREAK (octet) {
    octet = octet | 0

    pushObjectStart()

    offset = (offset + 1) | 0

    return 0
  }

  function TAG_KNOWN (octet) {
    octet = octet | 0

    pushTagStart((octet - 192| 0) | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BIGNUM_POS (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BIGNUM_NEG (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_FRAC (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BIGNUM_FLOAT (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_UNASSIGNED (octet) {
    octet = octet | 0

    pushTagStart((octet - 192| 0) | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BASE64_URL (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BASE64 (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BASE16 (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_MORE_1 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushTagStart(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2 | 0)

    return 0
  }

  function TAG_MORE_2 (octet) {
    octet = octet | 0

    if (checkOffset(2) | 0) {
      return 1
    }

    pushTagStart(
      readUInt16((offset + 1) | 0) | 0
    )

    offset = (offset + 3 | 0)

    return 0
  }

  function TAG_MORE_4 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushTagStart4(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5 | 0)

    return 0
  }

  function TAG_MORE_8 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushTagStart8(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9 | 0)

    return 0
  }

  function SIMPLE_UNASSIGNED (octet) {
    octet = octet | 0

    pushSimpleUnassigned(((octet | 0) - 224) | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_FALSE (octet) {
    octet = octet | 0

    pushFalse()

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_TRUE (octet) {
    octet = octet | 0

    pushTrue()

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_NULL (octet) {
    octet = octet | 0

    pushNull()

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_UNDEFINED (octet) {
    octet = octet | 0

    pushUndefined()

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_BYTE (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushSimpleUnassigned(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2)  | 0

    return 0
  }

  function SIMPLE_FLOAT_HALF (octet) {
    octet = octet | 0

    var f = 0
    var g = 0
    var sign = 1.0
    var exp = 0.0
    var mant = 0.0
    var r = 0.0
    if (checkOffset(2) | 0) {
      return 1
    }

    f = heap[(offset + 1) | 0] | 0
    g = heap[(offset + 2) | 0] | 0

    if ((f | 0) & 0x80) {
      sign = -1.0
    }

    exp = +(((f | 0) & 0x7C) >> 2)
    mant = +((((f | 0) & 0x03) << 8) | g)

    if (+exp == 0.0) {
      pushFloat(+(
        (+sign) * +5.9604644775390625e-8 * (+mant)
      ))
    } else if (+exp == 31.0) {
      if (+sign == 1.0) {
        if (+mant > 0.0) {
          pushNaN()
        } else {
          pushInfinity()
        }
      } else {
        if (+mant > 0.0) {
          pushNaNNeg()
        } else {
          pushInfinityNeg()
        }
      }
    } else {
      pushFloat(+(
        +sign * pow(+2, +(+exp - 25.0)) * +(1024.0 + mant)
      ))
    }

    offset = (offset + 3) | 0

    return 0
  }

  function SIMPLE_FLOAT_SINGLE (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushFloatSingle(
      heap[(offset + 1) | 0] | 0,
      heap[(offset + 2) | 0] | 0,
      heap[(offset + 3) | 0] | 0,
      heap[(offset + 4) | 0] | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function SIMPLE_FLOAT_DOUBLE (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushFloatDouble(
      heap[(offset + 1) | 0] | 0,
      heap[(offset + 2) | 0] | 0,
      heap[(offset + 3) | 0] | 0,
      heap[(offset + 4) | 0] | 0,
      heap[(offset + 5) | 0] | 0,
      heap[(offset + 6) | 0] | 0,
      heap[(offset + 7) | 0] | 0,
      heap[(offset + 8) | 0] | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function ERROR (octet) {
    octet = octet | 0

    return 1
  }

  function BREAK (octet) {
    octet = octet | 0

    pushBreak()

    offset = (offset + 1) | 0

    return 0
  }

  // -- Jump Table

  var jumpTable = [
    // Integer 0x00..0x17 (0..23)
    INT_P, // 0x00
    INT_P, // 0x01
    INT_P, // 0x02
    INT_P, // 0x03
    INT_P, // 0x04
    INT_P, // 0x05
    INT_P, // 0x06
    INT_P, // 0x07
    INT_P, // 0x08
    INT_P, // 0x09
    INT_P, // 0x0A
    INT_P, // 0x0B
    INT_P, // 0x0C
    INT_P, // 0x0D
    INT_P, // 0x0E
    INT_P, // 0x0F
    INT_P, // 0x10
    INT_P, // 0x11
    INT_P, // 0x12
    INT_P, // 0x13
    INT_P, // 0x14
    INT_P, // 0x15
    INT_P, // 0x16
    INT_P, // 0x17
    // Unsigned integer (one-byte uint8_t follows)
    UINT_P_8, // 0x18
    // Unsigned integer (two-byte uint16_t follows)
    UINT_P_16, // 0x19
    // Unsigned integer (four-byte uint32_t follows)
    UINT_P_32, // 0x1a
    // Unsigned integer (eight-byte uint64_t follows)
    UINT_P_64, // 0x1b
    ERROR, // 0x1c
    ERROR, // 0x1d
    ERROR, // 0x1e
    ERROR, // 0x1f
    // Negative integer -1-0x00..-1-0x17 (-1..-24)
    INT_N, // 0x20
    INT_N, // 0x21
    INT_N, // 0x22
    INT_N, // 0x23
    INT_N, // 0x24
    INT_N, // 0x25
    INT_N, // 0x26
    INT_N, // 0x27
    INT_N, // 0x28
    INT_N, // 0x29
    INT_N, // 0x2A
    INT_N, // 0x2B
    INT_N, // 0x2C
    INT_N, // 0x2D
    INT_N, // 0x2E
    INT_N, // 0x2F
    INT_N, // 0x30
    INT_N, // 0x31
    INT_N, // 0x32
    INT_N, // 0x33
    INT_N, // 0x34
    INT_N, // 0x35
    INT_N, // 0x36
    INT_N, // 0x37
    // Negative integer -1-n (one-byte uint8_t for n follows)
    UINT_N_8, // 0x38
    // Negative integer -1-n (two-byte uint16_t for n follows)
    UINT_N_16, // 0x39
    // Negative integer -1-n (four-byte uint32_t for nfollows)
    UINT_N_32, // 0x3a
    // Negative integer -1-n (eight-byte uint64_t for n follows)
    UINT_N_64, // 0x3b
    ERROR, // 0x3c
    ERROR, // 0x3d
    ERROR, // 0x3e
    ERROR, // 0x3f
    // byte string (0x00..0x17 bytes follow)
    BYTE_STRING, // 0x40
    BYTE_STRING, // 0x41
    BYTE_STRING, // 0x42
    BYTE_STRING, // 0x43
    BYTE_STRING, // 0x44
    BYTE_STRING, // 0x45
    BYTE_STRING, // 0x46
    BYTE_STRING, // 0x47
    BYTE_STRING, // 0x48
    BYTE_STRING, // 0x49
    BYTE_STRING, // 0x4A
    BYTE_STRING, // 0x4B
    BYTE_STRING, // 0x4C
    BYTE_STRING, // 0x4D
    BYTE_STRING, // 0x4E
    BYTE_STRING, // 0x4F
    BYTE_STRING, // 0x50
    BYTE_STRING, // 0x51
    BYTE_STRING, // 0x52
    BYTE_STRING, // 0x53
    BYTE_STRING, // 0x54
    BYTE_STRING, // 0x55
    BYTE_STRING, // 0x56
    BYTE_STRING, // 0x57
    // byte string (one-byte uint8_t for n, and then n bytes follow)
    BYTE_STRING_8, // 0x58
    // byte string (two-byte uint16_t for n, and then n bytes follow)
    BYTE_STRING_16, // 0x59
    // byte string (four-byte uint32_t for n, and then n bytes follow)
    BYTE_STRING_32, // 0x5a
    // byte string (eight-byte uint64_t for n, and then n bytes follow)
    BYTE_STRING_64, // 0x5b
    ERROR, // 0x5c
    ERROR, // 0x5d
    ERROR, // 0x5e
    // byte string, byte strings follow, terminated by "break"
    BYTE_STRING_BREAK, // 0x5f
    // UTF-8 string (0x00..0x17 bytes follow)
    UTF8_STRING, // 0x60
    UTF8_STRING, // 0x61
    UTF8_STRING, // 0x62
    UTF8_STRING, // 0x63
    UTF8_STRING, // 0x64
    UTF8_STRING, // 0x65
    UTF8_STRING, // 0x66
    UTF8_STRING, // 0x67
    UTF8_STRING, // 0x68
    UTF8_STRING, // 0x69
    UTF8_STRING, // 0x6A
    UTF8_STRING, // 0x6B
    UTF8_STRING, // 0x6C
    UTF8_STRING, // 0x6D
    UTF8_STRING, // 0x6E
    UTF8_STRING, // 0x6F
    UTF8_STRING, // 0x70
    UTF8_STRING, // 0x71
    UTF8_STRING, // 0x72
    UTF8_STRING, // 0x73
    UTF8_STRING, // 0x74
    UTF8_STRING, // 0x75
    UTF8_STRING, // 0x76
    UTF8_STRING, // 0x77
    // UTF-8 string (one-byte uint8_t for n, and then n bytes follow)
    UTF8_STRING_8, // 0x78
    // UTF-8 string (two-byte uint16_t for n, and then n bytes follow)
    UTF8_STRING_16, // 0x79
    // UTF-8 string (four-byte uint32_t for n, and then n bytes follow)
    UTF8_STRING_32, // 0x7a
    // UTF-8 string (eight-byte uint64_t for n, and then n bytes follow)
    UTF8_STRING_64, // 0x7b
    // UTF-8 string, UTF-8 strings follow, terminated by "break"
    ERROR, // 0x7c
    ERROR, // 0x7d
    ERROR, // 0x7e
    UTF8_STRING_BREAK, // 0x7f
    // array (0x00..0x17 data items follow)
    ARRAY, // 0x80
    ARRAY, // 0x81
    ARRAY, // 0x82
    ARRAY, // 0x83
    ARRAY, // 0x84
    ARRAY, // 0x85
    ARRAY, // 0x86
    ARRAY, // 0x87
    ARRAY, // 0x88
    ARRAY, // 0x89
    ARRAY, // 0x8A
    ARRAY, // 0x8B
    ARRAY, // 0x8C
    ARRAY, // 0x8D
    ARRAY, // 0x8E
    ARRAY, // 0x8F
    ARRAY, // 0x90
    ARRAY, // 0x91
    ARRAY, // 0x92
    ARRAY, // 0x93
    ARRAY, // 0x94
    ARRAY, // 0x95
    ARRAY, // 0x96
    ARRAY, // 0x97
    // array (one-byte uint8_t fo, and then n data items follow)
    ARRAY_8, // 0x98
    // array (two-byte uint16_t for n, and then n data items follow)
    ARRAY_16, // 0x99
    // array (four-byte uint32_t for n, and then n data items follow)
    ARRAY_32, // 0x9a
    // array (eight-byte uint64_t for n, and then n data items follow)
    ARRAY_64, // 0x9b
    // array, data items follow, terminated by "break"
    ERROR, // 0x9c
    ERROR, // 0x9d
    ERROR, // 0x9e
    ARRAY_BREAK, // 0x9f
    // map (0x00..0x17 pairs of data items follow)
    MAP, // 0xa0
    MAP, // 0xa1
    MAP, // 0xa2
    MAP, // 0xa3
    MAP, // 0xa4
    MAP, // 0xa5
    MAP, // 0xa6
    MAP, // 0xa7
    MAP, // 0xa8
    MAP, // 0xa9
    MAP, // 0xaA
    MAP, // 0xaB
    MAP, // 0xaC
    MAP, // 0xaD
    MAP, // 0xaE
    MAP, // 0xaF
    MAP, // 0xb0
    MAP, // 0xb1
    MAP, // 0xb2
    MAP, // 0xb3
    MAP, // 0xb4
    MAP, // 0xb5
    MAP, // 0xb6
    MAP, // 0xb7
    // map (one-byte uint8_t for n, and then n pairs of data items follow)
    MAP_8, // 0xb8
    // map (two-byte uint16_t for n, and then n pairs of data items follow)
    MAP_16, // 0xb9
    // map (four-byte uint32_t for n, and then n pairs of data items follow)
    MAP_32, // 0xba
    // map (eight-byte uint64_t for n, and then n pairs of data items follow)
    MAP_64, // 0xbb
    ERROR, // 0xbc
    ERROR, // 0xbd
    ERROR, // 0xbe
    // map, pairs of data items follow, terminated by "break"
    MAP_BREAK, // 0xbf
    // Text-based date/time (data item follows; see Section 2.4.1)
    TAG_KNOWN, // 0xc0
    // Epoch-based date/time (data item follows; see Section 2.4.1)
    TAG_KNOWN, // 0xc1
    // Positive bignum (data item "byte string" follows)
    TAG_KNOWN, // 0xc2
    // Negative bignum (data item "byte string" follows)
    TAG_KNOWN, // 0xc3
    // Decimal Fraction (data item "array" follows; see Section 2.4.3)
    TAG_KNOWN, // 0xc4
    // Bigfloat (data item "array" follows; see Section 2.4.3)
    TAG_KNOWN, // 0xc5
    // (tagged item)
    TAG_UNASSIGNED, // 0xc6
    TAG_UNASSIGNED, // 0xc7
    TAG_UNASSIGNED, // 0xc8
    TAG_UNASSIGNED, // 0xc9
    TAG_UNASSIGNED, // 0xca
    TAG_UNASSIGNED, // 0xcb
    TAG_UNASSIGNED, // 0xcc
    TAG_UNASSIGNED, // 0xcd
    TAG_UNASSIGNED, // 0xce
    TAG_UNASSIGNED, // 0xcf
    TAG_UNASSIGNED, // 0xd0
    TAG_UNASSIGNED, // 0xd1
    TAG_UNASSIGNED, // 0xd2
    TAG_UNASSIGNED, // 0xd3
    TAG_UNASSIGNED, // 0xd4
    // Expected Conversion (data item follows; see Section 2.4.4.2)
    TAG_UNASSIGNED, // 0xd5
    TAG_UNASSIGNED, // 0xd6
    TAG_UNASSIGNED, // 0xd7
    // (more tagged items, 1/2/4/8 bytes and then a data item follow)
    TAG_MORE_1, // 0xd8
    TAG_MORE_2, // 0xd9
    TAG_MORE_4, // 0xda
    TAG_MORE_8, // 0xdb
    ERROR, // 0xdc
    ERROR, // 0xdd
    ERROR, // 0xde
    ERROR, // 0xdf
    // (simple value)
    SIMPLE_UNASSIGNED, // 0xe0
    SIMPLE_UNASSIGNED, // 0xe1
    SIMPLE_UNASSIGNED, // 0xe2
    SIMPLE_UNASSIGNED, // 0xe3
    SIMPLE_UNASSIGNED, // 0xe4
    SIMPLE_UNASSIGNED, // 0xe5
    SIMPLE_UNASSIGNED, // 0xe6
    SIMPLE_UNASSIGNED, // 0xe7
    SIMPLE_UNASSIGNED, // 0xe8
    SIMPLE_UNASSIGNED, // 0xe9
    SIMPLE_UNASSIGNED, // 0xea
    SIMPLE_UNASSIGNED, // 0xeb
    SIMPLE_UNASSIGNED, // 0xec
    SIMPLE_UNASSIGNED, // 0xed
    SIMPLE_UNASSIGNED, // 0xee
    SIMPLE_UNASSIGNED, // 0xef
    SIMPLE_UNASSIGNED, // 0xf0
    SIMPLE_UNASSIGNED, // 0xf1
    SIMPLE_UNASSIGNED, // 0xf2
    SIMPLE_UNASSIGNED, // 0xf3
    // False
    SIMPLE_FALSE, // 0xf4
    // True
    SIMPLE_TRUE, // 0xf5
    // Null
    SIMPLE_NULL, // 0xf6
    // Undefined
    SIMPLE_UNDEFINED, // 0xf7
    // (simple value, one byte follows)
    SIMPLE_BYTE, // 0xf8
    // Half-Precision Float (two-byte IEEE 754)
    SIMPLE_FLOAT_HALF, // 0xf9
    // Single-Precision Float (four-byte IEEE 754)
    SIMPLE_FLOAT_SINGLE, // 0xfa
    // Double-Precision Float (eight-byte IEEE 754)
    SIMPLE_FLOAT_DOUBLE, // 0xfb
    ERROR, // 0xfc
    ERROR, // 0xfd
    ERROR, // 0xfe
    // "break" stop code
    BREAK // 0xff
  ]

  // --

  return {
    parse: parse
  }
}

},{}],5:[function(require,module,exports){
(function (global){(function (){
'use strict'

const { Buffer } = require('buffer')
const ieee754 = require('ieee754')
const Bignumber = require('bignumber.js').BigNumber

const parser = require('./decoder.asm')
const utils = require('./utils')
const c = require('./constants')
const Simple = require('./simple')
const Tagged = require('./tagged')
const { URL } = require('iso-url')

/**
 * Transform binary cbor data into JavaScript objects.
 */
class Decoder {
  /**
   * @param {Object} [opts={}]
   * @param {number} [opts.size=65536] - Size of the allocated heap.
   */
  constructor (opts) {
    opts = opts || {}

    if (!opts.size || opts.size < 0x10000) {
      opts.size = 0x10000
    } else {
      // Ensure the size is a power of 2
      opts.size = utils.nextPowerOf2(opts.size)
    }

    // Heap use to share the input with the parser
    this._heap = new ArrayBuffer(opts.size)
    this._heap8 = new Uint8Array(this._heap)
    this._buffer = Buffer.from(this._heap)

    this._reset()

    // Known tags
    this._knownTags = Object.assign({
      0: (val) => new Date(val),
      1: (val) => new Date(val * 1000),
      2: (val) => utils.arrayBufferToBignumber(val),
      3: (val) => c.NEG_ONE.minus(utils.arrayBufferToBignumber(val)),
      4: (v) => {
        // const v = new Uint8Array(val)
        return c.TEN.pow(v[0]).times(v[1])
      },
      5: (v) => {
        // const v = new Uint8Array(val)
        return c.TWO.pow(v[0]).times(v[1])
      },
      32: (val) => new URL(val),
      35: (val) => new RegExp(val)
    }, opts.tags)

    // Initialize asm based parser
    this.parser = parser(global, {
      // eslint-disable-next-line no-console
      log: console.log.bind(console),
      pushInt: this.pushInt.bind(this),
      pushInt32: this.pushInt32.bind(this),
      pushInt32Neg: this.pushInt32Neg.bind(this),
      pushInt64: this.pushInt64.bind(this),
      pushInt64Neg: this.pushInt64Neg.bind(this),
      pushFloat: this.pushFloat.bind(this),
      pushFloatSingle: this.pushFloatSingle.bind(this),
      pushFloatDouble: this.pushFloatDouble.bind(this),
      pushTrue: this.pushTrue.bind(this),
      pushFalse: this.pushFalse.bind(this),
      pushUndefined: this.pushUndefined.bind(this),
      pushNull: this.pushNull.bind(this),
      pushInfinity: this.pushInfinity.bind(this),
      pushInfinityNeg: this.pushInfinityNeg.bind(this),
      pushNaN: this.pushNaN.bind(this),
      pushNaNNeg: this.pushNaNNeg.bind(this),
      pushArrayStart: this.pushArrayStart.bind(this),
      pushArrayStartFixed: this.pushArrayStartFixed.bind(this),
      pushArrayStartFixed32: this.pushArrayStartFixed32.bind(this),
      pushArrayStartFixed64: this.pushArrayStartFixed64.bind(this),
      pushObjectStart: this.pushObjectStart.bind(this),
      pushObjectStartFixed: this.pushObjectStartFixed.bind(this),
      pushObjectStartFixed32: this.pushObjectStartFixed32.bind(this),
      pushObjectStartFixed64: this.pushObjectStartFixed64.bind(this),
      pushByteString: this.pushByteString.bind(this),
      pushByteStringStart: this.pushByteStringStart.bind(this),
      pushUtf8String: this.pushUtf8String.bind(this),
      pushUtf8StringStart: this.pushUtf8StringStart.bind(this),
      pushSimpleUnassigned: this.pushSimpleUnassigned.bind(this),
      pushTagUnassigned: this.pushTagUnassigned.bind(this),
      pushTagStart: this.pushTagStart.bind(this),
      pushTagStart4: this.pushTagStart4.bind(this),
      pushTagStart8: this.pushTagStart8.bind(this),
      pushBreak: this.pushBreak.bind(this)
    }, this._heap)
  }

  get _depth () {
    return this._parents.length
  }

  get _currentParent () {
    return this._parents[this._depth - 1]
  }

  get _ref () {
    return this._currentParent.ref
  }

  // Finish the current parent
  _closeParent () {
    const p = this._parents.pop()

    if (p.length > 0) {
      throw new Error(`Missing ${p.length} elements`)
    }

    switch (p.type) {
      case c.PARENT.TAG:
        this._push(
          this.createTag(p.ref[0], p.ref[1])
        )
        break
      case c.PARENT.BYTE_STRING:
        this._push(this.createByteString(p.ref, p.length))
        break
      case c.PARENT.UTF8_STRING:
        this._push(this.createUtf8String(p.ref, p.length))
        break
      case c.PARENT.MAP:
        if (p.values % 2 > 0) {
          throw new Error('Odd number of elements in the map')
        }
        this._push(this.createMap(p.ref, p.length))
        break
      case c.PARENT.OBJECT:
        if (p.values % 2 > 0) {
          throw new Error('Odd number of elements in the map')
        }
        this._push(this.createObject(p.ref, p.length))
        break
      case c.PARENT.ARRAY:
        this._push(this.createArray(p.ref, p.length))
        break
      default:
        break
    }

    if (this._currentParent && this._currentParent.type === c.PARENT.TAG) {
      this._dec()
    }
  }

  // Reduce the expected length of the current parent by one
  _dec () {
    const p = this._currentParent
    // The current parent does not know the epxected child length

    if (p.length < 0) {
      return
    }

    p.length--

    // All children were seen, we can close the current parent
    if (p.length === 0) {
      this._closeParent()
    }
  }

  // Push any value to the current parent
  _push (val, hasChildren) {
    const p = this._currentParent
    p.values++

    switch (p.type) {
      case c.PARENT.ARRAY:
      case c.PARENT.BYTE_STRING:
      case c.PARENT.UTF8_STRING:
        if (p.length > -1) {
          this._ref[this._ref.length - p.length] = val
        } else {
          this._ref.push(val)
        }
        this._dec()
        break
      case c.PARENT.OBJECT:
        if (p.tmpKey != null) {
          this._ref[p.tmpKey] = val
          p.tmpKey = null
          this._dec()
        } else {
          p.tmpKey = val

          if (typeof p.tmpKey !== 'string') {
            // too bad, convert to a Map
            p.type = c.PARENT.MAP
            p.ref = utils.buildMap(p.ref)
          }
        }
        break
      case c.PARENT.MAP:
        if (p.tmpKey != null) {
          this._ref.set(p.tmpKey, val)
          p.tmpKey = null
          this._dec()
        } else {
          p.tmpKey = val
        }
        break
      case c.PARENT.TAG:
        this._ref.push(val)
        if (!hasChildren) {
          this._dec()
        }
        break
      default:
        throw new Error('Unknown parent type')
    }
  }

  // Create a new parent in the parents list
  _createParent (obj, type, len) {
    this._parents[this._depth] = {
      type: type,
      length: len,
      ref: obj,
      values: 0,
      tmpKey: null
    }
  }

  // Reset all state back to the beginning, also used for initiatlization
  _reset () {
    this._res = []
    this._parents = [{
      type: c.PARENT.ARRAY,
      length: -1,
      ref: this._res,
      values: 0,
      tmpKey: null
    }]
  }

  // -- Interface to customize deoding behaviour
  createTag (tagNumber, value) {
    const typ = this._knownTags[tagNumber]

    if (!typ) {
      return new Tagged(tagNumber, value)
    }

    return typ(value)
  }

  createMap (obj, len) {
    return obj
  }

  createObject (obj, len) {
    return obj
  }

  createArray (arr, len) {
    return arr
  }

  createByteString (raw, len) {
    return Buffer.concat(raw)
  }

  createByteStringFromHeap (start, end) {
    if (start === end) {
      return Buffer.alloc(0)
    }

    return Buffer.from(this._heap.slice(start, end))
  }

  createInt (val) {
    return val
  }

  createInt32 (f, g) {
    return utils.buildInt32(f, g)
  }

  createInt64 (f1, f2, g1, g2) {
    return utils.buildInt64(f1, f2, g1, g2)
  }

  createFloat (val) {
    return val
  }

  createFloatSingle (a, b, c, d) {
    return ieee754.read([a, b, c, d], 0, false, 23, 4)
  }

  createFloatDouble (a, b, c, d, e, f, g, h) {
    return ieee754.read([a, b, c, d, e, f, g, h], 0, false, 52, 8)
  }

  createInt32Neg (f, g) {
    return -1 - utils.buildInt32(f, g)
  }

  createInt64Neg (f1, f2, g1, g2) {
    const f = utils.buildInt32(f1, f2)
    const g = utils.buildInt32(g1, g2)

    if (f > c.MAX_SAFE_HIGH) {
      return c.NEG_ONE.minus(new Bignumber(f).times(c.SHIFT32).plus(g))
    }

    return -1 - ((f * c.SHIFT32) + g)
  }

  createTrue () {
    return true
  }

  createFalse () {
    return false
  }

  createNull () {
    return null
  }

  createUndefined () {
    return undefined
  }

  createInfinity () {
    return Infinity
  }

  createInfinityNeg () {
    return -Infinity
  }

  createNaN () {
    return NaN
  }

  createNaNNeg () {
    return -NaN
  }

  createUtf8String (raw, len) {
    return raw.join('')
  }

  createUtf8StringFromHeap (start, end) {
    if (start === end) {
      return ''
    }

    return this._buffer.toString('utf8', start, end)
  }

  createSimpleUnassigned (val) {
    return new Simple(val)
  }

  // -- Interface for decoder.asm.js

  pushInt (val) {
    this._push(this.createInt(val))
  }

  pushInt32 (f, g) {
    this._push(this.createInt32(f, g))
  }

  pushInt64 (f1, f2, g1, g2) {
    this._push(this.createInt64(f1, f2, g1, g2))
  }

  pushFloat (val) {
    this._push(this.createFloat(val))
  }

  pushFloatSingle (a, b, c, d) {
    this._push(this.createFloatSingle(a, b, c, d))
  }

  pushFloatDouble (a, b, c, d, e, f, g, h) {
    this._push(this.createFloatDouble(a, b, c, d, e, f, g, h))
  }

  pushInt32Neg (f, g) {
    this._push(this.createInt32Neg(f, g))
  }

  pushInt64Neg (f1, f2, g1, g2) {
    this._push(this.createInt64Neg(f1, f2, g1, g2))
  }

  pushTrue () {
    this._push(this.createTrue())
  }

  pushFalse () {
    this._push(this.createFalse())
  }

  pushNull () {
    this._push(this.createNull())
  }

  pushUndefined () {
    this._push(this.createUndefined())
  }

  pushInfinity () {
    this._push(this.createInfinity())
  }

  pushInfinityNeg () {
    this._push(this.createInfinityNeg())
  }

  pushNaN () {
    this._push(this.createNaN())
  }

  pushNaNNeg () {
    this._push(this.createNaNNeg())
  }

  pushArrayStart () {
    this._createParent([], c.PARENT.ARRAY, -1)
  }

  pushArrayStartFixed (len) {
    this._createArrayStartFixed(len)
  }

  pushArrayStartFixed32 (len1, len2) {
    const len = utils.buildInt32(len1, len2)
    this._createArrayStartFixed(len)
  }

  pushArrayStartFixed64 (len1, len2, len3, len4) {
    const len = utils.buildInt64(len1, len2, len3, len4)
    this._createArrayStartFixed(len)
  }

  pushObjectStart () {
    this._createObjectStartFixed(-1)
  }

  pushObjectStartFixed (len) {
    this._createObjectStartFixed(len)
  }

  pushObjectStartFixed32 (len1, len2) {
    const len = utils.buildInt32(len1, len2)
    this._createObjectStartFixed(len)
  }

  pushObjectStartFixed64 (len1, len2, len3, len4) {
    const len = utils.buildInt64(len1, len2, len3, len4)
    this._createObjectStartFixed(len)
  }

  pushByteStringStart () {
    this._parents[this._depth] = {
      type: c.PARENT.BYTE_STRING,
      length: -1,
      ref: [],
      values: 0,
      tmpKey: null
    }
  }

  pushByteString (start, end) {
    this._push(this.createByteStringFromHeap(start, end))
  }

  pushUtf8StringStart () {
    this._parents[this._depth] = {
      type: c.PARENT.UTF8_STRING,
      length: -1,
      ref: [],
      values: 0,
      tmpKey: null
    }
  }

  pushUtf8String (start, end) {
    this._push(this.createUtf8StringFromHeap(start, end))
  }

  pushSimpleUnassigned (val) {
    this._push(this.createSimpleUnassigned(val))
  }

  pushTagStart (tag) {
    this._parents[this._depth] = {
      type: c.PARENT.TAG,
      length: 1,
      ref: [tag]
    }
  }

  pushTagStart4 (f, g) {
    this.pushTagStart(utils.buildInt32(f, g))
  }

  pushTagStart8 (f1, f2, g1, g2) {
    this.pushTagStart(utils.buildInt64(f1, f2, g1, g2))
  }

  pushTagUnassigned (tagNumber) {
    this._push(this.createTag(tagNumber))
  }

  pushBreak () {
    if (this._currentParent.length > -1) {
      throw new Error('Unexpected break')
    }

    this._closeParent()
  }

  _createObjectStartFixed (len) {
    if (len === 0) {
      this._push(this.createObject({}))
      return
    }

    this._createParent({}, c.PARENT.OBJECT, len)
  }

  _createArrayStartFixed (len) {
    if (len === 0) {
      this._push(this.createArray([]))
      return
    }

    this._createParent(new Array(len), c.PARENT.ARRAY, len)
  }

  _decode (input) {
    if (input.byteLength === 0) {
      throw new Error('Input too short')
    }

    this._reset()
    this._heap8.set(input)
    const code = this.parser.parse(input.byteLength)

    if (this._depth > 1) {
      while (this._currentParent.length === 0) {
        this._closeParent()
      }
      if (this._depth > 1) {
        throw new Error('Undeterminated nesting')
      }
    }

    if (code > 0) {
      throw new Error('Failed to parse')
    }

    if (this._res.length === 0) {
      throw new Error('No valid result')
    }
  }

  // -- Public Interface

  decodeFirst (input) {
    this._decode(input)

    return this._res[0]
  }

  decodeAll (input) {
    this._decode(input)

    return this._res
  }

  /**
   * Decode the first cbor object.
   *
   * @param {Buffer|string} input
   * @param {string} [enc='hex'] - Encoding used if a string is passed.
   * @returns {*}
   */
  static decode (input, enc) {
    if (typeof input === 'string') {
      input = Buffer.from(input, enc || 'hex')
    }

    const dec = new Decoder({ size: input.length })
    return dec.decodeFirst(input)
  }

  /**
   * Decode all cbor objects.
   *
   * @param {Buffer|string} input
   * @param {string} [enc='hex'] - Encoding used if a string is passed.
   * @returns {Array<*>}
   */
  static decodeAll (input, enc) {
    if (typeof input === 'string') {
      input = Buffer.from(input, enc || 'hex')
    }

    const dec = new Decoder({ size: input.length })
    return dec.decodeAll(input)
  }
}

Decoder.decodeFirst = Decoder.decode

module.exports = Decoder

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./constants":3,"./decoder.asm":4,"./simple":9,"./tagged":10,"./utils":11,"bignumber.js":2,"buffer":13,"ieee754":14,"iso-url":15}],6:[function(require,module,exports){
'use strict'

const { Buffer } = require('buffer')
const Decoder = require('./decoder')
const utils = require('./utils')

/**
 * Output the diagnostic format from a stream of CBOR bytes.
 *
 */
class Diagnose extends Decoder {
  createTag (tagNumber, value) {
    return `${tagNumber}(${value})`
  }

  createInt (val) {
    return super.createInt(val).toString()
  }

  createInt32 (f, g) {
    return super.createInt32(f, g).toString()
  }

  createInt64 (f1, f2, g1, g2) {
    return super.createInt64(f1, f2, g1, g2).toString()
  }

  createInt32Neg (f, g) {
    return super.createInt32Neg(f, g).toString()
  }

  createInt64Neg (f1, f2, g1, g2) {
    return super.createInt64Neg(f1, f2, g1, g2).toString()
  }

  createTrue () {
    return 'true'
  }

  createFalse () {
    return 'false'
  }

  createFloat (val) {
    const fl = super.createFloat(val)
    if (utils.isNegativeZero(val)) {
      return '-0_1'
    }

    return `${fl}_1`
  }

  createFloatSingle (a, b, c, d) {
    const fl = super.createFloatSingle(a, b, c, d)
    return `${fl}_2`
  }

  createFloatDouble (a, b, c, d, e, f, g, h) {
    const fl = super.createFloatDouble(a, b, c, d, e, f, g, h)
    return `${fl}_3`
  }

  createByteString (raw, len) {
    const val = raw.join(', ')

    if (len === -1) {
      return `(_ ${val})`
    }
    return `h'${val}`
  }

  createByteStringFromHeap (start, end) {
    const val = (Buffer.from(
      super.createByteStringFromHeap(start, end)
    )).toString('hex')

    return `h'${val}'`
  }

  createInfinity () {
    return 'Infinity_1'
  }

  createInfinityNeg () {
    return '-Infinity_1'
  }

  createNaN () {
    return 'NaN_1'
  }

  createNaNNeg () {
    return '-NaN_1'
  }

  createNull () {
    return 'null'
  }

  createUndefined () {
    return 'undefined'
  }

  createSimpleUnassigned (val) {
    return `simple(${val})`
  }

  createArray (arr, len) {
    const val = super.createArray(arr, len)

    if (len === -1) {
      // indefinite
      return `[_ ${val.join(', ')}]`
    }

    return `[${val.join(', ')}]`
  }

  createMap (map, len) {
    const val = super.createMap(map)
    const list = Array.from(val.keys())
      .reduce(collectObject(val), '')

    if (len === -1) {
      return `{_ ${list}}`
    }

    return `{${list}}`
  }

  createObject (obj, len) {
    const val = super.createObject(obj)
    const map = Object.keys(val)
      .reduce(collectObject(val), '')

    if (len === -1) {
      return `{_ ${map}}`
    }

    return `{${map}}`
  }

  createUtf8String (raw, len) {
    const val = raw.join(', ')

    if (len === -1) {
      return `(_ ${val})`
    }

    return `"${val}"`
  }

  createUtf8StringFromHeap (start, end) {
    const val = (Buffer.from(
      super.createUtf8StringFromHeap(start, end)
    )).toString('utf8')

    return `"${val}"`
  }

  static diagnose (input, enc) {
    if (typeof input === 'string') {
      input = Buffer.from(input, enc || 'hex')
    }

    const dec = new Diagnose()
    return dec.decodeFirst(input)
  }
}

module.exports = Diagnose

function collectObject (val) {
  return (acc, key) => {
    if (acc) {
      return `${acc}, ${key}: ${val[key]}`
    }
    return `${key}: ${val[key]}`
  }
}

},{"./decoder":5,"./utils":11,"buffer":13}],7:[function(require,module,exports){
'use strict'

const { Buffer } = require('buffer')
const { URL } = require('iso-url')
const Bignumber = require('bignumber.js').BigNumber

const utils = require('./utils')
const constants = require('./constants')
const MT = constants.MT
const NUMBYTES = constants.NUMBYTES
const SHIFT32 = constants.SHIFT32
const SYMS = constants.SYMS
const TAG = constants.TAG
const HALF = (constants.MT.SIMPLE_FLOAT << 5) | constants.NUMBYTES.TWO
const FLOAT = (constants.MT.SIMPLE_FLOAT << 5) | constants.NUMBYTES.FOUR
const DOUBLE = (constants.MT.SIMPLE_FLOAT << 5) | constants.NUMBYTES.EIGHT
const TRUE = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.TRUE
const FALSE = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.FALSE
const UNDEFINED = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.UNDEFINED
const NULL = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.NULL

const MAXINT_BN = new Bignumber('0x20000000000000')
const BUF_NAN = Buffer.from('f97e00', 'hex')
const BUF_INF_NEG = Buffer.from('f9fc00', 'hex')
const BUF_INF_POS = Buffer.from('f97c00', 'hex')

function toType (obj) {
  // [object Type]
  // --------8---1
  return ({}).toString.call(obj).slice(8, -1)
}

/**
 * Transform JavaScript values into CBOR bytes
 *
 */
class Encoder {
  /**
   * @param {Object} [options={}]
   * @param {function(Buffer)} options.stream
   */
  constructor (options) {
    options = options || {}

    this.streaming = typeof options.stream === 'function'
    this.onData = options.stream

    this.semanticTypes = [
      [URL, this._pushUrl],
      [Bignumber, this._pushBigNumber]
    ]

    const addTypes = options.genTypes || []
    const len = addTypes.length
    for (let i = 0; i < len; i++) {
      this.addSemanticType(
        addTypes[i][0],
        addTypes[i][1]
      )
    }

    this._reset()
  }

  addSemanticType (type, fun) {
    const len = this.semanticTypes.length
    for (let i = 0; i < len; i++) {
      const typ = this.semanticTypes[i][0]
      if (typ === type) {
        const old = this.semanticTypes[i][1]
        this.semanticTypes[i][1] = fun
        return old
      }
    }
    this.semanticTypes.push([type, fun])
    return null
  }

  push (val) {
    if (!val) {
      return true
    }

    this.result[this.offset] = val
    this.resultMethod[this.offset] = 0
    this.resultLength[this.offset] = val.length
    this.offset++

    if (this.streaming) {
      this.onData(this.finalize())
    }

    return true
  }

  pushWrite (val, method, len) {
    this.result[this.offset] = val
    this.resultMethod[this.offset] = method
    this.resultLength[this.offset] = len
    this.offset++

    if (this.streaming) {
      this.onData(this.finalize())
    }

    return true
  }

  _pushUInt8 (val) {
    return this.pushWrite(val, 1, 1)
  }

  _pushUInt16BE (val) {
    return this.pushWrite(val, 2, 2)
  }

  _pushUInt32BE (val) {
    return this.pushWrite(val, 3, 4)
  }

  _pushDoubleBE (val) {
    return this.pushWrite(val, 4, 8)
  }

  _pushNaN () {
    return this.push(BUF_NAN)
  }

  _pushInfinity (obj) {
    const half = (obj < 0) ? BUF_INF_NEG : BUF_INF_POS
    return this.push(half)
  }

  _pushFloat (obj) {
    const b2 = Buffer.allocUnsafe(2)

    if (utils.writeHalf(b2, obj)) {
      if (utils.parseHalf(b2) === obj) {
        return this._pushUInt8(HALF) && this.push(b2)
      }
    }

    const b4 = Buffer.allocUnsafe(4)
    b4.writeFloatBE(obj, 0)
    if (b4.readFloatBE(0) === obj) {
      return this._pushUInt8(FLOAT) && this.push(b4)
    }

    return this._pushUInt8(DOUBLE) && this._pushDoubleBE(obj)
  }

  _pushInt (obj, mt, orig) {
    const m = mt << 5
    if (obj < 24) {
      return this._pushUInt8(m | obj)
    }

    if (obj <= 0xff) {
      return this._pushUInt8(m | NUMBYTES.ONE) && this._pushUInt8(obj)
    }

    if (obj <= 0xffff) {
      return this._pushUInt8(m | NUMBYTES.TWO) && this._pushUInt16BE(obj)
    }

    if (obj <= 0xffffffff) {
      return this._pushUInt8(m | NUMBYTES.FOUR) && this._pushUInt32BE(obj)
    }

    if (obj <= Number.MAX_SAFE_INTEGER) {
      return this._pushUInt8(m | NUMBYTES.EIGHT) &&
        this._pushUInt32BE(Math.floor(obj / SHIFT32)) &&
        this._pushUInt32BE(obj % SHIFT32)
    }

    if (mt === MT.NEG_INT) {
      return this._pushFloat(orig)
    }

    return this._pushFloat(obj)
  }

  _pushIntNum (obj) {
    if (obj < 0) {
      return this._pushInt(-obj - 1, MT.NEG_INT, obj)
    } else {
      return this._pushInt(obj, MT.POS_INT)
    }
  }

  _pushNumber (obj) {
    switch (false) {
      case (obj === obj): // eslint-disable-line
        return this._pushNaN(obj)
      case isFinite(obj):
        return this._pushInfinity(obj)
      case ((obj % 1) !== 0):
        return this._pushIntNum(obj)
      default:
        return this._pushFloat(obj)
    }
  }

  _pushString (obj) {
    const len = Buffer.byteLength(obj, 'utf8')
    return this._pushInt(len, MT.UTF8_STRING) && this.pushWrite(obj, 5, len)
  }

  _pushBoolean (obj) {
    return this._pushUInt8(obj ? TRUE : FALSE)
  }

  _pushUndefined (obj) {
    return this._pushUInt8(UNDEFINED)
  }

  _pushArray (gen, obj) {
    const len = obj.length
    if (!gen._pushInt(len, MT.ARRAY)) {
      return false
    }
    for (let j = 0; j < len; j++) {
      if (!gen.pushAny(obj[j])) {
        return false
      }
    }
    return true
  }

  _pushTag (tag) {
    return this._pushInt(tag, MT.TAG)
  }

  _pushDate (gen, obj) {
    // Round date, to get seconds since 1970-01-01 00:00:00 as defined in
    // Sec. 2.4.1 and get a possibly more compact encoding. Note that it is
    // still allowed to encode fractions of seconds which can be achieved by
    // changing overwriting the encode function for Date objects.
    return gen._pushTag(TAG.DATE_EPOCH) && gen.pushAny(Math.round(obj / 1000))
  }

  _pushBuffer (gen, obj) {
    return gen._pushInt(obj.length, MT.BYTE_STRING) && gen.push(obj)
  }

  _pushNoFilter (gen, obj) {
    return gen._pushBuffer(gen, obj.slice())
  }

  _pushRegexp (gen, obj) {
    return gen._pushTag(TAG.REGEXP) && gen.pushAny(obj.source)
  }

  _pushSet (gen, obj) {
    if (!gen._pushInt(obj.size, MT.ARRAY)) {
      return false
    }
    for (const x of obj) {
      if (!gen.pushAny(x)) {
        return false
      }
    }
    return true
  }

  _pushUrl (gen, obj) {
    return gen._pushTag(TAG.URI) && gen.pushAny(obj.format())
  }

  _pushBigint (obj) {
    let tag = TAG.POS_BIGINT
    if (obj.isNegative()) {
      obj = obj.negated().minus(1)
      tag = TAG.NEG_BIGINT
    }
    let str = obj.toString(16)
    if (str.length % 2) {
      str = '0' + str
    }
    const buf = Buffer.from(str, 'hex')
    return this._pushTag(tag) && this._pushBuffer(this, buf)
  }

  _pushBigNumber (gen, obj) {
    if (obj.isNaN()) {
      return gen._pushNaN()
    }
    if (!obj.isFinite()) {
      return gen._pushInfinity(obj.isNegative() ? -Infinity : Infinity)
    }
    if (obj.isInteger()) {
      return gen._pushBigint(obj)
    }
    if (!(gen._pushTag(TAG.DECIMAL_FRAC) &&
      gen._pushInt(2, MT.ARRAY))) {
      return false
    }

    const dec = obj.decimalPlaces()
    const slide = obj.multipliedBy(new Bignumber(10).pow(dec))
    if (!gen._pushIntNum(-dec)) {
      return false
    }
    if (slide.abs().isLessThan(MAXINT_BN)) {
      return gen._pushIntNum(slide.toNumber())
    } else {
      return gen._pushBigint(slide)
    }
  }

  _pushMap (gen, obj) {
    if (!gen._pushInt(obj.size, MT.MAP)) {
      return false
    }

    return this._pushRawMap(
      obj.size,
      Array.from(obj)
    )
  }

  _pushObject (obj) {
    if (!obj) {
      return this._pushUInt8(NULL)
    }

    const len = this.semanticTypes.length
    for (let i = 0; i < len; i++) {
      if (obj instanceof this.semanticTypes[i][0]) {
        return this.semanticTypes[i][1].call(obj, this, obj)
      }
    }

    const f = obj.encodeCBOR
    if (typeof f === 'function') {
      return f.call(obj, this)
    }

    const keys = Object.keys(obj)
    const keyLength = keys.length
    if (!this._pushInt(keyLength, MT.MAP)) {
      return false
    }

    return this._pushRawMap(
      keyLength,
      keys.map((k) => [k, obj[k]])
    )
  }

  _pushRawMap (len, map) {
    // Sort keys for canoncialization
    // 1. encode key
    // 2. shorter key comes before longer key
    // 3. same length keys are sorted with lower
    //    byte value before higher

    map = map.map(function (a) {
      a[0] = Encoder.encode(a[0])
      return a
    }).sort(utils.keySorter)

    for (let j = 0; j < len; j++) {
      if (!this.push(map[j][0])) {
        return false
      }

      if (!this.pushAny(map[j][1])) {
        return false
      }
    }

    return true
  }

  /**
   * Alias for `.pushAny`
   *
   * @param {*} obj
   * @returns {boolean} true on success
   */
  write (obj) {
    return this.pushAny(obj)
  }

  /**
   * Push any supported type onto the encoded stream
   *
   * @param {any} obj
   * @returns {boolean} true on success
   */
  pushAny (obj) {
    const typ = toType(obj)

    switch (typ) {
      case 'Number':
        return this._pushNumber(obj)
      case 'String':
        return this._pushString(obj)
      case 'Boolean':
        return this._pushBoolean(obj)
      case 'Object':
        return this._pushObject(obj)
      case 'Array':
        return this._pushArray(this, obj)
      case 'Uint8Array':
        return this._pushBuffer(this, Buffer.isBuffer(obj) ? obj : Buffer.from(obj))
      case 'Null':
        return this._pushUInt8(NULL)
      case 'Undefined':
        return this._pushUndefined(obj)
      case 'Map':
        return this._pushMap(this, obj)
      case 'Set':
        return this._pushSet(this, obj)
      case 'URL':
        return this._pushUrl(this, obj)
      case 'BigNumber':
        return this._pushBigNumber(this, obj)
      case 'Date':
        return this._pushDate(this, obj)
      case 'RegExp':
        return this._pushRegexp(this, obj)
      case 'Symbol':
        switch (obj) {
          case SYMS.NULL:
            return this._pushObject(null)
          case SYMS.UNDEFINED:
            return this._pushUndefined(undefined)
          // TODO: Add pluggable support for other symbols
          default:
            throw new Error('Unknown symbol: ' + obj.toString())
        }
      default:
        throw new Error('Unknown type: ' + typeof obj + ', ' + (obj ? obj.toString() : ''))
    }
  }

  finalize () {
    if (this.offset === 0) {
      return null
    }

    const result = this.result
    const resultLength = this.resultLength
    const resultMethod = this.resultMethod
    const offset = this.offset

    // Determine the size of the buffer
    let size = 0
    let i = 0

    for (; i < offset; i++) {
      size += resultLength[i]
    }

    const res = Buffer.allocUnsafe(size)
    let index = 0
    let length = 0

    // Write the content into the result buffer
    for (i = 0; i < offset; i++) {
      length = resultLength[i]

      switch (resultMethod[i]) {
        case 0:
          result[i].copy(res, index)
          break
        case 1:
          res.writeUInt8(result[i], index, true)
          break
        case 2:
          res.writeUInt16BE(result[i], index, true)
          break
        case 3:
          res.writeUInt32BE(result[i], index, true)
          break
        case 4:
          res.writeDoubleBE(result[i], index, true)
          break
        case 5:
          res.write(result[i], index, length, 'utf8')
          break
        default:
          throw new Error('unkown method')
      }

      index += length
    }

    const tmp = res

    this._reset()

    return tmp
  }

  _reset () {
    this.result = []
    this.resultMethod = []
    this.resultLength = []
    this.offset = 0
  }

  /**
   * Encode the given value
   *
   * @param {*} o
   * @returns {Buffer}
   */
  static encode (o) {
    const enc = new Encoder()
    const ret = enc.pushAny(o)
    if (!ret) {
      throw new Error('Failed to encode input')
    }

    return enc.finalize()
  }
}

module.exports = Encoder

},{"./constants":3,"./utils":11,"bignumber.js":2,"buffer":13,"iso-url":15}],8:[function(require,module,exports){
'use strict'

// exports.Commented = require('./commented')
exports.Diagnose = require('./diagnose')
exports.Decoder = require('./decoder')
exports.Encoder = require('./encoder')
exports.Simple = require('./simple')
exports.Tagged = require('./tagged')

// exports.comment = exports.Commented.comment
exports.decodeAll = exports.Decoder.decodeAll
exports.decodeFirst = exports.Decoder.decodeFirst
exports.diagnose = exports.Diagnose.diagnose
exports.encode = exports.Encoder.encode
exports.decode = exports.Decoder.decode

exports.leveldb = {
  decode: exports.Decoder.decodeAll,
  encode: exports.Encoder.encode,
  buffer: true,
  name: 'cbor'
}

},{"./decoder":5,"./diagnose":6,"./encoder":7,"./simple":9,"./tagged":10}],9:[function(require,module,exports){
'use strict'

const constants = require('./constants')
const MT = constants.MT
const SIMPLE = constants.SIMPLE
const SYMS = constants.SYMS

/**
 * A CBOR Simple Value that does not map onto a known constant.
 */
class Simple {
  /**
   * Creates an instance of Simple.
   *
   * @param {integer} value - the simple value's integer value
   */
  constructor (value) {
    if (typeof value !== 'number') {
      throw new Error('Invalid Simple type: ' + (typeof value))
    }
    if ((value < 0) || (value > 255) || ((value | 0) !== value)) {
      throw new Error('value must be a small positive integer: ' + value)
    }
    this.value = value
  }

  /**
   * Debug string for simple value
   *
   * @returns {string} simple(value)
   */
  toString () {
    return 'simple(' + this.value + ')'
  }

  /**
   * Debug string for simple value
   *
   * @returns {string} simple(value)
   */
  inspect () {
    return 'simple(' + this.value + ')'
  }

  /**
   * Push the simple value onto the CBOR stream
   *
   * @param {cbor.Encoder} gen - The generator to push onto
   * @returns {number}
   */
  encodeCBOR (gen) {
    return gen._pushInt(this.value, MT.SIMPLE_FLOAT)
  }

  /**
   * Is the given object a Simple?
   *
   * @param {any} obj - object to test
   * @returns {bool} - is it Simple?
   */
  static isSimple (obj) {
    return obj instanceof Simple
  }

  /**
   * Decode from the CBOR additional information into a JavaScript value.
   * If the CBOR item has no parent, return a "safe" symbol instead of
   * `null` or `undefined`, so that the value can be passed through a
   * stream in object mode.
   *
   * @param {number} val - the CBOR additional info to convert
   * @param {bool} hasParent - Does the CBOR item have a parent?
   * @returns {(null | undefined | boolean | symbol)} - the decoded value
   */
  static decode (val, hasParent) {
    if (hasParent == null) {
      hasParent = true
    }
    switch (val) {
      case SIMPLE.FALSE:
        return false
      case SIMPLE.TRUE:
        return true
      case SIMPLE.NULL:
        if (hasParent) {
          return null
        } else {
          return SYMS.NULL
        }
      case SIMPLE.UNDEFINED:
        if (hasParent) {
          return undefined
        } else {
          return SYMS.UNDEFINED
        }
      case -1:
        if (!hasParent) {
          throw new Error('Invalid BREAK')
        }
        return SYMS.BREAK
      default:
        return new Simple(val)
    }
  }
}

module.exports = Simple

},{"./constants":3}],10:[function(require,module,exports){
'use strict'

/**
 * A CBOR tagged item, where the tag does not have semantics specified at the
 * moment, or those semantics threw an error during parsing. Typically this will
 * be an extension point you're not yet expecting.
 */
class Tagged {
  /**
   * Creates an instance of Tagged.
   *
   * @param {number} tag - the number of the tag
   * @param {any} value - the value inside the tag
   * @param {Error} err - the error that was thrown parsing the tag, or null
   */
  constructor (tag, value, err) {
    this.tag = tag
    this.value = value
    this.err = err
    if (typeof this.tag !== 'number') {
      throw new Error('Invalid tag type (' + (typeof this.tag) + ')')
    }
    if ((this.tag < 0) || ((this.tag | 0) !== this.tag)) {
      throw new Error('Tag must be a positive integer: ' + this.tag)
    }
  }

  /**
   * Convert to a String
   *
   * @returns {string} string of the form '1(2)'
   */
  toString () {
    return `${this.tag}(${JSON.stringify(this.value)})`
  }

  /**
   * Push the simple value onto the CBOR stream
   *
   * @param {cbor.Encoder} gen - The generator to push onto
   * @returns {number}
   */
  encodeCBOR (gen) {
    gen._pushTag(this.tag)
    return gen.pushAny(this.value)
  }

  /**
   * If we have a converter for this type, do the conversion.  Some converters
   * are built-in.  Additional ones can be passed in.  If you want to remove
   * a built-in converter, pass a converter in whose value is 'null' instead
   * of a function.
   *
   * @param {Object} converters - keys in the object are a tag number, the value
   * is a function that takes the decoded CBOR and returns a JavaScript value
   * of the appropriate type.  Throw an exception in the function on errors.
   * @returns {any} - the converted item
   */
  convert (converters) {
    let er, f
    f = converters != null ? converters[this.tag] : undefined
    if (typeof f !== 'function') {
      f = Tagged['_tag' + this.tag]
      if (typeof f !== 'function') {
        return this
      }
    }
    try {
      return f.call(Tagged, this.value)
    } catch (error) {
      er = error
      this.err = er
      return this
    }
  }
}

module.exports = Tagged

},{}],11:[function(require,module,exports){
'use strict'

const { Buffer } = require('buffer')
const Bignumber = require('bignumber.js').BigNumber

const constants = require('./constants')
const SHIFT32 = constants.SHIFT32
const SHIFT16 = constants.SHIFT16
const MAX_SAFE_HIGH = 0x1fffff

exports.parseHalf = function parseHalf (buf) {
  const sign = buf[0] & 0x80 ? -1 : 1
  const exp = (buf[0] & 0x7C) >> 2
  const mant = ((buf[0] & 0x03) << 8) | buf[1]
  if (!exp) {
    return sign * 5.9604644775390625e-8 * mant
  } else if (exp === 0x1f) {
    return sign * (mant ? 0 / 0 : 2e308) // eslint-disable-line no-loss-of-precision
  } else {
    return sign * Math.pow(2, exp - 25) * (1024 + mant)
  }
}

function toHex (n) {
  if (n < 16) {
    return '0' + n.toString(16)
  }

  return n.toString(16)
}

exports.arrayBufferToBignumber = function (buf) {
  const len = buf.byteLength
  let res = ''
  for (let i = 0; i < len; i++) {
    res += toHex(buf[i])
  }

  return new Bignumber(res, 16)
}

// convert an Object into a Map
exports.buildMap = (obj) => {
  const res = new Map()
  const keys = Object.keys(obj)
  const length = keys.length
  for (let i = 0; i < length; i++) {
    res.set(keys[i], obj[keys[i]])
  }
  return res
}

exports.buildInt32 = (f, g) => {
  return f * SHIFT16 + g
}

exports.buildInt64 = (f1, f2, g1, g2) => {
  const f = exports.buildInt32(f1, f2)
  const g = exports.buildInt32(g1, g2)

  if (f > MAX_SAFE_HIGH) {
    return new Bignumber(f).times(SHIFT32).plus(g)
  } else {
    return (f * SHIFT32) + g
  }
}

exports.writeHalf = function writeHalf (buf, half) {
  // assume 0, -0, NaN, Infinity, and -Infinity have already been caught

  // HACK: everyone settle in.  This isn't going to be pretty.
  // Translate cn-cbor's C code (from Carsten Borman):

  // uint32_t be32;
  // uint16_t be16, u16;
  // union {
  //   float f;
  //   uint32_t u;
  // } u32;
  // u32.f = float_val;

  const u32 = Buffer.allocUnsafe(4)
  u32.writeFloatBE(half, 0)
  const u = u32.readUInt32BE(0)

  // if ((u32.u & 0x1FFF) == 0) { /* worth trying half */

  // hildjj: If the lower 13 bits are 0, we won't lose anything in the conversion
  if ((u & 0x1FFF) !== 0) {
    return false
  }

  //   int s16 = (u32.u >> 16) & 0x8000;
  //   int exp = (u32.u >> 23) & 0xff;
  //   int mant = u32.u & 0x7fffff;

  let s16 = (u >> 16) & 0x8000 // top bit is sign
  const exp = (u >> 23) & 0xff // then 5 bits of exponent
  const mant = u & 0x7fffff

  //   if (exp == 0 && mant == 0)
  //     ;              /* 0.0, -0.0 */

  // hildjj: zeros already handled.  Assert if you don't believe me.

  //   else if (exp >= 113 && exp <= 142) /* normalized */
  //     s16 += ((exp - 112) << 10) + (mant >> 13);
  if ((exp >= 113) && (exp <= 142)) {
    s16 += ((exp - 112) << 10) + (mant >> 13)

  //   else if (exp >= 103 && exp < 113) { /* denorm, exp16 = 0 */
  //     if (mant & ((1 << (126 - exp)) - 1))
  //       goto float32;         /* loss of precision */
  //     s16 += ((mant + 0x800000) >> (126 - exp));
  } else if ((exp >= 103) && (exp < 113)) {
    if (mant & ((1 << (126 - exp)) - 1)) {
      return false
    }
    s16 += ((mant + 0x800000) >> (126 - exp))

    //   } else if (exp == 255 && mant == 0) { /* Inf */
    //     s16 += 0x7c00;

    // hildjj: Infinity already handled

  //   } else
  //     goto float32;           /* loss of range */
  } else {
    return false
  }

  //   ensure_writable(3);
  //   u16 = s16;
  //   be16 = hton16p((const uint8_t*)&u16);
  buf.writeUInt16BE(s16, 0)
  return true
}

exports.keySorter = function (a, b) {
  const lenA = a[0].byteLength
  const lenB = b[0].byteLength

  if (lenA > lenB) {
    return 1
  }

  if (lenB > lenA) {
    return -1
  }

  return a[0].compare(b[0])
}

// Adapted from http://www.2ality.com/2012/03/signedzero.html
exports.isNegativeZero = (x) => {
  return x === 0 && (1 / x < 0)
}

exports.nextPowerOf2 = (n) => {
  let count = 0
  // First n in the below condition is for
  // the case where n is 0
  if (n && !(n & (n - 1))) {
    return n
  }

  while (n !== 0) {
    n >>= 1
    count += 1
  }

  return 1 << count
}

},{"./constants":3,"bignumber.js":2,"buffer":13}],12:[function(require,module,exports){

},{}],13:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)

},{"base64-js":1,"buffer":13,"ieee754":14}],14:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],15:[function(require,module,exports){
'use strict'

const {
  URLWithLegacySupport,
  format,
  URLSearchParams,
  defaultBase
} = require('./src/url')
const relative = require('./src/relative')

module.exports = {
  URL: URLWithLegacySupport,
  URLSearchParams,
  format,
  relative,
  defaultBase
}

},{"./src/relative":16,"./src/url":17}],16:[function(require,module,exports){
'use strict'

const { URLWithLegacySupport, format } = require('./url')

/**
 * @param {string | undefined} url
 * @param {any} [location]
 * @param {any} [protocolMap]
 * @param {any} [defaultProtocol]
 */
module.exports = (url, location = {}, protocolMap = {}, defaultProtocol) => {
  let protocol = location.protocol
    ? location.protocol.replace(':', '')
    : 'http'

  // Check protocol map
  protocol = (protocolMap[protocol] || defaultProtocol || protocol) + ':'
  let urlParsed

  try {
    urlParsed = new URLWithLegacySupport(url)
  } catch (err) {
    urlParsed = {}
  }

  const base = Object.assign({}, location, {
    protocol: protocol || urlParsed.protocol,
    host: location.host || urlParsed.host
  })

  return new URLWithLegacySupport(url, format(base)).toString()
}

},{"./url":17}],17:[function(require,module,exports){
'use strict'

const isReactNative =
    typeof navigator !== 'undefined' &&
    navigator.product === 'ReactNative'

function getDefaultBase () {
  if (isReactNative) {
    return 'http://localhost'
  }

  return self.location.protocol + '//' + self.location.host
}

const URL = self.URL
const defaultBase = getDefaultBase()

class URLWithLegacySupport {
  constructor (url = '', base = defaultBase) {
    this.super = new URL(url, base)
    this.path = this.pathname + this.search
    this.auth =
            this.username && this.password
              ? this.username + ':' + this.password
              : null

    this.query =
            this.search && this.search.startsWith('?')
              ? this.search.slice(1)
              : null
  }

  get hash () {
    return this.super.hash
  }

  get host () {
    return this.super.host
  }

  get hostname () {
    return this.super.hostname
  }

  get href () {
    return this.super.href
  }

  get origin () {
    return this.super.origin
  }

  get password () {
    return this.super.password
  }

  get pathname () {
    return this.super.pathname
  }

  get port () {
    return this.super.port
  }

  get protocol () {
    return this.super.protocol
  }

  get search () {
    return this.super.search
  }

  get searchParams () {
    return this.super.searchParams
  }

  get username () {
    return this.super.username
  }

  set hash (hash) {
    this.super.hash = hash
  }

  set host (host) {
    this.super.host = host
  }

  set hostname (hostname) {
    this.super.hostname = hostname
  }

  set href (href) {
    this.super.href = href
  }

  set password (password) {
    this.super.password = password
  }

  set pathname (pathname) {
    this.super.pathname = pathname
  }

  set port (port) {
    this.super.port = port
  }

  set protocol (protocol) {
    this.super.protocol = protocol
  }

  set search (search) {
    this.super.search = search
  }

  set username (username) {
    this.super.username = username
  }

  /**
   * @param {any} o
   */
  static createObjectURL (o) {
    return URL.createObjectURL(o)
  }

  /**
   * @param {string} o
   */
  static revokeObjectURL (o) {
    URL.revokeObjectURL(o)
  }

  toJSON () {
    return this.super.toJSON()
  }

  toString () {
    return this.super.toString()
  }

  format () {
    return this.toString()
  }
}

/**
 * @param {string | import('url').UrlObject} obj
 */
function format (obj) {
  if (typeof obj === 'string') {
    const url = new URL(obj)

    return url.toString()
  }

  if (!(obj instanceof URL)) {
    const userPass =
            // @ts-ignore its not supported in node but we normalise
            obj.username && obj.password
              // @ts-ignore its not supported in node but we normalise
              ? `${obj.username}:${obj.password}@`
              : ''
    const auth = obj.auth ? obj.auth + '@' : ''
    const port = obj.port ? ':' + obj.port : ''
    const protocol = obj.protocol ? obj.protocol + '//' : ''
    const host = obj.host || ''
    const hostname = obj.hostname || ''
    const search = obj.search || (obj.query ? '?' + obj.query : '')
    const hash = obj.hash || ''
    const pathname = obj.pathname || ''
    // @ts-ignore - path is not supported in node but we normalise
    const path = obj.path || pathname + search

    return `${protocol}${userPass || auth}${
            host || hostname + port
        }${path}${hash}`
  }
}

module.exports = {
  URLWithLegacySupport,
  URLSearchParams: self.URLSearchParams,
  defaultBase,
  format
}

},{}],18:[function(require,module,exports){
'use strict';

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */
function Mime() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);

  for (let i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }

  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */
Mime.prototype.define = function(typeMap, force) {
  for (let type in typeMap) {
    let extensions = typeMap[type].map(function(t) {
      return t.toLowerCase();
    });
    type = type.toLowerCase();

    for (let i = 0; i < extensions.length; i++) {
      const ext = extensions[i];

      // '*' prefix = not the preferred type for this extension.  So fixup the
      // extension, and skip it.
      if (ext[0] === '*') {
        continue;
      }

      if (!force && (ext in this._types)) {
        throw new Error(
          'Attempt to change mapping for "' + ext +
          '" extension from "' + this._types[ext] + '" to "' + type +
          '". Pass `force=true` to allow this, otherwise remove "' + ext +
          '" from the list of extensions for "' + type + '".'
        );
      }

      this._types[ext] = type;
    }

    // Use first extension as default
    if (force || !this._extensions[type]) {
      const ext = extensions[0];
      this._extensions[type] = (ext[0] !== '*') ? ext : ext.substr(1);
    }
  }
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.getType = function(path) {
  path = String(path);
  let last = path.replace(/^.*[/\\]/, '').toLowerCase();
  let ext = last.replace(/^.*\./, '').toLowerCase();

  let hasPath = last.length < path.length;
  let hasDot = ext.length < last.length - 1;

  return (hasDot || !hasPath) && this._types[ext] || null;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};

module.exports = Mime;

},{}],19:[function(require,module,exports){
'use strict';

let Mime = require('./Mime');
module.exports = new Mime(require('./types/standard'), require('./types/other'));

},{"./Mime":18,"./types/other":20,"./types/standard":21}],20:[function(require,module,exports){
module.exports = {"application/prs.cww":["cww"],"application/vnd.1000minds.decision-model+xml":["1km"],"application/vnd.3gpp.pic-bw-large":["plb"],"application/vnd.3gpp.pic-bw-small":["psb"],"application/vnd.3gpp.pic-bw-var":["pvb"],"application/vnd.3gpp2.tcap":["tcap"],"application/vnd.3m.post-it-notes":["pwn"],"application/vnd.accpac.simply.aso":["aso"],"application/vnd.accpac.simply.imp":["imp"],"application/vnd.acucobol":["acu"],"application/vnd.acucorp":["atc","acutc"],"application/vnd.adobe.air-application-installer-package+zip":["air"],"application/vnd.adobe.formscentral.fcdt":["fcdt"],"application/vnd.adobe.fxp":["fxp","fxpl"],"application/vnd.adobe.xdp+xml":["xdp"],"application/vnd.adobe.xfdf":["xfdf"],"application/vnd.ahead.space":["ahead"],"application/vnd.airzip.filesecure.azf":["azf"],"application/vnd.airzip.filesecure.azs":["azs"],"application/vnd.amazon.ebook":["azw"],"application/vnd.americandynamics.acc":["acc"],"application/vnd.amiga.ami":["ami"],"application/vnd.android.package-archive":["apk"],"application/vnd.anser-web-certificate-issue-initiation":["cii"],"application/vnd.anser-web-funds-transfer-initiation":["fti"],"application/vnd.antix.game-component":["atx"],"application/vnd.apple.installer+xml":["mpkg"],"application/vnd.apple.keynote":["key"],"application/vnd.apple.mpegurl":["m3u8"],"application/vnd.apple.numbers":["numbers"],"application/vnd.apple.pages":["pages"],"application/vnd.apple.pkpass":["pkpass"],"application/vnd.aristanetworks.swi":["swi"],"application/vnd.astraea-software.iota":["iota"],"application/vnd.audiograph":["aep"],"application/vnd.balsamiq.bmml+xml":["bmml"],"application/vnd.blueice.multipass":["mpm"],"application/vnd.bmi":["bmi"],"application/vnd.businessobjects":["rep"],"application/vnd.chemdraw+xml":["cdxml"],"application/vnd.chipnuts.karaoke-mmd":["mmd"],"application/vnd.cinderella":["cdy"],"application/vnd.citationstyles.style+xml":["csl"],"application/vnd.claymore":["cla"],"application/vnd.cloanto.rp9":["rp9"],"application/vnd.clonk.c4group":["c4g","c4d","c4f","c4p","c4u"],"application/vnd.cluetrust.cartomobile-config":["c11amc"],"application/vnd.cluetrust.cartomobile-config-pkg":["c11amz"],"application/vnd.commonspace":["csp"],"application/vnd.contact.cmsg":["cdbcmsg"],"application/vnd.cosmocaller":["cmc"],"application/vnd.crick.clicker":["clkx"],"application/vnd.crick.clicker.keyboard":["clkk"],"application/vnd.crick.clicker.palette":["clkp"],"application/vnd.crick.clicker.template":["clkt"],"application/vnd.crick.clicker.wordbank":["clkw"],"application/vnd.criticaltools.wbs+xml":["wbs"],"application/vnd.ctc-posml":["pml"],"application/vnd.cups-ppd":["ppd"],"application/vnd.curl.car":["car"],"application/vnd.curl.pcurl":["pcurl"],"application/vnd.dart":["dart"],"application/vnd.data-vision.rdz":["rdz"],"application/vnd.dbf":["dbf"],"application/vnd.dece.data":["uvf","uvvf","uvd","uvvd"],"application/vnd.dece.ttml+xml":["uvt","uvvt"],"application/vnd.dece.unspecified":["uvx","uvvx"],"application/vnd.dece.zip":["uvz","uvvz"],"application/vnd.denovo.fcselayout-link":["fe_launch"],"application/vnd.dna":["dna"],"application/vnd.dolby.mlp":["mlp"],"application/vnd.dpgraph":["dpg"],"application/vnd.dreamfactory":["dfac"],"application/vnd.ds-keypoint":["kpxx"],"application/vnd.dvb.ait":["ait"],"application/vnd.dvb.service":["svc"],"application/vnd.dynageo":["geo"],"application/vnd.ecowin.chart":["mag"],"application/vnd.enliven":["nml"],"application/vnd.epson.esf":["esf"],"application/vnd.epson.msf":["msf"],"application/vnd.epson.quickanime":["qam"],"application/vnd.epson.salt":["slt"],"application/vnd.epson.ssf":["ssf"],"application/vnd.eszigno3+xml":["es3","et3"],"application/vnd.ezpix-album":["ez2"],"application/vnd.ezpix-package":["ez3"],"application/vnd.fdf":["fdf"],"application/vnd.fdsn.mseed":["mseed"],"application/vnd.fdsn.seed":["seed","dataless"],"application/vnd.flographit":["gph"],"application/vnd.fluxtime.clip":["ftc"],"application/vnd.framemaker":["fm","frame","maker","book"],"application/vnd.frogans.fnc":["fnc"],"application/vnd.frogans.ltf":["ltf"],"application/vnd.fsc.weblaunch":["fsc"],"application/vnd.fujitsu.oasys":["oas"],"application/vnd.fujitsu.oasys2":["oa2"],"application/vnd.fujitsu.oasys3":["oa3"],"application/vnd.fujitsu.oasysgp":["fg5"],"application/vnd.fujitsu.oasysprs":["bh2"],"application/vnd.fujixerox.ddd":["ddd"],"application/vnd.fujixerox.docuworks":["xdw"],"application/vnd.fujixerox.docuworks.binder":["xbd"],"application/vnd.fuzzysheet":["fzs"],"application/vnd.genomatix.tuxedo":["txd"],"application/vnd.geogebra.file":["ggb"],"application/vnd.geogebra.tool":["ggt"],"application/vnd.geometry-explorer":["gex","gre"],"application/vnd.geonext":["gxt"],"application/vnd.geoplan":["g2w"],"application/vnd.geospace":["g3w"],"application/vnd.gmx":["gmx"],"application/vnd.google-apps.document":["gdoc"],"application/vnd.google-apps.presentation":["gslides"],"application/vnd.google-apps.spreadsheet":["gsheet"],"application/vnd.google-earth.kml+xml":["kml"],"application/vnd.google-earth.kmz":["kmz"],"application/vnd.grafeq":["gqf","gqs"],"application/vnd.groove-account":["gac"],"application/vnd.groove-help":["ghf"],"application/vnd.groove-identity-message":["gim"],"application/vnd.groove-injector":["grv"],"application/vnd.groove-tool-message":["gtm"],"application/vnd.groove-tool-template":["tpl"],"application/vnd.groove-vcard":["vcg"],"application/vnd.hal+xml":["hal"],"application/vnd.handheld-entertainment+xml":["zmm"],"application/vnd.hbci":["hbci"],"application/vnd.hhe.lesson-player":["les"],"application/vnd.hp-hpgl":["hpgl"],"application/vnd.hp-hpid":["hpid"],"application/vnd.hp-hps":["hps"],"application/vnd.hp-jlyt":["jlt"],"application/vnd.hp-pcl":["pcl"],"application/vnd.hp-pclxl":["pclxl"],"application/vnd.hydrostatix.sof-data":["sfd-hdstx"],"application/vnd.ibm.minipay":["mpy"],"application/vnd.ibm.modcap":["afp","listafp","list3820"],"application/vnd.ibm.rights-management":["irm"],"application/vnd.ibm.secure-container":["sc"],"application/vnd.iccprofile":["icc","icm"],"application/vnd.igloader":["igl"],"application/vnd.immervision-ivp":["ivp"],"application/vnd.immervision-ivu":["ivu"],"application/vnd.insors.igm":["igm"],"application/vnd.intercon.formnet":["xpw","xpx"],"application/vnd.intergeo":["i2g"],"application/vnd.intu.qbo":["qbo"],"application/vnd.intu.qfx":["qfx"],"application/vnd.ipunplugged.rcprofile":["rcprofile"],"application/vnd.irepository.package+xml":["irp"],"application/vnd.is-xpr":["xpr"],"application/vnd.isac.fcs":["fcs"],"application/vnd.jam":["jam"],"application/vnd.jcp.javame.midlet-rms":["rms"],"application/vnd.jisp":["jisp"],"application/vnd.joost.joda-archive":["joda"],"application/vnd.kahootz":["ktz","ktr"],"application/vnd.kde.karbon":["karbon"],"application/vnd.kde.kchart":["chrt"],"application/vnd.kde.kformula":["kfo"],"application/vnd.kde.kivio":["flw"],"application/vnd.kde.kontour":["kon"],"application/vnd.kde.kpresenter":["kpr","kpt"],"application/vnd.kde.kspread":["ksp"],"application/vnd.kde.kword":["kwd","kwt"],"application/vnd.kenameaapp":["htke"],"application/vnd.kidspiration":["kia"],"application/vnd.kinar":["kne","knp"],"application/vnd.koan":["skp","skd","skt","skm"],"application/vnd.kodak-descriptor":["sse"],"application/vnd.las.las+xml":["lasxml"],"application/vnd.llamagraphics.life-balance.desktop":["lbd"],"application/vnd.llamagraphics.life-balance.exchange+xml":["lbe"],"application/vnd.lotus-1-2-3":["123"],"application/vnd.lotus-approach":["apr"],"application/vnd.lotus-freelance":["pre"],"application/vnd.lotus-notes":["nsf"],"application/vnd.lotus-organizer":["org"],"application/vnd.lotus-screencam":["scm"],"application/vnd.lotus-wordpro":["lwp"],"application/vnd.macports.portpkg":["portpkg"],"application/vnd.mcd":["mcd"],"application/vnd.medcalcdata":["mc1"],"application/vnd.mediastation.cdkey":["cdkey"],"application/vnd.mfer":["mwf"],"application/vnd.mfmp":["mfm"],"application/vnd.micrografx.flo":["flo"],"application/vnd.micrografx.igx":["igx"],"application/vnd.mif":["mif"],"application/vnd.mobius.daf":["daf"],"application/vnd.mobius.dis":["dis"],"application/vnd.mobius.mbk":["mbk"],"application/vnd.mobius.mqy":["mqy"],"application/vnd.mobius.msl":["msl"],"application/vnd.mobius.plc":["plc"],"application/vnd.mobius.txf":["txf"],"application/vnd.mophun.application":["mpn"],"application/vnd.mophun.certificate":["mpc"],"application/vnd.mozilla.xul+xml":["xul"],"application/vnd.ms-artgalry":["cil"],"application/vnd.ms-cab-compressed":["cab"],"application/vnd.ms-excel":["xls","xlm","xla","xlc","xlt","xlw"],"application/vnd.ms-excel.addin.macroenabled.12":["xlam"],"application/vnd.ms-excel.sheet.binary.macroenabled.12":["xlsb"],"application/vnd.ms-excel.sheet.macroenabled.12":["xlsm"],"application/vnd.ms-excel.template.macroenabled.12":["xltm"],"application/vnd.ms-fontobject":["eot"],"application/vnd.ms-htmlhelp":["chm"],"application/vnd.ms-ims":["ims"],"application/vnd.ms-lrm":["lrm"],"application/vnd.ms-officetheme":["thmx"],"application/vnd.ms-outlook":["msg"],"application/vnd.ms-pki.seccat":["cat"],"application/vnd.ms-pki.stl":["*stl"],"application/vnd.ms-powerpoint":["ppt","pps","pot"],"application/vnd.ms-powerpoint.addin.macroenabled.12":["ppam"],"application/vnd.ms-powerpoint.presentation.macroenabled.12":["pptm"],"application/vnd.ms-powerpoint.slide.macroenabled.12":["sldm"],"application/vnd.ms-powerpoint.slideshow.macroenabled.12":["ppsm"],"application/vnd.ms-powerpoint.template.macroenabled.12":["potm"],"application/vnd.ms-project":["mpp","mpt"],"application/vnd.ms-word.document.macroenabled.12":["docm"],"application/vnd.ms-word.template.macroenabled.12":["dotm"],"application/vnd.ms-works":["wps","wks","wcm","wdb"],"application/vnd.ms-wpl":["wpl"],"application/vnd.ms-xpsdocument":["xps"],"application/vnd.mseq":["mseq"],"application/vnd.musician":["mus"],"application/vnd.muvee.style":["msty"],"application/vnd.mynfc":["taglet"],"application/vnd.neurolanguage.nlu":["nlu"],"application/vnd.nitf":["ntf","nitf"],"application/vnd.noblenet-directory":["nnd"],"application/vnd.noblenet-sealer":["nns"],"application/vnd.noblenet-web":["nnw"],"application/vnd.nokia.n-gage.ac+xml":["*ac"],"application/vnd.nokia.n-gage.data":["ngdat"],"application/vnd.nokia.n-gage.symbian.install":["n-gage"],"application/vnd.nokia.radio-preset":["rpst"],"application/vnd.nokia.radio-presets":["rpss"],"application/vnd.novadigm.edm":["edm"],"application/vnd.novadigm.edx":["edx"],"application/vnd.novadigm.ext":["ext"],"application/vnd.oasis.opendocument.chart":["odc"],"application/vnd.oasis.opendocument.chart-template":["otc"],"application/vnd.oasis.opendocument.database":["odb"],"application/vnd.oasis.opendocument.formula":["odf"],"application/vnd.oasis.opendocument.formula-template":["odft"],"application/vnd.oasis.opendocument.graphics":["odg"],"application/vnd.oasis.opendocument.graphics-template":["otg"],"application/vnd.oasis.opendocument.image":["odi"],"application/vnd.oasis.opendocument.image-template":["oti"],"application/vnd.oasis.opendocument.presentation":["odp"],"application/vnd.oasis.opendocument.presentation-template":["otp"],"application/vnd.oasis.opendocument.spreadsheet":["ods"],"application/vnd.oasis.opendocument.spreadsheet-template":["ots"],"application/vnd.oasis.opendocument.text":["odt"],"application/vnd.oasis.opendocument.text-master":["odm"],"application/vnd.oasis.opendocument.text-template":["ott"],"application/vnd.oasis.opendocument.text-web":["oth"],"application/vnd.olpc-sugar":["xo"],"application/vnd.oma.dd2+xml":["dd2"],"application/vnd.openblox.game+xml":["obgx"],"application/vnd.openofficeorg.extension":["oxt"],"application/vnd.openstreetmap.data+xml":["osm"],"application/vnd.openxmlformats-officedocument.presentationml.presentation":["pptx"],"application/vnd.openxmlformats-officedocument.presentationml.slide":["sldx"],"application/vnd.openxmlformats-officedocument.presentationml.slideshow":["ppsx"],"application/vnd.openxmlformats-officedocument.presentationml.template":["potx"],"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":["xlsx"],"application/vnd.openxmlformats-officedocument.spreadsheetml.template":["xltx"],"application/vnd.openxmlformats-officedocument.wordprocessingml.document":["docx"],"application/vnd.openxmlformats-officedocument.wordprocessingml.template":["dotx"],"application/vnd.osgeo.mapguide.package":["mgp"],"application/vnd.osgi.dp":["dp"],"application/vnd.osgi.subsystem":["esa"],"application/vnd.palm":["pdb","pqa","oprc"],"application/vnd.pawaafile":["paw"],"application/vnd.pg.format":["str"],"application/vnd.pg.osasli":["ei6"],"application/vnd.picsel":["efif"],"application/vnd.pmi.widget":["wg"],"application/vnd.pocketlearn":["plf"],"application/vnd.powerbuilder6":["pbd"],"application/vnd.previewsystems.box":["box"],"application/vnd.proteus.magazine":["mgz"],"application/vnd.publishare-delta-tree":["qps"],"application/vnd.pvi.ptid1":["ptid"],"application/vnd.quark.quarkxpress":["qxd","qxt","qwd","qwt","qxl","qxb"],"application/vnd.rar":["rar"],"application/vnd.realvnc.bed":["bed"],"application/vnd.recordare.musicxml":["mxl"],"application/vnd.recordare.musicxml+xml":["musicxml"],"application/vnd.rig.cryptonote":["cryptonote"],"application/vnd.rim.cod":["cod"],"application/vnd.rn-realmedia":["rm"],"application/vnd.rn-realmedia-vbr":["rmvb"],"application/vnd.route66.link66+xml":["link66"],"application/vnd.sailingtracker.track":["st"],"application/vnd.seemail":["see"],"application/vnd.sema":["sema"],"application/vnd.semd":["semd"],"application/vnd.semf":["semf"],"application/vnd.shana.informed.formdata":["ifm"],"application/vnd.shana.informed.formtemplate":["itp"],"application/vnd.shana.informed.interchange":["iif"],"application/vnd.shana.informed.package":["ipk"],"application/vnd.simtech-mindmapper":["twd","twds"],"application/vnd.smaf":["mmf"],"application/vnd.smart.teacher":["teacher"],"application/vnd.software602.filler.form+xml":["fo"],"application/vnd.solent.sdkm+xml":["sdkm","sdkd"],"application/vnd.spotfire.dxp":["dxp"],"application/vnd.spotfire.sfs":["sfs"],"application/vnd.stardivision.calc":["sdc"],"application/vnd.stardivision.draw":["sda"],"application/vnd.stardivision.impress":["sdd"],"application/vnd.stardivision.math":["smf"],"application/vnd.stardivision.writer":["sdw","vor"],"application/vnd.stardivision.writer-global":["sgl"],"application/vnd.stepmania.package":["smzip"],"application/vnd.stepmania.stepchart":["sm"],"application/vnd.sun.wadl+xml":["wadl"],"application/vnd.sun.xml.calc":["sxc"],"application/vnd.sun.xml.calc.template":["stc"],"application/vnd.sun.xml.draw":["sxd"],"application/vnd.sun.xml.draw.template":["std"],"application/vnd.sun.xml.impress":["sxi"],"application/vnd.sun.xml.impress.template":["sti"],"application/vnd.sun.xml.math":["sxm"],"application/vnd.sun.xml.writer":["sxw"],"application/vnd.sun.xml.writer.global":["sxg"],"application/vnd.sun.xml.writer.template":["stw"],"application/vnd.sus-calendar":["sus","susp"],"application/vnd.svd":["svd"],"application/vnd.symbian.install":["sis","sisx"],"application/vnd.syncml+xml":["xsm"],"application/vnd.syncml.dm+wbxml":["bdm"],"application/vnd.syncml.dm+xml":["xdm"],"application/vnd.syncml.dmddf+xml":["ddf"],"application/vnd.tao.intent-module-archive":["tao"],"application/vnd.tcpdump.pcap":["pcap","cap","dmp"],"application/vnd.tmobile-livetv":["tmo"],"application/vnd.trid.tpt":["tpt"],"application/vnd.triscape.mxs":["mxs"],"application/vnd.trueapp":["tra"],"application/vnd.ufdl":["ufd","ufdl"],"application/vnd.uiq.theme":["utz"],"application/vnd.umajin":["umj"],"application/vnd.unity":["unityweb"],"application/vnd.uoml+xml":["uoml"],"application/vnd.vcx":["vcx"],"application/vnd.visio":["vsd","vst","vss","vsw"],"application/vnd.visionary":["vis"],"application/vnd.vsf":["vsf"],"application/vnd.wap.wbxml":["wbxml"],"application/vnd.wap.wmlc":["wmlc"],"application/vnd.wap.wmlscriptc":["wmlsc"],"application/vnd.webturbo":["wtb"],"application/vnd.wolfram.player":["nbp"],"application/vnd.wordperfect":["wpd"],"application/vnd.wqd":["wqd"],"application/vnd.wt.stf":["stf"],"application/vnd.xara":["xar"],"application/vnd.xfdl":["xfdl"],"application/vnd.yamaha.hv-dic":["hvd"],"application/vnd.yamaha.hv-script":["hvs"],"application/vnd.yamaha.hv-voice":["hvp"],"application/vnd.yamaha.openscoreformat":["osf"],"application/vnd.yamaha.openscoreformat.osfpvg+xml":["osfpvg"],"application/vnd.yamaha.smaf-audio":["saf"],"application/vnd.yamaha.smaf-phrase":["spf"],"application/vnd.yellowriver-custom-menu":["cmp"],"application/vnd.zul":["zir","zirz"],"application/vnd.zzazz.deck+xml":["zaz"],"application/x-7z-compressed":["7z"],"application/x-abiword":["abw"],"application/x-ace-compressed":["ace"],"application/x-apple-diskimage":["*dmg"],"application/x-arj":["arj"],"application/x-authorware-bin":["aab","x32","u32","vox"],"application/x-authorware-map":["aam"],"application/x-authorware-seg":["aas"],"application/x-bcpio":["bcpio"],"application/x-bdoc":["*bdoc"],"application/x-bittorrent":["torrent"],"application/x-blorb":["blb","blorb"],"application/x-bzip":["bz"],"application/x-bzip2":["bz2","boz"],"application/x-cbr":["cbr","cba","cbt","cbz","cb7"],"application/x-cdlink":["vcd"],"application/x-cfs-compressed":["cfs"],"application/x-chat":["chat"],"application/x-chess-pgn":["pgn"],"application/x-chrome-extension":["crx"],"application/x-cocoa":["cco"],"application/x-conference":["nsc"],"application/x-cpio":["cpio"],"application/x-csh":["csh"],"application/x-debian-package":["*deb","udeb"],"application/x-dgc-compressed":["dgc"],"application/x-director":["dir","dcr","dxr","cst","cct","cxt","w3d","fgd","swa"],"application/x-doom":["wad"],"application/x-dtbncx+xml":["ncx"],"application/x-dtbook+xml":["dtb"],"application/x-dtbresource+xml":["res"],"application/x-dvi":["dvi"],"application/x-envoy":["evy"],"application/x-eva":["eva"],"application/x-font-bdf":["bdf"],"application/x-font-ghostscript":["gsf"],"application/x-font-linux-psf":["psf"],"application/x-font-pcf":["pcf"],"application/x-font-snf":["snf"],"application/x-font-type1":["pfa","pfb","pfm","afm"],"application/x-freearc":["arc"],"application/x-futuresplash":["spl"],"application/x-gca-compressed":["gca"],"application/x-glulx":["ulx"],"application/x-gnumeric":["gnumeric"],"application/x-gramps-xml":["gramps"],"application/x-gtar":["gtar"],"application/x-hdf":["hdf"],"application/x-httpd-php":["php"],"application/x-install-instructions":["install"],"application/x-iso9660-image":["*iso"],"application/x-java-archive-diff":["jardiff"],"application/x-java-jnlp-file":["jnlp"],"application/x-keepass2":["kdbx"],"application/x-latex":["latex"],"application/x-lua-bytecode":["luac"],"application/x-lzh-compressed":["lzh","lha"],"application/x-makeself":["run"],"application/x-mie":["mie"],"application/x-mobipocket-ebook":["prc","mobi"],"application/x-ms-application":["application"],"application/x-ms-shortcut":["lnk"],"application/x-ms-wmd":["wmd"],"application/x-ms-wmz":["wmz"],"application/x-ms-xbap":["xbap"],"application/x-msaccess":["mdb"],"application/x-msbinder":["obd"],"application/x-mscardfile":["crd"],"application/x-msclip":["clp"],"application/x-msdos-program":["*exe"],"application/x-msdownload":["*exe","*dll","com","bat","*msi"],"application/x-msmediaview":["mvb","m13","m14"],"application/x-msmetafile":["*wmf","*wmz","*emf","emz"],"application/x-msmoney":["mny"],"application/x-mspublisher":["pub"],"application/x-msschedule":["scd"],"application/x-msterminal":["trm"],"application/x-mswrite":["wri"],"application/x-netcdf":["nc","cdf"],"application/x-ns-proxy-autoconfig":["pac"],"application/x-nzb":["nzb"],"application/x-perl":["pl","pm"],"application/x-pilot":["*prc","*pdb"],"application/x-pkcs12":["p12","pfx"],"application/x-pkcs7-certificates":["p7b","spc"],"application/x-pkcs7-certreqresp":["p7r"],"application/x-rar-compressed":["*rar"],"application/x-redhat-package-manager":["rpm"],"application/x-research-info-systems":["ris"],"application/x-sea":["sea"],"application/x-sh":["sh"],"application/x-shar":["shar"],"application/x-shockwave-flash":["swf"],"application/x-silverlight-app":["xap"],"application/x-sql":["sql"],"application/x-stuffit":["sit"],"application/x-stuffitx":["sitx"],"application/x-subrip":["srt"],"application/x-sv4cpio":["sv4cpio"],"application/x-sv4crc":["sv4crc"],"application/x-t3vm-image":["t3"],"application/x-tads":["gam"],"application/x-tar":["tar"],"application/x-tcl":["tcl","tk"],"application/x-tex":["tex"],"application/x-tex-tfm":["tfm"],"application/x-texinfo":["texinfo","texi"],"application/x-tgif":["*obj"],"application/x-ustar":["ustar"],"application/x-virtualbox-hdd":["hdd"],"application/x-virtualbox-ova":["ova"],"application/x-virtualbox-ovf":["ovf"],"application/x-virtualbox-vbox":["vbox"],"application/x-virtualbox-vbox-extpack":["vbox-extpack"],"application/x-virtualbox-vdi":["vdi"],"application/x-virtualbox-vhd":["vhd"],"application/x-virtualbox-vmdk":["vmdk"],"application/x-wais-source":["src"],"application/x-web-app-manifest+json":["webapp"],"application/x-x509-ca-cert":["der","crt","pem"],"application/x-xfig":["fig"],"application/x-xliff+xml":["*xlf"],"application/x-xpinstall":["xpi"],"application/x-xz":["xz"],"application/x-zmachine":["z1","z2","z3","z4","z5","z6","z7","z8"],"audio/vnd.dece.audio":["uva","uvva"],"audio/vnd.digital-winds":["eol"],"audio/vnd.dra":["dra"],"audio/vnd.dts":["dts"],"audio/vnd.dts.hd":["dtshd"],"audio/vnd.lucent.voice":["lvp"],"audio/vnd.ms-playready.media.pya":["pya"],"audio/vnd.nuera.ecelp4800":["ecelp4800"],"audio/vnd.nuera.ecelp7470":["ecelp7470"],"audio/vnd.nuera.ecelp9600":["ecelp9600"],"audio/vnd.rip":["rip"],"audio/x-aac":["aac"],"audio/x-aiff":["aif","aiff","aifc"],"audio/x-caf":["caf"],"audio/x-flac":["flac"],"audio/x-m4a":["*m4a"],"audio/x-matroska":["mka"],"audio/x-mpegurl":["m3u"],"audio/x-ms-wax":["wax"],"audio/x-ms-wma":["wma"],"audio/x-pn-realaudio":["ram","ra"],"audio/x-pn-realaudio-plugin":["rmp"],"audio/x-realaudio":["*ra"],"audio/x-wav":["*wav"],"chemical/x-cdx":["cdx"],"chemical/x-cif":["cif"],"chemical/x-cmdf":["cmdf"],"chemical/x-cml":["cml"],"chemical/x-csml":["csml"],"chemical/x-xyz":["xyz"],"image/prs.btif":["btif"],"image/prs.pti":["pti"],"image/vnd.adobe.photoshop":["psd"],"image/vnd.airzip.accelerator.azv":["azv"],"image/vnd.dece.graphic":["uvi","uvvi","uvg","uvvg"],"image/vnd.djvu":["djvu","djv"],"image/vnd.dvb.subtitle":["*sub"],"image/vnd.dwg":["dwg"],"image/vnd.dxf":["dxf"],"image/vnd.fastbidsheet":["fbs"],"image/vnd.fpx":["fpx"],"image/vnd.fst":["fst"],"image/vnd.fujixerox.edmics-mmr":["mmr"],"image/vnd.fujixerox.edmics-rlc":["rlc"],"image/vnd.microsoft.icon":["ico"],"image/vnd.ms-dds":["dds"],"image/vnd.ms-modi":["mdi"],"image/vnd.ms-photo":["wdp"],"image/vnd.net-fpx":["npx"],"image/vnd.pco.b16":["b16"],"image/vnd.tencent.tap":["tap"],"image/vnd.valve.source.texture":["vtf"],"image/vnd.wap.wbmp":["wbmp"],"image/vnd.xiff":["xif"],"image/vnd.zbrush.pcx":["pcx"],"image/x-3ds":["3ds"],"image/x-cmu-raster":["ras"],"image/x-cmx":["cmx"],"image/x-freehand":["fh","fhc","fh4","fh5","fh7"],"image/x-icon":["*ico"],"image/x-jng":["jng"],"image/x-mrsid-image":["sid"],"image/x-ms-bmp":["*bmp"],"image/x-pcx":["*pcx"],"image/x-pict":["pic","pct"],"image/x-portable-anymap":["pnm"],"image/x-portable-bitmap":["pbm"],"image/x-portable-graymap":["pgm"],"image/x-portable-pixmap":["ppm"],"image/x-rgb":["rgb"],"image/x-tga":["tga"],"image/x-xbitmap":["xbm"],"image/x-xpixmap":["xpm"],"image/x-xwindowdump":["xwd"],"message/vnd.wfa.wsc":["wsc"],"model/vnd.collada+xml":["dae"],"model/vnd.dwf":["dwf"],"model/vnd.gdl":["gdl"],"model/vnd.gtw":["gtw"],"model/vnd.mts":["mts"],"model/vnd.opengex":["ogex"],"model/vnd.parasolid.transmit.binary":["x_b"],"model/vnd.parasolid.transmit.text":["x_t"],"model/vnd.usdz+zip":["usdz"],"model/vnd.valve.source.compiled-map":["bsp"],"model/vnd.vtu":["vtu"],"text/prs.lines.tag":["dsc"],"text/vnd.curl":["curl"],"text/vnd.curl.dcurl":["dcurl"],"text/vnd.curl.mcurl":["mcurl"],"text/vnd.curl.scurl":["scurl"],"text/vnd.dvb.subtitle":["sub"],"text/vnd.fly":["fly"],"text/vnd.fmi.flexstor":["flx"],"text/vnd.graphviz":["gv"],"text/vnd.in3d.3dml":["3dml"],"text/vnd.in3d.spot":["spot"],"text/vnd.sun.j2me.app-descriptor":["jad"],"text/vnd.wap.wml":["wml"],"text/vnd.wap.wmlscript":["wmls"],"text/x-asm":["s","asm"],"text/x-c":["c","cc","cxx","cpp","h","hh","dic"],"text/x-component":["htc"],"text/x-fortran":["f","for","f77","f90"],"text/x-handlebars-template":["hbs"],"text/x-java-source":["java"],"text/x-lua":["lua"],"text/x-markdown":["mkd"],"text/x-nfo":["nfo"],"text/x-opml":["opml"],"text/x-org":["*org"],"text/x-pascal":["p","pas"],"text/x-processing":["pde"],"text/x-sass":["sass"],"text/x-scss":["scss"],"text/x-setext":["etx"],"text/x-sfv":["sfv"],"text/x-suse-ymp":["ymp"],"text/x-uuencode":["uu"],"text/x-vcalendar":["vcs"],"text/x-vcard":["vcf"],"video/vnd.dece.hd":["uvh","uvvh"],"video/vnd.dece.mobile":["uvm","uvvm"],"video/vnd.dece.pd":["uvp","uvvp"],"video/vnd.dece.sd":["uvs","uvvs"],"video/vnd.dece.video":["uvv","uvvv"],"video/vnd.dvb.file":["dvb"],"video/vnd.fvt":["fvt"],"video/vnd.mpegurl":["mxu","m4u"],"video/vnd.ms-playready.media.pyv":["pyv"],"video/vnd.uvvu.mp4":["uvu","uvvu"],"video/vnd.vivo":["viv"],"video/x-f4v":["f4v"],"video/x-fli":["fli"],"video/x-flv":["flv"],"video/x-m4v":["m4v"],"video/x-matroska":["mkv","mk3d","mks"],"video/x-mng":["mng"],"video/x-ms-asf":["asf","asx"],"video/x-ms-vob":["vob"],"video/x-ms-wm":["wm"],"video/x-ms-wmv":["wmv"],"video/x-ms-wmx":["wmx"],"video/x-ms-wvx":["wvx"],"video/x-msvideo":["avi"],"video/x-sgi-movie":["movie"],"video/x-smv":["smv"],"x-conference/x-cooltalk":["ice"]};
},{}],21:[function(require,module,exports){
module.exports = {"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomdeleted+xml":["atomdeleted"],"application/atomsvc+xml":["atomsvc"],"application/atsc-dwd+xml":["dwd"],"application/atsc-held+xml":["held"],"application/atsc-rsat+xml":["rsat"],"application/bdoc":["bdoc"],"application/calendar+xml":["xcs"],"application/ccxml+xml":["ccxml"],"application/cdfx+xml":["cdfx"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mpd"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["ecma","es"],"application/emma+xml":["emma"],"application/emotionml+xml":["emotionml"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/fdt+xml":["fdt"],"application/font-tdpfr":["pfr"],"application/geo+json":["geojson"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/gzip":["gz"],"application/hjson":["hjson"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/its+xml":["its"],"application/java-archive":["jar","war","ear"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js","mjs"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/ld+json":["jsonld"],"application/lgr+xml":["lgr"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/manifest+json":["webmanifest"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mmt-aei+xml":["maei"],"application/mmt-usd+xml":["musd"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/mrb-consumer+xml":["*xdf"],"application/mrb-publish+xml":["*xdf"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/n-quads":["nq"],"application/n-triples":["nt"],"application/node":["cjs"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/p2p-overlay+xml":["relo"],"application/patch-ops-error+xml":["*xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/provenance+xml":["provx"],"application/pskc+xml":["pskcxml"],"application/raml+yaml":["raml"],"application/rdf+xml":["rdf","owl"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/route-apd+xml":["rapd"],"application/route-s-tsid+xml":["sls"],"application/route-usd+xml":["rusd"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/senml+xml":["senmlx"],"application/sensml+xml":["sensmlx"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/sieve":["siv","sieve"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/swid+xml":["swidtag"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/toml":["toml"],"application/ttml+xml":["ttml"],"application/ubjson":["ubj"],"application/urc-ressheet+xml":["rsheet"],"application/urc-targetdesc+xml":["td"],"application/voicexml+xml":["vxml"],"application/wasm":["wasm"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/xaml+xml":["xaml"],"application/xcap-att+xml":["xav"],"application/xcap-caps+xml":["xca"],"application/xcap-diff+xml":["xdf"],"application/xcap-el+xml":["xel"],"application/xcap-error+xml":["xer"],"application/xcap-ns+xml":["xns"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xliff+xml":["xlf"],"application/xml":["xml","xsl","xsd","rng"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["*xsl","xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/3gpp":["*3gpp"],"audio/adpcm":["adp"],"audio/amr":["amr"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mobile-xmf":["mxmf"],"audio/mp3":["*mp3"],"audio/mp4":["m4a","mp4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx","opus"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/wav":["wav"],"audio/wave":["*wav"],"audio/webm":["weba"],"audio/xm":["xm"],"font/collection":["ttc"],"font/otf":["otf"],"font/ttf":["ttf"],"font/woff":["woff"],"font/woff2":["woff2"],"image/aces":["exr"],"image/apng":["apng"],"image/avif":["avif"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/dicom-rle":["drle"],"image/emf":["emf"],"image/fits":["fits"],"image/g3fax":["g3"],"image/gif":["gif"],"image/heic":["heic"],"image/heic-sequence":["heics"],"image/heif":["heif"],"image/heif-sequence":["heifs"],"image/hej2k":["hej2"],"image/hsj2":["hsj2"],"image/ief":["ief"],"image/jls":["jls"],"image/jp2":["jp2","jpg2"],"image/jpeg":["jpeg","jpg","jpe"],"image/jph":["jph"],"image/jphc":["jhc"],"image/jpm":["jpm"],"image/jpx":["jpx","jpf"],"image/jxr":["jxr"],"image/jxra":["jxra"],"image/jxrs":["jxrs"],"image/jxs":["jxs"],"image/jxsc":["jxsc"],"image/jxsi":["jxsi"],"image/jxss":["jxss"],"image/ktx":["ktx"],"image/ktx2":["ktx2"],"image/png":["png"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/t38":["t38"],"image/tiff":["tif","tiff"],"image/tiff-fx":["tfx"],"image/webp":["webp"],"image/wmf":["wmf"],"message/disposition-notification":["disposition-notification"],"message/global":["u8msg"],"message/global-delivery-status":["u8dsn"],"message/global-disposition-notification":["u8mdn"],"message/global-headers":["u8hdr"],"message/rfc822":["eml","mime"],"model/3mf":["3mf"],"model/gltf+json":["gltf"],"model/gltf-binary":["glb"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/mtl":["mtl"],"model/obj":["obj"],"model/stl":["stl"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["*x3db","x3dbz"],"model/x3d+fastinfoset":["x3db"],"model/x3d+vrml":["*x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"model/x3d-vrml":["x3dv"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee","litcoffee"],"text/css":["css"],"text/csv":["csv"],"text/html":["html","htm","shtml"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/markdown":["markdown","md"],"text/mathml":["mml"],"text/mdx":["mdx"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/richtext":["rtx"],"text/rtf":["*rtf"],"text/sgml":["sgml","sgm"],"text/shex":["shex"],"text/slim":["slim","slm"],"text/spdx":["spdx"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vtt":["vtt"],"text/xml":["*xml"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp","3gpp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/iso.segment":["m4s"],"video/jpeg":["jpgv"],"video/jpm":["*jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/webm":["webm"]};
},{}],22:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))

},{"_process":23}],23:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],24:[function(require,module,exports){
(function (global){(function (){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],25:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],26:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],27:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":25,"./encode":26}],28:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":29,"punycode":24,"querystring":27}],29:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],30:[function(require,module,exports){
(function (Buffer){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CBOR = require('borc');
const knownSections = [
    'critical',
    'index',
    'manifest',
    'responses',
    'signatures',
];
/** This class represents parsed Web Bundle. */
class Bundle {
    constructor(buffer) {
        this.sections = {};
        this.responses = {}; // Offset-in-responses -> resp
        const wbn = asArray(CBOR.decode(buffer));
        if (wbn.length !== 6) {
            throw new Error('Wrong toplevel structure');
        }
        const [magic, version, primaryURL, sectionLengthsCBOR, sections, length,] = wbn;
        if (bytestringToString(magic) !== '🌐📦') {
            throw new Error('Wrong magic');
        }
        this.version = bytestringToString(version).replace(/\0+$/, ''); // Strip off the '\0' paddings.
        this.primaryURL = asString(primaryURL);
        const sectionLengths = asArray(CBOR.decode(asBytestring(sectionLengthsCBOR)));
        const sectionsArray = asArray(sections);
        if (sectionLengths.length !== sectionsArray.length * 2) {
            throw new Error("Number of elements in section-lengths and in sections don't match");
        }
        for (let i = 0; i < sectionsArray.length; i++) {
            this.sections[asString(sectionLengths[i * 2])] = sectionsArray[i];
        }
        if (this.sections['critical']) {
            for (const name of asArray(this.sections['critical'])) {
                if (!knownSections.includes(asString(name))) {
                    throw new Error(`unknown section ${name} is marked as critical`);
                }
            }
        }
        // The index section records (offset, length) of each response, but our
        // CBOR decoder doesn't preserve location information. So, recalculate
        // offset and length of each response here. This is inefficient, but works.
        const responses = asArray(this.sections['responses']);
        let offsetInResponses = encodedLength(responses.length);
        for (const resp of responses) {
            this.responses[offsetInResponses] = new Response(asArray(resp));
            offsetInResponses += encodedLength(resp);
        }
    }
    get manifestURL() {
        if (this.sections['manifest']) {
            return asString(this.sections['manifest']);
        }
        return null;
    }
    get urls() {
        return Object.keys(this.indexSection);
    }
    getResponse(url) {
        const indexEntry = asArray(this.indexSection[url]);
        if (!indexEntry) {
            throw new Error('No entry for ' + url);
        }
        const [variants, offset, length] = indexEntry;
        if (asBytestring(variants).length !== 0) {
            throw new Error('Variants are not supported');
        }
        if (indexEntry.length !== 3) {
            throw new Error('Unexpected length of index entry for ' + url);
        }
        const resp = this.responses[asNumber(offset)];
        if (!resp) {
            throw new Error(`Response for ${url} is not found (broken index)`);
        }
        return resp;
    }
    get indexSection() {
        return asMap(this.sections['index']);
    }
}
exports.Bundle = Bundle;
/** This class represents an HTTP resource in Web Bundle. */
class Response {
    constructor(responsesSectionItem) {
        if (responsesSectionItem.length !== 2) {
            throw new Error('Wrong response structure');
        }
        const { status, headers } = decodeResponseMap(asBytestring(responsesSectionItem[0]));
        this.status = status;
        this.headers = headers;
        this.body = asBytestring(responsesSectionItem[1]);
    }
}
exports.Response = Response;
function encodedLength(value) {
    return CBOR.encode(value).byteLength;
}
function decodeResponseMap(cbor) {
    const decoded = CBOR.decode(cbor);
    if (!(decoded instanceof Map)) {
        throw new Error('Wrong header map structure');
    }
    let status = null;
    const headers = {};
    for (let [key, val] of decoded.entries()) {
        key = bytestringToString(key);
        val = bytestringToString(val);
        if (key === ':status') {
            status = Number(val);
        }
        else if (key.startsWith(':')) {
            throw new Error('Unknown psuedo header ' + key);
        }
        else {
            headers[key] = val;
        }
    }
    if (!status) {
        throw new Error('No :status in response header map');
    }
    return { status, headers };
}
// Type assertions and conversions for CBOR-decoded objects.
function asArray(x) {
    if (x instanceof Array) {
        return x;
    }
    throw new Error('Array expected, but got ' + typeof x);
}
function asMap(x) {
    if (typeof x === 'object' && x !== null && !(x instanceof Array)) {
        return x;
    }
    throw new Error('Map expected, but got ' + typeof x);
}
function asNumber(x) {
    if (typeof x === 'number') {
        return x;
    }
    throw new Error('Number expected, but got ' + typeof x);
}
function asString(x) {
    if (typeof x === 'string') {
        return x;
    }
    throw new Error('String expected, but got ' + typeof x);
}
function asBytestring(x) {
    if (x instanceof Buffer) {
        return x;
    }
    throw new Error('Bytestring expected, but got ' + typeof x);
}
function bytestringToString(bstr) {
    if (!(bstr instanceof Buffer)) {
        throw new Error('Bytestring expected');
    }
    return bstr.toString('utf-8');
}

}).call(this)}).call(this,require("buffer").Buffer)

},{"borc":8,"buffer":13}],31:[function(require,module,exports){
(function (Buffer){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CBOR = require('borc');
const fs = require("fs");
const mime = require("mime");
const path = require("path");
const url_1 = require("url");
class BundleBuilder {
    constructor(primaryURL) {
        this.primaryURL = primaryURL;
        this.sectionLengths = [];
        this.sections = [];
        this.responses = [];
        this.index = new Map();
        this.currentResponsesOffset = 0;
        validateExchangeURL(primaryURL);
    }
    // TODO: Provide async version of this.
    createBundle() {
        if (!this.index.has(this.primaryURL)) {
            throw new Error(`Exchange for primary URL (${this.primaryURL}) does not exist`);
        }
        this.addSection('index', this.fixupIndex());
        this.addSection('responses', this.responses);
        const estimatedBundleSize = this.sectionLengths.reduce((size, s) => size + s.length, 16384 // For headers (including primary URL)
        );
        const wbn = encodeCanonical(this.createTopLevel(), estimatedBundleSize);
        // Fill in the length field.
        const view = new DataView(wbn.buffer, wbn.byteOffset + wbn.length - 8);
        view.setUint32(0, Math.floor(wbn.length / 0x100000000));
        view.setUint32(4, wbn.length & 0xffffffff);
        return wbn;
    }
    addExchange(url, status, headers, payload) {
        validateExchangeURL(url);
        if (typeof payload === 'string') {
            payload = byteString(payload);
        }
        this.addIndexEntry(url, this.addResponse(new HeaderMap(status, headers), payload));
        return this;
    }
    addFile(url, file) {
        const headers = {
            'Content-Type': mime.getType(file) || 'application/octet-stream',
        };
        this.addExchange(url, 200, headers, fs.readFileSync(file));
        return this;
    }
    addFilesRecursively(baseURL, dir) {
        if (!baseURL.endsWith('/')) {
            throw new Error("baseURL must end with '/'.");
        }
        const files = fs.readdirSync(dir);
        files.sort(); // Sort entries for reproducibility.
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                this.addFilesRecursively(baseURL + file + '/', filePath);
            }
            else if (file === 'index.html') {
                // If the file name is 'index.html', create an entry for baseURL itself
                // and another entry for baseURL/index.html which redirects to baseURL.
                // This matches the behavior of gen-bundle.
                this.addFile(baseURL, filePath);
                this.addExchange(baseURL + file, 301, { Location: './' }, '');
            }
            else {
                this.addFile(baseURL + file, filePath);
            }
        }
        return this;
    }
    setManifestURL(url) {
        validateExchangeURL(url);
        this.addSection('manifest', url);
        return this;
    }
    addSection(name, content) {
        if (this.sectionLengths.some(s => s.name === name)) {
            throw new Error('Duplicated section: ' + name);
        }
        let length;
        if (name === 'responses') {
            // The responses section can be large, so avoid using encodedLength()
            // with the entire section's content.
            // Here, this.currentResponsesOffset holds the sum of all response
            // lengths. Adding encodedLength(this.responses.length) to this gives
            // the same result as encodedLength(content).
            length =
                this.currentResponsesOffset + encodedLength(this.responses.length);
        }
        else {
            length = encodedLength(content);
        }
        this.sectionLengths.push({ name, length });
        this.sections.push(content);
    }
    // Adds a response to `this.response`, and returns its length in the
    // responses section.
    addResponse(headerMap, payload) {
        if (payload.length > 0 && !headerMap.has('content-type')) {
            throw new Error('Non-empty exchange must have Content-Type header');
        }
        const response = [new Uint8Array(encodeCanonical(headerMap)), payload];
        this.responses.push(response);
        // This should be the same as encodedLength(response).
        return response.reduce((len, buf) => len + encodedLength(buf.length) + buf.length, 1);
    }
    addIndexEntry(url, responseLength) {
        this.index.set(url, [
            new Uint8Array(0),
            this.currentResponsesOffset,
            responseLength,
        ]);
        this.currentResponsesOffset += responseLength;
    }
    fixupIndex() {
        // Adjust the offsets by the length of the response section's CBOR header.
        const responsesHeaderSize = encodedLength(this.responses.length);
        for (const value of this.index.values()) {
            value[1] += responsesHeaderSize;
        }
        return this.index;
    }
    createTopLevel() {
        const sectionLengths = [];
        for (const s of this.sectionLengths) {
            sectionLengths.push(s.name, s.length);
        }
        return [
            byteString('🌐📦'),
            byteString('b1\0\0'),
            this.primaryURL,
            new Uint8Array(encodeCanonical(sectionLengths)),
            this.sections,
            new Uint8Array(8),
        ];
    }
}
exports.BundleBuilder = BundleBuilder;
class HeaderMap extends Map {
    constructor(status, headers) {
        super();
        if (status < 100 || status > 999) {
            throw new Error('Invalid status code');
        }
        this.set(':status', status.toString());
        for (const key of Object.keys(headers)) {
            this.set(key.toLowerCase(), headers[key]);
        }
    }
    // This tells the CBOR library how to serialize this object.
    encodeCBOR(encoder) {
        // Convert keys and values to Uint8Array, as the CBOR representation of
        // header map is {bytestring => bytestring}.
        const m = new Map();
        for (const [key, value] of this.entries()) {
            m.set(byteString(key), byteString(value));
        }
        return encoder.pushAny(m);
    }
}
// Throws an error if `urlString` is not a valid exchange URL, i.e. it must:
// - be absolute, and
// - have no credentials (user:password@) or hash (#fragment).
function validateExchangeURL(urlString) {
    const url = new url_1.URL(urlString); // This throws if urlString is not an absolute URL.
    if (url.username !== '' || url.password !== '') {
        throw new Error('Exchange URL must not have credentials: ' + urlString);
    }
    if (url.hash !== '') {
        throw new Error('Exchange URL must not have a hash: ' + urlString);
    }
}
// Encodes `value` in canonical CBOR. Throws an error if the result is larger
// than `bufferSize`, because the CBOR encoder silently ignores write errors
// to its internal stream and returns broken data.
function encodeCanonical(value, bufferSize = 1024 * 1024) {
    const buf = CBOR.encodeOne(value, {
        canonical: true,
        highWaterMark: bufferSize,
    });
    if (buf.length >= bufferSize) {
        throw new Error('CBOR encode error: insufficient buffer size');
    }
    return buf;
}
// Returns the length of `value` when CBOR-encoded.
function encodedLength(value, bufferSize = 1024 * 1024) {
    // We don't need to use canonical encoding here.
    const len = CBOR.encodeOne(value, { highWaterMark: bufferSize }).byteLength;
    if (len >= bufferSize) {
        throw new Error('CBOR encode error: insufficient buffer size');
    }
    return len;
}
function byteString(s) {
    return Buffer.from(s, 'utf-8');
}

}).call(this)}).call(this,require("buffer").Buffer)

},{"borc":8,"buffer":13,"fs":12,"mime":19,"path":22,"url":28}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var decoder_1 = require("./decoder");
exports.Bundle = decoder_1.Bundle;
exports.Response = decoder_1.Response;
var encoder_1 = require("./encoder");
exports.BundleBuilder = encoder_1.BundleBuilder;

},{"./decoder":30,"./encoder":31}],33:[function(require,module,exports){
const wbn = require('wbn');
var Buffer = require('buffer').Buffer;

var CACHE_VERSION = 1;
var CACHE_NAME = 'bundle-prototype-cache-v' + CACHE_VERSION;

self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());

    console.log('Install event: ', event);
});

self.addEventListener('activate', function (event) {
    console.log('Activate event: ', event);

    event.waitUntil(self.skipWaiting());

    // delete old caches
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function () {
            return clients.claim();
        }).then(function () {
            console.log('Service worker activated, clients claimed');

            // notify the clients
            return self.clients.matchAll().then((clients) => {
                return Promise.all(clients.map((client) => {
                    return client.postMessage({ type: "activated" });
                }));
            });
        })
    );
});

// returns a Promise that resolves to an array containing the resources not already in the cache
async function computeResourcesToPreload(resources, cache) {
    console.log('computing the list of resources to preload');
    if (resources) {
        var promises = [];
        for (let resource of resources) {
            let resourcePromise = cache.match(resource).then((response) => {
                if (response) {
                    return null;
                } else {
                    return resource;
                }
            });
            promises.push(resourcePromise);
        }
        return Promise.all(promises).then((values) => values.filter(Boolean));
    } else {
        return [];
    }
}

self.addEventListener('message', function (event) {
    console.log('Message event', event.data);

    switch (event.data.command) {
        case 'bundlepreload':
            event.waitUntil(
                caches.open(CACHE_NAME).then(async (cache) => {
                    let wasNotEmpty = (event.data.resources && event.data.resources.length > 0);
                    let resources = await computeResourcesToPreload(event.data.resources, cache);
                    console.log(`resources to preload: ${wasNotEmpty ? resources : 'all'}`);

                    var headers = {};
                    if (wasNotEmpty) {
                        if (resources && resources.length > 0) {
                            headers['bundle-preload'] = resources.join(' ');
                        } else {
                            console.log('all the resources were already in cache, we are done');
                            return;
                        }
                    }
                    // else we will fetch the whole bundle

                    var request = new Request(event.data.source, { headers: new Headers(headers) });
                    const response = await fetch(request);

                    if (response.ok) {
                        // process the bundle
                        let buf = await response.arrayBuffer();
                        var buffer = Buffer.from(buf);
                        const bundle = new wbn.Bundle(buffer);

                        console.log('bundle received', bundle);

                        var promises = [];
                        for (const resource of bundle.urls) {
                            console.log('cache bundled resource: ' + resource);
                            let bundledResponse = bundle.getResponse(resource);
                            let responseToCache =
                                new Response(bundledResponse.body, { headers: bundledResponse.headers });
                            promises.push(cache.put(resource, responseToCache));
                        }

                        return Promise.all(promises).then(
                            self.clients.matchAll().then((clients) => {
                                clients.forEach((client) => {
                                    client.postMessage({
                                        type: "bundlepreload-finished",
                                        url: event.data.source
                                    });
                                });
                            }));
                    } else {
                        console.log('fetch failed', response);
                    }
                }));
            break;
        // do nothing
        default:
            console.log('message: unknown command');
    }
});

self.addEventListener('fetch', function (event) {
    console.log(`fetch: ${event.request.url}`);
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // Cache hit - return response
                if (response) {
                    console.log(`in cache: ${event.request.url}`);
                    return response;
                }

                // TODO if the resource is being fetched as part of a bundle, wait until it arrives

                return fetch(event.request).then(
                    function (response) {
                        // check if we got an invalid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            console.log(`error fetching: ${event.request.url}`, response);
                            return response;
                        }

                        // The response is a stream, we need to clone it
                        // so both the cache and the browser can consume it.
                        var responseToCache = response.clone();

                        event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
                            console.log(`fetched and cached: ${event.request.url}`);
                            cache.put(event.request, responseToCache);
                        }));

                        return response;
                    }
                ).catch((error) => console.log(error));
            })
    );
});


},{"buffer":13,"wbn":32}]},{},[33])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JpZ251bWJlci5qcy9iaWdudW1iZXIuanMiLCJub2RlX21vZHVsZXMvYm9yYy9zcmMvY29uc3RhbnRzLmpzIiwibm9kZV9tb2R1bGVzL2JvcmMvc3JjL2RlY29kZXIuYXNtLmpzIiwibm9kZV9tb2R1bGVzL2JvcmMvc3JjL2RlY29kZXIuanMiLCJub2RlX21vZHVsZXMvYm9yYy9zcmMvZGlhZ25vc2UuanMiLCJub2RlX21vZHVsZXMvYm9yYy9zcmMvZW5jb2Rlci5qcyIsIm5vZGVfbW9kdWxlcy9ib3JjL3NyYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ib3JjL3NyYy9zaW1wbGUuanMiLCJub2RlX21vZHVsZXMvYm9yYy9zcmMvdGFnZ2VkLmpzIiwibm9kZV9tb2R1bGVzL2JvcmMvc3JjL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbGliL19lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pc28tdXJsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzby11cmwvc3JjL3JlbGF0aXZlLmpzIiwibm9kZV9tb2R1bGVzL2lzby11cmwvc3JjL3VybC1icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL21pbWUvTWltZS5qcyIsIm5vZGVfbW9kdWxlcy9taW1lL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21pbWUvdHlwZXMvb3RoZXIuanMiLCJub2RlX21vZHVsZXMvbWltZS90eXBlcy9zdGFuZGFyZC5qcyIsIm5vZGVfbW9kdWxlcy9wYXRoLWJyb3dzZXJpZnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3B1bnljb2RlL3B1bnljb2RlLmpzIiwibm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9kZWNvZGUuanMiLCJub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdXJsL3VybC5qcyIsIm5vZGVfbW9kdWxlcy91cmwvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy93Ym4vbGliL2RlY29kZXIuanMiLCJub2RlX21vZHVsZXMvd2JuL2xpYi9lbmNvZGVyLmpzIiwibm9kZV9tb2R1bGVzL3dibi9saWIvd2JuLmpzIiwic2VydmljZS13b3JrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0MUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDenpDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMvbUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBOztBQ0FBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDamhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcmhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1dEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5leHBvcnRzLnRvQnl0ZUFycmF5ID0gdG9CeXRlQXJyYXlcbmV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXlcblxudmFyIGxvb2t1cCA9IFtdXG52YXIgcmV2TG9va3VwID0gW11cbnZhciBBcnIgPSB0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBVaW50OEFycmF5IDogQXJyYXlcblxudmFyIGNvZGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLydcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gIGxvb2t1cFtpXSA9IGNvZGVbaV1cbiAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpXG59XG5cbi8vIFN1cHBvcnQgZGVjb2RpbmcgVVJMLXNhZmUgYmFzZTY0IHN0cmluZ3MsIGFzIE5vZGUuanMgZG9lcy5cbi8vIFNlZTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmFzZTY0I1VSTF9hcHBsaWNhdGlvbnNcbnJldkxvb2t1cFsnLScuY2hhckNvZGVBdCgwKV0gPSA2MlxucmV2TG9va3VwWydfJy5jaGFyQ29kZUF0KDApXSA9IDYzXG5cbmZ1bmN0aW9uIGdldExlbnMgKGI2NCkge1xuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyBUcmltIG9mZiBleHRyYSBieXRlcyBhZnRlciBwbGFjZWhvbGRlciBieXRlcyBhcmUgZm91bmRcbiAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYmVhdGdhbW1pdC9iYXNlNjQtanMvaXNzdWVzLzQyXG4gIHZhciB2YWxpZExlbiA9IGI2NC5pbmRleE9mKCc9JylcbiAgaWYgKHZhbGlkTGVuID09PSAtMSkgdmFsaWRMZW4gPSBsZW5cblxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gdmFsaWRMZW4gPT09IGxlblxuICAgID8gMFxuICAgIDogNCAtICh2YWxpZExlbiAlIDQpXG5cbiAgcmV0dXJuIFt2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuXVxufVxuXG4vLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKGI2NCkge1xuICB2YXIgbGVucyA9IGdldExlbnMoYjY0KVxuICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdXG4gIHJldHVybiAoKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0KSAtIHBsYWNlSG9sZGVyc0xlblxufVxuXG5mdW5jdGlvbiBfYnl0ZUxlbmd0aCAoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSB7XG4gIHJldHVybiAoKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0KSAtIHBsYWNlSG9sZGVyc0xlblxufVxuXG5mdW5jdGlvbiB0b0J5dGVBcnJheSAoYjY0KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NClcbiAgdmFyIHZhbGlkTGVuID0gbGVuc1swXVxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gbGVuc1sxXVxuXG4gIHZhciBhcnIgPSBuZXcgQXJyKF9ieXRlTGVuZ3RoKGI2NCwgdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbikpXG5cbiAgdmFyIGN1ckJ5dGUgPSAwXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICB2YXIgbGVuID0gcGxhY2VIb2xkZXJzTGVuID4gMFxuICAgID8gdmFsaWRMZW4gLSA0XG4gICAgOiB2YWxpZExlblxuXG4gIHZhciBpXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHRtcCA9XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxOCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPDwgNikgfFxuICAgICAgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAzKV1cbiAgICBhcnJbY3VyQnl0ZSsrXSA9ICh0bXAgPj4gMTYpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDIpIHtcbiAgICB0bXAgPVxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldID4+IDQpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAxKSB7XG4gICAgdG1wID1cbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDEwKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildID4+IDIpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuICByZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtICYgMHgzRl1cbn1cblxuZnVuY3Rpb24gZW5jb2RlQ2h1bmsgKHVpbnQ4LCBzdGFydCwgZW5kKSB7XG4gIHZhciB0bXBcbiAgdmFyIG91dHB1dCA9IFtdXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgdG1wID1cbiAgICAgICgodWludDhbaV0gPDwgMTYpICYgMHhGRjAwMDApICtcbiAgICAgICgodWludDhbaSArIDFdIDw8IDgpICYgMHhGRjAwKSArXG4gICAgICAodWludDhbaSArIDJdICYgMHhGRilcbiAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSlcbiAgfVxuICByZXR1cm4gb3V0cHV0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZyb21CeXRlQXJyYXkgKHVpbnQ4KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbiA9IHVpbnQ4Lmxlbmd0aFxuICB2YXIgZXh0cmFCeXRlcyA9IGxlbiAlIDMgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcbiAgdmFyIHBhcnRzID0gW11cbiAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODMgLy8gbXVzdCBiZSBtdWx0aXBsZSBvZiAzXG5cbiAgLy8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuICBmb3IgKHZhciBpID0gMCwgbGVuMiA9IGxlbiAtIGV4dHJhQnl0ZXM7IGkgPCBsZW4yOyBpICs9IG1heENodW5rTGVuZ3RoKSB7XG4gICAgcGFydHMucHVzaChlbmNvZGVDaHVuayh1aW50OCwgaSwgKGkgKyBtYXhDaHVua0xlbmd0aCkgPiBsZW4yID8gbGVuMiA6IChpICsgbWF4Q2h1bmtMZW5ndGgpKSlcbiAgfVxuXG4gIC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcbiAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcbiAgICB0bXAgPSB1aW50OFtsZW4gLSAxXVxuICAgIHBhcnRzLnB1c2goXG4gICAgICBsb29rdXBbdG1wID4+IDJdICtcbiAgICAgIGxvb2t1cFsodG1wIDw8IDQpICYgMHgzRl0gK1xuICAgICAgJz09J1xuICAgIClcbiAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgdG1wID0gKHVpbnQ4W2xlbiAtIDJdIDw8IDgpICsgdWludDhbbGVuIC0gMV1cbiAgICBwYXJ0cy5wdXNoKFxuICAgICAgbG9va3VwW3RtcCA+PiAxMF0gK1xuICAgICAgbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXSArXG4gICAgICBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdICtcbiAgICAgICc9J1xuICAgIClcbiAgfVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCcnKVxufVxuIiwiOyhmdW5jdGlvbiAoZ2xvYmFsT2JqZWN0KSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuLypcclxuICogICAgICBiaWdudW1iZXIuanMgdjkuMC4xXHJcbiAqICAgICAgQSBKYXZhU2NyaXB0IGxpYnJhcnkgZm9yIGFyYml0cmFyeS1wcmVjaXNpb24gYXJpdGhtZXRpYy5cclxuICogICAgICBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWdudW1iZXIuanNcclxuICogICAgICBDb3B5cmlnaHQgKGMpIDIwMjAgTWljaGFlbCBNY2xhdWdobGluIDxNOGNoODhsQGdtYWlsLmNvbT5cclxuICogICAgICBNSVQgTGljZW5zZWQuXHJcbiAqXHJcbiAqICAgICAgQmlnTnVtYmVyLnByb3RvdHlwZSBtZXRob2RzICAgICB8ICBCaWdOdW1iZXIgbWV0aG9kc1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIGFic29sdXRlVmFsdWUgICAgICAgICAgICBhYnMgICAgfCAgY2xvbmVcclxuICogICAgICBjb21wYXJlZFRvICAgICAgICAgICAgICAgICAgICAgIHwgIGNvbmZpZyAgICAgICAgICAgICAgIHNldFxyXG4gKiAgICAgIGRlY2ltYWxQbGFjZXMgICAgICAgICAgICBkcCAgICAgfCAgICAgIERFQ0lNQUxfUExBQ0VTXHJcbiAqICAgICAgZGl2aWRlZEJ5ICAgICAgICAgICAgICAgIGRpdiAgICB8ICAgICAgUk9VTkRJTkdfTU9ERVxyXG4gKiAgICAgIGRpdmlkZWRUb0ludGVnZXJCeSAgICAgICBpZGl2ICAgfCAgICAgIEVYUE9ORU5USUFMX0FUXHJcbiAqICAgICAgZXhwb25lbnRpYXRlZEJ5ICAgICAgICAgIHBvdyAgICB8ICAgICAgUkFOR0VcclxuICogICAgICBpbnRlZ2VyVmFsdWUgICAgICAgICAgICAgICAgICAgIHwgICAgICBDUllQVE9cclxuICogICAgICBpc0VxdWFsVG8gICAgICAgICAgICAgICAgZXEgICAgIHwgICAgICBNT0RVTE9fTU9ERVxyXG4gKiAgICAgIGlzRmluaXRlICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgIFBPV19QUkVDSVNJT05cclxuICogICAgICBpc0dyZWF0ZXJUaGFuICAgICAgICAgICAgZ3QgICAgIHwgICAgICBGT1JNQVRcclxuICogICAgICBpc0dyZWF0ZXJUaGFuT3JFcXVhbFRvICAgZ3RlICAgIHwgICAgICBBTFBIQUJFVFxyXG4gKiAgICAgIGlzSW50ZWdlciAgICAgICAgICAgICAgICAgICAgICAgfCAgaXNCaWdOdW1iZXJcclxuICogICAgICBpc0xlc3NUaGFuICAgICAgICAgICAgICAgbHQgICAgIHwgIG1heGltdW0gICAgICAgICAgICAgIG1heFxyXG4gKiAgICAgIGlzTGVzc1RoYW5PckVxdWFsVG8gICAgICBsdGUgICAgfCAgbWluaW11bSAgICAgICAgICAgICAgbWluXHJcbiAqICAgICAgaXNOYU4gICAgICAgICAgICAgICAgICAgICAgICAgICB8ICByYW5kb21cclxuICogICAgICBpc05lZ2F0aXZlICAgICAgICAgICAgICAgICAgICAgIHwgIHN1bVxyXG4gKiAgICAgIGlzUG9zaXRpdmUgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIGlzWmVybyAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIG1pbnVzICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIG1vZHVsbyAgICAgICAgICAgICAgICAgICBtb2QgICAgfFxyXG4gKiAgICAgIG11bHRpcGxpZWRCeSAgICAgICAgICAgICB0aW1lcyAgfFxyXG4gKiAgICAgIG5lZ2F0ZWQgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHBsdXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHByZWNpc2lvbiAgICAgICAgICAgICAgICBzZCAgICAgfFxyXG4gKiAgICAgIHNoaWZ0ZWRCeSAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHNxdWFyZVJvb3QgICAgICAgICAgICAgICBzcXJ0ICAgfFxyXG4gKiAgICAgIHRvRXhwb25lbnRpYWwgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvRml4ZWQgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvRm9ybWF0ICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvRnJhY3Rpb24gICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvSlNPTiAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvTnVtYmVyICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvUHJlY2lzaW9uICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHZhbHVlT2YgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKlxyXG4gKi9cclxuXHJcblxyXG4gIHZhciBCaWdOdW1iZXIsXHJcbiAgICBpc051bWVyaWMgPSAvXi0/KD86XFxkKyg/OlxcLlxcZCopP3xcXC5cXGQrKSg/OmVbKy1dP1xcZCspPyQvaSxcclxuICAgIG1hdGhjZWlsID0gTWF0aC5jZWlsLFxyXG4gICAgbWF0aGZsb29yID0gTWF0aC5mbG9vcixcclxuXHJcbiAgICBiaWdudW1iZXJFcnJvciA9ICdbQmlnTnVtYmVyIEVycm9yXSAnLFxyXG4gICAgdG9vTWFueURpZ2l0cyA9IGJpZ251bWJlckVycm9yICsgJ051bWJlciBwcmltaXRpdmUgaGFzIG1vcmUgdGhhbiAxNSBzaWduaWZpY2FudCBkaWdpdHM6ICcsXHJcblxyXG4gICAgQkFTRSA9IDFlMTQsXHJcbiAgICBMT0dfQkFTRSA9IDE0LFxyXG4gICAgTUFYX1NBRkVfSU5URUdFUiA9IDB4MWZmZmZmZmZmZmZmZmYsICAgICAgICAgLy8gMl41MyAtIDFcclxuICAgIC8vIE1BWF9JTlQzMiA9IDB4N2ZmZmZmZmYsICAgICAgICAgICAgICAgICAgIC8vIDJeMzEgLSAxXHJcbiAgICBQT1dTX1RFTiA9IFsxLCAxMCwgMTAwLCAxZTMsIDFlNCwgMWU1LCAxZTYsIDFlNywgMWU4LCAxZTksIDFlMTAsIDFlMTEsIDFlMTIsIDFlMTNdLFxyXG4gICAgU1FSVF9CQVNFID0gMWU3LFxyXG5cclxuICAgIC8vIEVESVRBQkxFXHJcbiAgICAvLyBUaGUgbGltaXQgb24gdGhlIHZhbHVlIG9mIERFQ0lNQUxfUExBQ0VTLCBUT19FWFBfTkVHLCBUT19FWFBfUE9TLCBNSU5fRVhQLCBNQVhfRVhQLCBhbmRcclxuICAgIC8vIHRoZSBhcmd1bWVudHMgdG8gdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9Gb3JtYXQsIGFuZCB0b1ByZWNpc2lvbi5cclxuICAgIE1BWCA9IDFFOTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYX0lOVDMyXHJcblxyXG5cclxuICAvKlxyXG4gICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgQmlnTnVtYmVyIGNvbnN0cnVjdG9yLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGNsb25lKGNvbmZpZ09iamVjdCkge1xyXG4gICAgdmFyIGRpdiwgY29udmVydEJhc2UsIHBhcnNlTnVtZXJpYyxcclxuICAgICAgUCA9IEJpZ051bWJlci5wcm90b3R5cGUgPSB7IGNvbnN0cnVjdG9yOiBCaWdOdW1iZXIsIHRvU3RyaW5nOiBudWxsLCB2YWx1ZU9mOiBudWxsIH0sXHJcbiAgICAgIE9ORSA9IG5ldyBCaWdOdW1iZXIoMSksXHJcblxyXG5cclxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFRElUQUJMRSBDT05GSUcgREVGQVVMVFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbiAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlcyBiZWxvdyBtdXN0IGJlIGludGVnZXJzIHdpdGhpbiB0aGUgaW5jbHVzaXZlIHJhbmdlcyBzdGF0ZWQuXHJcbiAgICAgIC8vIFRoZSB2YWx1ZXMgY2FuIGFsc28gYmUgY2hhbmdlZCBhdCBydW4tdGltZSB1c2luZyBCaWdOdW1iZXIuc2V0LlxyXG5cclxuICAgICAgLy8gVGhlIG1heGltdW0gbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIGZvciBvcGVyYXRpb25zIGludm9sdmluZyBkaXZpc2lvbi5cclxuICAgICAgREVDSU1BTF9QTEFDRVMgPSAyMCwgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWFxyXG5cclxuICAgICAgLy8gVGhlIHJvdW5kaW5nIG1vZGUgdXNlZCB3aGVuIHJvdW5kaW5nIHRvIHRoZSBhYm92ZSBkZWNpbWFsIHBsYWNlcywgYW5kIHdoZW4gdXNpbmdcclxuICAgICAgLy8gdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9Gb3JtYXQgYW5kIHRvUHJlY2lzaW9uLCBhbmQgcm91bmQgKGRlZmF1bHQgdmFsdWUpLlxyXG4gICAgICAvLyBVUCAgICAgICAgIDAgQXdheSBmcm9tIHplcm8uXHJcbiAgICAgIC8vIERPV04gICAgICAgMSBUb3dhcmRzIHplcm8uXHJcbiAgICAgIC8vIENFSUwgICAgICAgMiBUb3dhcmRzICtJbmZpbml0eS5cclxuICAgICAgLy8gRkxPT1IgICAgICAzIFRvd2FyZHMgLUluZmluaXR5LlxyXG4gICAgICAvLyBIQUxGX1VQICAgIDQgVG93YXJkcyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHVwLlxyXG4gICAgICAvLyBIQUxGX0RPV04gIDUgVG93YXJkcyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIGRvd24uXHJcbiAgICAgIC8vIEhBTEZfRVZFTiAgNiBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG93YXJkcyBldmVuIG5laWdoYm91ci5cclxuICAgICAgLy8gSEFMRl9DRUlMICA3IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0b3dhcmRzICtJbmZpbml0eS5cclxuICAgICAgLy8gSEFMRl9GTE9PUiA4IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0b3dhcmRzIC1JbmZpbml0eS5cclxuICAgICAgUk9VTkRJTkdfTU9ERSA9IDQsICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDhcclxuXHJcbiAgICAgIC8vIEVYUE9ORU5USUFMX0FUIDogW1RPX0VYUF9ORUcgLCBUT19FWFBfUE9TXVxyXG5cclxuICAgICAgLy8gVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBiZW5lYXRoIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgIC8vIE51bWJlciB0eXBlOiAtN1xyXG4gICAgICBUT19FWFBfTkVHID0gLTcsICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gLU1BWFxyXG5cclxuICAgICAgLy8gVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBhYm92ZSB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAvLyBOdW1iZXIgdHlwZTogMjFcclxuICAgICAgVE9fRVhQX1BPUyA9IDIxLCAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWFxyXG5cclxuICAgICAgLy8gUkFOR0UgOiBbTUlOX0VYUCwgTUFYX0VYUF1cclxuXHJcbiAgICAgIC8vIFRoZSBtaW5pbXVtIGV4cG9uZW50IHZhbHVlLCBiZW5lYXRoIHdoaWNoIHVuZGVyZmxvdyB0byB6ZXJvIG9jY3Vycy5cclxuICAgICAgLy8gTnVtYmVyIHR5cGU6IC0zMjQgICg1ZS0zMjQpXHJcbiAgICAgIE1JTl9FWFAgPSAtMWU3LCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLTEgdG8gLU1BWFxyXG5cclxuICAgICAgLy8gVGhlIG1heGltdW0gZXhwb25lbnQgdmFsdWUsIGFib3ZlIHdoaWNoIG92ZXJmbG93IHRvIEluZmluaXR5IG9jY3Vycy5cclxuICAgICAgLy8gTnVtYmVyIHR5cGU6ICAzMDggICgxLjc5NzY5MzEzNDg2MjMxNTdlKzMwOClcclxuICAgICAgLy8gRm9yIE1BWF9FWFAgPiAxZTcsIGUuZy4gbmV3IEJpZ051bWJlcignMWUxMDAwMDAwMDAnKS5wbHVzKDEpIG1heSBiZSBzbG93LlxyXG4gICAgICBNQVhfRVhQID0gMWU3LCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDEgdG8gTUFYXHJcblxyXG4gICAgICAvLyBXaGV0aGVyIHRvIHVzZSBjcnlwdG9ncmFwaGljYWxseS1zZWN1cmUgcmFuZG9tIG51bWJlciBnZW5lcmF0aW9uLCBpZiBhdmFpbGFibGUuXHJcbiAgICAgIENSWVBUTyA9IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHJ1ZSBvciBmYWxzZVxyXG5cclxuICAgICAgLy8gVGhlIG1vZHVsbyBtb2RlIHVzZWQgd2hlbiBjYWxjdWxhdGluZyB0aGUgbW9kdWx1czogYSBtb2Qgbi5cclxuICAgICAgLy8gVGhlIHF1b3RpZW50IChxID0gYSAvIG4pIGlzIGNhbGN1bGF0ZWQgYWNjb3JkaW5nIHRvIHRoZSBjb3JyZXNwb25kaW5nIHJvdW5kaW5nIG1vZGUuXHJcbiAgICAgIC8vIFRoZSByZW1haW5kZXIgKHIpIGlzIGNhbGN1bGF0ZWQgYXM6IHIgPSBhIC0gbiAqIHEuXHJcbiAgICAgIC8vXHJcbiAgICAgIC8vIFVQICAgICAgICAwIFRoZSByZW1haW5kZXIgaXMgcG9zaXRpdmUgaWYgdGhlIGRpdmlkZW5kIGlzIG5lZ2F0aXZlLCBlbHNlIGlzIG5lZ2F0aXZlLlxyXG4gICAgICAvLyBET1dOICAgICAgMSBUaGUgcmVtYWluZGVyIGhhcyB0aGUgc2FtZSBzaWduIGFzIHRoZSBkaXZpZGVuZC5cclxuICAgICAgLy8gICAgICAgICAgICAgVGhpcyBtb2R1bG8gbW9kZSBpcyBjb21tb25seSBrbm93biBhcyAndHJ1bmNhdGVkIGRpdmlzaW9uJyBhbmQgaXNcclxuICAgICAgLy8gICAgICAgICAgICAgZXF1aXZhbGVudCB0byAoYSAlIG4pIGluIEphdmFTY3JpcHQuXHJcbiAgICAgIC8vIEZMT09SICAgICAzIFRoZSByZW1haW5kZXIgaGFzIHRoZSBzYW1lIHNpZ24gYXMgdGhlIGRpdmlzb3IgKFB5dGhvbiAlKS5cclxuICAgICAgLy8gSEFMRl9FVkVOIDYgVGhpcyBtb2R1bG8gbW9kZSBpbXBsZW1lbnRzIHRoZSBJRUVFIDc1NCByZW1haW5kZXIgZnVuY3Rpb24uXHJcbiAgICAgIC8vIEVVQ0xJRCAgICA5IEV1Y2xpZGlhbiBkaXZpc2lvbi4gcSA9IHNpZ24obikgKiBmbG9vcihhIC8gYWJzKG4pKS5cclxuICAgICAgLy8gICAgICAgICAgICAgVGhlIHJlbWFpbmRlciBpcyBhbHdheXMgcG9zaXRpdmUuXHJcbiAgICAgIC8vXHJcbiAgICAgIC8vIFRoZSB0cnVuY2F0ZWQgZGl2aXNpb24sIGZsb29yZWQgZGl2aXNpb24sIEV1Y2xpZGlhbiBkaXZpc2lvbiBhbmQgSUVFRSA3NTQgcmVtYWluZGVyXHJcbiAgICAgIC8vIG1vZGVzIGFyZSBjb21tb25seSB1c2VkIGZvciB0aGUgbW9kdWx1cyBvcGVyYXRpb24uXHJcbiAgICAgIC8vIEFsdGhvdWdoIHRoZSBvdGhlciByb3VuZGluZyBtb2RlcyBjYW4gYWxzbyBiZSB1c2VkLCB0aGV5IG1heSBub3QgZ2l2ZSB1c2VmdWwgcmVzdWx0cy5cclxuICAgICAgTU9EVUxPX01PREUgPSAxLCAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDlcclxuXHJcbiAgICAgIC8vIFRoZSBtYXhpbXVtIG51bWJlciBvZiBzaWduaWZpY2FudCBkaWdpdHMgb2YgdGhlIHJlc3VsdCBvZiB0aGUgZXhwb25lbnRpYXRlZEJ5IG9wZXJhdGlvbi5cclxuICAgICAgLy8gSWYgUE9XX1BSRUNJU0lPTiBpcyAwLCB0aGVyZSB3aWxsIGJlIHVubGltaXRlZCBzaWduaWZpY2FudCBkaWdpdHMuXHJcbiAgICAgIFBPV19QUkVDSVNJT04gPSAwLCAgICAgICAgICAgICAgICAgICAgLy8gMCB0byBNQVhcclxuXHJcbiAgICAgIC8vIFRoZSBmb3JtYXQgc3BlY2lmaWNhdGlvbiB1c2VkIGJ5IHRoZSBCaWdOdW1iZXIucHJvdG90eXBlLnRvRm9ybWF0IG1ldGhvZC5cclxuICAgICAgRk9STUFUID0ge1xyXG4gICAgICAgIHByZWZpeDogJycsXHJcbiAgICAgICAgZ3JvdXBTaXplOiAzLFxyXG4gICAgICAgIHNlY29uZGFyeUdyb3VwU2l6ZTogMCxcclxuICAgICAgICBncm91cFNlcGFyYXRvcjogJywnLFxyXG4gICAgICAgIGRlY2ltYWxTZXBhcmF0b3I6ICcuJyxcclxuICAgICAgICBmcmFjdGlvbkdyb3VwU2l6ZTogMCxcclxuICAgICAgICBmcmFjdGlvbkdyb3VwU2VwYXJhdG9yOiAnXFx4QTAnLCAgICAgIC8vIG5vbi1icmVha2luZyBzcGFjZVxyXG4gICAgICAgIHN1ZmZpeDogJydcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFRoZSBhbHBoYWJldCB1c2VkIGZvciBiYXNlIGNvbnZlcnNpb24uIEl0IG11c3QgYmUgYXQgbGVhc3QgMiBjaGFyYWN0ZXJzIGxvbmcsIHdpdGggbm8gJysnLFxyXG4gICAgICAvLyAnLScsICcuJywgd2hpdGVzcGFjZSwgb3IgcmVwZWF0ZWQgY2hhcmFjdGVyLlxyXG4gICAgICAvLyAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVokXydcclxuICAgICAgQUxQSEFCRVQgPSAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6JztcclxuXHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG4gICAgLy8gQ09OU1RSVUNUT1JcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBCaWdOdW1iZXIgY29uc3RydWN0b3IgYW5kIGV4cG9ydGVkIGZ1bmN0aW9uLlxyXG4gICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgYSBCaWdOdW1iZXIgb2JqZWN0LlxyXG4gICAgICpcclxuICAgICAqIHYge251bWJlcnxzdHJpbmd8QmlnTnVtYmVyfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgKiBbYl0ge251bWJlcn0gVGhlIGJhc2Ugb2Ygdi4gSW50ZWdlciwgMiB0byBBTFBIQUJFVC5sZW5ndGggaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBCaWdOdW1iZXIodiwgYikge1xyXG4gICAgICB2YXIgYWxwaGFiZXQsIGMsIGNhc2VDaGFuZ2VkLCBlLCBpLCBpc051bSwgbGVuLCBzdHIsXHJcbiAgICAgICAgeCA9IHRoaXM7XHJcblxyXG4gICAgICAvLyBFbmFibGUgY29uc3RydWN0b3IgY2FsbCB3aXRob3V0IGBuZXdgLlxyXG4gICAgICBpZiAoISh4IGluc3RhbmNlb2YgQmlnTnVtYmVyKSkgcmV0dXJuIG5ldyBCaWdOdW1iZXIodiwgYik7XHJcblxyXG4gICAgICBpZiAoYiA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgIGlmICh2ICYmIHYuX2lzQmlnTnVtYmVyID09PSB0cnVlKSB7XHJcbiAgICAgICAgICB4LnMgPSB2LnM7XHJcblxyXG4gICAgICAgICAgaWYgKCF2LmMgfHwgdi5lID4gTUFYX0VYUCkge1xyXG4gICAgICAgICAgICB4LmMgPSB4LmUgPSBudWxsO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICh2LmUgPCBNSU5fRVhQKSB7XHJcbiAgICAgICAgICAgIHguYyA9IFt4LmUgPSAwXTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHguZSA9IHYuZTtcclxuICAgICAgICAgICAgeC5jID0gdi5jLnNsaWNlKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKChpc051bSA9IHR5cGVvZiB2ID09ICdudW1iZXInKSAmJiB2ICogMCA9PSAwKSB7XHJcblxyXG4gICAgICAgICAgLy8gVXNlIGAxIC8gbmAgdG8gaGFuZGxlIG1pbnVzIHplcm8gYWxzby5cclxuICAgICAgICAgIHgucyA9IDEgLyB2IDwgMCA/ICh2ID0gLXYsIC0xKSA6IDE7XHJcblxyXG4gICAgICAgICAgLy8gRmFzdCBwYXRoIGZvciBpbnRlZ2Vycywgd2hlcmUgbiA8IDIxNDc0ODM2NDggKDIqKjMxKS5cclxuICAgICAgICAgIGlmICh2ID09PSB+fnYpIHtcclxuICAgICAgICAgICAgZm9yIChlID0gMCwgaSA9IHY7IGkgPj0gMTA7IGkgLz0gMTAsIGUrKyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZSA+IE1BWF9FWFApIHtcclxuICAgICAgICAgICAgICB4LmMgPSB4LmUgPSBudWxsO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHguZSA9IGU7XHJcbiAgICAgICAgICAgICAgeC5jID0gW3ZdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgc3RyID0gU3RyaW5nKHYpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgaWYgKCFpc051bWVyaWMudGVzdChzdHIgPSBTdHJpbmcodikpKSByZXR1cm4gcGFyc2VOdW1lcmljKHgsIHN0ciwgaXNOdW0pO1xyXG5cclxuICAgICAgICAgIHgucyA9IHN0ci5jaGFyQ29kZUF0KDApID09IDQ1ID8gKHN0ciA9IHN0ci5zbGljZSgxKSwgLTEpIDogMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERlY2ltYWwgcG9pbnQ/XHJcbiAgICAgICAgaWYgKChlID0gc3RyLmluZGV4T2YoJy4nKSkgPiAtMSkgc3RyID0gc3RyLnJlcGxhY2UoJy4nLCAnJyk7XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIGZvcm0/XHJcbiAgICAgICAgaWYgKChpID0gc3RyLnNlYXJjaCgvZS9pKSkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgLy8gRGV0ZXJtaW5lIGV4cG9uZW50LlxyXG4gICAgICAgICAgaWYgKGUgPCAwKSBlID0gaTtcclxuICAgICAgICAgIGUgKz0gK3N0ci5zbGljZShpICsgMSk7XHJcbiAgICAgICAgICBzdHIgPSBzdHIuc3Vic3RyaW5nKDAsIGkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAvLyBJbnRlZ2VyLlxyXG4gICAgICAgICAgZSA9IHN0ci5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIEJhc2Uge25vdCBhIHByaW1pdGl2ZSBudW1iZXJ8bm90IGFuIGludGVnZXJ8b3V0IG9mIHJhbmdlfToge2J9J1xyXG4gICAgICAgIGludENoZWNrKGIsIDIsIEFMUEhBQkVULmxlbmd0aCwgJ0Jhc2UnKTtcclxuXHJcbiAgICAgICAgLy8gQWxsb3cgZXhwb25lbnRpYWwgbm90YXRpb24gdG8gYmUgdXNlZCB3aXRoIGJhc2UgMTAgYXJndW1lbnQsIHdoaWxlXHJcbiAgICAgICAgLy8gYWxzbyByb3VuZGluZyB0byBERUNJTUFMX1BMQUNFUyBhcyB3aXRoIG90aGVyIGJhc2VzLlxyXG4gICAgICAgIGlmIChiID09IDEwKSB7XHJcbiAgICAgICAgICB4ID0gbmV3IEJpZ051bWJlcih2KTtcclxuICAgICAgICAgIHJldHVybiByb3VuZCh4LCBERUNJTUFMX1BMQUNFUyArIHguZSArIDEsIFJPVU5ESU5HX01PREUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RyID0gU3RyaW5nKHYpO1xyXG5cclxuICAgICAgICBpZiAoaXNOdW0gPSB0eXBlb2YgdiA9PSAnbnVtYmVyJykge1xyXG5cclxuICAgICAgICAgIC8vIEF2b2lkIHBvdGVudGlhbCBpbnRlcnByZXRhdGlvbiBvZiBJbmZpbml0eSBhbmQgTmFOIGFzIGJhc2UgNDQrIHZhbHVlcy5cclxuICAgICAgICAgIGlmICh2ICogMCAhPSAwKSByZXR1cm4gcGFyc2VOdW1lcmljKHgsIHN0ciwgaXNOdW0sIGIpO1xyXG5cclxuICAgICAgICAgIHgucyA9IDEgLyB2IDwgMCA/IChzdHIgPSBzdHIuc2xpY2UoMSksIC0xKSA6IDE7XHJcblxyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIE51bWJlciBwcmltaXRpdmUgaGFzIG1vcmUgdGhhbiAxNSBzaWduaWZpY2FudCBkaWdpdHM6IHtufSdcclxuICAgICAgICAgIGlmIChCaWdOdW1iZXIuREVCVUcgJiYgc3RyLnJlcGxhY2UoL14wXFwuMCp8XFwuLywgJycpLmxlbmd0aCA+IDE1KSB7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yXHJcbiAgICAgICAgICAgICAodG9vTWFueURpZ2l0cyArIHYpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB4LnMgPSBzdHIuY2hhckNvZGVBdCgwKSA9PT0gNDUgPyAoc3RyID0gc3RyLnNsaWNlKDEpLCAtMSkgOiAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWxwaGFiZXQgPSBBTFBIQUJFVC5zbGljZSgwLCBiKTtcclxuICAgICAgICBlID0gaSA9IDA7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIHRoYXQgc3RyIGlzIGEgdmFsaWQgYmFzZSBiIG51bWJlci5cclxuICAgICAgICAvLyBEb24ndCB1c2UgUmVnRXhwLCBzbyBhbHBoYWJldCBjYW4gY29udGFpbiBzcGVjaWFsIGNoYXJhY3RlcnMuXHJcbiAgICAgICAgZm9yIChsZW4gPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgIGlmIChhbHBoYWJldC5pbmRleE9mKGMgPSBzdHIuY2hhckF0KGkpKSA8IDApIHtcclxuICAgICAgICAgICAgaWYgKGMgPT0gJy4nKSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIElmICcuJyBpcyBub3QgdGhlIGZpcnN0IGNoYXJhY3RlciBhbmQgaXQgaGFzIG5vdCBiZSBmb3VuZCBiZWZvcmUuXHJcbiAgICAgICAgICAgICAgaWYgKGkgPiBlKSB7XHJcbiAgICAgICAgICAgICAgICBlID0gbGVuO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjYXNlQ2hhbmdlZCkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBBbGxvdyBlLmcuIGhleGFkZWNpbWFsICdGRicgYXMgd2VsbCBhcyAnZmYnLlxyXG4gICAgICAgICAgICAgIGlmIChzdHIgPT0gc3RyLnRvVXBwZXJDYXNlKCkgJiYgKHN0ciA9IHN0ci50b0xvd2VyQ2FzZSgpKSB8fFxyXG4gICAgICAgICAgICAgICAgICBzdHIgPT0gc3RyLnRvTG93ZXJDYXNlKCkgJiYgKHN0ciA9IHN0ci50b1VwcGVyQ2FzZSgpKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZUNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaSA9IC0xO1xyXG4gICAgICAgICAgICAgICAgZSA9IDA7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZU51bWVyaWMoeCwgU3RyaW5nKHYpLCBpc051bSwgYik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBQcmV2ZW50IGxhdGVyIGNoZWNrIGZvciBsZW5ndGggb24gY29udmVydGVkIG51bWJlci5cclxuICAgICAgICBpc051bSA9IGZhbHNlO1xyXG4gICAgICAgIHN0ciA9IGNvbnZlcnRCYXNlKHN0ciwgYiwgMTAsIHgucyk7XHJcblxyXG4gICAgICAgIC8vIERlY2ltYWwgcG9pbnQ/XHJcbiAgICAgICAgaWYgKChlID0gc3RyLmluZGV4T2YoJy4nKSkgPiAtMSkgc3RyID0gc3RyLnJlcGxhY2UoJy4nLCAnJyk7XHJcbiAgICAgICAgZWxzZSBlID0gc3RyLmxlbmd0aDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgIGZvciAoaSA9IDA7IHN0ci5jaGFyQ29kZUF0KGkpID09PSA0ODsgaSsrKTtcclxuXHJcbiAgICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgZm9yIChsZW4gPSBzdHIubGVuZ3RoOyBzdHIuY2hhckNvZGVBdCgtLWxlbikgPT09IDQ4Oyk7XHJcblxyXG4gICAgICBpZiAoc3RyID0gc3RyLnNsaWNlKGksICsrbGVuKSkge1xyXG4gICAgICAgIGxlbiAtPSBpO1xyXG5cclxuICAgICAgICAvLyAnW0JpZ051bWJlciBFcnJvcl0gTnVtYmVyIHByaW1pdGl2ZSBoYXMgbW9yZSB0aGFuIDE1IHNpZ25pZmljYW50IGRpZ2l0czoge259J1xyXG4gICAgICAgIGlmIChpc051bSAmJiBCaWdOdW1iZXIuREVCVUcgJiZcclxuICAgICAgICAgIGxlbiA+IDE1ICYmICh2ID4gTUFYX1NBRkVfSU5URUdFUiB8fCB2ICE9PSBtYXRoZmxvb3IodikpKSB7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yXHJcbiAgICAgICAgICAgICAodG9vTWFueURpZ2l0cyArICh4LnMgKiB2KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgLy8gT3ZlcmZsb3c/XHJcbiAgICAgICAgaWYgKChlID0gZSAtIGkgLSAxKSA+IE1BWF9FWFApIHtcclxuXHJcbiAgICAgICAgICAvLyBJbmZpbml0eS5cclxuICAgICAgICAgIHguYyA9IHguZSA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIFVuZGVyZmxvdz9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCBNSU5fRVhQKSB7XHJcblxyXG4gICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgIHguYyA9IFt4LmUgPSAwXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgeC5lID0gZTtcclxuICAgICAgICAgIHguYyA9IFtdO1xyXG5cclxuICAgICAgICAgIC8vIFRyYW5zZm9ybSBiYXNlXHJcblxyXG4gICAgICAgICAgLy8gZSBpcyB0aGUgYmFzZSAxMCBleHBvbmVudC5cclxuICAgICAgICAgIC8vIGkgaXMgd2hlcmUgdG8gc2xpY2Ugc3RyIHRvIGdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiB0aGUgY29lZmZpY2llbnQgYXJyYXkuXHJcbiAgICAgICAgICBpID0gKGUgKyAxKSAlIExPR19CQVNFO1xyXG4gICAgICAgICAgaWYgKGUgPCAwKSBpICs9IExPR19CQVNFOyAgLy8gaSA8IDFcclxuXHJcbiAgICAgICAgICBpZiAoaSA8IGxlbikge1xyXG4gICAgICAgICAgICBpZiAoaSkgeC5jLnB1c2goK3N0ci5zbGljZSgwLCBpKSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxlbiAtPSBMT0dfQkFTRTsgaSA8IGxlbjspIHtcclxuICAgICAgICAgICAgICB4LmMucHVzaCgrc3RyLnNsaWNlKGksIGkgKz0gTE9HX0JBU0UpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaSA9IExPR19CQVNFIC0gKHN0ciA9IHN0ci5zbGljZShpKSkubGVuZ3RoO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaSAtPSBsZW47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZm9yICg7IGktLTsgc3RyICs9ICcwJyk7XHJcbiAgICAgICAgICB4LmMucHVzaCgrc3RyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgeC5jID0gW3guZSA9IDBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIENPTlNUUlVDVE9SIFBST1BFUlRJRVNcclxuXHJcblxyXG4gICAgQmlnTnVtYmVyLmNsb25lID0gY2xvbmU7XHJcblxyXG4gICAgQmlnTnVtYmVyLlJPVU5EX1VQID0gMDtcclxuICAgIEJpZ051bWJlci5ST1VORF9ET1dOID0gMTtcclxuICAgIEJpZ051bWJlci5ST1VORF9DRUlMID0gMjtcclxuICAgIEJpZ051bWJlci5ST1VORF9GTE9PUiA9IDM7XHJcbiAgICBCaWdOdW1iZXIuUk9VTkRfSEFMRl9VUCA9IDQ7XHJcbiAgICBCaWdOdW1iZXIuUk9VTkRfSEFMRl9ET1dOID0gNTtcclxuICAgIEJpZ051bWJlci5ST1VORF9IQUxGX0VWRU4gPSA2O1xyXG4gICAgQmlnTnVtYmVyLlJPVU5EX0hBTEZfQ0VJTCA9IDc7XHJcbiAgICBCaWdOdW1iZXIuUk9VTkRfSEFMRl9GTE9PUiA9IDg7XHJcbiAgICBCaWdOdW1iZXIuRVVDTElEID0gOTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIENvbmZpZ3VyZSBpbmZyZXF1ZW50bHktY2hhbmdpbmcgbGlicmFyeS13aWRlIHNldHRpbmdzLlxyXG4gICAgICpcclxuICAgICAqIEFjY2VwdCBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIG9wdGlvbmFsIHByb3BlcnRpZXMgKGlmIHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGlzXHJcbiAgICAgKiBhIG51bWJlciwgaXQgbXVzdCBiZSBhbiBpbnRlZ2VyIHdpdGhpbiB0aGUgaW5jbHVzaXZlIHJhbmdlIHN0YXRlZCk6XHJcbiAgICAgKlxyXG4gICAgICogICBERUNJTUFMX1BMQUNFUyAgIHtudW1iZXJ9ICAgICAgICAgICAwIHRvIE1BWFxyXG4gICAgICogICBST1VORElOR19NT0RFICAgIHtudW1iZXJ9ICAgICAgICAgICAwIHRvIDhcclxuICAgICAqICAgRVhQT05FTlRJQUxfQVQgICB7bnVtYmVyfG51bWJlcltdfSAgLU1BWCB0byBNQVggIG9yICBbLU1BWCB0byAwLCAwIHRvIE1BWF1cclxuICAgICAqICAgUkFOR0UgICAgICAgICAgICB7bnVtYmVyfG51bWJlcltdfSAgLU1BWCB0byBNQVggKG5vdCB6ZXJvKSAgb3IgIFstTUFYIHRvIC0xLCAxIHRvIE1BWF1cclxuICAgICAqICAgQ1JZUFRPICAgICAgICAgICB7Ym9vbGVhbn0gICAgICAgICAgdHJ1ZSBvciBmYWxzZVxyXG4gICAgICogICBNT0RVTE9fTU9ERSAgICAgIHtudW1iZXJ9ICAgICAgICAgICAwIHRvIDlcclxuICAgICAqICAgUE9XX1BSRUNJU0lPTiAgICAgICB7bnVtYmVyfSAgICAgICAgICAgMCB0byBNQVhcclxuICAgICAqICAgQUxQSEFCRVQgICAgICAgICB7c3RyaW5nfSAgICAgICAgICAgQSBzdHJpbmcgb2YgdHdvIG9yIG1vcmUgdW5pcXVlIGNoYXJhY3RlcnMgd2hpY2ggZG9lc1xyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3QgY29udGFpbiAnLicuXHJcbiAgICAgKiAgIEZPUk1BVCAgICAgICAgICAge29iamVjdH0gICAgICAgICAgIEFuIG9iamVjdCB3aXRoIHNvbWUgb2YgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG4gICAgICogICAgIHByZWZpeCAgICAgICAgICAgICAgICAge3N0cmluZ31cclxuICAgICAqICAgICBncm91cFNpemUgICAgICAgICAgICAgIHtudW1iZXJ9XHJcbiAgICAgKiAgICAgc2Vjb25kYXJ5R3JvdXBTaXplICAgICB7bnVtYmVyfVxyXG4gICAgICogICAgIGdyb3VwU2VwYXJhdG9yICAgICAgICAge3N0cmluZ31cclxuICAgICAqICAgICBkZWNpbWFsU2VwYXJhdG9yICAgICAgIHtzdHJpbmd9XHJcbiAgICAgKiAgICAgZnJhY3Rpb25Hcm91cFNpemUgICAgICB7bnVtYmVyfVxyXG4gICAgICogICAgIGZyYWN0aW9uR3JvdXBTZXBhcmF0b3Ige3N0cmluZ31cclxuICAgICAqICAgICBzdWZmaXggICAgICAgICAgICAgICAgIHtzdHJpbmd9XHJcbiAgICAgKlxyXG4gICAgICogKFRoZSB2YWx1ZXMgYXNzaWduZWQgdG8gdGhlIGFib3ZlIEZPUk1BVCBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IGNoZWNrZWQgZm9yIHZhbGlkaXR5LilcclxuICAgICAqXHJcbiAgICAgKiBFLmcuXHJcbiAgICAgKiBCaWdOdW1iZXIuY29uZmlnKHsgREVDSU1BTF9QTEFDRVMgOiAyMCwgUk9VTkRJTkdfTU9ERSA6IDQgfSlcclxuICAgICAqXHJcbiAgICAgKiBJZ25vcmUgcHJvcGVydGllcy9wYXJhbWV0ZXJzIHNldCB0byBudWxsIG9yIHVuZGVmaW5lZCwgZXhjZXB0IGZvciBBTFBIQUJFVC5cclxuICAgICAqXHJcbiAgICAgKiBSZXR1cm4gYW4gb2JqZWN0IHdpdGggdGhlIHByb3BlcnRpZXMgY3VycmVudCB2YWx1ZXMuXHJcbiAgICAgKi9cclxuICAgIEJpZ051bWJlci5jb25maWcgPSBCaWdOdW1iZXIuc2V0ID0gZnVuY3Rpb24gKG9iaikge1xyXG4gICAgICB2YXIgcCwgdjtcclxuXHJcbiAgICAgIGlmIChvYmogIT0gbnVsbCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIG9iaiA9PSAnb2JqZWN0Jykge1xyXG5cclxuICAgICAgICAgIC8vIERFQ0lNQUxfUExBQ0VTIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgIC8vICdbQmlnTnVtYmVyIEVycm9yXSBERUNJTUFMX1BMQUNFUyB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7dn0nXHJcbiAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHAgPSAnREVDSU1BTF9QTEFDRVMnKSkge1xyXG4gICAgICAgICAgICB2ID0gb2JqW3BdO1xyXG4gICAgICAgICAgICBpbnRDaGVjayh2LCAwLCBNQVgsIHApO1xyXG4gICAgICAgICAgICBERUNJTUFMX1BMQUNFUyA9IHY7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUk9VTkRJTkdfTU9ERSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIFJPVU5ESU5HX01PREUge25vdCBhIHByaW1pdGl2ZSBudW1iZXJ8bm90IGFuIGludGVnZXJ8b3V0IG9mIHJhbmdlfToge3Z9J1xyXG4gICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwID0gJ1JPVU5ESU5HX01PREUnKSkge1xyXG4gICAgICAgICAgICB2ID0gb2JqW3BdO1xyXG4gICAgICAgICAgICBpbnRDaGVjayh2LCAwLCA4LCBwKTtcclxuICAgICAgICAgICAgUk9VTkRJTkdfTU9ERSA9IHY7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gRVhQT05FTlRJQUxfQVQge251bWJlcnxudW1iZXJbXX1cclxuICAgICAgICAgIC8vIEludGVnZXIsIC1NQVggdG8gTUFYIGluY2x1c2l2ZSBvclxyXG4gICAgICAgICAgLy8gW2ludGVnZXIgLU1BWCB0byAwIGluY2x1c2l2ZSwgMCB0byBNQVggaW5jbHVzaXZlXS5cclxuICAgICAgICAgIC8vICdbQmlnTnVtYmVyIEVycm9yXSBFWFBPTkVOVElBTF9BVCB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7dn0nXHJcbiAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHAgPSAnRVhQT05FTlRJQUxfQVQnKSkge1xyXG4gICAgICAgICAgICB2ID0gb2JqW3BdO1xyXG4gICAgICAgICAgICBpZiAodiAmJiB2LnBvcCkge1xyXG4gICAgICAgICAgICAgIGludENoZWNrKHZbMF0sIC1NQVgsIDAsIHApO1xyXG4gICAgICAgICAgICAgIGludENoZWNrKHZbMV0sIDAsIE1BWCwgcCk7XHJcbiAgICAgICAgICAgICAgVE9fRVhQX05FRyA9IHZbMF07XHJcbiAgICAgICAgICAgICAgVE9fRVhQX1BPUyA9IHZbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaW50Q2hlY2sodiwgLU1BWCwgTUFYLCBwKTtcclxuICAgICAgICAgICAgICBUT19FWFBfTkVHID0gLShUT19FWFBfUE9TID0gdiA8IDAgPyAtdiA6IHYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUkFOR0Uge251bWJlcnxudW1iZXJbXX0gTm9uLXplcm8gaW50ZWdlciwgLU1BWCB0byBNQVggaW5jbHVzaXZlIG9yXHJcbiAgICAgICAgICAvLyBbaW50ZWdlciAtTUFYIHRvIC0xIGluY2x1c2l2ZSwgaW50ZWdlciAxIHRvIE1BWCBpbmNsdXNpdmVdLlxyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIFJBTkdFIHtub3QgYSBwcmltaXRpdmUgbnVtYmVyfG5vdCBhbiBpbnRlZ2VyfG91dCBvZiByYW5nZXxjYW5ub3QgYmUgemVyb306IHt2fSdcclxuICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocCA9ICdSQU5HRScpKSB7XHJcbiAgICAgICAgICAgIHYgPSBvYmpbcF07XHJcbiAgICAgICAgICAgIGlmICh2ICYmIHYucG9wKSB7XHJcbiAgICAgICAgICAgICAgaW50Q2hlY2sodlswXSwgLU1BWCwgLTEsIHApO1xyXG4gICAgICAgICAgICAgIGludENoZWNrKHZbMV0sIDEsIE1BWCwgcCk7XHJcbiAgICAgICAgICAgICAgTUlOX0VYUCA9IHZbMF07XHJcbiAgICAgICAgICAgICAgTUFYX0VYUCA9IHZbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaW50Q2hlY2sodiwgLU1BWCwgTUFYLCBwKTtcclxuICAgICAgICAgICAgICBpZiAodikge1xyXG4gICAgICAgICAgICAgICAgTUlOX0VYUCA9IC0oTUFYX0VYUCA9IHYgPCAwID8gLXYgOiB2KTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3JcclxuICAgICAgICAgICAgICAgICAoYmlnbnVtYmVyRXJyb3IgKyBwICsgJyBjYW5ub3QgYmUgemVybzogJyArIHYpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIENSWVBUTyB7Ym9vbGVhbn0gdHJ1ZSBvciBmYWxzZS5cclxuICAgICAgICAgIC8vICdbQmlnTnVtYmVyIEVycm9yXSBDUllQVE8gbm90IHRydWUgb3IgZmFsc2U6IHt2fSdcclxuICAgICAgICAgIC8vICdbQmlnTnVtYmVyIEVycm9yXSBjcnlwdG8gdW5hdmFpbGFibGUnXHJcbiAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHAgPSAnQ1JZUFRPJykpIHtcclxuICAgICAgICAgICAgdiA9IG9ialtwXTtcclxuICAgICAgICAgICAgaWYgKHYgPT09ICEhdikge1xyXG4gICAgICAgICAgICAgIGlmICh2KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNyeXB0byAhPSAndW5kZWZpbmVkJyAmJiBjcnlwdG8gJiZcclxuICAgICAgICAgICAgICAgICAoY3J5cHRvLmdldFJhbmRvbVZhbHVlcyB8fCBjcnlwdG8ucmFuZG9tQnl0ZXMpKSB7XHJcbiAgICAgICAgICAgICAgICAgIENSWVBUTyA9IHY7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBDUllQVE8gPSAhdjtcclxuICAgICAgICAgICAgICAgICAgdGhyb3cgRXJyb3JcclxuICAgICAgICAgICAgICAgICAgIChiaWdudW1iZXJFcnJvciArICdjcnlwdG8gdW5hdmFpbGFibGUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgQ1JZUFRPID0gdjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgRXJyb3JcclxuICAgICAgICAgICAgICAgKGJpZ251bWJlckVycm9yICsgcCArICcgbm90IHRydWUgb3IgZmFsc2U6ICcgKyB2KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIE1PRFVMT19NT0RFIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gOSBpbmNsdXNpdmUuXHJcbiAgICAgICAgICAvLyAnW0JpZ051bWJlciBFcnJvcl0gTU9EVUxPX01PREUge25vdCBhIHByaW1pdGl2ZSBudW1iZXJ8bm90IGFuIGludGVnZXJ8b3V0IG9mIHJhbmdlfToge3Z9J1xyXG4gICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwID0gJ01PRFVMT19NT0RFJykpIHtcclxuICAgICAgICAgICAgdiA9IG9ialtwXTtcclxuICAgICAgICAgICAgaW50Q2hlY2sodiwgMCwgOSwgcCk7XHJcbiAgICAgICAgICAgIE1PRFVMT19NT0RFID0gdjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBQT1dfUFJFQ0lTSU9OIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgIC8vICdbQmlnTnVtYmVyIEVycm9yXSBQT1dfUFJFQ0lTSU9OIHtub3QgYSBwcmltaXRpdmUgbnVtYmVyfG5vdCBhbiBpbnRlZ2VyfG91dCBvZiByYW5nZX06IHt2fSdcclxuICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocCA9ICdQT1dfUFJFQ0lTSU9OJykpIHtcclxuICAgICAgICAgICAgdiA9IG9ialtwXTtcclxuICAgICAgICAgICAgaW50Q2hlY2sodiwgMCwgTUFYLCBwKTtcclxuICAgICAgICAgICAgUE9XX1BSRUNJU0lPTiA9IHY7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gRk9STUFUIHtvYmplY3R9XHJcbiAgICAgICAgICAvLyAnW0JpZ051bWJlciBFcnJvcl0gRk9STUFUIG5vdCBhbiBvYmplY3Q6IHt2fSdcclxuICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocCA9ICdGT1JNQVQnKSkge1xyXG4gICAgICAgICAgICB2ID0gb2JqW3BdO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHYgPT0gJ29iamVjdCcpIEZPUk1BVCA9IHY7XHJcbiAgICAgICAgICAgIGVsc2UgdGhyb3cgRXJyb3JcclxuICAgICAgICAgICAgIChiaWdudW1iZXJFcnJvciArIHAgKyAnIG5vdCBhbiBvYmplY3Q6ICcgKyB2KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBBTFBIQUJFVCB7c3RyaW5nfVxyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIEFMUEhBQkVUIGludmFsaWQ6IHt2fSdcclxuICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocCA9ICdBTFBIQUJFVCcpKSB7XHJcbiAgICAgICAgICAgIHYgPSBvYmpbcF07XHJcblxyXG4gICAgICAgICAgICAvLyBEaXNhbGxvdyBpZiBsZXNzIHRoYW4gdHdvIGNoYXJhY3RlcnMsXHJcbiAgICAgICAgICAgIC8vIG9yIGlmIGl0IGNvbnRhaW5zICcrJywgJy0nLCAnLicsIHdoaXRlc3BhY2UsIG9yIGEgcmVwZWF0ZWQgY2hhcmFjdGVyLlxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHYgPT0gJ3N0cmluZycgJiYgIS9eLj8kfFsrXFwtLlxcc118KC4pLipcXDEvLnRlc3QodikpIHtcclxuICAgICAgICAgICAgICBBTFBIQUJFVCA9IHY7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgRXJyb3JcclxuICAgICAgICAgICAgICAgKGJpZ251bWJlckVycm9yICsgcCArICcgaW52YWxpZDogJyArIHYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIE9iamVjdCBleHBlY3RlZDoge3Z9J1xyXG4gICAgICAgICAgdGhyb3cgRXJyb3JcclxuICAgICAgICAgICAoYmlnbnVtYmVyRXJyb3IgKyAnT2JqZWN0IGV4cGVjdGVkOiAnICsgb2JqKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgREVDSU1BTF9QTEFDRVM6IERFQ0lNQUxfUExBQ0VTLFxyXG4gICAgICAgIFJPVU5ESU5HX01PREU6IFJPVU5ESU5HX01PREUsXHJcbiAgICAgICAgRVhQT05FTlRJQUxfQVQ6IFtUT19FWFBfTkVHLCBUT19FWFBfUE9TXSxcclxuICAgICAgICBSQU5HRTogW01JTl9FWFAsIE1BWF9FWFBdLFxyXG4gICAgICAgIENSWVBUTzogQ1JZUFRPLFxyXG4gICAgICAgIE1PRFVMT19NT0RFOiBNT0RVTE9fTU9ERSxcclxuICAgICAgICBQT1dfUFJFQ0lTSU9OOiBQT1dfUFJFQ0lTSU9OLFxyXG4gICAgICAgIEZPUk1BVDogRk9STUFULFxyXG4gICAgICAgIEFMUEhBQkVUOiBBTFBIQUJFVFxyXG4gICAgICB9O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHYgaXMgYSBCaWdOdW1iZXIgaW5zdGFuY2UsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICAgKlxyXG4gICAgICogSWYgQmlnTnVtYmVyLkRFQlVHIGlzIHRydWUsIHRocm93IGlmIGEgQmlnTnVtYmVyIGluc3RhbmNlIGlzIG5vdCB3ZWxsLWZvcm1lZC5cclxuICAgICAqXHJcbiAgICAgKiB2IHthbnl9XHJcbiAgICAgKlxyXG4gICAgICogJ1tCaWdOdW1iZXIgRXJyb3JdIEludmFsaWQgQmlnTnVtYmVyOiB7dn0nXHJcbiAgICAgKi9cclxuICAgIEJpZ051bWJlci5pc0JpZ051bWJlciA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgIGlmICghdiB8fCB2Ll9pc0JpZ051bWJlciAhPT0gdHJ1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICBpZiAoIUJpZ051bWJlci5ERUJVRykgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICB2YXIgaSwgbixcclxuICAgICAgICBjID0gdi5jLFxyXG4gICAgICAgIGUgPSB2LmUsXHJcbiAgICAgICAgcyA9IHYucztcclxuXHJcbiAgICAgIG91dDogaWYgKHt9LnRvU3RyaW5nLmNhbGwoYykgPT0gJ1tvYmplY3QgQXJyYXldJykge1xyXG5cclxuICAgICAgICBpZiAoKHMgPT09IDEgfHwgcyA9PT0gLTEpICYmIGUgPj0gLU1BWCAmJiBlIDw9IE1BWCAmJiBlID09PSBtYXRoZmxvb3IoZSkpIHtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGUgZmlyc3QgZWxlbWVudCBpcyB6ZXJvLCB0aGUgQmlnTnVtYmVyIHZhbHVlIG11c3QgYmUgemVyby5cclxuICAgICAgICAgIGlmIChjWzBdID09PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChlID09PSAwICYmIGMubGVuZ3RoID09PSAxKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWsgb3V0O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIENhbGN1bGF0ZSBudW1iZXIgb2YgZGlnaXRzIHRoYXQgY1swXSBzaG91bGQgaGF2ZSwgYmFzZWQgb24gdGhlIGV4cG9uZW50LlxyXG4gICAgICAgICAgaSA9IChlICsgMSkgJSBMT0dfQkFTRTtcclxuICAgICAgICAgIGlmIChpIDwgMSkgaSArPSBMT0dfQkFTRTtcclxuXHJcbiAgICAgICAgICAvLyBDYWxjdWxhdGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiBjWzBdLlxyXG4gICAgICAgICAgLy9pZiAoTWF0aC5jZWlsKE1hdGgubG9nKGNbMF0gKyAxKSAvIE1hdGguTE4xMCkgPT0gaSkge1xyXG4gICAgICAgICAgaWYgKFN0cmluZyhjWzBdKS5sZW5ndGggPT0gaSkge1xyXG5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBuID0gY1tpXTtcclxuICAgICAgICAgICAgICBpZiAobiA8IDAgfHwgbiA+PSBCQVNFIHx8IG4gIT09IG1hdGhmbG9vcihuKSkgYnJlYWsgb3V0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBMYXN0IGVsZW1lbnQgY2Fubm90IGJlIHplcm8sIHVubGVzcyBpdCBpcyB0aGUgb25seSBlbGVtZW50LlxyXG4gICAgICAgICAgICBpZiAobiAhPT0gMCkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgLy8gSW5maW5pdHkvTmFOXHJcbiAgICAgIH0gZWxzZSBpZiAoYyA9PT0gbnVsbCAmJiBlID09PSBudWxsICYmIChzID09PSBudWxsIHx8IHMgPT09IDEgfHwgcyA9PT0gLTEpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRocm93IEVycm9yXHJcbiAgICAgICAgKGJpZ251bWJlckVycm9yICsgJ0ludmFsaWQgQmlnTnVtYmVyOiAnICsgdik7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgbWF4aW11bSBvZiB0aGUgYXJndW1lbnRzLlxyXG4gICAgICpcclxuICAgICAqIGFyZ3VtZW50cyB7bnVtYmVyfHN0cmluZ3xCaWdOdW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIEJpZ051bWJlci5tYXhpbXVtID0gQmlnTnVtYmVyLm1heCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIG1heE9yTWluKGFyZ3VtZW50cywgUC5sdCk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgbWluaW11bSBvZiB0aGUgYXJndW1lbnRzLlxyXG4gICAgICpcclxuICAgICAqIGFyZ3VtZW50cyB7bnVtYmVyfHN0cmluZ3xCaWdOdW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIEJpZ051bWJlci5taW5pbXVtID0gQmlnTnVtYmVyLm1pbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIG1heE9yTWluKGFyZ3VtZW50cywgUC5ndCk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aXRoIGEgcmFuZG9tIHZhbHVlIGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhbiAwIGFuZCBsZXNzIHRoYW4gMSxcclxuICAgICAqIGFuZCB3aXRoIGRwLCBvciBERUNJTUFMX1BMQUNFUyBpZiBkcCBpcyBvbWl0dGVkLCBkZWNpbWFsIHBsYWNlcyAob3IgbGVzcyBpZiB0cmFpbGluZ1xyXG4gICAgICogemVyb3MgYXJlIHByb2R1Y2VkKS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzLiBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgKlxyXG4gICAgICogJ1tCaWdOdW1iZXIgRXJyb3JdIEFyZ3VtZW50IHtub3QgYSBwcmltaXRpdmUgbnVtYmVyfG5vdCBhbiBpbnRlZ2VyfG91dCBvZiByYW5nZX06IHtkcH0nXHJcbiAgICAgKiAnW0JpZ051bWJlciBFcnJvcl0gY3J5cHRvIHVuYXZhaWxhYmxlJ1xyXG4gICAgICovXHJcbiAgICBCaWdOdW1iZXIucmFuZG9tID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHBvdzJfNTMgPSAweDIwMDAwMDAwMDAwMDAwO1xyXG5cclxuICAgICAgLy8gUmV0dXJuIGEgNTMgYml0IGludGVnZXIgbiwgd2hlcmUgMCA8PSBuIDwgOTAwNzE5OTI1NDc0MDk5Mi5cclxuICAgICAgLy8gQ2hlY2sgaWYgTWF0aC5yYW5kb20oKSBwcm9kdWNlcyBtb3JlIHRoYW4gMzIgYml0cyBvZiByYW5kb21uZXNzLlxyXG4gICAgICAvLyBJZiBpdCBkb2VzLCBhc3N1bWUgYXQgbGVhc3QgNTMgYml0cyBhcmUgcHJvZHVjZWQsIG90aGVyd2lzZSBhc3N1bWUgYXQgbGVhc3QgMzAgYml0cy5cclxuICAgICAgLy8gMHg0MDAwMDAwMCBpcyAyXjMwLCAweDgwMDAwMCBpcyAyXjIzLCAweDFmZmZmZiBpcyAyXjIxIC0gMS5cclxuICAgICAgdmFyIHJhbmRvbTUzYml0SW50ID0gKE1hdGgucmFuZG9tKCkgKiBwb3cyXzUzKSAmIDB4MWZmZmZmXHJcbiAgICAgICA/IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGhmbG9vcihNYXRoLnJhbmRvbSgpICogcG93Ml81Myk7IH1cclxuICAgICAgIDogZnVuY3Rpb24gKCkgeyByZXR1cm4gKChNYXRoLnJhbmRvbSgpICogMHg0MDAwMDAwMCB8IDApICogMHg4MDAwMDApICtcclxuICAgICAgICAgKE1hdGgucmFuZG9tKCkgKiAweDgwMDAwMCB8IDApOyB9O1xyXG5cclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkcCkge1xyXG4gICAgICAgIHZhciBhLCBiLCBlLCBrLCB2LFxyXG4gICAgICAgICAgaSA9IDAsXHJcbiAgICAgICAgICBjID0gW10sXHJcbiAgICAgICAgICByYW5kID0gbmV3IEJpZ051bWJlcihPTkUpO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkgZHAgPSBERUNJTUFMX1BMQUNFUztcclxuICAgICAgICBlbHNlIGludENoZWNrKGRwLCAwLCBNQVgpO1xyXG5cclxuICAgICAgICBrID0gbWF0aGNlaWwoZHAgLyBMT0dfQkFTRSk7XHJcblxyXG4gICAgICAgIGlmIChDUllQVE8pIHtcclxuXHJcbiAgICAgICAgICAvLyBCcm93c2VycyBzdXBwb3J0aW5nIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMuXHJcbiAgICAgICAgICBpZiAoY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xyXG5cclxuICAgICAgICAgICAgYSA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQzMkFycmF5KGsgKj0gMikpO1xyXG5cclxuICAgICAgICAgICAgZm9yICg7IGkgPCBrOykge1xyXG5cclxuICAgICAgICAgICAgICAvLyA1MyBiaXRzOlxyXG4gICAgICAgICAgICAgIC8vICgoTWF0aC5wb3coMiwgMzIpIC0gMSkgKiBNYXRoLnBvdygyLCAyMSkpLnRvU3RyaW5nKDIpXHJcbiAgICAgICAgICAgICAgLy8gMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMDAwMDAgMDAwMDAwMDAgMDAwMDAwMDBcclxuICAgICAgICAgICAgICAvLyAoKE1hdGgucG93KDIsIDMyKSAtIDEpID4+PiAxMSkudG9TdHJpbmcoMilcclxuICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxMTExMSAxMTExMTExMSAxMTExMTExMVxyXG4gICAgICAgICAgICAgIC8vIDB4MjAwMDAgaXMgMl4yMS5cclxuICAgICAgICAgICAgICB2ID0gYVtpXSAqIDB4MjAwMDAgKyAoYVtpICsgMV0gPj4+IDExKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gUmVqZWN0aW9uIHNhbXBsaW5nOlxyXG4gICAgICAgICAgICAgIC8vIDAgPD0gdiA8IDkwMDcxOTkyNTQ3NDA5OTJcclxuICAgICAgICAgICAgICAvLyBQcm9iYWJpbGl0eSB0aGF0IHYgPj0gOWUxNSwgaXNcclxuICAgICAgICAgICAgICAvLyA3MTk5MjU0NzQwOTkyIC8gOTAwNzE5OTI1NDc0MDk5MiB+PSAwLjAwMDgsIGkuZS4gMSBpbiAxMjUxXHJcbiAgICAgICAgICAgICAgaWYgKHYgPj0gOWUxNSkge1xyXG4gICAgICAgICAgICAgICAgYiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQzMkFycmF5KDIpKTtcclxuICAgICAgICAgICAgICAgIGFbaV0gPSBiWzBdO1xyXG4gICAgICAgICAgICAgICAgYVtpICsgMV0gPSBiWzFdO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gMCA8PSB2IDw9IDg5OTk5OTk5OTk5OTk5OTlcclxuICAgICAgICAgICAgICAgIC8vIDAgPD0gKHYgJSAxZTE0KSA8PSA5OTk5OTk5OTk5OTk5OVxyXG4gICAgICAgICAgICAgICAgYy5wdXNoKHYgJSAxZTE0KTtcclxuICAgICAgICAgICAgICAgIGkgKz0gMjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaSA9IGsgLyAyO1xyXG5cclxuICAgICAgICAgIC8vIE5vZGUuanMgc3VwcG9ydGluZyBjcnlwdG8ucmFuZG9tQnl0ZXMuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNyeXB0by5yYW5kb21CeXRlcykge1xyXG5cclxuICAgICAgICAgICAgLy8gYnVmZmVyXHJcbiAgICAgICAgICAgIGEgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoayAqPSA3KTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoOyBpIDwgazspIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gMHgxMDAwMDAwMDAwMDAwIGlzIDJeNDgsIDB4MTAwMDAwMDAwMDAgaXMgMl40MFxyXG4gICAgICAgICAgICAgIC8vIDB4MTAwMDAwMDAwIGlzIDJeMzIsIDB4MTAwMDAwMCBpcyAyXjI0XHJcbiAgICAgICAgICAgICAgLy8gMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTFcclxuICAgICAgICAgICAgICAvLyAwIDw9IHYgPCA5MDA3MTk5MjU0NzQwOTkyXHJcbiAgICAgICAgICAgICAgdiA9ICgoYVtpXSAmIDMxKSAqIDB4MTAwMDAwMDAwMDAwMCkgKyAoYVtpICsgMV0gKiAweDEwMDAwMDAwMDAwKSArXHJcbiAgICAgICAgICAgICAgICAgKGFbaSArIDJdICogMHgxMDAwMDAwMDApICsgKGFbaSArIDNdICogMHgxMDAwMDAwKSArXHJcbiAgICAgICAgICAgICAgICAgKGFbaSArIDRdIDw8IDE2KSArIChhW2kgKyA1XSA8PCA4KSArIGFbaSArIDZdO1xyXG5cclxuICAgICAgICAgICAgICBpZiAodiA+PSA5ZTE1KSB7XHJcbiAgICAgICAgICAgICAgICBjcnlwdG8ucmFuZG9tQnl0ZXMoNykuY29weShhLCBpKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIDAgPD0gKHYgJSAxZTE0KSA8PSA5OTk5OTk5OTk5OTk5OVxyXG4gICAgICAgICAgICAgICAgYy5wdXNoKHYgJSAxZTE0KTtcclxuICAgICAgICAgICAgICAgIGkgKz0gNztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaSA9IGsgLyA3O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgQ1JZUFRPID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yXHJcbiAgICAgICAgICAgICAoYmlnbnVtYmVyRXJyb3IgKyAnY3J5cHRvIHVuYXZhaWxhYmxlJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVc2UgTWF0aC5yYW5kb20uXHJcbiAgICAgICAgaWYgKCFDUllQVE8pIHtcclxuXHJcbiAgICAgICAgICBmb3IgKDsgaSA8IGs7KSB7XHJcbiAgICAgICAgICAgIHYgPSByYW5kb201M2JpdEludCgpO1xyXG4gICAgICAgICAgICBpZiAodiA8IDllMTUpIGNbaSsrXSA9IHYgJSAxZTE0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgayA9IGNbLS1pXTtcclxuICAgICAgICBkcCAlPSBMT0dfQkFTRTtcclxuXHJcbiAgICAgICAgLy8gQ29udmVydCB0cmFpbGluZyBkaWdpdHMgdG8gemVyb3MgYWNjb3JkaW5nIHRvIGRwLlxyXG4gICAgICAgIGlmIChrICYmIGRwKSB7XHJcbiAgICAgICAgICB2ID0gUE9XU19URU5bTE9HX0JBU0UgLSBkcF07XHJcbiAgICAgICAgICBjW2ldID0gbWF0aGZsb29yKGsgLyB2KSAqIHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgZWxlbWVudHMgd2hpY2ggYXJlIHplcm8uXHJcbiAgICAgICAgZm9yICg7IGNbaV0gPT09IDA7IGMucG9wKCksIGktLSk7XHJcblxyXG4gICAgICAgIC8vIFplcm8/XHJcbiAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICBjID0gW2UgPSAwXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIGVsZW1lbnRzIHdoaWNoIGFyZSB6ZXJvIGFuZCBhZGp1c3QgZXhwb25lbnQgYWNjb3JkaW5nbHkuXHJcbiAgICAgICAgICBmb3IgKGUgPSAtMSA7IGNbMF0gPT09IDA7IGMuc3BsaWNlKDAsIDEpLCBlIC09IExPR19CQVNFKTtcclxuXHJcbiAgICAgICAgICAvLyBDb3VudCB0aGUgZGlnaXRzIG9mIHRoZSBmaXJzdCBlbGVtZW50IG9mIGMgdG8gZGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MsIGFuZC4uLlxyXG4gICAgICAgICAgZm9yIChpID0gMSwgdiA9IGNbMF07IHYgPj0gMTA7IHYgLz0gMTAsIGkrKyk7XHJcblxyXG4gICAgICAgICAgLy8gYWRqdXN0IHRoZSBleHBvbmVudCBhY2NvcmRpbmdseS5cclxuICAgICAgICAgIGlmIChpIDwgTE9HX0JBU0UpIGUgLT0gTE9HX0JBU0UgLSBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmFuZC5lID0gZTtcclxuICAgICAgICByYW5kLmMgPSBjO1xyXG4gICAgICAgIHJldHVybiByYW5kO1xyXG4gICAgICB9O1xyXG4gICAgfSkoKTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgc3VtIG9mIHRoZSBhcmd1bWVudHMuXHJcbiAgICAgKlxyXG4gICAgICogYXJndW1lbnRzIHtudW1iZXJ8c3RyaW5nfEJpZ051bWJlcn1cclxuICAgICAqL1xyXG4gICAgQmlnTnVtYmVyLnN1bSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIGkgPSAxLFxyXG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHMsXHJcbiAgICAgICAgc3VtID0gbmV3IEJpZ051bWJlcihhcmdzWzBdKTtcclxuICAgICAgZm9yICg7IGkgPCBhcmdzLmxlbmd0aDspIHN1bSA9IHN1bS5wbHVzKGFyZ3NbaSsrXSk7XHJcbiAgICAgIHJldHVybiBzdW07XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvLyBQUklWQVRFIEZVTkNUSU9OU1xyXG5cclxuXHJcbiAgICAvLyBDYWxsZWQgYnkgQmlnTnVtYmVyIGFuZCBCaWdOdW1iZXIucHJvdG90eXBlLnRvU3RyaW5nLlxyXG4gICAgY29udmVydEJhc2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgZGVjaW1hbCA9ICcwMTIzNDU2Nzg5JztcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIENvbnZlcnQgc3RyaW5nIG9mIGJhc2VJbiB0byBhbiBhcnJheSBvZiBudW1iZXJzIG9mIGJhc2VPdXQuXHJcbiAgICAgICAqIEVnLiB0b0Jhc2VPdXQoJzI1NScsIDEwLCAxNikgcmV0dXJucyBbMTUsIDE1XS5cclxuICAgICAgICogRWcuIHRvQmFzZU91dCgnZmYnLCAxNiwgMTApIHJldHVybnMgWzIsIDUsIDVdLlxyXG4gICAgICAgKi9cclxuICAgICAgZnVuY3Rpb24gdG9CYXNlT3V0KHN0ciwgYmFzZUluLCBiYXNlT3V0LCBhbHBoYWJldCkge1xyXG4gICAgICAgIHZhciBqLFxyXG4gICAgICAgICAgYXJyID0gWzBdLFxyXG4gICAgICAgICAgYXJyTCxcclxuICAgICAgICAgIGkgPSAwLFxyXG4gICAgICAgICAgbGVuID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgZm9yICg7IGkgPCBsZW47KSB7XHJcbiAgICAgICAgICBmb3IgKGFyckwgPSBhcnIubGVuZ3RoOyBhcnJMLS07IGFyclthcnJMXSAqPSBiYXNlSW4pO1xyXG5cclxuICAgICAgICAgIGFyclswXSArPSBhbHBoYWJldC5pbmRleE9mKHN0ci5jaGFyQXQoaSsrKSk7XHJcblxyXG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IGFyci5sZW5ndGg7IGorKykge1xyXG5cclxuICAgICAgICAgICAgaWYgKGFycltqXSA+IGJhc2VPdXQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGFycltqICsgMV0gPT0gbnVsbCkgYXJyW2ogKyAxXSA9IDA7XHJcbiAgICAgICAgICAgICAgYXJyW2ogKyAxXSArPSBhcnJbal0gLyBiYXNlT3V0IHwgMDtcclxuICAgICAgICAgICAgICBhcnJbal0gJT0gYmFzZU91dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGFyci5yZXZlcnNlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENvbnZlcnQgYSBudW1lcmljIHN0cmluZyBvZiBiYXNlSW4gdG8gYSBudW1lcmljIHN0cmluZyBvZiBiYXNlT3V0LlxyXG4gICAgICAvLyBJZiB0aGUgY2FsbGVyIGlzIHRvU3RyaW5nLCB3ZSBhcmUgY29udmVydGluZyBmcm9tIGJhc2UgMTAgdG8gYmFzZU91dC5cclxuICAgICAgLy8gSWYgdGhlIGNhbGxlciBpcyBCaWdOdW1iZXIsIHdlIGFyZSBjb252ZXJ0aW5nIGZyb20gYmFzZUluIHRvIGJhc2UgMTAuXHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoc3RyLCBiYXNlSW4sIGJhc2VPdXQsIHNpZ24sIGNhbGxlcklzVG9TdHJpbmcpIHtcclxuICAgICAgICB2YXIgYWxwaGFiZXQsIGQsIGUsIGssIHIsIHgsIHhjLCB5LFxyXG4gICAgICAgICAgaSA9IHN0ci5pbmRleE9mKCcuJyksXHJcbiAgICAgICAgICBkcCA9IERFQ0lNQUxfUExBQ0VTLFxyXG4gICAgICAgICAgcm0gPSBST1VORElOR19NT0RFO1xyXG5cclxuICAgICAgICAvLyBOb24taW50ZWdlci5cclxuICAgICAgICBpZiAoaSA+PSAwKSB7XHJcbiAgICAgICAgICBrID0gUE9XX1BSRUNJU0lPTjtcclxuXHJcbiAgICAgICAgICAvLyBVbmxpbWl0ZWQgcHJlY2lzaW9uLlxyXG4gICAgICAgICAgUE9XX1BSRUNJU0lPTiA9IDA7XHJcbiAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgnLicsICcnKTtcclxuICAgICAgICAgIHkgPSBuZXcgQmlnTnVtYmVyKGJhc2VJbik7XHJcbiAgICAgICAgICB4ID0geS5wb3coc3RyLmxlbmd0aCAtIGkpO1xyXG4gICAgICAgICAgUE9XX1BSRUNJU0lPTiA9IGs7XHJcblxyXG4gICAgICAgICAgLy8gQ29udmVydCBzdHIgYXMgaWYgYW4gaW50ZWdlciwgdGhlbiByZXN0b3JlIHRoZSBmcmFjdGlvbiBwYXJ0IGJ5IGRpdmlkaW5nIHRoZVxyXG4gICAgICAgICAgLy8gcmVzdWx0IGJ5IGl0cyBiYXNlIHJhaXNlZCB0byBhIHBvd2VyLlxyXG5cclxuICAgICAgICAgIHkuYyA9IHRvQmFzZU91dCh0b0ZpeGVkUG9pbnQoY29lZmZUb1N0cmluZyh4LmMpLCB4LmUsICcwJyksXHJcbiAgICAgICAgICAgMTAsIGJhc2VPdXQsIGRlY2ltYWwpO1xyXG4gICAgICAgICAgeS5lID0geS5jLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgdGhlIG51bWJlciBhcyBpbnRlZ2VyLlxyXG5cclxuICAgICAgICB4YyA9IHRvQmFzZU91dChzdHIsIGJhc2VJbiwgYmFzZU91dCwgY2FsbGVySXNUb1N0cmluZ1xyXG4gICAgICAgICA/IChhbHBoYWJldCA9IEFMUEhBQkVULCBkZWNpbWFsKVxyXG4gICAgICAgICA6IChhbHBoYWJldCA9IGRlY2ltYWwsIEFMUEhBQkVUKSk7XHJcblxyXG4gICAgICAgIC8vIHhjIG5vdyByZXByZXNlbnRzIHN0ciBhcyBhbiBpbnRlZ2VyIGFuZCBjb252ZXJ0ZWQgdG8gYmFzZU91dC4gZSBpcyB0aGUgZXhwb25lbnQuXHJcbiAgICAgICAgZSA9IGsgPSB4Yy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKDsgeGNbLS1rXSA9PSAwOyB4Yy5wb3AoKSk7XHJcblxyXG4gICAgICAgIC8vIFplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSkgcmV0dXJuIGFscGhhYmV0LmNoYXJBdCgwKTtcclxuXHJcbiAgICAgICAgLy8gRG9lcyBzdHIgcmVwcmVzZW50IGFuIGludGVnZXI/IElmIHNvLCBubyBuZWVkIGZvciB0aGUgZGl2aXNpb24uXHJcbiAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICAtLWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHguYyA9IHhjO1xyXG4gICAgICAgICAgeC5lID0gZTtcclxuXHJcbiAgICAgICAgICAvLyBUaGUgc2lnbiBpcyBuZWVkZWQgZm9yIGNvcnJlY3Qgcm91bmRpbmcuXHJcbiAgICAgICAgICB4LnMgPSBzaWduO1xyXG4gICAgICAgICAgeCA9IGRpdih4LCB5LCBkcCwgcm0sIGJhc2VPdXQpO1xyXG4gICAgICAgICAgeGMgPSB4LmM7XHJcbiAgICAgICAgICByID0geC5yO1xyXG4gICAgICAgICAgZSA9IHguZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHhjIG5vdyByZXByZXNlbnRzIHN0ciBjb252ZXJ0ZWQgdG8gYmFzZU91dC5cclxuXHJcbiAgICAgICAgLy8gVEhlIGluZGV4IG9mIHRoZSByb3VuZGluZyBkaWdpdC5cclxuICAgICAgICBkID0gZSArIGRwICsgMTtcclxuXHJcbiAgICAgICAgLy8gVGhlIHJvdW5kaW5nIGRpZ2l0OiB0aGUgZGlnaXQgdG8gdGhlIHJpZ2h0IG9mIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgIGkgPSB4Y1tkXTtcclxuXHJcbiAgICAgICAgLy8gTG9vayBhdCB0aGUgcm91bmRpbmcgZGlnaXRzIGFuZCBtb2RlIHRvIGRldGVybWluZSB3aGV0aGVyIHRvIHJvdW5kIHVwLlxyXG5cclxuICAgICAgICBrID0gYmFzZU91dCAvIDI7XHJcbiAgICAgICAgciA9IHIgfHwgZCA8IDAgfHwgeGNbZCArIDFdICE9IG51bGw7XHJcblxyXG4gICAgICAgIHIgPSBybSA8IDQgPyAoaSAhPSBudWxsIHx8IHIpICYmIChybSA9PSAwIHx8IHJtID09ICh4LnMgPCAwID8gMyA6IDIpKVxyXG4gICAgICAgICAgICAgIDogaSA+IGsgfHwgaSA9PSBrICYmKHJtID09IDQgfHwgciB8fCBybSA9PSA2ICYmIHhjW2QgLSAxXSAmIDEgfHxcclxuICAgICAgICAgICAgICAgcm0gPT0gKHgucyA8IDAgPyA4IDogNykpO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgaW5kZXggb2YgdGhlIHJvdW5kaW5nIGRpZ2l0IGlzIG5vdCBncmVhdGVyIHRoYW4gemVybywgb3IgeGMgcmVwcmVzZW50c1xyXG4gICAgICAgIC8vIHplcm8sIHRoZW4gdGhlIHJlc3VsdCBvZiB0aGUgYmFzZSBjb252ZXJzaW9uIGlzIHplcm8gb3IsIGlmIHJvdW5kaW5nIHVwLCBhIHZhbHVlXHJcbiAgICAgICAgLy8gc3VjaCBhcyAwLjAwMDAxLlxyXG4gICAgICAgIGlmIChkIDwgMSB8fCAheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAvLyAxXi1kcCBvciAwXHJcbiAgICAgICAgICBzdHIgPSByID8gdG9GaXhlZFBvaW50KGFscGhhYmV0LmNoYXJBdCgxKSwgLWRwLCBhbHBoYWJldC5jaGFyQXQoMCkpIDogYWxwaGFiZXQuY2hhckF0KDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gVHJ1bmNhdGUgeGMgdG8gdGhlIHJlcXVpcmVkIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgIHhjLmxlbmd0aCA9IGQ7XHJcblxyXG4gICAgICAgICAgLy8gUm91bmQgdXA/XHJcbiAgICAgICAgICBpZiAocikge1xyXG5cclxuICAgICAgICAgICAgLy8gUm91bmRpbmcgdXAgbWF5IG1lYW4gdGhlIHByZXZpb3VzIGRpZ2l0IGhhcyB0byBiZSByb3VuZGVkIHVwIGFuZCBzbyBvbi5cclxuICAgICAgICAgICAgZm9yICgtLWJhc2VPdXQ7ICsreGNbLS1kXSA+IGJhc2VPdXQ7KSB7XHJcbiAgICAgICAgICAgICAgeGNbZF0gPSAwO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoIWQpIHtcclxuICAgICAgICAgICAgICAgICsrZTtcclxuICAgICAgICAgICAgICAgIHhjID0gWzFdLmNvbmNhdCh4Yyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgZm9yIChrID0geGMubGVuZ3RoOyAheGNbLS1rXTspO1xyXG5cclxuICAgICAgICAgIC8vIEUuZy4gWzQsIDExLCAxNV0gYmVjb21lcyA0YmYuXHJcbiAgICAgICAgICBmb3IgKGkgPSAwLCBzdHIgPSAnJzsgaSA8PSBrOyBzdHIgKz0gYWxwaGFiZXQuY2hhckF0KHhjW2krK10pKTtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgbGVhZGluZyB6ZXJvcywgZGVjaW1hbCBwb2ludCBhbmQgdHJhaWxpbmcgemVyb3MgYXMgcmVxdWlyZWQuXHJcbiAgICAgICAgICBzdHIgPSB0b0ZpeGVkUG9pbnQoc3RyLCBlLCBhbHBoYWJldC5jaGFyQXQoMCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVGhlIGNhbGxlciB3aWxsIGFkZCB0aGUgc2lnbi5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICB9O1xyXG4gICAgfSkoKTtcclxuXHJcblxyXG4gICAgLy8gUGVyZm9ybSBkaXZpc2lvbiBpbiB0aGUgc3BlY2lmaWVkIGJhc2UuIENhbGxlZCBieSBkaXYgYW5kIGNvbnZlcnRCYXNlLlxyXG4gICAgZGl2ID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIC8vIEFzc3VtZSBub24temVybyB4IGFuZCBrLlxyXG4gICAgICBmdW5jdGlvbiBtdWx0aXBseSh4LCBrLCBiYXNlKSB7XHJcbiAgICAgICAgdmFyIG0sIHRlbXAsIHhsbywgeGhpLFxyXG4gICAgICAgICAgY2FycnkgPSAwLFxyXG4gICAgICAgICAgaSA9IHgubGVuZ3RoLFxyXG4gICAgICAgICAga2xvID0gayAlIFNRUlRfQkFTRSxcclxuICAgICAgICAgIGtoaSA9IGsgLyBTUVJUX0JBU0UgfCAwO1xyXG5cclxuICAgICAgICBmb3IgKHggPSB4LnNsaWNlKCk7IGktLTspIHtcclxuICAgICAgICAgIHhsbyA9IHhbaV0gJSBTUVJUX0JBU0U7XHJcbiAgICAgICAgICB4aGkgPSB4W2ldIC8gU1FSVF9CQVNFIHwgMDtcclxuICAgICAgICAgIG0gPSBraGkgKiB4bG8gKyB4aGkgKiBrbG87XHJcbiAgICAgICAgICB0ZW1wID0ga2xvICogeGxvICsgKChtICUgU1FSVF9CQVNFKSAqIFNRUlRfQkFTRSkgKyBjYXJyeTtcclxuICAgICAgICAgIGNhcnJ5ID0gKHRlbXAgLyBiYXNlIHwgMCkgKyAobSAvIFNRUlRfQkFTRSB8IDApICsga2hpICogeGhpO1xyXG4gICAgICAgICAgeFtpXSA9IHRlbXAgJSBiYXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNhcnJ5KSB4ID0gW2NhcnJ5XS5jb25jYXQoeCk7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBjb21wYXJlKGEsIGIsIGFMLCBiTCkge1xyXG4gICAgICAgIHZhciBpLCBjbXA7XHJcblxyXG4gICAgICAgIGlmIChhTCAhPSBiTCkge1xyXG4gICAgICAgICAgY21wID0gYUwgPiBiTCA/IDEgOiAtMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIGZvciAoaSA9IGNtcCA9IDA7IGkgPCBhTDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoYVtpXSAhPSBiW2ldKSB7XHJcbiAgICAgICAgICAgICAgY21wID0gYVtpXSA+IGJbaV0gPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjbXA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHN1YnRyYWN0KGEsIGIsIGFMLCBiYXNlKSB7XHJcbiAgICAgICAgdmFyIGkgPSAwO1xyXG5cclxuICAgICAgICAvLyBTdWJ0cmFjdCBiIGZyb20gYS5cclxuICAgICAgICBmb3IgKDsgYUwtLTspIHtcclxuICAgICAgICAgIGFbYUxdIC09IGk7XHJcbiAgICAgICAgICBpID0gYVthTF0gPCBiW2FMXSA/IDEgOiAwO1xyXG4gICAgICAgICAgYVthTF0gPSBpICogYmFzZSArIGFbYUxdIC0gYlthTF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKDsgIWFbMF0gJiYgYS5sZW5ndGggPiAxOyBhLnNwbGljZSgwLCAxKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHg6IGRpdmlkZW5kLCB5OiBkaXZpc29yLlxyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHgsIHksIGRwLCBybSwgYmFzZSkge1xyXG4gICAgICAgIHZhciBjbXAsIGUsIGksIG1vcmUsIG4sIHByb2QsIHByb2RMLCBxLCBxYywgcmVtLCByZW1MLCByZW0wLCB4aSwgeEwsIHljMCxcclxuICAgICAgICAgIHlMLCB5eixcclxuICAgICAgICAgIHMgPSB4LnMgPT0geS5zID8gMSA6IC0xLFxyXG4gICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICB5YyA9IHkuYztcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIE5hTiwgSW5maW5pdHkgb3IgMD9cclxuICAgICAgICBpZiAoIXhjIHx8ICF4Y1swXSB8fCAheWMgfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG5ldyBCaWdOdW1iZXIoXHJcblxyXG4gICAgICAgICAgIC8vIFJldHVybiBOYU4gaWYgZWl0aGVyIE5hTiwgb3IgYm90aCBJbmZpbml0eSBvciAwLlxyXG4gICAgICAgICAgICF4LnMgfHwgIXkucyB8fCAoeGMgPyB5YyAmJiB4Y1swXSA9PSB5Y1swXSA6ICF5YykgPyBOYU4gOlxyXG5cclxuICAgICAgICAgICAgLy8gUmV0dXJuIMKxMCBpZiB4IGlzIMKxMCBvciB5IGlzIMKxSW5maW5pdHksIG9yIHJldHVybiDCsUluZmluaXR5IGFzIHkgaXMgwrEwLlxyXG4gICAgICAgICAgICB4YyAmJiB4Y1swXSA9PSAwIHx8ICF5YyA/IHMgKiAwIDogcyAvIDBcclxuICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHEgPSBuZXcgQmlnTnVtYmVyKHMpO1xyXG4gICAgICAgIHFjID0gcS5jID0gW107XHJcbiAgICAgICAgZSA9IHguZSAtIHkuZTtcclxuICAgICAgICBzID0gZHAgKyBlICsgMTtcclxuXHJcbiAgICAgICAgaWYgKCFiYXNlKSB7XHJcbiAgICAgICAgICBiYXNlID0gQkFTRTtcclxuICAgICAgICAgIGUgPSBiaXRGbG9vcih4LmUgLyBMT0dfQkFTRSkgLSBiaXRGbG9vcih5LmUgLyBMT0dfQkFTRSk7XHJcbiAgICAgICAgICBzID0gcyAvIExPR19CQVNFIHwgMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlc3VsdCBleHBvbmVudCBtYXkgYmUgb25lIGxlc3MgdGhlbiB0aGUgY3VycmVudCB2YWx1ZSBvZiBlLlxyXG4gICAgICAgIC8vIFRoZSBjb2VmZmljaWVudHMgb2YgdGhlIEJpZ051bWJlcnMgZnJvbSBjb252ZXJ0QmFzZSBtYXkgaGF2ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSAwOyB5Y1tpXSA9PSAoeGNbaV0gfHwgMCk7IGkrKyk7XHJcblxyXG4gICAgICAgIGlmICh5Y1tpXSA+ICh4Y1tpXSB8fCAwKSkgZS0tO1xyXG5cclxuICAgICAgICBpZiAocyA8IDApIHtcclxuICAgICAgICAgIHFjLnB1c2goMSk7XHJcbiAgICAgICAgICBtb3JlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgeEwgPSB4Yy5sZW5ndGg7XHJcbiAgICAgICAgICB5TCA9IHljLmxlbmd0aDtcclxuICAgICAgICAgIGkgPSAwO1xyXG4gICAgICAgICAgcyArPSAyO1xyXG5cclxuICAgICAgICAgIC8vIE5vcm1hbGlzZSB4YyBhbmQgeWMgc28gaGlnaGVzdCBvcmRlciBkaWdpdCBvZiB5YyBpcyA+PSBiYXNlIC8gMi5cclxuXHJcbiAgICAgICAgICBuID0gbWF0aGZsb29yKGJhc2UgLyAoeWNbMF0gKyAxKSk7XHJcblxyXG4gICAgICAgICAgLy8gTm90IG5lY2Vzc2FyeSwgYnV0IHRvIGhhbmRsZSBvZGQgYmFzZXMgd2hlcmUgeWNbMF0gPT0gKGJhc2UgLyAyKSAtIDEuXHJcbiAgICAgICAgICAvLyBpZiAobiA+IDEgfHwgbisrID09IDEgJiYgeWNbMF0gPCBiYXNlIC8gMikge1xyXG4gICAgICAgICAgaWYgKG4gPiAxKSB7XHJcbiAgICAgICAgICAgIHljID0gbXVsdGlwbHkoeWMsIG4sIGJhc2UpO1xyXG4gICAgICAgICAgICB4YyA9IG11bHRpcGx5KHhjLCBuLCBiYXNlKTtcclxuICAgICAgICAgICAgeUwgPSB5Yy5sZW5ndGg7XHJcbiAgICAgICAgICAgIHhMID0geGMubGVuZ3RoO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHhpID0geUw7XHJcbiAgICAgICAgICByZW0gPSB4Yy5zbGljZSgwLCB5TCk7XHJcbiAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgemVyb3MgdG8gbWFrZSByZW1haW5kZXIgYXMgbG9uZyBhcyBkaXZpc29yLlxyXG4gICAgICAgICAgZm9yICg7IHJlbUwgPCB5TDsgcmVtW3JlbUwrK10gPSAwKTtcclxuICAgICAgICAgIHl6ID0geWMuc2xpY2UoKTtcclxuICAgICAgICAgIHl6ID0gWzBdLmNvbmNhdCh5eik7XHJcbiAgICAgICAgICB5YzAgPSB5Y1swXTtcclxuICAgICAgICAgIGlmICh5Y1sxXSA+PSBiYXNlIC8gMikgeWMwKys7XHJcbiAgICAgICAgICAvLyBOb3QgbmVjZXNzYXJ5LCBidXQgdG8gcHJldmVudCB0cmlhbCBkaWdpdCBuID4gYmFzZSwgd2hlbiB1c2luZyBiYXNlIDMuXHJcbiAgICAgICAgICAvLyBlbHNlIGlmIChiYXNlID09IDMgJiYgeWMwID09IDEpIHljMCA9IDEgKyAxZS0xNTtcclxuXHJcbiAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIG4gPSAwO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGNtcCA9IGNvbXBhcmUoeWMsIHJlbSwgeUwsIHJlbUwpO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgZGl2aXNvciA8IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRyaWFsIGRpZ2l0LCBuLlxyXG5cclxuICAgICAgICAgICAgICByZW0wID0gcmVtWzBdO1xyXG4gICAgICAgICAgICAgIGlmICh5TCAhPSByZW1MKSByZW0wID0gcmVtMCAqIGJhc2UgKyAocmVtWzFdIHx8IDApO1xyXG5cclxuICAgICAgICAgICAgICAvLyBuIGlzIGhvdyBtYW55IHRpbWVzIHRoZSBkaXZpc29yIGdvZXMgaW50byB0aGUgY3VycmVudCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgbiA9IG1hdGhmbG9vcihyZW0wIC8geWMwKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gIEFsZ29yaXRobTpcclxuICAgICAgICAgICAgICAvLyAgcHJvZHVjdCA9IGRpdmlzb3IgbXVsdGlwbGllZCBieSB0cmlhbCBkaWdpdCAobikuXHJcbiAgICAgICAgICAgICAgLy8gIENvbXBhcmUgcHJvZHVjdCBhbmQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgIC8vICBJZiBwcm9kdWN0IGlzIGdyZWF0ZXIgdGhhbiByZW1haW5kZXI6XHJcbiAgICAgICAgICAgICAgLy8gICAgU3VidHJhY3QgZGl2aXNvciBmcm9tIHByb2R1Y3QsIGRlY3JlbWVudCB0cmlhbCBkaWdpdC5cclxuICAgICAgICAgICAgICAvLyAgU3VidHJhY3QgcHJvZHVjdCBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAvLyAgSWYgcHJvZHVjdCB3YXMgbGVzcyB0aGFuIHJlbWFpbmRlciBhdCB0aGUgbGFzdCBjb21wYXJlOlxyXG4gICAgICAgICAgICAgIC8vICAgIENvbXBhcmUgbmV3IHJlbWFpbmRlciBhbmQgZGl2aXNvci5cclxuICAgICAgICAgICAgICAvLyAgICBJZiByZW1haW5kZXIgaXMgZ3JlYXRlciB0aGFuIGRpdmlzb3I6XHJcbiAgICAgICAgICAgICAgLy8gICAgICBTdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLCBpbmNyZW1lbnQgdHJpYWwgZGlnaXQuXHJcblxyXG4gICAgICAgICAgICAgIGlmIChuID4gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG4gbWF5IGJlID4gYmFzZSBvbmx5IHdoZW4gYmFzZSBpcyAzLlxyXG4gICAgICAgICAgICAgICAgaWYgKG4gPj0gYmFzZSkgbiA9IGJhc2UgLSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHByb2R1Y3QgPSBkaXZpc29yICogdHJpYWwgZGlnaXQuXHJcbiAgICAgICAgICAgICAgICBwcm9kID0gbXVsdGlwbHkoeWMsIG4sIGJhc2UpO1xyXG4gICAgICAgICAgICAgICAgcHJvZEwgPSBwcm9kLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgcHJvZHVjdCBhbmQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgLy8gSWYgcHJvZHVjdCA+IHJlbWFpbmRlciB0aGVuIHRyaWFsIGRpZ2l0IG4gdG9vIGhpZ2guXHJcbiAgICAgICAgICAgICAgICAvLyBuIGlzIDEgdG9vIGhpZ2ggYWJvdXQgNSUgb2YgdGhlIHRpbWUsIGFuZCBpcyBub3Qga25vd24gdG8gaGF2ZVxyXG4gICAgICAgICAgICAgICAgLy8gZXZlciBiZWVuIG1vcmUgdGhhbiAxIHRvbyBoaWdoLlxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGNvbXBhcmUocHJvZCwgcmVtLCBwcm9kTCwgcmVtTCkgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICBuLS07XHJcblxyXG4gICAgICAgICAgICAgICAgICAvLyBTdWJ0cmFjdCBkaXZpc29yIGZyb20gcHJvZHVjdC5cclxuICAgICAgICAgICAgICAgICAgc3VidHJhY3QocHJvZCwgeUwgPCBwcm9kTCA/IHl6IDogeWMsIHByb2RMLCBiYXNlKTtcclxuICAgICAgICAgICAgICAgICAgcHJvZEwgPSBwcm9kLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgY21wID0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG4gaXMgMCBvciAxLCBjbXAgaXMgLTEuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBuIGlzIDAsIHRoZXJlIGlzIG5vIG5lZWQgdG8gY29tcGFyZSB5YyBhbmQgcmVtIGFnYWluIGJlbG93LFxyXG4gICAgICAgICAgICAgICAgLy8gc28gY2hhbmdlIGNtcCB0byAxIHRvIGF2b2lkIGl0LlxyXG4gICAgICAgICAgICAgICAgLy8gSWYgbiBpcyAxLCBsZWF2ZSBjbXAgYXMgLTEsIHNvIHljIGFuZCByZW0gYXJlIGNvbXBhcmVkIGFnYWluLlxyXG4gICAgICAgICAgICAgICAgaWYgKG4gPT0gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gZGl2aXNvciA8IHJlbWFpbmRlciwgc28gbiBtdXN0IGJlIGF0IGxlYXN0IDEuXHJcbiAgICAgICAgICAgICAgICAgIGNtcCA9IG4gPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHByb2R1Y3QgPSBkaXZpc29yXHJcbiAgICAgICAgICAgICAgICBwcm9kID0geWMuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgIHByb2RMID0gcHJvZC5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAocHJvZEwgPCByZW1MKSBwcm9kID0gWzBdLmNvbmNhdChwcm9kKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gU3VidHJhY3QgcHJvZHVjdCBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICBzdWJ0cmFjdChyZW0sIHByb2QsIHJlbUwsIGJhc2UpO1xyXG4gICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgLy8gSWYgcHJvZHVjdCB3YXMgPCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgaWYgKGNtcCA9PSAtMSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgZGl2aXNvciBhbmQgbmV3IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIC8vIElmIGRpdmlzb3IgPCBuZXcgcmVtYWluZGVyLCBzdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgLy8gVHJpYWwgZGlnaXQgbiB0b28gbG93LlxyXG4gICAgICAgICAgICAgICAgLy8gbiBpcyAxIHRvbyBsb3cgYWJvdXQgNSUgb2YgdGhlIHRpbWUsIGFuZCB2ZXJ5IHJhcmVseSAyIHRvbyBsb3cuXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoY29tcGFyZSh5YywgcmVtLCB5TCwgcmVtTCkgPCAxKSB7XHJcbiAgICAgICAgICAgICAgICAgIG4rKztcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIFN1YnRyYWN0IGRpdmlzb3IgZnJvbSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgIHN1YnRyYWN0KHJlbSwgeUwgPCByZW1MID8geXogOiB5YywgcmVtTCwgYmFzZSk7XHJcbiAgICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjbXAgPT09IDApIHtcclxuICAgICAgICAgICAgICBuKys7XHJcbiAgICAgICAgICAgICAgcmVtID0gWzBdO1xyXG4gICAgICAgICAgICB9IC8vIGVsc2UgY21wID09PSAxIGFuZCBuIHdpbGwgYmUgMFxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRoZSBuZXh0IGRpZ2l0LCBuLCB0byB0aGUgcmVzdWx0IGFycmF5LlxyXG4gICAgICAgICAgICBxY1tpKytdID0gbjtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBpZiAocmVtWzBdKSB7XHJcbiAgICAgICAgICAgICAgcmVtW3JlbUwrK10gPSB4Y1t4aV0gfHwgMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICByZW0gPSBbeGNbeGldXTtcclxuICAgICAgICAgICAgICByZW1MID0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSB3aGlsZSAoKHhpKysgPCB4TCB8fCByZW1bMF0gIT0gbnVsbCkgJiYgcy0tKTtcclxuXHJcbiAgICAgICAgICBtb3JlID0gcmVtWzBdICE9IG51bGw7XHJcblxyXG4gICAgICAgICAgLy8gTGVhZGluZyB6ZXJvP1xyXG4gICAgICAgICAgaWYgKCFxY1swXSkgcWMuc3BsaWNlKDAsIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGJhc2UgPT0gQkFTRSkge1xyXG5cclxuICAgICAgICAgIC8vIFRvIGNhbGN1bGF0ZSBxLmUsIGZpcnN0IGdldCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiBxY1swXS5cclxuICAgICAgICAgIGZvciAoaSA9IDEsIHMgPSBxY1swXTsgcyA+PSAxMDsgcyAvPSAxMCwgaSsrKTtcclxuXHJcbiAgICAgICAgICByb3VuZChxLCBkcCArIChxLmUgPSBpICsgZSAqIExPR19CQVNFIC0gMSkgKyAxLCBybSwgbW9yZSk7XHJcblxyXG4gICAgICAgIC8vIENhbGxlciBpcyBjb252ZXJ0QmFzZS5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcS5lID0gZTtcclxuICAgICAgICAgIHEuciA9ICttb3JlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHE7XHJcbiAgICAgIH07XHJcbiAgICB9KSgpO1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyIG4gaW4gZml4ZWQtcG9pbnQgb3IgZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHJvdW5kZWQgdG8gdGhlIHNwZWNpZmllZCBkZWNpbWFsIHBsYWNlcyBvciBzaWduaWZpY2FudCBkaWdpdHMuXHJcbiAgICAgKlxyXG4gICAgICogbjogYSBCaWdOdW1iZXIuXHJcbiAgICAgKiBpOiB0aGUgaW5kZXggb2YgdGhlIGxhc3QgZGlnaXQgcmVxdWlyZWQgKGkuZS4gdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXApLlxyXG4gICAgICogcm06IHRoZSByb3VuZGluZyBtb2RlLlxyXG4gICAgICogaWQ6IDEgKHRvRXhwb25lbnRpYWwpIG9yIDIgKHRvUHJlY2lzaW9uKS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZm9ybWF0KG4sIGksIHJtLCBpZCkge1xyXG4gICAgICB2YXIgYzAsIGUsIG5lLCBsZW4sIHN0cjtcclxuXHJcbiAgICAgIGlmIChybSA9PSBudWxsKSBybSA9IFJPVU5ESU5HX01PREU7XHJcbiAgICAgIGVsc2UgaW50Q2hlY2socm0sIDAsIDgpO1xyXG5cclxuICAgICAgaWYgKCFuLmMpIHJldHVybiBuLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICBjMCA9IG4uY1swXTtcclxuICAgICAgbmUgPSBuLmU7XHJcblxyXG4gICAgICBpZiAoaSA9PSBudWxsKSB7XHJcbiAgICAgICAgc3RyID0gY29lZmZUb1N0cmluZyhuLmMpO1xyXG4gICAgICAgIHN0ciA9IGlkID09IDEgfHwgaWQgPT0gMiAmJiAobmUgPD0gVE9fRVhQX05FRyB8fCBuZSA+PSBUT19FWFBfUE9TKVxyXG4gICAgICAgICA/IHRvRXhwb25lbnRpYWwoc3RyLCBuZSlcclxuICAgICAgICAgOiB0b0ZpeGVkUG9pbnQoc3RyLCBuZSwgJzAnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuID0gcm91bmQobmV3IEJpZ051bWJlcihuKSwgaSwgcm0pO1xyXG5cclxuICAgICAgICAvLyBuLmUgbWF5IGhhdmUgY2hhbmdlZCBpZiB0aGUgdmFsdWUgd2FzIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgZSA9IG4uZTtcclxuXHJcbiAgICAgICAgc3RyID0gY29lZmZUb1N0cmluZyhuLmMpO1xyXG4gICAgICAgIGxlbiA9IHN0ci5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIHRvUHJlY2lzaW9uIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBkaWdpdHNcclxuICAgICAgICAvLyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXJcclxuICAgICAgICAvLyBwYXJ0IG9mIHRoZSB2YWx1ZSBpbiBmaXhlZC1wb2ludCBub3RhdGlvbi5cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgaWYgKGlkID09IDEgfHwgaWQgPT0gMiAmJiAoaSA8PSBlIHx8IGUgPD0gVE9fRVhQX05FRykpIHtcclxuXHJcbiAgICAgICAgICAvLyBBcHBlbmQgemVyb3M/XHJcbiAgICAgICAgICBmb3IgKDsgbGVuIDwgaTsgc3RyICs9ICcwJywgbGVuKyspO1xyXG4gICAgICAgICAgc3RyID0gdG9FeHBvbmVudGlhbChzdHIsIGUpO1xyXG5cclxuICAgICAgICAvLyBGaXhlZC1wb2ludCBub3RhdGlvbi5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaSAtPSBuZTtcclxuICAgICAgICAgIHN0ciA9IHRvRml4ZWRQb2ludChzdHIsIGUsICcwJyk7XHJcblxyXG4gICAgICAgICAgLy8gQXBwZW5kIHplcm9zP1xyXG4gICAgICAgICAgaWYgKGUgKyAxID4gbGVuKSB7XHJcbiAgICAgICAgICAgIGlmICgtLWkgPiAwKSBmb3IgKHN0ciArPSAnLic7IGktLTsgc3RyICs9ICcwJyk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpICs9IGUgLSBsZW47XHJcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xyXG4gICAgICAgICAgICAgIGlmIChlICsgMSA9PSBsZW4pIHN0ciArPSAnLic7XHJcbiAgICAgICAgICAgICAgZm9yICg7IGktLTsgc3RyICs9ICcwJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBuLnMgPCAwICYmIGMwID8gJy0nICsgc3RyIDogc3RyO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBIYW5kbGUgQmlnTnVtYmVyLm1heCBhbmQgQmlnTnVtYmVyLm1pbi5cclxuICAgIGZ1bmN0aW9uIG1heE9yTWluKGFyZ3MsIG1ldGhvZCkge1xyXG4gICAgICB2YXIgbixcclxuICAgICAgICBpID0gMSxcclxuICAgICAgICBtID0gbmV3IEJpZ051bWJlcihhcmdzWzBdKTtcclxuXHJcbiAgICAgIGZvciAoOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG4gPSBuZXcgQmlnTnVtYmVyKGFyZ3NbaV0pO1xyXG5cclxuICAgICAgICAvLyBJZiBhbnkgbnVtYmVyIGlzIE5hTiwgcmV0dXJuIE5hTi5cclxuICAgICAgICBpZiAoIW4ucykge1xyXG4gICAgICAgICAgbSA9IG47XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZC5jYWxsKG0sIG4pKSB7XHJcbiAgICAgICAgICBtID0gbjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBtO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogU3RyaXAgdHJhaWxpbmcgemVyb3MsIGNhbGN1bGF0ZSBiYXNlIDEwIGV4cG9uZW50IGFuZCBjaGVjayBhZ2FpbnN0IE1JTl9FWFAgYW5kIE1BWF9FWFAuXHJcbiAgICAgKiBDYWxsZWQgYnkgbWludXMsIHBsdXMgYW5kIHRpbWVzLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBub3JtYWxpc2UobiwgYywgZSkge1xyXG4gICAgICB2YXIgaSA9IDEsXHJcbiAgICAgICAgaiA9IGMubGVuZ3RoO1xyXG5cclxuICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgZm9yICg7ICFjWy0tal07IGMucG9wKCkpO1xyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBiYXNlIDEwIGV4cG9uZW50LiBGaXJzdCBnZXQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2YgY1swXS5cclxuICAgICAgZm9yIChqID0gY1swXTsgaiA+PSAxMDsgaiAvPSAxMCwgaSsrKTtcclxuXHJcbiAgICAgIC8vIE92ZXJmbG93P1xyXG4gICAgICBpZiAoKGUgPSBpICsgZSAqIExPR19CQVNFIC0gMSkgPiBNQVhfRVhQKSB7XHJcblxyXG4gICAgICAgIC8vIEluZmluaXR5LlxyXG4gICAgICAgIG4uYyA9IG4uZSA9IG51bGw7XHJcblxyXG4gICAgICAvLyBVbmRlcmZsb3c/XHJcbiAgICAgIH0gZWxzZSBpZiAoZSA8IE1JTl9FWFApIHtcclxuXHJcbiAgICAgICAgLy8gWmVyby5cclxuICAgICAgICBuLmMgPSBbbi5lID0gMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbi5lID0gZTtcclxuICAgICAgICBuLmMgPSBjO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gbjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gSGFuZGxlIHZhbHVlcyB0aGF0IGZhaWwgdGhlIHZhbGlkaXR5IHRlc3QgaW4gQmlnTnVtYmVyLlxyXG4gICAgcGFyc2VOdW1lcmljID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIGJhc2VQcmVmaXggPSAvXigtPykwKFt4Ym9dKSg/PVxcd1tcXHcuXSokKS9pLFxyXG4gICAgICAgIGRvdEFmdGVyID0gL14oW14uXSspXFwuJC8sXHJcbiAgICAgICAgZG90QmVmb3JlID0gL15cXC4oW14uXSspJC8sXHJcbiAgICAgICAgaXNJbmZpbml0eU9yTmFOID0gL14tPyhJbmZpbml0eXxOYU4pJC8sXHJcbiAgICAgICAgd2hpdGVzcGFjZU9yUGx1cyA9IC9eXFxzKlxcKyg/PVtcXHcuXSl8Xlxccyt8XFxzKyQvZztcclxuXHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoeCwgc3RyLCBpc051bSwgYikge1xyXG4gICAgICAgIHZhciBiYXNlLFxyXG4gICAgICAgICAgcyA9IGlzTnVtID8gc3RyIDogc3RyLnJlcGxhY2Uod2hpdGVzcGFjZU9yUGx1cywgJycpO1xyXG5cclxuICAgICAgICAvLyBObyBleGNlcHRpb24gb24gwrFJbmZpbml0eSBvciBOYU4uXHJcbiAgICAgICAgaWYgKGlzSW5maW5pdHlPck5hTi50ZXN0KHMpKSB7XHJcbiAgICAgICAgICB4LnMgPSBpc05hTihzKSA/IG51bGwgOiBzIDwgMCA/IC0xIDogMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKCFpc051bSkge1xyXG5cclxuICAgICAgICAgICAgLy8gYmFzZVByZWZpeCA9IC9eKC0/KTAoW3hib10pKD89XFx3W1xcdy5dKiQpL2lcclxuICAgICAgICAgICAgcyA9IHMucmVwbGFjZShiYXNlUHJlZml4LCBmdW5jdGlvbiAobSwgcDEsIHAyKSB7XHJcbiAgICAgICAgICAgICAgYmFzZSA9IChwMiA9IHAyLnRvTG93ZXJDYXNlKCkpID09ICd4JyA/IDE2IDogcDIgPT0gJ2InID8gMiA6IDg7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICFiIHx8IGIgPT0gYmFzZSA/IHAxIDogbTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICAgIGJhc2UgPSBiO1xyXG5cclxuICAgICAgICAgICAgICAvLyBFLmcuICcxLicgdG8gJzEnLCAnLjEnIHRvICcwLjEnXHJcbiAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShkb3RBZnRlciwgJyQxJykucmVwbGFjZShkb3RCZWZvcmUsICcwLiQxJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChzdHIgIT0gcykgcmV0dXJuIG5ldyBCaWdOdW1iZXIocywgYmFzZSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIE5vdCBhIG51bWJlcjoge259J1xyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIE5vdCBhIGJhc2Uge2J9IG51bWJlcjoge259J1xyXG4gICAgICAgICAgaWYgKEJpZ051bWJlci5ERUJVRykge1xyXG4gICAgICAgICAgICB0aHJvdyBFcnJvclxyXG4gICAgICAgICAgICAgIChiaWdudW1iZXJFcnJvciArICdOb3QgYScgKyAoYiA/ICcgYmFzZSAnICsgYiA6ICcnKSArICcgbnVtYmVyOiAnICsgc3RyKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBOYU5cclxuICAgICAgICAgIHgucyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB4LmMgPSB4LmUgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9KSgpO1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUm91bmQgeCB0byBzZCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS4gQ2hlY2sgZm9yIG92ZXIvdW5kZXItZmxvdy5cclxuICAgICAqIElmIHIgaXMgdHJ1dGh5LCBpdCBpcyBrbm93biB0aGF0IHRoZXJlIGFyZSBtb3JlIGRpZ2l0cyBhZnRlciB0aGUgcm91bmRpbmcgZGlnaXQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJvdW5kKHgsIHNkLCBybSwgcikge1xyXG4gICAgICB2YXIgZCwgaSwgaiwgaywgbiwgbmksIHJkLFxyXG4gICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgIHBvd3MxMCA9IFBPV1NfVEVOO1xyXG5cclxuICAgICAgLy8gaWYgeCBpcyBub3QgSW5maW5pdHkgb3IgTmFOLi4uXHJcbiAgICAgIGlmICh4Yykge1xyXG5cclxuICAgICAgICAvLyByZCBpcyB0aGUgcm91bmRpbmcgZGlnaXQsIGkuZS4gdGhlIGRpZ2l0IGFmdGVyIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgIC8vIG4gaXMgYSBiYXNlIDFlMTQgbnVtYmVyLCB0aGUgdmFsdWUgb2YgdGhlIGVsZW1lbnQgb2YgYXJyYXkgeC5jIGNvbnRhaW5pbmcgcmQuXHJcbiAgICAgICAgLy8gbmkgaXMgdGhlIGluZGV4IG9mIG4gd2l0aGluIHguYy5cclxuICAgICAgICAvLyBkIGlzIHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIG4uXHJcbiAgICAgICAgLy8gaSBpcyB0aGUgaW5kZXggb2YgcmQgd2l0aGluIG4gaW5jbHVkaW5nIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgICAgLy8gaiBpcyB0aGUgYWN0dWFsIGluZGV4IG9mIHJkIHdpdGhpbiBuIChpZiA8IDAsIHJkIGlzIGEgbGVhZGluZyB6ZXJvKS5cclxuICAgICAgICBvdXQ6IHtcclxuXHJcbiAgICAgICAgICAvLyBHZXQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2YgdGhlIGZpcnN0IGVsZW1lbnQgb2YgeGMuXHJcbiAgICAgICAgICBmb3IgKGQgPSAxLCBrID0geGNbMF07IGsgPj0gMTA7IGsgLz0gMTAsIGQrKyk7XHJcbiAgICAgICAgICBpID0gc2QgLSBkO1xyXG5cclxuICAgICAgICAgIC8vIElmIHRoZSByb3VuZGluZyBkaWdpdCBpcyBpbiB0aGUgZmlyc3QgZWxlbWVudCBvZiB4Yy4uLlxyXG4gICAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICAgIGkgKz0gTE9HX0JBU0U7XHJcbiAgICAgICAgICAgIGogPSBzZDtcclxuICAgICAgICAgICAgbiA9IHhjW25pID0gMF07XHJcblxyXG4gICAgICAgICAgICAvLyBHZXQgdGhlIHJvdW5kaW5nIGRpZ2l0IGF0IGluZGV4IGogb2Ygbi5cclxuICAgICAgICAgICAgcmQgPSBuIC8gcG93czEwW2QgLSBqIC0gMV0gJSAxMCB8IDA7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuaSA9IG1hdGhjZWlsKChpICsgMSkgLyBMT0dfQkFTRSk7XHJcblxyXG4gICAgICAgICAgICBpZiAobmkgPj0geGMubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICAgIGlmIChyKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTmVlZGVkIGJ5IHNxcnQuXHJcbiAgICAgICAgICAgICAgICBmb3IgKDsgeGMubGVuZ3RoIDw9IG5pOyB4Yy5wdXNoKDApKTtcclxuICAgICAgICAgICAgICAgIG4gPSByZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBkID0gMTtcclxuICAgICAgICAgICAgICAgIGkgJT0gTE9HX0JBU0U7XHJcbiAgICAgICAgICAgICAgICBqID0gaSAtIExPR19CQVNFICsgMTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYnJlYWsgb3V0O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBuID0gayA9IHhjW25pXTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gR2V0IHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIG4uXHJcbiAgICAgICAgICAgICAgZm9yIChkID0gMTsgayA+PSAxMDsgayAvPSAxMCwgZCsrKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gR2V0IHRoZSBpbmRleCBvZiByZCB3aXRoaW4gbi5cclxuICAgICAgICAgICAgICBpICU9IExPR19CQVNFO1xyXG5cclxuICAgICAgICAgICAgICAvLyBHZXQgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiBuLCBhZGp1c3RlZCBmb3IgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIGxlYWRpbmcgemVyb3Mgb2YgbiBpcyBnaXZlbiBieSBMT0dfQkFTRSAtIGQuXHJcbiAgICAgICAgICAgICAgaiA9IGkgLSBMT0dfQkFTRSArIGQ7XHJcblxyXG4gICAgICAgICAgICAgIC8vIEdldCB0aGUgcm91bmRpbmcgZGlnaXQgYXQgaW5kZXggaiBvZiBuLlxyXG4gICAgICAgICAgICAgIHJkID0gaiA8IDAgPyAwIDogbiAvIHBvd3MxMFtkIC0gaiAtIDFdICUgMTAgfCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgciA9IHIgfHwgc2QgPCAwIHx8XHJcblxyXG4gICAgICAgICAgLy8gQXJlIHRoZXJlIGFueSBub24temVybyBkaWdpdHMgYWZ0ZXIgdGhlIHJvdW5kaW5nIGRpZ2l0P1xyXG4gICAgICAgICAgLy8gVGhlIGV4cHJlc3Npb24gIG4gJSBwb3dzMTBbZCAtIGogLSAxXSAgcmV0dXJucyBhbGwgZGlnaXRzIG9mIG4gdG8gdGhlIHJpZ2h0XHJcbiAgICAgICAgICAvLyBvZiB0aGUgZGlnaXQgYXQgaiwgZS5nLiBpZiBuIGlzIDkwODcxNCBhbmQgaiBpcyAyLCB0aGUgZXhwcmVzc2lvbiBnaXZlcyA3MTQuXHJcbiAgICAgICAgICAgeGNbbmkgKyAxXSAhPSBudWxsIHx8IChqIDwgMCA/IG4gOiBuICUgcG93czEwW2QgLSBqIC0gMV0pO1xyXG5cclxuICAgICAgICAgIHIgPSBybSA8IDRcclxuICAgICAgICAgICA/IChyZCB8fCByKSAmJiAocm0gPT0gMCB8fCBybSA9PSAoeC5zIDwgMCA/IDMgOiAyKSlcclxuICAgICAgICAgICA6IHJkID4gNSB8fCByZCA9PSA1ICYmIChybSA9PSA0IHx8IHIgfHwgcm0gPT0gNiAmJlxyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgZGlnaXQgdG8gdGhlIGxlZnQgb2YgdGhlIHJvdW5kaW5nIGRpZ2l0IGlzIG9kZC5cclxuICAgICAgICAgICAgKChpID4gMCA/IGogPiAwID8gbiAvIHBvd3MxMFtkIC0gal0gOiAwIDogeGNbbmkgLSAxXSkgJSAxMCkgJiAxIHx8XHJcbiAgICAgICAgICAgICBybSA9PSAoeC5zIDwgMCA/IDggOiA3KSk7XHJcblxyXG4gICAgICAgICAgaWYgKHNkIDwgMSB8fCAheGNbMF0pIHtcclxuICAgICAgICAgICAgeGMubGVuZ3RoID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChyKSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIENvbnZlcnQgc2QgdG8gZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICAgICAgc2QgLT0geC5lICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gMSwgMC4xLCAwLjAxLCAwLjAwMSwgMC4wMDAxIGV0Yy5cclxuICAgICAgICAgICAgICB4Y1swXSA9IHBvd3MxMFsoTE9HX0JBU0UgLSBzZCAlIExPR19CQVNFKSAlIExPR19CQVNFXTtcclxuICAgICAgICAgICAgICB4LmUgPSAtc2QgfHwgMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgICB4Y1swXSA9IHguZSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB4O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFJlbW92ZSBleGNlc3MgZGlnaXRzLlxyXG4gICAgICAgICAgaWYgKGkgPT0gMCkge1xyXG4gICAgICAgICAgICB4Yy5sZW5ndGggPSBuaTtcclxuICAgICAgICAgICAgayA9IDE7XHJcbiAgICAgICAgICAgIG5pLS07XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB4Yy5sZW5ndGggPSBuaSArIDE7XHJcbiAgICAgICAgICAgIGsgPSBwb3dzMTBbTE9HX0JBU0UgLSBpXTtcclxuXHJcbiAgICAgICAgICAgIC8vIEUuZy4gNTY3MDAgYmVjb21lcyA1NjAwMCBpZiA3IGlzIHRoZSByb3VuZGluZyBkaWdpdC5cclxuICAgICAgICAgICAgLy8gaiA+IDAgbWVhbnMgaSA+IG51bWJlciBvZiBsZWFkaW5nIHplcm9zIG9mIG4uXHJcbiAgICAgICAgICAgIHhjW25pXSA9IGogPiAwID8gbWF0aGZsb29yKG4gLyBwb3dzMTBbZCAtIGpdICUgcG93czEwW2pdKSAqIGsgOiAwO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFJvdW5kIHVwP1xyXG4gICAgICAgICAgaWYgKHIpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoOyA7KSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIElmIHRoZSBkaWdpdCB0byBiZSByb3VuZGVkIHVwIGlzIGluIHRoZSBmaXJzdCBlbGVtZW50IG9mIHhjLi4uXHJcbiAgICAgICAgICAgICAgaWYgKG5pID09IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBpIHdpbGwgYmUgdGhlIGxlbmd0aCBvZiB4Y1swXSBiZWZvcmUgayBpcyBhZGRlZC5cclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDEsIGogPSB4Y1swXTsgaiA+PSAxMDsgaiAvPSAxMCwgaSsrKTtcclxuICAgICAgICAgICAgICAgIGogPSB4Y1swXSArPSBrO1xyXG4gICAgICAgICAgICAgICAgZm9yIChrID0gMTsgaiA+PSAxMDsgaiAvPSAxMCwgaysrKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBpZiBpICE9IGsgdGhlIGxlbmd0aCBoYXMgaW5jcmVhc2VkLlxyXG4gICAgICAgICAgICAgICAgaWYgKGkgIT0gaykge1xyXG4gICAgICAgICAgICAgICAgICB4LmUrKztcclxuICAgICAgICAgICAgICAgICAgaWYgKHhjWzBdID09IEJBU0UpIHhjWzBdID0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgeGNbbmldICs9IGs7XHJcbiAgICAgICAgICAgICAgICBpZiAoeGNbbmldICE9IEJBU0UpIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgeGNbbmktLV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgayA9IDE7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgZm9yIChpID0geGMubGVuZ3RoOyB4Y1stLWldID09PSAwOyB4Yy5wb3AoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBPdmVyZmxvdz8gSW5maW5pdHkuXHJcbiAgICAgICAgaWYgKHguZSA+IE1BWF9FWFApIHtcclxuICAgICAgICAgIHguYyA9IHguZSA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIFVuZGVyZmxvdz8gWmVyby5cclxuICAgICAgICB9IGVsc2UgaWYgKHguZSA8IE1JTl9FWFApIHtcclxuICAgICAgICAgIHguYyA9IFt4LmUgPSAwXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiB2YWx1ZU9mKG4pIHtcclxuICAgICAgdmFyIHN0cixcclxuICAgICAgICBlID0gbi5lO1xyXG5cclxuICAgICAgaWYgKGUgPT09IG51bGwpIHJldHVybiBuLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICBzdHIgPSBjb2VmZlRvU3RyaW5nKG4uYyk7XHJcblxyXG4gICAgICBzdHIgPSBlIDw9IFRPX0VYUF9ORUcgfHwgZSA+PSBUT19FWFBfUE9TXHJcbiAgICAgICAgPyB0b0V4cG9uZW50aWFsKHN0ciwgZSlcclxuICAgICAgICA6IHRvRml4ZWRQb2ludChzdHIsIGUsICcwJyk7XHJcblxyXG4gICAgICByZXR1cm4gbi5zIDwgMCA/ICctJyArIHN0ciA6IHN0cjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUFJPVE9UWVBFL0lOU1RBTkNFIE1FVEhPRFNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyLlxyXG4gICAgICovXHJcbiAgICBQLmFic29sdXRlVmFsdWUgPSBQLmFicyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHggPSBuZXcgQmlnTnVtYmVyKHRoaXMpO1xyXG4gICAgICBpZiAoeC5zIDwgMCkgeC5zID0gMTtcclxuICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuXHJcbiAgICAgKiAgIDEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyKHksIGIpLFxyXG4gICAgICogICAtMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXIoeSwgYiksXHJcbiAgICAgKiAgIDAgaWYgdGhleSBoYXZlIHRoZSBzYW1lIHZhbHVlLFxyXG4gICAgICogICBvciBudWxsIGlmIHRoZSB2YWx1ZSBvZiBlaXRoZXIgaXMgTmFOLlxyXG4gICAgICovXHJcbiAgICBQLmNvbXBhcmVkVG8gPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICByZXR1cm4gY29tcGFyZSh0aGlzLCBuZXcgQmlnTnVtYmVyKHksIGIpKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBkcCBpcyB1bmRlZmluZWQgb3IgbnVsbCBvciB0cnVlIG9yIGZhbHNlLCByZXR1cm4gdGhlIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBvZiB0aGVcclxuICAgICAqIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyLCBvciBudWxsIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyDCsUluZmluaXR5IG9yIE5hTi5cclxuICAgICAqXHJcbiAgICAgKiBPdGhlcndpc2UsIGlmIGRwIGlzIGEgbnVtYmVyLCByZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzXHJcbiAgICAgKiBCaWdOdW1iZXIgcm91bmRlZCB0byBhIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybSwgb3JcclxuICAgICAqIFJPVU5ESU5HX01PREUgaWYgcm0gaXMgb21pdHRlZC5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzOiBpbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgKlxyXG4gICAgICogJ1tCaWdOdW1iZXIgRXJyb3JdIEFyZ3VtZW50IHtub3QgYSBwcmltaXRpdmUgbnVtYmVyfG5vdCBhbiBpbnRlZ2VyfG91dCBvZiByYW5nZX06IHtkcHxybX0nXHJcbiAgICAgKi9cclxuICAgIFAuZGVjaW1hbFBsYWNlcyA9IFAuZHAgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICAgIHZhciBjLCBuLCB2LFxyXG4gICAgICAgIHggPSB0aGlzO1xyXG5cclxuICAgICAgaWYgKGRwICE9IG51bGwpIHtcclxuICAgICAgICBpbnRDaGVjayhkcCwgMCwgTUFYKTtcclxuICAgICAgICBpZiAocm0gPT0gbnVsbCkgcm0gPSBST1VORElOR19NT0RFO1xyXG4gICAgICAgIGVsc2UgaW50Q2hlY2socm0sIDAsIDgpO1xyXG5cclxuICAgICAgICByZXR1cm4gcm91bmQobmV3IEJpZ051bWJlcih4KSwgZHAgKyB4LmUgKyAxLCBybSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghKGMgPSB4LmMpKSByZXR1cm4gbnVsbDtcclxuICAgICAgbiA9ICgodiA9IGMubGVuZ3RoIC0gMSkgLSBiaXRGbG9vcih0aGlzLmUgLyBMT0dfQkFTRSkpICogTE9HX0JBU0U7XHJcblxyXG4gICAgICAvLyBTdWJ0cmFjdCB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIHplcm9zIG9mIHRoZSBsYXN0IG51bWJlci5cclxuICAgICAgaWYgKHYgPSBjW3ZdKSBmb3IgKDsgdiAlIDEwID09IDA7IHYgLz0gMTAsIG4tLSk7XHJcbiAgICAgIGlmIChuIDwgMCkgbiA9IDA7XHJcblxyXG4gICAgICByZXR1cm4gbjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiAgbiAvIDAgPSBJXHJcbiAgICAgKiAgbiAvIE4gPSBOXHJcbiAgICAgKiAgbiAvIEkgPSAwXHJcbiAgICAgKiAgMCAvIG4gPSAwXHJcbiAgICAgKiAgMCAvIDAgPSBOXHJcbiAgICAgKiAgMCAvIE4gPSBOXHJcbiAgICAgKiAgMCAvIEkgPSAwXHJcbiAgICAgKiAgTiAvIG4gPSBOXHJcbiAgICAgKiAgTiAvIDAgPSBOXHJcbiAgICAgKiAgTiAvIE4gPSBOXHJcbiAgICAgKiAgTiAvIEkgPSBOXHJcbiAgICAgKiAgSSAvIG4gPSBJXHJcbiAgICAgKiAgSSAvIDAgPSBJXHJcbiAgICAgKiAgSSAvIE4gPSBOXHJcbiAgICAgKiAgSSAvIEkgPSBOXHJcbiAgICAgKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgZGl2aWRlZCBieSB0aGUgdmFsdWUgb2ZcclxuICAgICAqIEJpZ051bWJlcih5LCBiKSwgcm91bmRlZCBhY2NvcmRpbmcgdG8gREVDSU1BTF9QTEFDRVMgYW5kIFJPVU5ESU5HX01PREUuXHJcbiAgICAgKi9cclxuICAgIFAuZGl2aWRlZEJ5ID0gUC5kaXYgPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICByZXR1cm4gZGl2KHRoaXMsIG5ldyBCaWdOdW1iZXIoeSwgYiksIERFQ0lNQUxfUExBQ0VTLCBST1VORElOR19NT0RFKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSBpbnRlZ2VyIHBhcnQgb2YgZGl2aWRpbmcgdGhlIHZhbHVlIG9mIHRoaXNcclxuICAgICAqIEJpZ051bWJlciBieSB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyKHksIGIpLlxyXG4gICAgICovXHJcbiAgICBQLmRpdmlkZWRUb0ludGVnZXJCeSA9IFAuaWRpdiA9IGZ1bmN0aW9uICh5LCBiKSB7XHJcbiAgICAgIHJldHVybiBkaXYodGhpcywgbmV3IEJpZ051bWJlcih5LCBiKSwgMCwgMSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBleHBvbmVudGlhdGVkIGJ5IG4uXHJcbiAgICAgKlxyXG4gICAgICogSWYgbSBpcyBwcmVzZW50LCByZXR1cm4gdGhlIHJlc3VsdCBtb2R1bG8gbS5cclxuICAgICAqIElmIG4gaXMgbmVnYXRpdmUgcm91bmQgYWNjb3JkaW5nIHRvIERFQ0lNQUxfUExBQ0VTIGFuZCBST1VORElOR19NT0RFLlxyXG4gICAgICogSWYgUE9XX1BSRUNJU0lPTiBpcyBub24temVybyBhbmQgbSBpcyBub3QgcHJlc2VudCwgcm91bmQgdG8gUE9XX1BSRUNJU0lPTiB1c2luZyBST1VORElOR19NT0RFLlxyXG4gICAgICpcclxuICAgICAqIFRoZSBtb2R1bGFyIHBvd2VyIG9wZXJhdGlvbiB3b3JrcyBlZmZpY2llbnRseSB3aGVuIHgsIG4sIGFuZCBtIGFyZSBpbnRlZ2Vycywgb3RoZXJ3aXNlIGl0XHJcbiAgICAgKiBpcyBlcXVpdmFsZW50IHRvIGNhbGN1bGF0aW5nIHguZXhwb25lbnRpYXRlZEJ5KG4pLm1vZHVsbyhtKSB3aXRoIGEgUE9XX1BSRUNJU0lPTiBvZiAwLlxyXG4gICAgICpcclxuICAgICAqIG4ge251bWJlcnxzdHJpbmd8QmlnTnVtYmVyfSBUaGUgZXhwb25lbnQuIEFuIGludGVnZXIuXHJcbiAgICAgKiBbbV0ge251bWJlcnxzdHJpbmd8QmlnTnVtYmVyfSBUaGUgbW9kdWx1cy5cclxuICAgICAqXHJcbiAgICAgKiAnW0JpZ051bWJlciBFcnJvcl0gRXhwb25lbnQgbm90IGFuIGludGVnZXI6IHtufSdcclxuICAgICAqL1xyXG4gICAgUC5leHBvbmVudGlhdGVkQnkgPSBQLnBvdyA9IGZ1bmN0aW9uIChuLCBtKSB7XHJcbiAgICAgIHZhciBoYWxmLCBpc01vZEV4cCwgaSwgaywgbW9yZSwgbklzQmlnLCBuSXNOZWcsIG5Jc09kZCwgeSxcclxuICAgICAgICB4ID0gdGhpcztcclxuXHJcbiAgICAgIG4gPSBuZXcgQmlnTnVtYmVyKG4pO1xyXG5cclxuICAgICAgLy8gQWxsb3cgTmFOIGFuZCDCsUluZmluaXR5LCBidXQgbm90IG90aGVyIG5vbi1pbnRlZ2Vycy5cclxuICAgICAgaWYgKG4uYyAmJiAhbi5pc0ludGVnZXIoKSkge1xyXG4gICAgICAgIHRocm93IEVycm9yXHJcbiAgICAgICAgICAoYmlnbnVtYmVyRXJyb3IgKyAnRXhwb25lbnQgbm90IGFuIGludGVnZXI6ICcgKyB2YWx1ZU9mKG4pKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG0gIT0gbnVsbCkgbSA9IG5ldyBCaWdOdW1iZXIobSk7XHJcblxyXG4gICAgICAvLyBFeHBvbmVudCBvZiBNQVhfU0FGRV9JTlRFR0VSIGlzIDE1LlxyXG4gICAgICBuSXNCaWcgPSBuLmUgPiAxNDtcclxuXHJcbiAgICAgIC8vIElmIHggaXMgTmFOLCDCsUluZmluaXR5LCDCsTAgb3IgwrExLCBvciBuIGlzIMKxSW5maW5pdHksIE5hTiBvciDCsTAuXHJcbiAgICAgIGlmICgheC5jIHx8ICF4LmNbMF0gfHwgeC5jWzBdID09IDEgJiYgIXguZSAmJiB4LmMubGVuZ3RoID09IDEgfHwgIW4uYyB8fCAhbi5jWzBdKSB7XHJcblxyXG4gICAgICAgIC8vIFRoZSBzaWduIG9mIHRoZSByZXN1bHQgb2YgcG93IHdoZW4geCBpcyBuZWdhdGl2ZSBkZXBlbmRzIG9uIHRoZSBldmVubmVzcyBvZiBuLlxyXG4gICAgICAgIC8vIElmICtuIG92ZXJmbG93cyB0byDCsUluZmluaXR5LCB0aGUgZXZlbm5lc3Mgb2YgbiB3b3VsZCBiZSBub3QgYmUga25vd24uXHJcbiAgICAgICAgeSA9IG5ldyBCaWdOdW1iZXIoTWF0aC5wb3coK3ZhbHVlT2YoeCksIG5Jc0JpZyA/IDIgLSBpc09kZChuKSA6ICt2YWx1ZU9mKG4pKSk7XHJcbiAgICAgICAgcmV0dXJuIG0gPyB5Lm1vZChtKSA6IHk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5Jc05lZyA9IG4ucyA8IDA7XHJcblxyXG4gICAgICBpZiAobSkge1xyXG5cclxuICAgICAgICAvLyB4ICUgbSByZXR1cm5zIE5hTiBpZiBhYnMobSkgaXMgemVybywgb3IgbSBpcyBOYU4uXHJcbiAgICAgICAgaWYgKG0uYyA/ICFtLmNbMF0gOiAhbS5zKSByZXR1cm4gbmV3IEJpZ051bWJlcihOYU4pO1xyXG5cclxuICAgICAgICBpc01vZEV4cCA9ICFuSXNOZWcgJiYgeC5pc0ludGVnZXIoKSAmJiBtLmlzSW50ZWdlcigpO1xyXG5cclxuICAgICAgICBpZiAoaXNNb2RFeHApIHggPSB4Lm1vZChtKTtcclxuXHJcbiAgICAgIC8vIE92ZXJmbG93IHRvIMKxSW5maW5pdHk6ID49MioqMWUxMCBvciA+PTEuMDAwMDAyNCoqMWUxNS5cclxuICAgICAgLy8gVW5kZXJmbG93IHRvIMKxMDogPD0wLjc5KioxZTEwIG9yIDw9MC45OTk5OTc1KioxZTE1LlxyXG4gICAgICB9IGVsc2UgaWYgKG4uZSA+IDkgJiYgKHguZSA+IDAgfHwgeC5lIDwgLTEgfHwgKHguZSA9PSAwXHJcbiAgICAgICAgLy8gWzEsIDI0MDAwMDAwMF1cclxuICAgICAgICA/IHguY1swXSA+IDEgfHwgbklzQmlnICYmIHguY1sxXSA+PSAyNGU3XHJcbiAgICAgICAgLy8gWzgwMDAwMDAwMDAwMDAwXSAgWzk5OTk5NzUwMDAwMDAwXVxyXG4gICAgICAgIDogeC5jWzBdIDwgOGUxMyB8fCBuSXNCaWcgJiYgeC5jWzBdIDw9IDk5OTk5NzVlNykpKSB7XHJcblxyXG4gICAgICAgIC8vIElmIHggaXMgbmVnYXRpdmUgYW5kIG4gaXMgb2RkLCBrID0gLTAsIGVsc2UgayA9IDAuXHJcbiAgICAgICAgayA9IHgucyA8IDAgJiYgaXNPZGQobikgPyAtMCA6IDA7XHJcblxyXG4gICAgICAgIC8vIElmIHggPj0gMSwgayA9IMKxSW5maW5pdHkuXHJcbiAgICAgICAgaWYgKHguZSA+IC0xKSBrID0gMSAvIGs7XHJcblxyXG4gICAgICAgIC8vIElmIG4gaXMgbmVnYXRpdmUgcmV0dXJuIMKxMCwgZWxzZSByZXR1cm4gwrFJbmZpbml0eS5cclxuICAgICAgICByZXR1cm4gbmV3IEJpZ051bWJlcihuSXNOZWcgPyAxIC8gayA6IGspO1xyXG5cclxuICAgICAgfSBlbHNlIGlmIChQT1dfUFJFQ0lTSU9OKSB7XHJcblxyXG4gICAgICAgIC8vIFRydW5jYXRpbmcgZWFjaCBjb2VmZmljaWVudCBhcnJheSB0byBhIGxlbmd0aCBvZiBrIGFmdGVyIGVhY2ggbXVsdGlwbGljYXRpb25cclxuICAgICAgICAvLyBlcXVhdGVzIHRvIHRydW5jYXRpbmcgc2lnbmlmaWNhbnQgZGlnaXRzIHRvIFBPV19QUkVDSVNJT04gKyBbMjgsIDQxXSxcclxuICAgICAgICAvLyBpLmUuIHRoZXJlIHdpbGwgYmUgYSBtaW5pbXVtIG9mIDI4IGd1YXJkIGRpZ2l0cyByZXRhaW5lZC5cclxuICAgICAgICBrID0gbWF0aGNlaWwoUE9XX1BSRUNJU0lPTiAvIExPR19CQVNFICsgMik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChuSXNCaWcpIHtcclxuICAgICAgICBoYWxmID0gbmV3IEJpZ051bWJlcigwLjUpO1xyXG4gICAgICAgIGlmIChuSXNOZWcpIG4ucyA9IDE7XHJcbiAgICAgICAgbklzT2RkID0gaXNPZGQobik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaSA9IE1hdGguYWJzKCt2YWx1ZU9mKG4pKTtcclxuICAgICAgICBuSXNPZGQgPSBpICUgMjtcclxuICAgICAgfVxyXG5cclxuICAgICAgeSA9IG5ldyBCaWdOdW1iZXIoT05FKTtcclxuXHJcbiAgICAgIC8vIFBlcmZvcm1zIDU0IGxvb3AgaXRlcmF0aW9ucyBmb3IgbiBvZiA5MDA3MTk5MjU0NzQwOTkxLlxyXG4gICAgICBmb3IgKDsgOykge1xyXG5cclxuICAgICAgICBpZiAobklzT2RkKSB7XHJcbiAgICAgICAgICB5ID0geS50aW1lcyh4KTtcclxuICAgICAgICAgIGlmICgheS5jKSBicmVhaztcclxuXHJcbiAgICAgICAgICBpZiAoaykge1xyXG4gICAgICAgICAgICBpZiAoeS5jLmxlbmd0aCA+IGspIHkuYy5sZW5ndGggPSBrO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChpc01vZEV4cCkge1xyXG4gICAgICAgICAgICB5ID0geS5tb2QobSk7ICAgIC8veSA9IHkubWludXMoZGl2KHksIG0sIDAsIE1PRFVMT19NT0RFKS50aW1lcyhtKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSkge1xyXG4gICAgICAgICAgaSA9IG1hdGhmbG9vcihpIC8gMik7XHJcbiAgICAgICAgICBpZiAoaSA9PT0gMCkgYnJlYWs7XHJcbiAgICAgICAgICBuSXNPZGQgPSBpICUgMjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbiA9IG4udGltZXMoaGFsZik7XHJcbiAgICAgICAgICByb3VuZChuLCBuLmUgKyAxLCAxKTtcclxuXHJcbiAgICAgICAgICBpZiAobi5lID4gMTQpIHtcclxuICAgICAgICAgICAgbklzT2RkID0gaXNPZGQobik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpID0gK3ZhbHVlT2Yobik7XHJcbiAgICAgICAgICAgIGlmIChpID09PSAwKSBicmVhaztcclxuICAgICAgICAgICAgbklzT2RkID0gaSAlIDI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB4ID0geC50aW1lcyh4KTtcclxuXHJcbiAgICAgICAgaWYgKGspIHtcclxuICAgICAgICAgIGlmICh4LmMgJiYgeC5jLmxlbmd0aCA+IGspIHguYy5sZW5ndGggPSBrO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNNb2RFeHApIHtcclxuICAgICAgICAgIHggPSB4Lm1vZChtKTsgICAgLy94ID0geC5taW51cyhkaXYoeCwgbSwgMCwgTU9EVUxPX01PREUpLnRpbWVzKG0pKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpc01vZEV4cCkgcmV0dXJuIHk7XHJcbiAgICAgIGlmIChuSXNOZWcpIHkgPSBPTkUuZGl2KHkpO1xyXG5cclxuICAgICAgcmV0dXJuIG0gPyB5Lm1vZChtKSA6IGsgPyByb3VuZCh5LCBQT1dfUFJFQ0lTSU9OLCBST1VORElOR19NT0RFLCBtb3JlKSA6IHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcm91bmRlZCB0byBhbiBpbnRlZ2VyXHJcbiAgICAgKiB1c2luZyByb3VuZGluZyBtb2RlIHJtLCBvciBST1VORElOR19NT0RFIGlmIHJtIGlzIG9taXR0ZWQuXHJcbiAgICAgKlxyXG4gICAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICpcclxuICAgICAqICdbQmlnTnVtYmVyIEVycm9yXSBBcmd1bWVudCB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7cm19J1xyXG4gICAgICovXHJcbiAgICBQLmludGVnZXJWYWx1ZSA9IGZ1bmN0aW9uIChybSkge1xyXG4gICAgICB2YXIgbiA9IG5ldyBCaWdOdW1iZXIodGhpcyk7XHJcbiAgICAgIGlmIChybSA9PSBudWxsKSBybSA9IFJPVU5ESU5HX01PREU7XHJcbiAgICAgIGVsc2UgaW50Q2hlY2socm0sIDAsIDgpO1xyXG4gICAgICByZXR1cm4gcm91bmQobiwgbi5lICsgMSwgcm0pO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBlcXVhbCB0byB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyKHksIGIpLFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc0VxdWFsVG8gPSBQLmVxID0gZnVuY3Rpb24gKHksIGIpIHtcclxuICAgICAgcmV0dXJuIGNvbXBhcmUodGhpcywgbmV3IEJpZ051bWJlcih5LCBiKSkgPT09IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGEgZmluaXRlIG51bWJlciwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc0Zpbml0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuICEhdGhpcy5jO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZ051bWJlcih5LCBiKSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuaXNHcmVhdGVyVGhhbiA9IFAuZ3QgPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICByZXR1cm4gY29tcGFyZSh0aGlzLCBuZXcgQmlnTnVtYmVyKHksIGIpKSA+IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGUgdmFsdWUgb2ZcclxuICAgICAqIEJpZ051bWJlcih5LCBiKSwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc0dyZWF0ZXJUaGFuT3JFcXVhbFRvID0gUC5ndGUgPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICByZXR1cm4gKGIgPSBjb21wYXJlKHRoaXMsIG5ldyBCaWdOdW1iZXIoeSwgYikpKSA9PT0gMSB8fCBiID09PSAwO1xyXG5cclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgYW4gaW50ZWdlciwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc0ludGVnZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiAhIXRoaXMuYyAmJiBiaXRGbG9vcih0aGlzLmUgLyBMT0dfQkFTRSkgPiB0aGlzLmMubGVuZ3RoIC0gMjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXIoeSwgYiksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmlzTGVzc1RoYW4gPSBQLmx0ID0gZnVuY3Rpb24gKHksIGIpIHtcclxuICAgICAgcmV0dXJuIGNvbXBhcmUodGhpcywgbmV3IEJpZ051bWJlcih5LCBiKSkgPCAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlIG9mXHJcbiAgICAgKiBCaWdOdW1iZXIoeSwgYiksIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuaXNMZXNzVGhhbk9yRXF1YWxUbyA9IFAubHRlID0gZnVuY3Rpb24gKHksIGIpIHtcclxuICAgICAgcmV0dXJuIChiID0gY29tcGFyZSh0aGlzLCBuZXcgQmlnTnVtYmVyKHksIGIpKSkgPT09IC0xIHx8IGIgPT09IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIE5hTiwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc05hTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuICF0aGlzLnM7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIG5lZ2F0aXZlLCBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmlzTmVnYXRpdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnMgPCAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBwb3NpdGl2ZSwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc1Bvc2l0aXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zID4gMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgMCBvciAtMCwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc1plcm8gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiAhIXRoaXMuYyAmJiB0aGlzLmNbMF0gPT0gMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiAgbiAtIDAgPSBuXHJcbiAgICAgKiAgbiAtIE4gPSBOXHJcbiAgICAgKiAgbiAtIEkgPSAtSVxyXG4gICAgICogIDAgLSBuID0gLW5cclxuICAgICAqICAwIC0gMCA9IDBcclxuICAgICAqICAwIC0gTiA9IE5cclxuICAgICAqICAwIC0gSSA9IC1JXHJcbiAgICAgKiAgTiAtIG4gPSBOXHJcbiAgICAgKiAgTiAtIDAgPSBOXHJcbiAgICAgKiAgTiAtIE4gPSBOXHJcbiAgICAgKiAgTiAtIEkgPSBOXHJcbiAgICAgKiAgSSAtIG4gPSBJXHJcbiAgICAgKiAgSSAtIDAgPSBJXHJcbiAgICAgKiAgSSAtIE4gPSBOXHJcbiAgICAgKiAgSSAtIEkgPSBOXHJcbiAgICAgKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgbWludXMgdGhlIHZhbHVlIG9mXHJcbiAgICAgKiBCaWdOdW1iZXIoeSwgYikuXHJcbiAgICAgKi9cclxuICAgIFAubWludXMgPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICB2YXIgaSwgaiwgdCwgeExUeSxcclxuICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICBhID0geC5zO1xyXG5cclxuICAgICAgeSA9IG5ldyBCaWdOdW1iZXIoeSwgYik7XHJcbiAgICAgIGIgPSB5LnM7XHJcblxyXG4gICAgICAvLyBFaXRoZXIgTmFOP1xyXG4gICAgICBpZiAoIWEgfHwgIWIpIHJldHVybiBuZXcgQmlnTnVtYmVyKE5hTik7XHJcblxyXG4gICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICByZXR1cm4geC5wbHVzKHkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgeGUgPSB4LmUgLyBMT0dfQkFTRSxcclxuICAgICAgICB5ZSA9IHkuZSAvIExPR19CQVNFLFxyXG4gICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgaWYgKCF4ZSB8fCAheWUpIHtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIEluZmluaXR5P1xyXG4gICAgICAgIGlmICgheGMgfHwgIXljKSByZXR1cm4geGMgPyAoeS5zID0gLWIsIHkpIDogbmV3IEJpZ051bWJlcih5YyA/IHggOiBOYU4pO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgIC8vIFJldHVybiB5IGlmIHkgaXMgbm9uLXplcm8sIHggaWYgeCBpcyBub24temVybywgb3IgemVybyBpZiBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgcmV0dXJuIHljWzBdID8gKHkucyA9IC1iLCB5KSA6IG5ldyBCaWdOdW1iZXIoeGNbMF0gPyB4IDpcclxuXHJcbiAgICAgICAgICAgLy8gSUVFRSA3NTQgKDIwMDgpIDYuMzogbiAtIG4gPSAtMCB3aGVuIHJvdW5kaW5nIHRvIC1JbmZpbml0eVxyXG4gICAgICAgICAgIFJPVU5ESU5HX01PREUgPT0gMyA/IC0wIDogMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB4ZSA9IGJpdEZsb29yKHhlKTtcclxuICAgICAgeWUgPSBiaXRGbG9vcih5ZSk7XHJcbiAgICAgIHhjID0geGMuc2xpY2UoKTtcclxuXHJcbiAgICAgIC8vIERldGVybWluZSB3aGljaCBpcyB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgaWYgKGEgPSB4ZSAtIHllKSB7XHJcblxyXG4gICAgICAgIGlmICh4TFR5ID0gYSA8IDApIHtcclxuICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHQucmV2ZXJzZSgpO1xyXG5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICBmb3IgKGIgPSBhOyBiLS07IHQucHVzaCgwKSk7XHJcbiAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50cyBlcXVhbC4gQ2hlY2sgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgaiA9ICh4TFR5ID0gKGEgPSB4Yy5sZW5ndGgpIDwgKGIgPSB5Yy5sZW5ndGgpKSA/IGEgOiBiO1xyXG5cclxuICAgICAgICBmb3IgKGEgPSBiID0gMDsgYiA8IGo7IGIrKykge1xyXG5cclxuICAgICAgICAgIGlmICh4Y1tiXSAhPSB5Y1tiXSkge1xyXG4gICAgICAgICAgICB4TFR5ID0geGNbYl0gPCB5Y1tiXTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB4IDwgeT8gUG9pbnQgeGMgdG8gdGhlIGFycmF5IG9mIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICBpZiAoeExUeSkgdCA9IHhjLCB4YyA9IHljLCB5YyA9IHQsIHkucyA9IC15LnM7XHJcblxyXG4gICAgICBiID0gKGogPSB5Yy5sZW5ndGgpIC0gKGkgPSB4Yy5sZW5ndGgpO1xyXG5cclxuICAgICAgLy8gQXBwZW5kIHplcm9zIHRvIHhjIGlmIHNob3J0ZXIuXHJcbiAgICAgIC8vIE5vIG5lZWQgdG8gYWRkIHplcm9zIHRvIHljIGlmIHNob3J0ZXIgYXMgc3VidHJhY3Qgb25seSBuZWVkcyB0byBzdGFydCBhdCB5Yy5sZW5ndGguXHJcbiAgICAgIGlmIChiID4gMCkgZm9yICg7IGItLTsgeGNbaSsrXSA9IDApO1xyXG4gICAgICBiID0gQkFTRSAtIDE7XHJcblxyXG4gICAgICAvLyBTdWJ0cmFjdCB5YyBmcm9tIHhjLlxyXG4gICAgICBmb3IgKDsgaiA+IGE7KSB7XHJcblxyXG4gICAgICAgIGlmICh4Y1stLWpdIDwgeWNbal0pIHtcclxuICAgICAgICAgIGZvciAoaSA9IGo7IGkgJiYgIXhjWy0taV07IHhjW2ldID0gYik7XHJcbiAgICAgICAgICAtLXhjW2ldO1xyXG4gICAgICAgICAgeGNbal0gKz0gQkFTRTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHhjW2pdIC09IHljW2pdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICBmb3IgKDsgeGNbMF0gPT0gMDsgeGMuc3BsaWNlKDAsIDEpLCAtLXllKTtcclxuXHJcbiAgICAgIC8vIFplcm8/XHJcbiAgICAgIGlmICgheGNbMF0pIHtcclxuXHJcbiAgICAgICAgLy8gRm9sbG93aW5nIElFRUUgNzU0ICgyMDA4KSA2LjMsXHJcbiAgICAgICAgLy8gbiAtIG4gPSArMCAgYnV0ICBuIC0gbiA9IC0wICB3aGVuIHJvdW5kaW5nIHRvd2FyZHMgLUluZmluaXR5LlxyXG4gICAgICAgIHkucyA9IFJPVU5ESU5HX01PREUgPT0gMyA/IC0xIDogMTtcclxuICAgICAgICB5LmMgPSBbeS5lID0gMF07XHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIEluZmluaXR5IGFzICt4IC0gK3kgIT0gSW5maW5pdHkgJiYgLXggLSAteSAhPSBJbmZpbml0eVxyXG4gICAgICAvLyBmb3IgZmluaXRlIHggYW5kIHkuXHJcbiAgICAgIHJldHVybiBub3JtYWxpc2UoeSwgeGMsIHllKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiAgIG4gJSAwID0gIE5cclxuICAgICAqICAgbiAlIE4gPSAgTlxyXG4gICAgICogICBuICUgSSA9ICBuXHJcbiAgICAgKiAgIDAgJSBuID0gIDBcclxuICAgICAqICAtMCAlIG4gPSAtMFxyXG4gICAgICogICAwICUgMCA9ICBOXHJcbiAgICAgKiAgIDAgJSBOID0gIE5cclxuICAgICAqICAgMCAlIEkgPSAgMFxyXG4gICAgICogICBOICUgbiA9ICBOXHJcbiAgICAgKiAgIE4gJSAwID0gIE5cclxuICAgICAqICAgTiAlIE4gPSAgTlxyXG4gICAgICogICBOICUgSSA9ICBOXHJcbiAgICAgKiAgIEkgJSBuID0gIE5cclxuICAgICAqICAgSSAlIDAgPSAgTlxyXG4gICAgICogICBJICUgTiA9ICBOXHJcbiAgICAgKiAgIEkgJSBJID0gIE5cclxuICAgICAqXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBtb2R1bG8gdGhlIHZhbHVlIG9mXHJcbiAgICAgKiBCaWdOdW1iZXIoeSwgYikuIFRoZSByZXN1bHQgZGVwZW5kcyBvbiB0aGUgdmFsdWUgb2YgTU9EVUxPX01PREUuXHJcbiAgICAgKi9cclxuICAgIFAubW9kdWxvID0gUC5tb2QgPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICB2YXIgcSwgcyxcclxuICAgICAgICB4ID0gdGhpcztcclxuXHJcbiAgICAgIHkgPSBuZXcgQmlnTnVtYmVyKHksIGIpO1xyXG5cclxuICAgICAgLy8gUmV0dXJuIE5hTiBpZiB4IGlzIEluZmluaXR5IG9yIE5hTiwgb3IgeSBpcyBOYU4gb3IgemVyby5cclxuICAgICAgaWYgKCF4LmMgfHwgIXkucyB8fCB5LmMgJiYgIXkuY1swXSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgQmlnTnVtYmVyKE5hTik7XHJcblxyXG4gICAgICAvLyBSZXR1cm4geCBpZiB5IGlzIEluZmluaXR5IG9yIHggaXMgemVyby5cclxuICAgICAgfSBlbHNlIGlmICgheS5jIHx8IHguYyAmJiAheC5jWzBdKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCaWdOdW1iZXIoeCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChNT0RVTE9fTU9ERSA9PSA5KSB7XHJcblxyXG4gICAgICAgIC8vIEV1Y2xpZGlhbiBkaXZpc2lvbjogcSA9IHNpZ24oeSkgKiBmbG9vcih4IC8gYWJzKHkpKVxyXG4gICAgICAgIC8vIHIgPSB4IC0gcXkgICAgd2hlcmUgIDAgPD0gciA8IGFicyh5KVxyXG4gICAgICAgIHMgPSB5LnM7XHJcbiAgICAgICAgeS5zID0gMTtcclxuICAgICAgICBxID0gZGl2KHgsIHksIDAsIDMpO1xyXG4gICAgICAgIHkucyA9IHM7XHJcbiAgICAgICAgcS5zICo9IHM7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcSA9IGRpdih4LCB5LCAwLCBNT0RVTE9fTU9ERSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHkgPSB4Lm1pbnVzKHEudGltZXMoeSkpO1xyXG5cclxuICAgICAgLy8gVG8gbWF0Y2ggSmF2YVNjcmlwdCAlLCBlbnN1cmUgc2lnbiBvZiB6ZXJvIGlzIHNpZ24gb2YgZGl2aWRlbmQuXHJcbiAgICAgIGlmICgheS5jWzBdICYmIE1PRFVMT19NT0RFID09IDEpIHkucyA9IHgucztcclxuXHJcbiAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqICBuICogMCA9IDBcclxuICAgICAqICBuICogTiA9IE5cclxuICAgICAqICBuICogSSA9IElcclxuICAgICAqICAwICogbiA9IDBcclxuICAgICAqICAwICogMCA9IDBcclxuICAgICAqICAwICogTiA9IE5cclxuICAgICAqICAwICogSSA9IE5cclxuICAgICAqICBOICogbiA9IE5cclxuICAgICAqICBOICogMCA9IE5cclxuICAgICAqICBOICogTiA9IE5cclxuICAgICAqICBOICogSSA9IE5cclxuICAgICAqICBJICogbiA9IElcclxuICAgICAqICBJICogMCA9IE5cclxuICAgICAqICBJICogTiA9IE5cclxuICAgICAqICBJICogSSA9IElcclxuICAgICAqXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBtdWx0aXBsaWVkIGJ5IHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnTnVtYmVyKHksIGIpLlxyXG4gICAgICovXHJcbiAgICBQLm11bHRpcGxpZWRCeSA9IFAudGltZXMgPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICB2YXIgYywgZSwgaSwgaiwgaywgbSwgeGNMLCB4bG8sIHhoaSwgeWNMLCB5bG8sIHloaSwgemMsXHJcbiAgICAgICAgYmFzZSwgc3FydEJhc2UsXHJcbiAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgeWMgPSAoeSA9IG5ldyBCaWdOdW1iZXIoeSwgYikpLmM7XHJcblxyXG4gICAgICAvLyBFaXRoZXIgTmFOLCDCsUluZmluaXR5IG9yIMKxMD9cclxuICAgICAgaWYgKCF4YyB8fCAheWMgfHwgIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gTmFOIGlmIGVpdGhlciBpcyBOYU4sIG9yIG9uZSBpcyAwIGFuZCB0aGUgb3RoZXIgaXMgSW5maW5pdHkuXHJcbiAgICAgICAgaWYgKCF4LnMgfHwgIXkucyB8fCB4YyAmJiAheGNbMF0gJiYgIXljIHx8IHljICYmICF5Y1swXSAmJiAheGMpIHtcclxuICAgICAgICAgIHkuYyA9IHkuZSA9IHkucyA9IG51bGw7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHkucyAqPSB4LnM7XHJcblxyXG4gICAgICAgICAgLy8gUmV0dXJuIMKxSW5maW5pdHkgaWYgZWl0aGVyIGlzIMKxSW5maW5pdHkuXHJcbiAgICAgICAgICBpZiAoIXhjIHx8ICF5Yykge1xyXG4gICAgICAgICAgICB5LmMgPSB5LmUgPSBudWxsO1xyXG5cclxuICAgICAgICAgIC8vIFJldHVybiDCsTAgaWYgZWl0aGVyIGlzIMKxMC5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHkuYyA9IFswXTtcclxuICAgICAgICAgICAgeS5lID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBlID0gYml0Rmxvb3IoeC5lIC8gTE9HX0JBU0UpICsgYml0Rmxvb3IoeS5lIC8gTE9HX0JBU0UpO1xyXG4gICAgICB5LnMgKj0geC5zO1xyXG4gICAgICB4Y0wgPSB4Yy5sZW5ndGg7XHJcbiAgICAgIHljTCA9IHljLmxlbmd0aDtcclxuXHJcbiAgICAgIC8vIEVuc3VyZSB4YyBwb2ludHMgdG8gbG9uZ2VyIGFycmF5IGFuZCB4Y0wgdG8gaXRzIGxlbmd0aC5cclxuICAgICAgaWYgKHhjTCA8IHljTCkgemMgPSB4YywgeGMgPSB5YywgeWMgPSB6YywgaSA9IHhjTCwgeGNMID0geWNMLCB5Y0wgPSBpO1xyXG5cclxuICAgICAgLy8gSW5pdGlhbGlzZSB0aGUgcmVzdWx0IGFycmF5IHdpdGggemVyb3MuXHJcbiAgICAgIGZvciAoaSA9IHhjTCArIHljTCwgemMgPSBbXTsgaS0tOyB6Yy5wdXNoKDApKTtcclxuXHJcbiAgICAgIGJhc2UgPSBCQVNFO1xyXG4gICAgICBzcXJ0QmFzZSA9IFNRUlRfQkFTRTtcclxuXHJcbiAgICAgIGZvciAoaSA9IHljTDsgLS1pID49IDA7KSB7XHJcbiAgICAgICAgYyA9IDA7XHJcbiAgICAgICAgeWxvID0geWNbaV0gJSBzcXJ0QmFzZTtcclxuICAgICAgICB5aGkgPSB5Y1tpXSAvIHNxcnRCYXNlIHwgMDtcclxuXHJcbiAgICAgICAgZm9yIChrID0geGNMLCBqID0gaSArIGs7IGogPiBpOykge1xyXG4gICAgICAgICAgeGxvID0geGNbLS1rXSAlIHNxcnRCYXNlO1xyXG4gICAgICAgICAgeGhpID0geGNba10gLyBzcXJ0QmFzZSB8IDA7XHJcbiAgICAgICAgICBtID0geWhpICogeGxvICsgeGhpICogeWxvO1xyXG4gICAgICAgICAgeGxvID0geWxvICogeGxvICsgKChtICUgc3FydEJhc2UpICogc3FydEJhc2UpICsgemNbal0gKyBjO1xyXG4gICAgICAgICAgYyA9ICh4bG8gLyBiYXNlIHwgMCkgKyAobSAvIHNxcnRCYXNlIHwgMCkgKyB5aGkgKiB4aGk7XHJcbiAgICAgICAgICB6Y1tqLS1dID0geGxvICUgYmFzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHpjW2pdID0gYztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGMpIHtcclxuICAgICAgICArK2U7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgemMuc3BsaWNlKDAsIDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gbm9ybWFsaXNlKHksIHpjLCBlKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBuZWdhdGVkLFxyXG4gICAgICogaS5lLiBtdWx0aXBsaWVkIGJ5IC0xLlxyXG4gICAgICovXHJcbiAgICBQLm5lZ2F0ZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciB4ID0gbmV3IEJpZ051bWJlcih0aGlzKTtcclxuICAgICAgeC5zID0gLXgucyB8fCBudWxsO1xyXG4gICAgICByZXR1cm4geDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiAgbiArIDAgPSBuXHJcbiAgICAgKiAgbiArIE4gPSBOXHJcbiAgICAgKiAgbiArIEkgPSBJXHJcbiAgICAgKiAgMCArIG4gPSBuXHJcbiAgICAgKiAgMCArIDAgPSAwXHJcbiAgICAgKiAgMCArIE4gPSBOXHJcbiAgICAgKiAgMCArIEkgPSBJXHJcbiAgICAgKiAgTiArIG4gPSBOXHJcbiAgICAgKiAgTiArIDAgPSBOXHJcbiAgICAgKiAgTiArIE4gPSBOXHJcbiAgICAgKiAgTiArIEkgPSBOXHJcbiAgICAgKiAgSSArIG4gPSBJXHJcbiAgICAgKiAgSSArIDAgPSBJXHJcbiAgICAgKiAgSSArIE4gPSBOXHJcbiAgICAgKiAgSSArIEkgPSBJXHJcbiAgICAgKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcGx1cyB0aGUgdmFsdWUgb2ZcclxuICAgICAqIEJpZ051bWJlcih5LCBiKS5cclxuICAgICAqL1xyXG4gICAgUC5wbHVzID0gZnVuY3Rpb24gKHksIGIpIHtcclxuICAgICAgdmFyIHQsXHJcbiAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgYSA9IHgucztcclxuXHJcbiAgICAgIHkgPSBuZXcgQmlnTnVtYmVyKHksIGIpO1xyXG4gICAgICBiID0geS5zO1xyXG5cclxuICAgICAgLy8gRWl0aGVyIE5hTj9cclxuICAgICAgaWYgKCFhIHx8ICFiKSByZXR1cm4gbmV3IEJpZ051bWJlcihOYU4pO1xyXG5cclxuICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgaWYgKGEgIT0gYikge1xyXG4gICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgeGUgPSB4LmUgLyBMT0dfQkFTRSxcclxuICAgICAgICB5ZSA9IHkuZSAvIExPR19CQVNFLFxyXG4gICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgaWYgKCF4ZSB8fCAheWUpIHtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIMKxSW5maW5pdHkgaWYgZWl0aGVyIMKxSW5maW5pdHkuXHJcbiAgICAgICAgaWYgKCF4YyB8fCAheWMpIHJldHVybiBuZXcgQmlnTnVtYmVyKGEgLyAwKTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgLy8gUmV0dXJuIHkgaWYgeSBpcyBub24temVybywgeCBpZiB4IGlzIG5vbi16ZXJvLCBvciB6ZXJvIGlmIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHJldHVybiB5Y1swXSA/IHkgOiBuZXcgQmlnTnVtYmVyKHhjWzBdID8geCA6IGEgKiAwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgeGUgPSBiaXRGbG9vcih4ZSk7XHJcbiAgICAgIHllID0gYml0Rmxvb3IoeWUpO1xyXG4gICAgICB4YyA9IHhjLnNsaWNlKCk7XHJcblxyXG4gICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy4gRmFzdGVyIHRvIHVzZSByZXZlcnNlIHRoZW4gZG8gdW5zaGlmdHMuXHJcbiAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG4gICAgICAgIGlmIChhID4gMCkge1xyXG4gICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgZm9yICg7IGEtLTsgdC5wdXNoKDApKTtcclxuICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgYSA9IHhjLmxlbmd0aDtcclxuICAgICAgYiA9IHljLmxlbmd0aDtcclxuXHJcbiAgICAgIC8vIFBvaW50IHhjIHRvIHRoZSBsb25nZXIgYXJyYXksIGFuZCBiIHRvIHRoZSBzaG9ydGVyIGxlbmd0aC5cclxuICAgICAgaWYgKGEgLSBiIDwgMCkgdCA9IHljLCB5YyA9IHhjLCB4YyA9IHQsIGIgPSBhO1xyXG5cclxuICAgICAgLy8gT25seSBzdGFydCBhZGRpbmcgYXQgeWMubGVuZ3RoIC0gMSBhcyB0aGUgZnVydGhlciBkaWdpdHMgb2YgeGMgY2FuIGJlIGlnbm9yZWQuXHJcbiAgICAgIGZvciAoYSA9IDA7IGI7KSB7XHJcbiAgICAgICAgYSA9ICh4Y1stLWJdID0geGNbYl0gKyB5Y1tiXSArIGEpIC8gQkFTRSB8IDA7XHJcbiAgICAgICAgeGNbYl0gPSBCQVNFID09PSB4Y1tiXSA/IDAgOiB4Y1tiXSAlIEJBU0U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhKSB7XHJcbiAgICAgICAgeGMgPSBbYV0uY29uY2F0KHhjKTtcclxuICAgICAgICArK3llO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBObyBuZWVkIHRvIGNoZWNrIGZvciB6ZXJvLCBhcyAreCArICt5ICE9IDAgJiYgLXggKyAteSAhPSAwXHJcbiAgICAgIC8vIHllID0gTUFYX0VYUCArIDEgcG9zc2libGVcclxuICAgICAgcmV0dXJuIG5vcm1hbGlzZSh5LCB4YywgeWUpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIElmIHNkIGlzIHVuZGVmaW5lZCBvciBudWxsIG9yIHRydWUgb3IgZmFsc2UsIHJldHVybiB0aGUgbnVtYmVyIG9mIHNpZ25pZmljYW50IGRpZ2l0cyBvZlxyXG4gICAgICogdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyLCBvciBudWxsIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyDCsUluZmluaXR5IG9yIE5hTi5cclxuICAgICAqIElmIHNkIGlzIHRydWUgaW5jbHVkZSBpbnRlZ2VyLXBhcnQgdHJhaWxpbmcgemVyb3MgaW4gdGhlIGNvdW50LlxyXG4gICAgICpcclxuICAgICAqIE90aGVyd2lzZSwgaWYgc2QgaXMgYSBudW1iZXIsIHJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXNcclxuICAgICAqIEJpZ051bWJlciByb3VuZGVkIHRvIGEgbWF4aW11bSBvZiBzZCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBybSwgb3JcclxuICAgICAqIFJPVU5ESU5HX01PREUgaWYgcm0gaXMgb21pdHRlZC5cclxuICAgICAqXHJcbiAgICAgKiBzZCB7bnVtYmVyfGJvb2xlYW59IG51bWJlcjogc2lnbmlmaWNhbnQgZGlnaXRzOiBpbnRlZ2VyLCAxIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgIGJvb2xlYW46IHdoZXRoZXIgdG8gY291bnQgaW50ZWdlci1wYXJ0IHRyYWlsaW5nIHplcm9zOiB0cnVlIG9yIGZhbHNlLlxyXG4gICAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICpcclxuICAgICAqICdbQmlnTnVtYmVyIEVycm9yXSBBcmd1bWVudCB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7c2R8cm19J1xyXG4gICAgICovXHJcbiAgICBQLnByZWNpc2lvbiA9IFAuc2QgPSBmdW5jdGlvbiAoc2QsIHJtKSB7XHJcbiAgICAgIHZhciBjLCBuLCB2LFxyXG4gICAgICAgIHggPSB0aGlzO1xyXG5cclxuICAgICAgaWYgKHNkICE9IG51bGwgJiYgc2QgIT09ICEhc2QpIHtcclxuICAgICAgICBpbnRDaGVjayhzZCwgMSwgTUFYKTtcclxuICAgICAgICBpZiAocm0gPT0gbnVsbCkgcm0gPSBST1VORElOR19NT0RFO1xyXG4gICAgICAgIGVsc2UgaW50Q2hlY2socm0sIDAsIDgpO1xyXG5cclxuICAgICAgICByZXR1cm4gcm91bmQobmV3IEJpZ051bWJlcih4KSwgc2QsIHJtKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCEoYyA9IHguYykpIHJldHVybiBudWxsO1xyXG4gICAgICB2ID0gYy5sZW5ndGggLSAxO1xyXG4gICAgICBuID0gdiAqIExPR19CQVNFICsgMTtcclxuXHJcbiAgICAgIGlmICh2ID0gY1t2XSkge1xyXG5cclxuICAgICAgICAvLyBTdWJ0cmFjdCB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIHplcm9zIG9mIHRoZSBsYXN0IGVsZW1lbnQuXHJcbiAgICAgICAgZm9yICg7IHYgJSAxMCA9PSAwOyB2IC89IDEwLCBuLS0pO1xyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2YgdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgICAgZm9yICh2ID0gY1swXTsgdiA+PSAxMDsgdiAvPSAxMCwgbisrKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNkICYmIHguZSArIDEgPiBuKSBuID0geC5lICsgMTtcclxuXHJcbiAgICAgIHJldHVybiBuO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIHNoaWZ0ZWQgYnkgayBwbGFjZXNcclxuICAgICAqIChwb3dlcnMgb2YgMTApLiBTaGlmdCB0byB0aGUgcmlnaHQgaWYgbiA+IDAsIGFuZCB0byB0aGUgbGVmdCBpZiBuIDwgMC5cclxuICAgICAqXHJcbiAgICAgKiBrIHtudW1iZXJ9IEludGVnZXIsIC1NQVhfU0FGRV9JTlRFR0VSIHRvIE1BWF9TQUZFX0lOVEVHRVIgaW5jbHVzaXZlLlxyXG4gICAgICpcclxuICAgICAqICdbQmlnTnVtYmVyIEVycm9yXSBBcmd1bWVudCB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7a30nXHJcbiAgICAgKi9cclxuICAgIFAuc2hpZnRlZEJ5ID0gZnVuY3Rpb24gKGspIHtcclxuICAgICAgaW50Q2hlY2soaywgLU1BWF9TQUZFX0lOVEVHRVIsIE1BWF9TQUZFX0lOVEVHRVIpO1xyXG4gICAgICByZXR1cm4gdGhpcy50aW1lcygnMWUnICsgayk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogIHNxcnQoLW4pID0gIE5cclxuICAgICAqICBzcXJ0KE4pID0gIE5cclxuICAgICAqICBzcXJ0KC1JKSA9ICBOXHJcbiAgICAgKiAgc3FydChJKSA9ICBJXHJcbiAgICAgKiAgc3FydCgwKSA9ICAwXHJcbiAgICAgKiAgc3FydCgtMCkgPSAtMFxyXG4gICAgICpcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlcixcclxuICAgICAqIHJvdW5kZWQgYWNjb3JkaW5nIHRvIERFQ0lNQUxfUExBQ0VTIGFuZCBST1VORElOR19NT0RFLlxyXG4gICAgICovXHJcbiAgICBQLnNxdWFyZVJvb3QgPSBQLnNxcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBtLCBuLCByLCByZXAsIHQsXHJcbiAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgYyA9IHguYyxcclxuICAgICAgICBzID0geC5zLFxyXG4gICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgZHAgPSBERUNJTUFMX1BMQUNFUyArIDQsXHJcbiAgICAgICAgaGFsZiA9IG5ldyBCaWdOdW1iZXIoJzAuNScpO1xyXG5cclxuICAgICAgLy8gTmVnYXRpdmUvTmFOL0luZmluaXR5L3plcm8/XHJcbiAgICAgIGlmIChzICE9PSAxIHx8ICFjIHx8ICFjWzBdKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCaWdOdW1iZXIoIXMgfHwgcyA8IDAgJiYgKCFjIHx8IGNbMF0pID8gTmFOIDogYyA/IHggOiAxIC8gMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEluaXRpYWwgZXN0aW1hdGUuXHJcbiAgICAgIHMgPSBNYXRoLnNxcnQoK3ZhbHVlT2YoeCkpO1xyXG5cclxuICAgICAgLy8gTWF0aC5zcXJ0IHVuZGVyZmxvdy9vdmVyZmxvdz9cclxuICAgICAgLy8gUGFzcyB4IHRvIE1hdGguc3FydCBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgZXhwb25lbnQgb2YgdGhlIHJlc3VsdC5cclxuICAgICAgaWYgKHMgPT0gMCB8fCBzID09IDEgLyAwKSB7XHJcbiAgICAgICAgbiA9IGNvZWZmVG9TdHJpbmcoYyk7XHJcbiAgICAgICAgaWYgKChuLmxlbmd0aCArIGUpICUgMiA9PSAwKSBuICs9ICcwJztcclxuICAgICAgICBzID0gTWF0aC5zcXJ0KCtuKTtcclxuICAgICAgICBlID0gYml0Rmxvb3IoKGUgKyAxKSAvIDIpIC0gKGUgPCAwIHx8IGUgJSAyKTtcclxuXHJcbiAgICAgICAgaWYgKHMgPT0gMSAvIDApIHtcclxuICAgICAgICAgIG4gPSAnNWUnICsgZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbiA9IHMudG9FeHBvbmVudGlhbCgpO1xyXG4gICAgICAgICAgbiA9IG4uc2xpY2UoMCwgbi5pbmRleE9mKCdlJykgKyAxKSArIGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByID0gbmV3IEJpZ051bWJlcihuKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByID0gbmV3IEJpZ051bWJlcihzICsgJycpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGVjayBmb3IgemVyby5cclxuICAgICAgLy8gciBjb3VsZCBiZSB6ZXJvIGlmIE1JTl9FWFAgaXMgY2hhbmdlZCBhZnRlciB0aGUgdGhpcyB2YWx1ZSB3YXMgY3JlYXRlZC5cclxuICAgICAgLy8gVGhpcyB3b3VsZCBjYXVzZSBhIGRpdmlzaW9uIGJ5IHplcm8gKHgvdCkgYW5kIGhlbmNlIEluZmluaXR5IGJlbG93LCB3aGljaCB3b3VsZCBjYXVzZVxyXG4gICAgICAvLyBjb2VmZlRvU3RyaW5nIHRvIHRocm93LlxyXG4gICAgICBpZiAoci5jWzBdKSB7XHJcbiAgICAgICAgZSA9IHIuZTtcclxuICAgICAgICBzID0gZSArIGRwO1xyXG4gICAgICAgIGlmIChzIDwgMykgcyA9IDA7XHJcblxyXG4gICAgICAgIC8vIE5ld3Rvbi1SYXBoc29uIGl0ZXJhdGlvbi5cclxuICAgICAgICBmb3IgKDsgOykge1xyXG4gICAgICAgICAgdCA9IHI7XHJcbiAgICAgICAgICByID0gaGFsZi50aW1lcyh0LnBsdXMoZGl2KHgsIHQsIGRwLCAxKSkpO1xyXG5cclxuICAgICAgICAgIGlmIChjb2VmZlRvU3RyaW5nKHQuYykuc2xpY2UoMCwgcykgPT09IChuID0gY29lZmZUb1N0cmluZyhyLmMpKS5zbGljZSgwLCBzKSkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGV4cG9uZW50IG9mIHIgbWF5IGhlcmUgYmUgb25lIGxlc3MgdGhhbiB0aGUgZmluYWwgcmVzdWx0IGV4cG9uZW50LFxyXG4gICAgICAgICAgICAvLyBlLmcgMC4wMDA5OTk5IChlLTQpIC0tPiAwLjAwMSAoZS0zKSwgc28gYWRqdXN0IHMgc28gdGhlIHJvdW5kaW5nIGRpZ2l0c1xyXG4gICAgICAgICAgICAvLyBhcmUgaW5kZXhlZCBjb3JyZWN0bHkuXHJcbiAgICAgICAgICAgIGlmIChyLmUgPCBlKSAtLXM7XHJcbiAgICAgICAgICAgIG4gPSBuLnNsaWNlKHMgLSAzLCBzICsgMSk7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgNHRoIHJvdW5kaW5nIGRpZ2l0IG1heSBiZSBpbiBlcnJvciBieSAtMSBzbyBpZiB0aGUgNCByb3VuZGluZyBkaWdpdHNcclxuICAgICAgICAgICAgLy8gYXJlIDk5OTkgb3IgNDk5OSAoaS5lLiBhcHByb2FjaGluZyBhIHJvdW5kaW5nIGJvdW5kYXJ5KSBjb250aW51ZSB0aGVcclxuICAgICAgICAgICAgLy8gaXRlcmF0aW9uLlxyXG4gICAgICAgICAgICBpZiAobiA9PSAnOTk5OScgfHwgIXJlcCAmJiBuID09ICc0OTk5Jykge1xyXG5cclxuICAgICAgICAgICAgICAvLyBPbiB0aGUgZmlyc3QgaXRlcmF0aW9uIG9ubHksIGNoZWNrIHRvIHNlZSBpZiByb3VuZGluZyB1cCBnaXZlcyB0aGVcclxuICAgICAgICAgICAgICAvLyBleGFjdCByZXN1bHQgYXMgdGhlIG5pbmVzIG1heSBpbmZpbml0ZWx5IHJlcGVhdC5cclxuICAgICAgICAgICAgICBpZiAoIXJlcCkge1xyXG4gICAgICAgICAgICAgICAgcm91bmQodCwgdC5lICsgREVDSU1BTF9QTEFDRVMgKyAyLCAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodC50aW1lcyh0KS5lcSh4KSkge1xyXG4gICAgICAgICAgICAgICAgICByID0gdDtcclxuICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBkcCArPSA0O1xyXG4gICAgICAgICAgICAgIHMgKz0gNDtcclxuICAgICAgICAgICAgICByZXAgPSAxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAvLyBJZiByb3VuZGluZyBkaWdpdHMgYXJlIG51bGwsIDB7MCw0fSBvciA1MHswLDN9LCBjaGVjayBmb3IgZXhhY3RcclxuICAgICAgICAgICAgICAvLyByZXN1bHQuIElmIG5vdCwgdGhlbiB0aGVyZSBhcmUgZnVydGhlciBkaWdpdHMgYW5kIG0gd2lsbCBiZSB0cnV0aHkuXHJcbiAgICAgICAgICAgICAgaWYgKCErbiB8fCAhK24uc2xpY2UoMSkgJiYgbi5jaGFyQXQoMCkgPT0gJzUnKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVHJ1bmNhdGUgdG8gdGhlIGZpcnN0IHJvdW5kaW5nIGRpZ2l0LlxyXG4gICAgICAgICAgICAgICAgcm91bmQociwgci5lICsgREVDSU1BTF9QTEFDRVMgKyAyLCAxKTtcclxuICAgICAgICAgICAgICAgIG0gPSAhci50aW1lcyhyKS5lcSh4KTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcm91bmQociwgci5lICsgREVDSU1BTF9QTEFDRVMgKyAxLCBST1VORElOR19NT0RFLCBtKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpbiBleHBvbmVudGlhbCBub3RhdGlvbiBhbmRcclxuICAgICAqIHJvdW5kZWQgdXNpbmcgUk9VTkRJTkdfTU9ERSB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzLiBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgKlxyXG4gICAgICogJ1tCaWdOdW1iZXIgRXJyb3JdIEFyZ3VtZW50IHtub3QgYSBwcmltaXRpdmUgbnVtYmVyfG5vdCBhbiBpbnRlZ2VyfG91dCBvZiByYW5nZX06IHtkcHxybX0nXHJcbiAgICAgKi9cclxuICAgIFAudG9FeHBvbmVudGlhbCA9IGZ1bmN0aW9uIChkcCwgcm0pIHtcclxuICAgICAgaWYgKGRwICE9IG51bGwpIHtcclxuICAgICAgICBpbnRDaGVjayhkcCwgMCwgTUFYKTtcclxuICAgICAgICBkcCsrO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmb3JtYXQodGhpcywgZHAsIHJtLCAxKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpbiBmaXhlZC1wb2ludCBub3RhdGlvbiByb3VuZGluZ1xyXG4gICAgICogdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybSwgb3IgUk9VTkRJTkdfTU9ERSBpZiBybSBpcyBvbWl0dGVkLlxyXG4gICAgICpcclxuICAgICAqIE5vdGU6IGFzIHdpdGggSmF2YVNjcmlwdCdzIG51bWJlciB0eXBlLCAoLTApLnRvRml4ZWQoMCkgaXMgJzAnLFxyXG4gICAgICogYnV0IGUuZy4gKC0wLjAwMDAxKS50b0ZpeGVkKDApIGlzICctMCcuXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBEZWNpbWFsIHBsYWNlcy4gSW50ZWdlciwgMCB0byBNQVggaW5jbHVzaXZlLlxyXG4gICAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICpcclxuICAgICAqICdbQmlnTnVtYmVyIEVycm9yXSBBcmd1bWVudCB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7ZHB8cm19J1xyXG4gICAgICovXHJcbiAgICBQLnRvRml4ZWQgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICAgIGlmIChkcCAhPSBudWxsKSB7XHJcbiAgICAgICAgaW50Q2hlY2soZHAsIDAsIE1BWCk7XHJcbiAgICAgICAgZHAgPSBkcCArIHRoaXMuZSArIDE7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBkcCwgcm0pO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGluIGZpeGVkLXBvaW50IG5vdGF0aW9uIHJvdW5kZWRcclxuICAgICAqIHVzaW5nIHJtIG9yIFJPVU5ESU5HX01PREUgdG8gZHAgZGVjaW1hbCBwbGFjZXMsIGFuZCBmb3JtYXR0ZWQgYWNjb3JkaW5nIHRvIHRoZSBwcm9wZXJ0aWVzXHJcbiAgICAgKiBvZiB0aGUgZm9ybWF0IG9yIEZPUk1BVCBvYmplY3QgKHNlZSBCaWdOdW1iZXIuc2V0KS5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgZm9ybWF0dGluZyBvYmplY3QgbWF5IGNvbnRhaW4gc29tZSBvciBhbGwgb2YgdGhlIHByb3BlcnRpZXMgc2hvd24gYmVsb3cuXHJcbiAgICAgKlxyXG4gICAgICogRk9STUFUID0ge1xyXG4gICAgICogICBwcmVmaXg6ICcnLFxyXG4gICAgICogICBncm91cFNpemU6IDMsXHJcbiAgICAgKiAgIHNlY29uZGFyeUdyb3VwU2l6ZTogMCxcclxuICAgICAqICAgZ3JvdXBTZXBhcmF0b3I6ICcsJyxcclxuICAgICAqICAgZGVjaW1hbFNlcGFyYXRvcjogJy4nLFxyXG4gICAgICogICBmcmFjdGlvbkdyb3VwU2l6ZTogMCxcclxuICAgICAqICAgZnJhY3Rpb25Hcm91cFNlcGFyYXRvcjogJ1xceEEwJywgICAgICAvLyBub24tYnJlYWtpbmcgc3BhY2VcclxuICAgICAqICAgc3VmZml4OiAnJ1xyXG4gICAgICogfTtcclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzLiBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbZm9ybWF0XSB7b2JqZWN0fSBGb3JtYXR0aW5nIG9wdGlvbnMuIFNlZSBGT1JNQVQgcGJqZWN0IGFib3ZlLlxyXG4gICAgICpcclxuICAgICAqICdbQmlnTnVtYmVyIEVycm9yXSBBcmd1bWVudCB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7ZHB8cm19J1xyXG4gICAgICogJ1tCaWdOdW1iZXIgRXJyb3JdIEFyZ3VtZW50IG5vdCBhbiBvYmplY3Q6IHtmb3JtYXR9J1xyXG4gICAgICovXHJcbiAgICBQLnRvRm9ybWF0ID0gZnVuY3Rpb24gKGRwLCBybSwgZm9ybWF0KSB7XHJcbiAgICAgIHZhciBzdHIsXHJcbiAgICAgICAgeCA9IHRoaXM7XHJcblxyXG4gICAgICBpZiAoZm9ybWF0ID09IG51bGwpIHtcclxuICAgICAgICBpZiAoZHAgIT0gbnVsbCAmJiBybSAmJiB0eXBlb2Ygcm0gPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgIGZvcm1hdCA9IHJtO1xyXG4gICAgICAgICAgcm0gPSBudWxsO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgJiYgdHlwZW9mIGRwID09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICBmb3JtYXQgPSBkcDtcclxuICAgICAgICAgIGRwID0gcm0gPSBudWxsO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBmb3JtYXQgPSBGT1JNQVQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBmb3JtYXQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICB0aHJvdyBFcnJvclxyXG4gICAgICAgICAgKGJpZ251bWJlckVycm9yICsgJ0FyZ3VtZW50IG5vdCBhbiBvYmplY3Q6ICcgKyBmb3JtYXQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzdHIgPSB4LnRvRml4ZWQoZHAsIHJtKTtcclxuXHJcbiAgICAgIGlmICh4LmMpIHtcclxuICAgICAgICB2YXIgaSxcclxuICAgICAgICAgIGFyciA9IHN0ci5zcGxpdCgnLicpLFxyXG4gICAgICAgICAgZzEgPSArZm9ybWF0Lmdyb3VwU2l6ZSxcclxuICAgICAgICAgIGcyID0gK2Zvcm1hdC5zZWNvbmRhcnlHcm91cFNpemUsXHJcbiAgICAgICAgICBncm91cFNlcGFyYXRvciA9IGZvcm1hdC5ncm91cFNlcGFyYXRvciB8fCAnJyxcclxuICAgICAgICAgIGludFBhcnQgPSBhcnJbMF0sXHJcbiAgICAgICAgICBmcmFjdGlvblBhcnQgPSBhcnJbMV0sXHJcbiAgICAgICAgICBpc05lZyA9IHgucyA8IDAsXHJcbiAgICAgICAgICBpbnREaWdpdHMgPSBpc05lZyA/IGludFBhcnQuc2xpY2UoMSkgOiBpbnRQYXJ0LFxyXG4gICAgICAgICAgbGVuID0gaW50RGlnaXRzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgaWYgKGcyKSBpID0gZzEsIGcxID0gZzIsIGcyID0gaSwgbGVuIC09IGk7XHJcblxyXG4gICAgICAgIGlmIChnMSA+IDAgJiYgbGVuID4gMCkge1xyXG4gICAgICAgICAgaSA9IGxlbiAlIGcxIHx8IGcxO1xyXG4gICAgICAgICAgaW50UGFydCA9IGludERpZ2l0cy5zdWJzdHIoMCwgaSk7XHJcbiAgICAgICAgICBmb3IgKDsgaSA8IGxlbjsgaSArPSBnMSkgaW50UGFydCArPSBncm91cFNlcGFyYXRvciArIGludERpZ2l0cy5zdWJzdHIoaSwgZzEpO1xyXG4gICAgICAgICAgaWYgKGcyID4gMCkgaW50UGFydCArPSBncm91cFNlcGFyYXRvciArIGludERpZ2l0cy5zbGljZShpKTtcclxuICAgICAgICAgIGlmIChpc05lZykgaW50UGFydCA9ICctJyArIGludFBhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdHIgPSBmcmFjdGlvblBhcnRcclxuICAgICAgICAgPyBpbnRQYXJ0ICsgKGZvcm1hdC5kZWNpbWFsU2VwYXJhdG9yIHx8ICcnKSArICgoZzIgPSArZm9ybWF0LmZyYWN0aW9uR3JvdXBTaXplKVxyXG4gICAgICAgICAgPyBmcmFjdGlvblBhcnQucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxcZHsnICsgZzIgKyAnfVxcXFxCJywgJ2cnKSxcclxuICAgICAgICAgICAnJCYnICsgKGZvcm1hdC5mcmFjdGlvbkdyb3VwU2VwYXJhdG9yIHx8ICcnKSlcclxuICAgICAgICAgIDogZnJhY3Rpb25QYXJ0KVxyXG4gICAgICAgICA6IGludFBhcnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiAoZm9ybWF0LnByZWZpeCB8fCAnJykgKyBzdHIgKyAoZm9ybWF0LnN1ZmZpeCB8fCAnJyk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGFuIGFycmF5IG9mIHR3byBCaWdOdW1iZXJzIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgYXMgYSBzaW1wbGVcclxuICAgICAqIGZyYWN0aW9uIHdpdGggYW4gaW50ZWdlciBudW1lcmF0b3IgYW5kIGFuIGludGVnZXIgZGVub21pbmF0b3IuXHJcbiAgICAgKiBUaGUgZGVub21pbmF0b3Igd2lsbCBiZSBhIHBvc2l0aXZlIG5vbi16ZXJvIHZhbHVlIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgc3BlY2lmaWVkXHJcbiAgICAgKiBtYXhpbXVtIGRlbm9taW5hdG9yLiBJZiBhIG1heGltdW0gZGVub21pbmF0b3IgaXMgbm90IHNwZWNpZmllZCwgdGhlIGRlbm9taW5hdG9yIHdpbGwgYmVcclxuICAgICAqIHRoZSBsb3dlc3QgdmFsdWUgbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgbnVtYmVyIGV4YWN0bHkuXHJcbiAgICAgKlxyXG4gICAgICogW21kXSB7bnVtYmVyfHN0cmluZ3xCaWdOdW1iZXJ9IEludGVnZXIgPj0gMSwgb3IgSW5maW5pdHkuIFRoZSBtYXhpbXVtIGRlbm9taW5hdG9yLlxyXG4gICAgICpcclxuICAgICAqICdbQmlnTnVtYmVyIEVycm9yXSBBcmd1bWVudCB7bm90IGFuIGludGVnZXJ8b3V0IG9mIHJhbmdlfSA6IHttZH0nXHJcbiAgICAgKi9cclxuICAgIFAudG9GcmFjdGlvbiA9IGZ1bmN0aW9uIChtZCkge1xyXG4gICAgICB2YXIgZCwgZDAsIGQxLCBkMiwgZSwgZXhwLCBuLCBuMCwgbjEsIHEsIHIsIHMsXHJcbiAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgeGMgPSB4LmM7XHJcblxyXG4gICAgICBpZiAobWQgIT0gbnVsbCkge1xyXG4gICAgICAgIG4gPSBuZXcgQmlnTnVtYmVyKG1kKTtcclxuXHJcbiAgICAgICAgLy8gVGhyb3cgaWYgbWQgaXMgbGVzcyB0aGFuIG9uZSBvciBpcyBub3QgYW4gaW50ZWdlciwgdW5sZXNzIGl0IGlzIEluZmluaXR5LlxyXG4gICAgICAgIGlmICghbi5pc0ludGVnZXIoKSAmJiAobi5jIHx8IG4ucyAhPT0gMSkgfHwgbi5sdChPTkUpKSB7XHJcbiAgICAgICAgICB0aHJvdyBFcnJvclxyXG4gICAgICAgICAgICAoYmlnbnVtYmVyRXJyb3IgKyAnQXJndW1lbnQgJyArXHJcbiAgICAgICAgICAgICAgKG4uaXNJbnRlZ2VyKCkgPyAnb3V0IG9mIHJhbmdlOiAnIDogJ25vdCBhbiBpbnRlZ2VyOiAnKSArIHZhbHVlT2YobikpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCF4YykgcmV0dXJuIG5ldyBCaWdOdW1iZXIoeCk7XHJcblxyXG4gICAgICBkID0gbmV3IEJpZ051bWJlcihPTkUpO1xyXG4gICAgICBuMSA9IGQwID0gbmV3IEJpZ051bWJlcihPTkUpO1xyXG4gICAgICBkMSA9IG4wID0gbmV3IEJpZ051bWJlcihPTkUpO1xyXG4gICAgICBzID0gY29lZmZUb1N0cmluZyh4Yyk7XHJcblxyXG4gICAgICAvLyBEZXRlcm1pbmUgaW5pdGlhbCBkZW5vbWluYXRvci5cclxuICAgICAgLy8gZCBpcyBhIHBvd2VyIG9mIDEwIGFuZCB0aGUgbWluaW11bSBtYXggZGVub21pbmF0b3IgdGhhdCBzcGVjaWZpZXMgdGhlIHZhbHVlIGV4YWN0bHkuXHJcbiAgICAgIGUgPSBkLmUgPSBzLmxlbmd0aCAtIHguZSAtIDE7XHJcbiAgICAgIGQuY1swXSA9IFBPV1NfVEVOWyhleHAgPSBlICUgTE9HX0JBU0UpIDwgMCA/IExPR19CQVNFICsgZXhwIDogZXhwXTtcclxuICAgICAgbWQgPSAhbWQgfHwgbi5jb21wYXJlZFRvKGQpID4gMCA/IChlID4gMCA/IGQgOiBuMSkgOiBuO1xyXG5cclxuICAgICAgZXhwID0gTUFYX0VYUDtcclxuICAgICAgTUFYX0VYUCA9IDEgLyAwO1xyXG4gICAgICBuID0gbmV3IEJpZ051bWJlcihzKTtcclxuXHJcbiAgICAgIC8vIG4wID0gZDEgPSAwXHJcbiAgICAgIG4wLmNbMF0gPSAwO1xyXG5cclxuICAgICAgZm9yICg7IDspICB7XHJcbiAgICAgICAgcSA9IGRpdihuLCBkLCAwLCAxKTtcclxuICAgICAgICBkMiA9IGQwLnBsdXMocS50aW1lcyhkMSkpO1xyXG4gICAgICAgIGlmIChkMi5jb21wYXJlZFRvKG1kKSA9PSAxKSBicmVhaztcclxuICAgICAgICBkMCA9IGQxO1xyXG4gICAgICAgIGQxID0gZDI7XHJcbiAgICAgICAgbjEgPSBuMC5wbHVzKHEudGltZXMoZDIgPSBuMSkpO1xyXG4gICAgICAgIG4wID0gZDI7XHJcbiAgICAgICAgZCA9IG4ubWludXMocS50aW1lcyhkMiA9IGQpKTtcclxuICAgICAgICBuID0gZDI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGQyID0gZGl2KG1kLm1pbnVzKGQwKSwgZDEsIDAsIDEpO1xyXG4gICAgICBuMCA9IG4wLnBsdXMoZDIudGltZXMobjEpKTtcclxuICAgICAgZDAgPSBkMC5wbHVzKGQyLnRpbWVzKGQxKSk7XHJcbiAgICAgIG4wLnMgPSBuMS5zID0geC5zO1xyXG4gICAgICBlID0gZSAqIDI7XHJcblxyXG4gICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggZnJhY3Rpb24gaXMgY2xvc2VyIHRvIHgsIG4wL2QwIG9yIG4xL2QxXHJcbiAgICAgIHIgPSBkaXYobjEsIGQxLCBlLCBST1VORElOR19NT0RFKS5taW51cyh4KS5hYnMoKS5jb21wYXJlZFRvKFxyXG4gICAgICAgICAgZGl2KG4wLCBkMCwgZSwgUk9VTkRJTkdfTU9ERSkubWludXMoeCkuYWJzKCkpIDwgMSA/IFtuMSwgZDFdIDogW24wLCBkMF07XHJcblxyXG4gICAgICBNQVhfRVhQID0gZXhwO1xyXG5cclxuICAgICAgcmV0dXJuIHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBjb252ZXJ0ZWQgdG8gYSBudW1iZXIgcHJpbWl0aXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvTnVtYmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gK3ZhbHVlT2YodGhpcyk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcm91bmRlZCB0byBzZCBzaWduaWZpY2FudCBkaWdpdHNcclxuICAgICAqIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0gb3IgUk9VTkRJTkdfTU9ERS4gSWYgc2QgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzXHJcbiAgICAgKiBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlIHZhbHVlIGluIGZpeGVkLXBvaW50IG5vdGF0aW9uLCB0aGVuIHVzZVxyXG4gICAgICogZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogW3NkXSB7bnVtYmVyfSBTaWduaWZpY2FudCBkaWdpdHMuIEludGVnZXIsIDEgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAqIFtybV0ge251bWJlcn0gUm91bmRpbmcgbW9kZS4gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgICAqXHJcbiAgICAgKiAnW0JpZ051bWJlciBFcnJvcl0gQXJndW1lbnQge25vdCBhIHByaW1pdGl2ZSBudW1iZXJ8bm90IGFuIGludGVnZXJ8b3V0IG9mIHJhbmdlfToge3NkfHJtfSdcclxuICAgICAqL1xyXG4gICAgUC50b1ByZWNpc2lvbiA9IGZ1bmN0aW9uIChzZCwgcm0pIHtcclxuICAgICAgaWYgKHNkICE9IG51bGwpIGludENoZWNrKHNkLCAxLCBNQVgpO1xyXG4gICAgICByZXR1cm4gZm9ybWF0KHRoaXMsIHNkLCBybSwgMik7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaW4gYmFzZSBiLCBvciBiYXNlIDEwIGlmIGIgaXNcclxuICAgICAqIG9taXR0ZWQuIElmIGEgYmFzZSBpcyBzcGVjaWZpZWQsIGluY2x1ZGluZyBiYXNlIDEwLCByb3VuZCBhY2NvcmRpbmcgdG8gREVDSU1BTF9QTEFDRVMgYW5kXHJcbiAgICAgKiBST1VORElOR19NT0RFLiBJZiBhIGJhc2UgaXMgbm90IHNwZWNpZmllZCwgYW5kIHRoaXMgQmlnTnVtYmVyIGhhcyBhIHBvc2l0aXZlIGV4cG9uZW50XHJcbiAgICAgKiB0aGF0IGlzIGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhbiBUT19FWFBfUE9TLCBvciBhIG5lZ2F0aXZlIGV4cG9uZW50IGVxdWFsIHRvIG9yIGxlc3MgdGhhblxyXG4gICAgICogVE9fRVhQX05FRywgcmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIFtiXSB7bnVtYmVyfSBJbnRlZ2VyLCAyIHRvIEFMUEhBQkVULmxlbmd0aCBpbmNsdXNpdmUuXHJcbiAgICAgKlxyXG4gICAgICogJ1tCaWdOdW1iZXIgRXJyb3JdIEJhc2Uge25vdCBhIHByaW1pdGl2ZSBudW1iZXJ8bm90IGFuIGludGVnZXJ8b3V0IG9mIHJhbmdlfToge2J9J1xyXG4gICAgICovXHJcbiAgICBQLnRvU3RyaW5nID0gZnVuY3Rpb24gKGIpIHtcclxuICAgICAgdmFyIHN0cixcclxuICAgICAgICBuID0gdGhpcyxcclxuICAgICAgICBzID0gbi5zLFxyXG4gICAgICAgIGUgPSBuLmU7XHJcblxyXG4gICAgICAvLyBJbmZpbml0eSBvciBOYU4/XHJcbiAgICAgIGlmIChlID09PSBudWxsKSB7XHJcbiAgICAgICAgaWYgKHMpIHtcclxuICAgICAgICAgIHN0ciA9ICdJbmZpbml0eSc7XHJcbiAgICAgICAgICBpZiAocyA8IDApIHN0ciA9ICctJyArIHN0cjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RyID0gJ05hTic7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChiID09IG51bGwpIHtcclxuICAgICAgICAgIHN0ciA9IGUgPD0gVE9fRVhQX05FRyB8fCBlID49IFRPX0VYUF9QT1NcclxuICAgICAgICAgICA/IHRvRXhwb25lbnRpYWwoY29lZmZUb1N0cmluZyhuLmMpLCBlKVxyXG4gICAgICAgICAgIDogdG9GaXhlZFBvaW50KGNvZWZmVG9TdHJpbmcobi5jKSwgZSwgJzAnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGIgPT09IDEwKSB7XHJcbiAgICAgICAgICBuID0gcm91bmQobmV3IEJpZ051bWJlcihuKSwgREVDSU1BTF9QTEFDRVMgKyBlICsgMSwgUk9VTkRJTkdfTU9ERSk7XHJcbiAgICAgICAgICBzdHIgPSB0b0ZpeGVkUG9pbnQoY29lZmZUb1N0cmluZyhuLmMpLCBuLmUsICcwJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGludENoZWNrKGIsIDIsIEFMUEhBQkVULmxlbmd0aCwgJ0Jhc2UnKTtcclxuICAgICAgICAgIHN0ciA9IGNvbnZlcnRCYXNlKHRvRml4ZWRQb2ludChjb2VmZlRvU3RyaW5nKG4uYyksIGUsICcwJyksIDEwLCBiLCBzLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzIDwgMCAmJiBuLmNbMF0pIHN0ciA9ICctJyArIHN0cjtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYXMgdG9TdHJpbmcsIGJ1dCBkbyBub3QgYWNjZXB0IGEgYmFzZSBhcmd1bWVudCwgYW5kIGluY2x1ZGUgdGhlIG1pbnVzIHNpZ24gZm9yXHJcbiAgICAgKiBuZWdhdGl2ZSB6ZXJvLlxyXG4gICAgICovXHJcbiAgICBQLnZhbHVlT2YgPSBQLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHZhbHVlT2YodGhpcyk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICBQLl9pc0JpZ051bWJlciA9IHRydWU7XHJcblxyXG4gICAgaWYgKGNvbmZpZ09iamVjdCAhPSBudWxsKSBCaWdOdW1iZXIuc2V0KGNvbmZpZ09iamVjdCk7XHJcblxyXG4gICAgcmV0dXJuIEJpZ051bWJlcjtcclxuICB9XHJcblxyXG5cclxuICAvLyBQUklWQVRFIEhFTFBFUiBGVU5DVElPTlNcclxuXHJcbiAgLy8gVGhlc2UgZnVuY3Rpb25zIGRvbid0IG5lZWQgYWNjZXNzIHRvIHZhcmlhYmxlcyxcclxuICAvLyBlLmcuIERFQ0lNQUxfUExBQ0VTLCBpbiB0aGUgc2NvcGUgb2YgdGhlIGBjbG9uZWAgZnVuY3Rpb24gYWJvdmUuXHJcblxyXG5cclxuICBmdW5jdGlvbiBiaXRGbG9vcihuKSB7XHJcbiAgICB2YXIgaSA9IG4gfCAwO1xyXG4gICAgcmV0dXJuIG4gPiAwIHx8IG4gPT09IGkgPyBpIDogaSAtIDE7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gUmV0dXJuIGEgY29lZmZpY2llbnQgYXJyYXkgYXMgYSBzdHJpbmcgb2YgYmFzZSAxMCBkaWdpdHMuXHJcbiAgZnVuY3Rpb24gY29lZmZUb1N0cmluZyhhKSB7XHJcbiAgICB2YXIgcywgeixcclxuICAgICAgaSA9IDEsXHJcbiAgICAgIGogPSBhLmxlbmd0aCxcclxuICAgICAgciA9IGFbMF0gKyAnJztcclxuXHJcbiAgICBmb3IgKDsgaSA8IGo7KSB7XHJcbiAgICAgIHMgPSBhW2krK10gKyAnJztcclxuICAgICAgeiA9IExPR19CQVNFIC0gcy5sZW5ndGg7XHJcbiAgICAgIGZvciAoOyB6LS07IHMgPSAnMCcgKyBzKTtcclxuICAgICAgciArPSBzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgIGZvciAoaiA9IHIubGVuZ3RoOyByLmNoYXJDb2RlQXQoLS1qKSA9PT0gNDg7KTtcclxuXHJcbiAgICByZXR1cm4gci5zbGljZSgwLCBqICsgMSB8fCAxKTtcclxuICB9XHJcblxyXG5cclxuICAvLyBDb21wYXJlIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXJzIHggYW5kIHkuXHJcbiAgZnVuY3Rpb24gY29tcGFyZSh4LCB5KSB7XHJcbiAgICB2YXIgYSwgYixcclxuICAgICAgeGMgPSB4LmMsXHJcbiAgICAgIHljID0geS5jLFxyXG4gICAgICBpID0geC5zLFxyXG4gICAgICBqID0geS5zLFxyXG4gICAgICBrID0geC5lLFxyXG4gICAgICBsID0geS5lO1xyXG5cclxuICAgIC8vIEVpdGhlciBOYU4/XHJcbiAgICBpZiAoIWkgfHwgIWopIHJldHVybiBudWxsO1xyXG5cclxuICAgIGEgPSB4YyAmJiAheGNbMF07XHJcbiAgICBiID0geWMgJiYgIXljWzBdO1xyXG5cclxuICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgaWYgKGEgfHwgYikgcmV0dXJuIGEgPyBiID8gMCA6IC1qIDogaTtcclxuXHJcbiAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICBpZiAoaSAhPSBqKSByZXR1cm4gaTtcclxuXHJcbiAgICBhID0gaSA8IDA7XHJcbiAgICBiID0gayA9PSBsO1xyXG5cclxuICAgIC8vIEVpdGhlciBJbmZpbml0eT9cclxuICAgIGlmICgheGMgfHwgIXljKSByZXR1cm4gYiA/IDAgOiAheGMgXiBhID8gMSA6IC0xO1xyXG5cclxuICAgIC8vIENvbXBhcmUgZXhwb25lbnRzLlxyXG4gICAgaWYgKCFiKSByZXR1cm4gayA+IGwgXiBhID8gMSA6IC0xO1xyXG5cclxuICAgIGogPSAoayA9IHhjLmxlbmd0aCkgPCAobCA9IHljLmxlbmd0aCkgPyBrIDogbDtcclxuXHJcbiAgICAvLyBDb21wYXJlIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgZm9yIChpID0gMDsgaSA8IGo7IGkrKykgaWYgKHhjW2ldICE9IHljW2ldKSByZXR1cm4geGNbaV0gPiB5Y1tpXSBeIGEgPyAxIDogLTE7XHJcblxyXG4gICAgLy8gQ29tcGFyZSBsZW5ndGhzLlxyXG4gICAgcmV0dXJuIGsgPT0gbCA/IDAgOiBrID4gbCBeIGEgPyAxIDogLTE7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBDaGVjayB0aGF0IG4gaXMgYSBwcmltaXRpdmUgbnVtYmVyLCBhbiBpbnRlZ2VyLCBhbmQgaW4gcmFuZ2UsIG90aGVyd2lzZSB0aHJvdy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBpbnRDaGVjayhuLCBtaW4sIG1heCwgbmFtZSkge1xyXG4gICAgaWYgKG4gPCBtaW4gfHwgbiA+IG1heCB8fCBuICE9PSBtYXRoZmxvb3IobikpIHtcclxuICAgICAgdGhyb3cgRXJyb3JcclxuICAgICAgIChiaWdudW1iZXJFcnJvciArIChuYW1lIHx8ICdBcmd1bWVudCcpICsgKHR5cGVvZiBuID09ICdudW1iZXInXHJcbiAgICAgICAgID8gbiA8IG1pbiB8fCBuID4gbWF4ID8gJyBvdXQgb2YgcmFuZ2U6ICcgOiAnIG5vdCBhbiBpbnRlZ2VyOiAnXHJcbiAgICAgICAgIDogJyBub3QgYSBwcmltaXRpdmUgbnVtYmVyOiAnKSArIFN0cmluZyhuKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQXNzdW1lcyBmaW5pdGUgbi5cclxuICBmdW5jdGlvbiBpc09kZChuKSB7XHJcbiAgICB2YXIgayA9IG4uYy5sZW5ndGggLSAxO1xyXG4gICAgcmV0dXJuIGJpdEZsb29yKG4uZSAvIExPR19CQVNFKSA9PSBrICYmIG4uY1trXSAlIDIgIT0gMDtcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiB0b0V4cG9uZW50aWFsKHN0ciwgZSkge1xyXG4gICAgcmV0dXJuIChzdHIubGVuZ3RoID4gMSA/IHN0ci5jaGFyQXQoMCkgKyAnLicgKyBzdHIuc2xpY2UoMSkgOiBzdHIpICtcclxuICAgICAoZSA8IDAgPyAnZScgOiAnZSsnKSArIGU7XHJcbiAgfVxyXG5cclxuXHJcbiAgZnVuY3Rpb24gdG9GaXhlZFBvaW50KHN0ciwgZSwgeikge1xyXG4gICAgdmFyIGxlbiwgenM7XHJcblxyXG4gICAgLy8gTmVnYXRpdmUgZXhwb25lbnQ/XHJcbiAgICBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgIC8vIFByZXBlbmQgemVyb3MuXHJcbiAgICAgIGZvciAoenMgPSB6ICsgJy4nOyArK2U7IHpzICs9IHopO1xyXG4gICAgICBzdHIgPSB6cyArIHN0cjtcclxuXHJcbiAgICAvLyBQb3NpdGl2ZSBleHBvbmVudFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGVuID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgIC8vIEFwcGVuZCB6ZXJvcy5cclxuICAgICAgaWYgKCsrZSA+IGxlbikge1xyXG4gICAgICAgIGZvciAoenMgPSB6LCBlIC09IGxlbjsgLS1lOyB6cyArPSB6KTtcclxuICAgICAgICBzdHIgKz0genM7XHJcbiAgICAgIH0gZWxzZSBpZiAoZSA8IGxlbikge1xyXG4gICAgICAgIHN0ciA9IHN0ci5zbGljZSgwLCBlKSArICcuJyArIHN0ci5zbGljZShlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzdHI7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gRVhQT1JUXHJcblxyXG5cclxuICBCaWdOdW1iZXIgPSBjbG9uZSgpO1xyXG4gIEJpZ051bWJlclsnZGVmYXVsdCddID0gQmlnTnVtYmVyLkJpZ051bWJlciA9IEJpZ051bWJlcjtcclxuXHJcbiAgLy8gQU1ELlxyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgZGVmaW5lKGZ1bmN0aW9uICgpIHsgcmV0dXJuIEJpZ051bWJlcjsgfSk7XHJcblxyXG4gIC8vIE5vZGUuanMgYW5kIG90aGVyIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMuXHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEJpZ051bWJlcjtcclxuXHJcbiAgLy8gQnJvd3Nlci5cclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKCFnbG9iYWxPYmplY3QpIHtcclxuICAgICAgZ2xvYmFsT2JqZWN0ID0gdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZiA/IHNlbGYgOiB3aW5kb3c7XHJcbiAgICB9XHJcblxyXG4gICAgZ2xvYmFsT2JqZWN0LkJpZ051bWJlciA9IEJpZ051bWJlcjtcclxuICB9XHJcbn0pKHRoaXMpO1xyXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgQmlnbnVtYmVyID0gcmVxdWlyZSgnYmlnbnVtYmVyLmpzJykuQmlnTnVtYmVyXG5cbmV4cG9ydHMuTVQgPSB7XG4gIFBPU19JTlQ6IDAsXG4gIE5FR19JTlQ6IDEsXG4gIEJZVEVfU1RSSU5HOiAyLFxuICBVVEY4X1NUUklORzogMyxcbiAgQVJSQVk6IDQsXG4gIE1BUDogNSxcbiAgVEFHOiA2LFxuICBTSU1QTEVfRkxPQVQ6IDdcbn1cblxuZXhwb3J0cy5UQUcgPSB7XG4gIERBVEVfU1RSSU5HOiAwLFxuICBEQVRFX0VQT0NIOiAxLFxuICBQT1NfQklHSU5UOiAyLFxuICBORUdfQklHSU5UOiAzLFxuICBERUNJTUFMX0ZSQUM6IDQsXG4gIEJJR0ZMT0FUOiA1LFxuICBCQVNFNjRVUkxfRVhQRUNURUQ6IDIxLFxuICBCQVNFNjRfRVhQRUNURUQ6IDIyLFxuICBCQVNFMTZfRVhQRUNURUQ6IDIzLFxuICBDQk9SOiAyNCxcbiAgVVJJOiAzMixcbiAgQkFTRTY0VVJMOiAzMyxcbiAgQkFTRTY0OiAzNCxcbiAgUkVHRVhQOiAzNSxcbiAgTUlNRTogMzZcbn1cblxuZXhwb3J0cy5OVU1CWVRFUyA9IHtcbiAgWkVSTzogMCxcbiAgT05FOiAyNCxcbiAgVFdPOiAyNSxcbiAgRk9VUjogMjYsXG4gIEVJR0hUOiAyNyxcbiAgSU5ERUZJTklURTogMzFcbn1cblxuZXhwb3J0cy5TSU1QTEUgPSB7XG4gIEZBTFNFOiAyMCxcbiAgVFJVRTogMjEsXG4gIE5VTEw6IDIyLFxuICBVTkRFRklORUQ6IDIzXG59XG5cbmV4cG9ydHMuU1lNUyA9IHtcbiAgTlVMTDogU3ltYm9sKCdudWxsJyksXG4gIFVOREVGSU5FRDogU3ltYm9sKCd1bmRlZicpLFxuICBQQVJFTlQ6IFN5bWJvbCgncGFyZW50JyksXG4gIEJSRUFLOiBTeW1ib2woJ2JyZWFrJyksXG4gIFNUUkVBTTogU3ltYm9sKCdzdHJlYW0nKVxufVxuXG5leHBvcnRzLlNISUZUMzIgPSBNYXRoLnBvdygyLCAzMilcbmV4cG9ydHMuU0hJRlQxNiA9IE1hdGgucG93KDIsIDE2KVxuXG5leHBvcnRzLk1BWF9TQUZFX0hJR0ggPSAweDFmZmZmZlxuZXhwb3J0cy5ORUdfT05FID0gbmV3IEJpZ251bWJlcigtMSlcbmV4cG9ydHMuVEVOID0gbmV3IEJpZ251bWJlcigxMClcbmV4cG9ydHMuVFdPID0gbmV3IEJpZ251bWJlcigyKVxuXG5leHBvcnRzLlBBUkVOVCA9IHtcbiAgQVJSQVk6IDAsXG4gIE9CSkVDVDogMSxcbiAgTUFQOiAyLFxuICBUQUc6IDMsXG4gIEJZVEVfU1RSSU5HOiA0LFxuICBVVEY4X1NUUklORzogNVxufVxuIiwiLyogZXNsaW50LWRpc2FibGUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWNvZGVBc20gKHN0ZGxpYiwgZm9yZWlnbiwgYnVmZmVyKSB7XG4gICd1c2UgYXNtJ1xuXG4gIC8vIC0tIEltcG9ydHNcblxuICB2YXIgaGVhcCA9IG5ldyBzdGRsaWIuVWludDhBcnJheShidWZmZXIpXG4gIC8vIHZhciBsb2cgPSBmb3JlaWduLmxvZ1xuICB2YXIgcHVzaEludCA9IGZvcmVpZ24ucHVzaEludFxuICB2YXIgcHVzaEludDMyID0gZm9yZWlnbi5wdXNoSW50MzJcbiAgdmFyIHB1c2hJbnQzMk5lZyA9IGZvcmVpZ24ucHVzaEludDMyTmVnXG4gIHZhciBwdXNoSW50NjQgPSBmb3JlaWduLnB1c2hJbnQ2NFxuICB2YXIgcHVzaEludDY0TmVnID0gZm9yZWlnbi5wdXNoSW50NjROZWdcbiAgdmFyIHB1c2hGbG9hdCA9IGZvcmVpZ24ucHVzaEZsb2F0XG4gIHZhciBwdXNoRmxvYXRTaW5nbGUgPSBmb3JlaWduLnB1c2hGbG9hdFNpbmdsZVxuICB2YXIgcHVzaEZsb2F0RG91YmxlID0gZm9yZWlnbi5wdXNoRmxvYXREb3VibGVcbiAgdmFyIHB1c2hUcnVlID0gZm9yZWlnbi5wdXNoVHJ1ZVxuICB2YXIgcHVzaEZhbHNlID0gZm9yZWlnbi5wdXNoRmFsc2VcbiAgdmFyIHB1c2hVbmRlZmluZWQgPSBmb3JlaWduLnB1c2hVbmRlZmluZWRcbiAgdmFyIHB1c2hOdWxsID0gZm9yZWlnbi5wdXNoTnVsbFxuICB2YXIgcHVzaEluZmluaXR5ID0gZm9yZWlnbi5wdXNoSW5maW5pdHlcbiAgdmFyIHB1c2hJbmZpbml0eU5lZyA9IGZvcmVpZ24ucHVzaEluZmluaXR5TmVnXG4gIHZhciBwdXNoTmFOID0gZm9yZWlnbi5wdXNoTmFOXG4gIHZhciBwdXNoTmFOTmVnID0gZm9yZWlnbi5wdXNoTmFOTmVnXG5cbiAgdmFyIHB1c2hBcnJheVN0YXJ0ID0gZm9yZWlnbi5wdXNoQXJyYXlTdGFydFxuICB2YXIgcHVzaEFycmF5U3RhcnRGaXhlZCA9IGZvcmVpZ24ucHVzaEFycmF5U3RhcnRGaXhlZFxuICB2YXIgcHVzaEFycmF5U3RhcnRGaXhlZDMyID0gZm9yZWlnbi5wdXNoQXJyYXlTdGFydEZpeGVkMzJcbiAgdmFyIHB1c2hBcnJheVN0YXJ0Rml4ZWQ2NCA9IGZvcmVpZ24ucHVzaEFycmF5U3RhcnRGaXhlZDY0XG4gIHZhciBwdXNoT2JqZWN0U3RhcnQgPSBmb3JlaWduLnB1c2hPYmplY3RTdGFydFxuICB2YXIgcHVzaE9iamVjdFN0YXJ0Rml4ZWQgPSBmb3JlaWduLnB1c2hPYmplY3RTdGFydEZpeGVkXG4gIHZhciBwdXNoT2JqZWN0U3RhcnRGaXhlZDMyID0gZm9yZWlnbi5wdXNoT2JqZWN0U3RhcnRGaXhlZDMyXG4gIHZhciBwdXNoT2JqZWN0U3RhcnRGaXhlZDY0ID0gZm9yZWlnbi5wdXNoT2JqZWN0U3RhcnRGaXhlZDY0XG5cbiAgdmFyIHB1c2hCeXRlU3RyaW5nID0gZm9yZWlnbi5wdXNoQnl0ZVN0cmluZ1xuICB2YXIgcHVzaEJ5dGVTdHJpbmdTdGFydCA9IGZvcmVpZ24ucHVzaEJ5dGVTdHJpbmdTdGFydFxuICB2YXIgcHVzaFV0ZjhTdHJpbmcgPSBmb3JlaWduLnB1c2hVdGY4U3RyaW5nXG4gIHZhciBwdXNoVXRmOFN0cmluZ1N0YXJ0ID0gZm9yZWlnbi5wdXNoVXRmOFN0cmluZ1N0YXJ0XG5cbiAgdmFyIHB1c2hTaW1wbGVVbmFzc2lnbmVkID0gZm9yZWlnbi5wdXNoU2ltcGxlVW5hc3NpZ25lZFxuXG4gIHZhciBwdXNoVGFnU3RhcnQgPSBmb3JlaWduLnB1c2hUYWdTdGFydFxuICB2YXIgcHVzaFRhZ1N0YXJ0NCA9IGZvcmVpZ24ucHVzaFRhZ1N0YXJ0NFxuICB2YXIgcHVzaFRhZ1N0YXJ0OCA9IGZvcmVpZ24ucHVzaFRhZ1N0YXJ0OFxuICB2YXIgcHVzaFRhZ1VuYXNzaWduZWQgPSBmb3JlaWduLnB1c2hUYWdVbmFzc2lnbmVkXG5cbiAgdmFyIHB1c2hCcmVhayA9IGZvcmVpZ24ucHVzaEJyZWFrXG5cbiAgdmFyIHBvdyA9IHN0ZGxpYi5NYXRoLnBvd1xuXG4gIC8vIC0tIENvbnN0YW50c1xuXG5cbiAgLy8gLS0gTXV0YWJsZSBWYXJpYWJsZXNcblxuICB2YXIgb2Zmc2V0ID0gMFxuICB2YXIgaW5wdXRMZW5ndGggPSAwXG4gIHZhciBjb2RlID0gMFxuXG4gIC8vIERlY29kZSBhIGNib3Igc3RyaW5nIHJlcHJlc2VudGVkIGFzIFVpbnQ4QXJyYXlcbiAgLy8gd2hpY2ggaXMgYWxsb2NhdGVkIG9uIHRoZSBoZWFwIGZyb20gMCB0byBpbnB1dExlbmd0aFxuICAvL1xuICAvLyBpbnB1dCAtIEludFxuICAvL1xuICAvLyBSZXR1cm5zIENvZGUgLSBJbnQsXG4gIC8vIFN1Y2Nlc3MgPSAwXG4gIC8vIEVycm9yID4gMFxuICBmdW5jdGlvbiBwYXJzZSAoaW5wdXQpIHtcbiAgICBpbnB1dCA9IGlucHV0IHwgMFxuXG4gICAgb2Zmc2V0ID0gMFxuICAgIGlucHV0TGVuZ3RoID0gaW5wdXRcblxuICAgIHdoaWxlICgob2Zmc2V0IHwgMCkgPCAoaW5wdXRMZW5ndGggfCAwKSkge1xuICAgICAgY29kZSA9IGp1bXBUYWJsZVtoZWFwW29mZnNldF0gJiAyNTVdKGhlYXBbb2Zmc2V0XSB8IDApIHwgMFxuXG4gICAgICBpZiAoKGNvZGUgfCAwKSA+IDApIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29kZSB8IDBcbiAgfVxuXG4gIC8vIC0tIEhlbHBlciBGdW5jdGlvblxuXG4gIGZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChuKSB7XG4gICAgbiA9IG4gfCAwXG5cbiAgICBpZiAoKCgob2Zmc2V0IHwgMCkgKyAobiB8IDApKSB8IDApIDwgKGlucHV0TGVuZ3RoIHwgMCkpIHtcbiAgICAgIHJldHVybiAwXG4gICAgfVxuXG4gICAgcmV0dXJuIDFcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRVSW50MTYgKG4pIHtcbiAgICBuID0gbiB8IDBcblxuICAgIHJldHVybiAoXG4gICAgICAoaGVhcFtuIHwgMF0gPDwgOCkgfCBoZWFwWyhuICsgMSkgfCAwXVxuICAgICkgfCAwXG4gIH1cblxuICBmdW5jdGlvbiByZWFkVUludDMyIChuKSB7XG4gICAgbiA9IG4gfCAwXG5cbiAgICByZXR1cm4gKFxuICAgICAgKGhlYXBbbiB8IDBdIDw8IDI0KSB8IChoZWFwWyhuICsgMSkgfCAwXSA8PCAxNikgfCAoaGVhcFsobiArIDIpIHwgMF0gPDwgOCkgfCBoZWFwWyhuICsgMykgfCAwXVxuICAgICkgfCAwXG4gIH1cblxuICAvLyAtLSBJbml0aWFsIEJ5dGUgSGFuZGxlcnNcblxuICBmdW5jdGlvbiBJTlRfUCAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgcHVzaEludChvY3RldCB8IDApXG5cbiAgICBvZmZzZXQgPSAob2Zmc2V0ICsgMSkgfCAwXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gVUlOVF9QXzggKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIGlmIChjaGVja09mZnNldCgxKSB8IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgcHVzaEludChoZWFwWyhvZmZzZXQgKyAxKSB8IDBdIHwgMClcblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyAyKSB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBVSU5UX1BfMTYgKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIGlmIChjaGVja09mZnNldCgyKSB8IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgcHVzaEludChcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDEpIHwgMCkgfCAwXG4gICAgKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDMpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFVJTlRfUF8zMiAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDQpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBwdXNoSW50MzIoXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyAxKSB8IDApIHwgMCxcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDMpIHwgMCkgfCAwXG4gICAgKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDUpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFVJTlRfUF82NCAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDgpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBwdXNoSW50NjQoXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyAxKSB8IDApIHwgMCxcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDMpIHwgMCkgfCAwLFxuICAgICAgcmVhZFVJbnQxNigob2Zmc2V0ICsgNSkgfCAwKSB8IDAsXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyA3KSB8IDApIHwgMFxuICAgIClcblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyA5KSB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBJTlRfTiAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgcHVzaEludCgoLTEgLSAoKG9jdGV0IC0gMzIpIHwgMCkpIHwgMClcblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyAxKSB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBVSU5UX05fOCAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDEpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBwdXNoSW50KFxuICAgICAgKC0xIC0gKGhlYXBbKG9mZnNldCArIDEpIHwgMF0gfCAwKSkgfCAwXG4gICAgKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDIpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFVJTlRfTl8xNiAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgdmFyIHZhbCA9IDBcblxuICAgIGlmIChjaGVja09mZnNldCgyKSB8IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgdmFsID0gcmVhZFVJbnQxNigob2Zmc2V0ICsgMSkgfCAwKSB8IDBcbiAgICBwdXNoSW50KCgtMSAtICh2YWwgfCAwKSkgfCAwKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDMpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFVJTlRfTl8zMiAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDQpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBwdXNoSW50MzJOZWcoXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyAxKSB8IDApIHwgMCxcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDMpIHwgMCkgfCAwXG4gICAgKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDUpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFVJTlRfTl82NCAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDgpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBwdXNoSW50NjROZWcoXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyAxKSB8IDApIHwgMCxcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDMpIHwgMCkgfCAwLFxuICAgICAgcmVhZFVJbnQxNigob2Zmc2V0ICsgNSkgfCAwKSB8IDAsXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyA3KSB8IDApIHwgMFxuICAgIClcblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyA5KSB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBCWVRFX1NUUklORyAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgdmFyIHN0YXJ0ID0gMFxuICAgIHZhciBlbmQgPSAwXG4gICAgdmFyIHN0ZXAgPSAwXG5cbiAgICBzdGVwID0gKG9jdGV0IC0gNjQpIHwgMFxuICAgIGlmIChjaGVja09mZnNldChzdGVwIHwgMCkgfCAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHN0YXJ0ID0gKG9mZnNldCArIDEpIHwgMFxuICAgIGVuZCA9ICgoKG9mZnNldCArIDEpIHwgMCkgKyAoc3RlcCB8IDApKSB8IDBcblxuICAgIHB1c2hCeXRlU3RyaW5nKHN0YXJ0IHwgMCwgZW5kIHwgMClcblxuICAgIG9mZnNldCA9IGVuZCB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBCWVRFX1NUUklOR184IChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICB2YXIgc3RhcnQgPSAwXG4gICAgdmFyIGVuZCA9IDBcbiAgICB2YXIgbGVuZ3RoID0gMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDEpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBsZW5ndGggPSBoZWFwWyhvZmZzZXQgKyAxKSB8IDBdIHwgMFxuICAgIHN0YXJ0ID0gKG9mZnNldCArIDIpIHwgMFxuICAgIGVuZCA9ICgoKG9mZnNldCArIDIpIHwgMCkgKyAobGVuZ3RoIHwgMCkpIHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KChsZW5ndGggKyAxKSB8IDApIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBwdXNoQnl0ZVN0cmluZyhzdGFydCB8IDAsIGVuZCB8IDApXG5cbiAgICBvZmZzZXQgPSBlbmQgfCAwXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gQllURV9TVFJJTkdfMTYgKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIHZhciBzdGFydCA9IDBcbiAgICB2YXIgZW5kID0gMFxuICAgIHZhciBsZW5ndGggPSAwXG5cbiAgICBpZiAoY2hlY2tPZmZzZXQoMikgfCAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIGxlbmd0aCA9IHJlYWRVSW50MTYoKG9mZnNldCArIDEpIHwgMCkgfCAwXG4gICAgc3RhcnQgPSAob2Zmc2V0ICsgMykgfCAwXG4gICAgZW5kID0gKCgob2Zmc2V0ICsgMykgfCAwKSArIChsZW5ndGggfCAwKSkgfCAwXG5cblxuICAgIGlmIChjaGVja09mZnNldCgobGVuZ3RoICsgMikgfCAwKSB8IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgcHVzaEJ5dGVTdHJpbmcoc3RhcnQgfCAwLCBlbmQgfCAwKVxuXG4gICAgb2Zmc2V0ID0gZW5kIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIEJZVEVfU1RSSU5HXzMyIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICB2YXIgc3RhcnQgPSAwXG4gICAgdmFyIGVuZCA9IDBcbiAgICB2YXIgbGVuZ3RoID0gMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDQpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBsZW5ndGggPSByZWFkVUludDMyKChvZmZzZXQgKyAxKSB8IDApIHwgMFxuICAgIHN0YXJ0ID0gKG9mZnNldCArIDUpIHwgMFxuICAgIGVuZCA9ICgoKG9mZnNldCArIDUpIHwgMCkgKyAobGVuZ3RoIHwgMCkpIHwgMFxuXG5cbiAgICBpZiAoY2hlY2tPZmZzZXQoKGxlbmd0aCArIDQpIHwgMCkgfCAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHB1c2hCeXRlU3RyaW5nKHN0YXJ0IHwgMCwgZW5kIHwgMClcblxuICAgIG9mZnNldCA9IGVuZCB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBCWVRFX1NUUklOR182NCAob2N0ZXQpIHtcbiAgICAvLyBOT1QgSU1QTEVNRU5URURcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgcmV0dXJuIDFcbiAgfVxuXG4gIGZ1bmN0aW9uIEJZVEVfU1RSSU5HX0JSRUFLIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBwdXNoQnl0ZVN0cmluZ1N0YXJ0KClcblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyAxKSB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBVVEY4X1NUUklORyAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgdmFyIHN0YXJ0ID0gMFxuICAgIHZhciBlbmQgPSAwXG4gICAgdmFyIHN0ZXAgPSAwXG5cbiAgICBzdGVwID0gKG9jdGV0IC0gOTYpIHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KHN0ZXAgfCAwKSB8IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgc3RhcnQgPSAob2Zmc2V0ICsgMSkgfCAwXG4gICAgZW5kID0gKCgob2Zmc2V0ICsgMSkgfCAwKSArIChzdGVwIHwgMCkpIHwgMFxuXG4gICAgcHVzaFV0ZjhTdHJpbmcoc3RhcnQgfCAwLCBlbmQgfCAwKVxuXG4gICAgb2Zmc2V0ID0gZW5kIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFVURjhfU1RSSU5HXzggKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIHZhciBzdGFydCA9IDBcbiAgICB2YXIgZW5kID0gMFxuICAgIHZhciBsZW5ndGggPSAwXG5cbiAgICBpZiAoY2hlY2tPZmZzZXQoMSkgfCAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIGxlbmd0aCA9IGhlYXBbKG9mZnNldCArIDEpIHwgMF0gfCAwXG4gICAgc3RhcnQgPSAob2Zmc2V0ICsgMikgfCAwXG4gICAgZW5kID0gKCgob2Zmc2V0ICsgMikgfCAwKSArIChsZW5ndGggfCAwKSkgfCAwXG5cbiAgICBpZiAoY2hlY2tPZmZzZXQoKGxlbmd0aCArIDEpIHwgMCkgfCAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHB1c2hVdGY4U3RyaW5nKHN0YXJ0IHwgMCwgZW5kIHwgMClcblxuICAgIG9mZnNldCA9IGVuZCB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBVVEY4X1NUUklOR18xNiAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgdmFyIHN0YXJ0ID0gMFxuICAgIHZhciBlbmQgPSAwXG4gICAgdmFyIGxlbmd0aCA9IDBcblxuICAgIGlmIChjaGVja09mZnNldCgyKSB8IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgbGVuZ3RoID0gcmVhZFVJbnQxNigob2Zmc2V0ICsgMSkgfCAwKSB8IDBcbiAgICBzdGFydCA9IChvZmZzZXQgKyAzKSB8IDBcbiAgICBlbmQgPSAoKChvZmZzZXQgKyAzKSB8IDApICsgKGxlbmd0aCB8IDApKSB8IDBcblxuICAgIGlmIChjaGVja09mZnNldCgobGVuZ3RoICsgMikgfCAwKSB8IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgcHVzaFV0ZjhTdHJpbmcoc3RhcnQgfCAwLCBlbmQgfCAwKVxuXG4gICAgb2Zmc2V0ID0gZW5kIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFVURjhfU1RSSU5HXzMyIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICB2YXIgc3RhcnQgPSAwXG4gICAgdmFyIGVuZCA9IDBcbiAgICB2YXIgbGVuZ3RoID0gMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDQpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBsZW5ndGggPSByZWFkVUludDMyKChvZmZzZXQgKyAxKSB8IDApIHwgMFxuICAgIHN0YXJ0ID0gKG9mZnNldCArIDUpIHwgMFxuICAgIGVuZCA9ICgoKG9mZnNldCArIDUpIHwgMCkgKyAobGVuZ3RoIHwgMCkpIHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KChsZW5ndGggKyA0KSB8IDApIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBwdXNoVXRmOFN0cmluZyhzdGFydCB8IDAsIGVuZCB8IDApXG5cbiAgICBvZmZzZXQgPSBlbmQgfCAwXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gVVRGOF9TVFJJTkdfNjQgKG9jdGV0KSB7XG4gICAgLy8gTk9UIElNUExFTUVOVEVEXG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIHJldHVybiAxXG4gIH1cblxuICBmdW5jdGlvbiBVVEY4X1NUUklOR19CUkVBSyAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgcHVzaFV0ZjhTdHJpbmdTdGFydCgpXG5cbiAgICBvZmZzZXQgPSAob2Zmc2V0ICsgMSkgfCAwXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gQVJSQVkgKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIHB1c2hBcnJheVN0YXJ0Rml4ZWQoKG9jdGV0IC0gMTI4KSB8IDApXG5cbiAgICBvZmZzZXQgPSAob2Zmc2V0ICsgMSkgfCAwXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gQVJSQVlfOCAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDEpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBwdXNoQXJyYXlTdGFydEZpeGVkKGhlYXBbKG9mZnNldCArIDEpIHwgMF0gfCAwKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDIpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIEFSUkFZXzE2IChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBpZiAoY2hlY2tPZmZzZXQoMikgfCAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHB1c2hBcnJheVN0YXJ0Rml4ZWQoXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyAxKSB8IDApIHwgMFxuICAgIClcblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyAzKSB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBBUlJBWV8zMiAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDQpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBwdXNoQXJyYXlTdGFydEZpeGVkMzIoXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyAxKSB8IDApIHwgMCxcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDMpIHwgMCkgfCAwXG4gICAgKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDUpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIEFSUkFZXzY0IChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBpZiAoY2hlY2tPZmZzZXQoOCkgfCAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHB1c2hBcnJheVN0YXJ0Rml4ZWQ2NChcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDEpIHwgMCkgfCAwLFxuICAgICAgcmVhZFVJbnQxNigob2Zmc2V0ICsgMykgfCAwKSB8IDAsXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyA1KSB8IDApIHwgMCxcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDcpIHwgMCkgfCAwXG4gICAgKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDkpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIEFSUkFZX0JSRUFLIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBwdXNoQXJyYXlTdGFydCgpXG5cbiAgICBvZmZzZXQgPSAob2Zmc2V0ICsgMSkgfCAwXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gTUFQIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICB2YXIgc3RlcCA9IDBcblxuICAgIHN0ZXAgPSAob2N0ZXQgLSAxNjApIHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KHN0ZXAgfCAwKSB8IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgcHVzaE9iamVjdFN0YXJ0Rml4ZWQoc3RlcCB8IDApXG5cbiAgICBvZmZzZXQgPSAob2Zmc2V0ICsgMSkgfCAwXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gTUFQXzggKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIGlmIChjaGVja09mZnNldCgxKSB8IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgcHVzaE9iamVjdFN0YXJ0Rml4ZWQoaGVhcFsob2Zmc2V0ICsgMSkgfCAwXSB8IDApXG5cbiAgICBvZmZzZXQgPSAob2Zmc2V0ICsgMikgfCAwXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gTUFQXzE2IChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBpZiAoY2hlY2tPZmZzZXQoMikgfCAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHB1c2hPYmplY3RTdGFydEZpeGVkKFxuICAgICAgcmVhZFVJbnQxNigob2Zmc2V0ICsgMSkgfCAwKSB8IDBcbiAgICApXG5cbiAgICBvZmZzZXQgPSAob2Zmc2V0ICsgMykgfCAwXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gTUFQXzMyIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBpZiAoY2hlY2tPZmZzZXQoNCkgfCAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHB1c2hPYmplY3RTdGFydEZpeGVkMzIoXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyAxKSB8IDApIHwgMCxcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDMpIHwgMCkgfCAwXG4gICAgKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDUpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIE1BUF82NCAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDgpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBwdXNoT2JqZWN0U3RhcnRGaXhlZDY0KFxuICAgICAgcmVhZFVJbnQxNigob2Zmc2V0ICsgMSkgfCAwKSB8IDAsXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyAzKSB8IDApIHwgMCxcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDUpIHwgMCkgfCAwLFxuICAgICAgcmVhZFVJbnQxNigob2Zmc2V0ICsgNykgfCAwKSB8IDBcbiAgICApXG5cbiAgICBvZmZzZXQgPSAob2Zmc2V0ICsgOSkgfCAwXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gTUFQX0JSRUFLIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBwdXNoT2JqZWN0U3RhcnQoKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDEpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFRBR19LTk9XTiAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgcHVzaFRhZ1N0YXJ0KChvY3RldCAtIDE5MnwgMCkgfCAwKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDEgfCAwKVxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFRBR19CSUdOVU1fUE9TIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBwdXNoVGFnU3RhcnQob2N0ZXQgfCAwKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDEgfCAwKVxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFRBR19CSUdOVU1fTkVHIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBwdXNoVGFnU3RhcnQob2N0ZXQgfCAwKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDEgfCAwKVxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFRBR19GUkFDIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBwdXNoVGFnU3RhcnQob2N0ZXQgfCAwKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDEgfCAwKVxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFRBR19CSUdOVU1fRkxPQVQgKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIHB1c2hUYWdTdGFydChvY3RldCB8IDApXG5cbiAgICBvZmZzZXQgPSAob2Zmc2V0ICsgMSB8IDApXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gVEFHX1VOQVNTSUdORUQgKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIHB1c2hUYWdTdGFydCgob2N0ZXQgLSAxOTJ8IDApIHwgMClcblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyAxIHwgMClcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBUQUdfQkFTRTY0X1VSTCAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgcHVzaFRhZ1N0YXJ0KG9jdGV0IHwgMClcblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyAxIHwgMClcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBUQUdfQkFTRTY0IChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBwdXNoVGFnU3RhcnQob2N0ZXQgfCAwKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDEgfCAwKVxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFRBR19CQVNFMTYgKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIHB1c2hUYWdTdGFydChvY3RldCB8IDApXG5cbiAgICBvZmZzZXQgPSAob2Zmc2V0ICsgMSB8IDApXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gVEFHX01PUkVfMSAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDEpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBwdXNoVGFnU3RhcnQoaGVhcFsob2Zmc2V0ICsgMSkgfCAwXSB8IDApXG5cbiAgICBvZmZzZXQgPSAob2Zmc2V0ICsgMiB8IDApXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gVEFHX01PUkVfMiAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgaWYgKGNoZWNrT2Zmc2V0KDIpIHwgMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBwdXNoVGFnU3RhcnQoXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyAxKSB8IDApIHwgMFxuICAgIClcblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyAzIHwgMClcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBUQUdfTU9SRV80IChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBpZiAoY2hlY2tPZmZzZXQoNCkgfCAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHB1c2hUYWdTdGFydDQoXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyAxKSB8IDApIHwgMCxcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDMpIHwgMCkgfCAwXG4gICAgKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDUgfCAwKVxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFRBR19NT1JFXzggKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIGlmIChjaGVja09mZnNldCg4KSB8IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgcHVzaFRhZ1N0YXJ0OChcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDEpIHwgMCkgfCAwLFxuICAgICAgcmVhZFVJbnQxNigob2Zmc2V0ICsgMykgfCAwKSB8IDAsXG4gICAgICByZWFkVUludDE2KChvZmZzZXQgKyA1KSB8IDApIHwgMCxcbiAgICAgIHJlYWRVSW50MTYoKG9mZnNldCArIDcpIHwgMCkgfCAwXG4gICAgKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDkgfCAwKVxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFNJTVBMRV9VTkFTU0lHTkVEIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBwdXNoU2ltcGxlVW5hc3NpZ25lZCgoKG9jdGV0IHwgMCkgLSAyMjQpIHwgMClcblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyAxKSB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBTSU1QTEVfRkFMU0UgKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIHB1c2hGYWxzZSgpXG5cbiAgICBvZmZzZXQgPSAob2Zmc2V0ICsgMSkgfCAwXG5cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgZnVuY3Rpb24gU0lNUExFX1RSVUUgKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIHB1c2hUcnVlKClcblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyAxKSB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBTSU1QTEVfTlVMTCAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgcHVzaE51bGwoKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDEpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFNJTVBMRV9VTkRFRklORUQgKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIHB1c2hVbmRlZmluZWQoKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDEpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFNJTVBMRV9CWVRFIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBpZiAoY2hlY2tPZmZzZXQoMSkgfCAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHB1c2hTaW1wbGVVbmFzc2lnbmVkKGhlYXBbKG9mZnNldCArIDEpIHwgMF0gfCAwKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDIpICB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBTSU1QTEVfRkxPQVRfSEFMRiAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgdmFyIGYgPSAwXG4gICAgdmFyIGcgPSAwXG4gICAgdmFyIHNpZ24gPSAxLjBcbiAgICB2YXIgZXhwID0gMC4wXG4gICAgdmFyIG1hbnQgPSAwLjBcbiAgICB2YXIgciA9IDAuMFxuICAgIGlmIChjaGVja09mZnNldCgyKSB8IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgZiA9IGhlYXBbKG9mZnNldCArIDEpIHwgMF0gfCAwXG4gICAgZyA9IGhlYXBbKG9mZnNldCArIDIpIHwgMF0gfCAwXG5cbiAgICBpZiAoKGYgfCAwKSAmIDB4ODApIHtcbiAgICAgIHNpZ24gPSAtMS4wXG4gICAgfVxuXG4gICAgZXhwID0gKygoKGYgfCAwKSAmIDB4N0MpID4+IDIpXG4gICAgbWFudCA9ICsoKCgoZiB8IDApICYgMHgwMykgPDwgOCkgfCBnKVxuXG4gICAgaWYgKCtleHAgPT0gMC4wKSB7XG4gICAgICBwdXNoRmxvYXQoKyhcbiAgICAgICAgKCtzaWduKSAqICs1Ljk2MDQ2NDQ3NzUzOTA2MjVlLTggKiAoK21hbnQpXG4gICAgICApKVxuICAgIH0gZWxzZSBpZiAoK2V4cCA9PSAzMS4wKSB7XG4gICAgICBpZiAoK3NpZ24gPT0gMS4wKSB7XG4gICAgICAgIGlmICgrbWFudCA+IDAuMCkge1xuICAgICAgICAgIHB1c2hOYU4oKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHB1c2hJbmZpbml0eSgpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICgrbWFudCA+IDAuMCkge1xuICAgICAgICAgIHB1c2hOYU5OZWcoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHB1c2hJbmZpbml0eU5lZygpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcHVzaEZsb2F0KCsoXG4gICAgICAgICtzaWduICogcG93KCsyLCArKCtleHAgLSAyNS4wKSkgKiArKDEwMjQuMCArIG1hbnQpXG4gICAgICApKVxuICAgIH1cblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyAzKSB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBTSU1QTEVfRkxPQVRfU0lOR0xFIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBpZiAoY2hlY2tPZmZzZXQoNCkgfCAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHB1c2hGbG9hdFNpbmdsZShcbiAgICAgIGhlYXBbKG9mZnNldCArIDEpIHwgMF0gfCAwLFxuICAgICAgaGVhcFsob2Zmc2V0ICsgMikgfCAwXSB8IDAsXG4gICAgICBoZWFwWyhvZmZzZXQgKyAzKSB8IDBdIHwgMCxcbiAgICAgIGhlYXBbKG9mZnNldCArIDQpIHwgMF0gfCAwXG4gICAgKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDUpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIGZ1bmN0aW9uIFNJTVBMRV9GTE9BVF9ET1VCTEUgKG9jdGV0KSB7XG4gICAgb2N0ZXQgPSBvY3RldCB8IDBcblxuICAgIGlmIChjaGVja09mZnNldCg4KSB8IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgcHVzaEZsb2F0RG91YmxlKFxuICAgICAgaGVhcFsob2Zmc2V0ICsgMSkgfCAwXSB8IDAsXG4gICAgICBoZWFwWyhvZmZzZXQgKyAyKSB8IDBdIHwgMCxcbiAgICAgIGhlYXBbKG9mZnNldCArIDMpIHwgMF0gfCAwLFxuICAgICAgaGVhcFsob2Zmc2V0ICsgNCkgfCAwXSB8IDAsXG4gICAgICBoZWFwWyhvZmZzZXQgKyA1KSB8IDBdIHwgMCxcbiAgICAgIGhlYXBbKG9mZnNldCArIDYpIHwgMF0gfCAwLFxuICAgICAgaGVhcFsob2Zmc2V0ICsgNykgfCAwXSB8IDAsXG4gICAgICBoZWFwWyhvZmZzZXQgKyA4KSB8IDBdIHwgMFxuICAgIClcblxuICAgIG9mZnNldCA9IChvZmZzZXQgKyA5KSB8IDBcblxuICAgIHJldHVybiAwXG4gIH1cblxuICBmdW5jdGlvbiBFUlJPUiAob2N0ZXQpIHtcbiAgICBvY3RldCA9IG9jdGV0IHwgMFxuXG4gICAgcmV0dXJuIDFcbiAgfVxuXG4gIGZ1bmN0aW9uIEJSRUFLIChvY3RldCkge1xuICAgIG9jdGV0ID0gb2N0ZXQgfCAwXG5cbiAgICBwdXNoQnJlYWsoKVxuXG4gICAgb2Zmc2V0ID0gKG9mZnNldCArIDEpIHwgMFxuXG4gICAgcmV0dXJuIDBcbiAgfVxuXG4gIC8vIC0tIEp1bXAgVGFibGVcblxuICB2YXIganVtcFRhYmxlID0gW1xuICAgIC8vIEludGVnZXIgMHgwMC4uMHgxNyAoMC4uMjMpXG4gICAgSU5UX1AsIC8vIDB4MDBcbiAgICBJTlRfUCwgLy8gMHgwMVxuICAgIElOVF9QLCAvLyAweDAyXG4gICAgSU5UX1AsIC8vIDB4MDNcbiAgICBJTlRfUCwgLy8gMHgwNFxuICAgIElOVF9QLCAvLyAweDA1XG4gICAgSU5UX1AsIC8vIDB4MDZcbiAgICBJTlRfUCwgLy8gMHgwN1xuICAgIElOVF9QLCAvLyAweDA4XG4gICAgSU5UX1AsIC8vIDB4MDlcbiAgICBJTlRfUCwgLy8gMHgwQVxuICAgIElOVF9QLCAvLyAweDBCXG4gICAgSU5UX1AsIC8vIDB4MENcbiAgICBJTlRfUCwgLy8gMHgwRFxuICAgIElOVF9QLCAvLyAweDBFXG4gICAgSU5UX1AsIC8vIDB4MEZcbiAgICBJTlRfUCwgLy8gMHgxMFxuICAgIElOVF9QLCAvLyAweDExXG4gICAgSU5UX1AsIC8vIDB4MTJcbiAgICBJTlRfUCwgLy8gMHgxM1xuICAgIElOVF9QLCAvLyAweDE0XG4gICAgSU5UX1AsIC8vIDB4MTVcbiAgICBJTlRfUCwgLy8gMHgxNlxuICAgIElOVF9QLCAvLyAweDE3XG4gICAgLy8gVW5zaWduZWQgaW50ZWdlciAob25lLWJ5dGUgdWludDhfdCBmb2xsb3dzKVxuICAgIFVJTlRfUF84LCAvLyAweDE4XG4gICAgLy8gVW5zaWduZWQgaW50ZWdlciAodHdvLWJ5dGUgdWludDE2X3QgZm9sbG93cylcbiAgICBVSU5UX1BfMTYsIC8vIDB4MTlcbiAgICAvLyBVbnNpZ25lZCBpbnRlZ2VyIChmb3VyLWJ5dGUgdWludDMyX3QgZm9sbG93cylcbiAgICBVSU5UX1BfMzIsIC8vIDB4MWFcbiAgICAvLyBVbnNpZ25lZCBpbnRlZ2VyIChlaWdodC1ieXRlIHVpbnQ2NF90IGZvbGxvd3MpXG4gICAgVUlOVF9QXzY0LCAvLyAweDFiXG4gICAgRVJST1IsIC8vIDB4MWNcbiAgICBFUlJPUiwgLy8gMHgxZFxuICAgIEVSUk9SLCAvLyAweDFlXG4gICAgRVJST1IsIC8vIDB4MWZcbiAgICAvLyBOZWdhdGl2ZSBpbnRlZ2VyIC0xLTB4MDAuLi0xLTB4MTcgKC0xLi4tMjQpXG4gICAgSU5UX04sIC8vIDB4MjBcbiAgICBJTlRfTiwgLy8gMHgyMVxuICAgIElOVF9OLCAvLyAweDIyXG4gICAgSU5UX04sIC8vIDB4MjNcbiAgICBJTlRfTiwgLy8gMHgyNFxuICAgIElOVF9OLCAvLyAweDI1XG4gICAgSU5UX04sIC8vIDB4MjZcbiAgICBJTlRfTiwgLy8gMHgyN1xuICAgIElOVF9OLCAvLyAweDI4XG4gICAgSU5UX04sIC8vIDB4MjlcbiAgICBJTlRfTiwgLy8gMHgyQVxuICAgIElOVF9OLCAvLyAweDJCXG4gICAgSU5UX04sIC8vIDB4MkNcbiAgICBJTlRfTiwgLy8gMHgyRFxuICAgIElOVF9OLCAvLyAweDJFXG4gICAgSU5UX04sIC8vIDB4MkZcbiAgICBJTlRfTiwgLy8gMHgzMFxuICAgIElOVF9OLCAvLyAweDMxXG4gICAgSU5UX04sIC8vIDB4MzJcbiAgICBJTlRfTiwgLy8gMHgzM1xuICAgIElOVF9OLCAvLyAweDM0XG4gICAgSU5UX04sIC8vIDB4MzVcbiAgICBJTlRfTiwgLy8gMHgzNlxuICAgIElOVF9OLCAvLyAweDM3XG4gICAgLy8gTmVnYXRpdmUgaW50ZWdlciAtMS1uIChvbmUtYnl0ZSB1aW50OF90IGZvciBuIGZvbGxvd3MpXG4gICAgVUlOVF9OXzgsIC8vIDB4MzhcbiAgICAvLyBOZWdhdGl2ZSBpbnRlZ2VyIC0xLW4gKHR3by1ieXRlIHVpbnQxNl90IGZvciBuIGZvbGxvd3MpXG4gICAgVUlOVF9OXzE2LCAvLyAweDM5XG4gICAgLy8gTmVnYXRpdmUgaW50ZWdlciAtMS1uIChmb3VyLWJ5dGUgdWludDMyX3QgZm9yIG5mb2xsb3dzKVxuICAgIFVJTlRfTl8zMiwgLy8gMHgzYVxuICAgIC8vIE5lZ2F0aXZlIGludGVnZXIgLTEtbiAoZWlnaHQtYnl0ZSB1aW50NjRfdCBmb3IgbiBmb2xsb3dzKVxuICAgIFVJTlRfTl82NCwgLy8gMHgzYlxuICAgIEVSUk9SLCAvLyAweDNjXG4gICAgRVJST1IsIC8vIDB4M2RcbiAgICBFUlJPUiwgLy8gMHgzZVxuICAgIEVSUk9SLCAvLyAweDNmXG4gICAgLy8gYnl0ZSBzdHJpbmcgKDB4MDAuLjB4MTcgYnl0ZXMgZm9sbG93KVxuICAgIEJZVEVfU1RSSU5HLCAvLyAweDQwXG4gICAgQllURV9TVFJJTkcsIC8vIDB4NDFcbiAgICBCWVRFX1NUUklORywgLy8gMHg0MlxuICAgIEJZVEVfU1RSSU5HLCAvLyAweDQzXG4gICAgQllURV9TVFJJTkcsIC8vIDB4NDRcbiAgICBCWVRFX1NUUklORywgLy8gMHg0NVxuICAgIEJZVEVfU1RSSU5HLCAvLyAweDQ2XG4gICAgQllURV9TVFJJTkcsIC8vIDB4NDdcbiAgICBCWVRFX1NUUklORywgLy8gMHg0OFxuICAgIEJZVEVfU1RSSU5HLCAvLyAweDQ5XG4gICAgQllURV9TVFJJTkcsIC8vIDB4NEFcbiAgICBCWVRFX1NUUklORywgLy8gMHg0QlxuICAgIEJZVEVfU1RSSU5HLCAvLyAweDRDXG4gICAgQllURV9TVFJJTkcsIC8vIDB4NERcbiAgICBCWVRFX1NUUklORywgLy8gMHg0RVxuICAgIEJZVEVfU1RSSU5HLCAvLyAweDRGXG4gICAgQllURV9TVFJJTkcsIC8vIDB4NTBcbiAgICBCWVRFX1NUUklORywgLy8gMHg1MVxuICAgIEJZVEVfU1RSSU5HLCAvLyAweDUyXG4gICAgQllURV9TVFJJTkcsIC8vIDB4NTNcbiAgICBCWVRFX1NUUklORywgLy8gMHg1NFxuICAgIEJZVEVfU1RSSU5HLCAvLyAweDU1XG4gICAgQllURV9TVFJJTkcsIC8vIDB4NTZcbiAgICBCWVRFX1NUUklORywgLy8gMHg1N1xuICAgIC8vIGJ5dGUgc3RyaW5nIChvbmUtYnl0ZSB1aW50OF90IGZvciBuLCBhbmQgdGhlbiBuIGJ5dGVzIGZvbGxvdylcbiAgICBCWVRFX1NUUklOR184LCAvLyAweDU4XG4gICAgLy8gYnl0ZSBzdHJpbmcgKHR3by1ieXRlIHVpbnQxNl90IGZvciBuLCBhbmQgdGhlbiBuIGJ5dGVzIGZvbGxvdylcbiAgICBCWVRFX1NUUklOR18xNiwgLy8gMHg1OVxuICAgIC8vIGJ5dGUgc3RyaW5nIChmb3VyLWJ5dGUgdWludDMyX3QgZm9yIG4sIGFuZCB0aGVuIG4gYnl0ZXMgZm9sbG93KVxuICAgIEJZVEVfU1RSSU5HXzMyLCAvLyAweDVhXG4gICAgLy8gYnl0ZSBzdHJpbmcgKGVpZ2h0LWJ5dGUgdWludDY0X3QgZm9yIG4sIGFuZCB0aGVuIG4gYnl0ZXMgZm9sbG93KVxuICAgIEJZVEVfU1RSSU5HXzY0LCAvLyAweDViXG4gICAgRVJST1IsIC8vIDB4NWNcbiAgICBFUlJPUiwgLy8gMHg1ZFxuICAgIEVSUk9SLCAvLyAweDVlXG4gICAgLy8gYnl0ZSBzdHJpbmcsIGJ5dGUgc3RyaW5ncyBmb2xsb3csIHRlcm1pbmF0ZWQgYnkgXCJicmVha1wiXG4gICAgQllURV9TVFJJTkdfQlJFQUssIC8vIDB4NWZcbiAgICAvLyBVVEYtOCBzdHJpbmcgKDB4MDAuLjB4MTcgYnl0ZXMgZm9sbG93KVxuICAgIFVURjhfU1RSSU5HLCAvLyAweDYwXG4gICAgVVRGOF9TVFJJTkcsIC8vIDB4NjFcbiAgICBVVEY4X1NUUklORywgLy8gMHg2MlxuICAgIFVURjhfU1RSSU5HLCAvLyAweDYzXG4gICAgVVRGOF9TVFJJTkcsIC8vIDB4NjRcbiAgICBVVEY4X1NUUklORywgLy8gMHg2NVxuICAgIFVURjhfU1RSSU5HLCAvLyAweDY2XG4gICAgVVRGOF9TVFJJTkcsIC8vIDB4NjdcbiAgICBVVEY4X1NUUklORywgLy8gMHg2OFxuICAgIFVURjhfU1RSSU5HLCAvLyAweDY5XG4gICAgVVRGOF9TVFJJTkcsIC8vIDB4NkFcbiAgICBVVEY4X1NUUklORywgLy8gMHg2QlxuICAgIFVURjhfU1RSSU5HLCAvLyAweDZDXG4gICAgVVRGOF9TVFJJTkcsIC8vIDB4NkRcbiAgICBVVEY4X1NUUklORywgLy8gMHg2RVxuICAgIFVURjhfU1RSSU5HLCAvLyAweDZGXG4gICAgVVRGOF9TVFJJTkcsIC8vIDB4NzBcbiAgICBVVEY4X1NUUklORywgLy8gMHg3MVxuICAgIFVURjhfU1RSSU5HLCAvLyAweDcyXG4gICAgVVRGOF9TVFJJTkcsIC8vIDB4NzNcbiAgICBVVEY4X1NUUklORywgLy8gMHg3NFxuICAgIFVURjhfU1RSSU5HLCAvLyAweDc1XG4gICAgVVRGOF9TVFJJTkcsIC8vIDB4NzZcbiAgICBVVEY4X1NUUklORywgLy8gMHg3N1xuICAgIC8vIFVURi04IHN0cmluZyAob25lLWJ5dGUgdWludDhfdCBmb3IgbiwgYW5kIHRoZW4gbiBieXRlcyBmb2xsb3cpXG4gICAgVVRGOF9TVFJJTkdfOCwgLy8gMHg3OFxuICAgIC8vIFVURi04IHN0cmluZyAodHdvLWJ5dGUgdWludDE2X3QgZm9yIG4sIGFuZCB0aGVuIG4gYnl0ZXMgZm9sbG93KVxuICAgIFVURjhfU1RSSU5HXzE2LCAvLyAweDc5XG4gICAgLy8gVVRGLTggc3RyaW5nIChmb3VyLWJ5dGUgdWludDMyX3QgZm9yIG4sIGFuZCB0aGVuIG4gYnl0ZXMgZm9sbG93KVxuICAgIFVURjhfU1RSSU5HXzMyLCAvLyAweDdhXG4gICAgLy8gVVRGLTggc3RyaW5nIChlaWdodC1ieXRlIHVpbnQ2NF90IGZvciBuLCBhbmQgdGhlbiBuIGJ5dGVzIGZvbGxvdylcbiAgICBVVEY4X1NUUklOR182NCwgLy8gMHg3YlxuICAgIC8vIFVURi04IHN0cmluZywgVVRGLTggc3RyaW5ncyBmb2xsb3csIHRlcm1pbmF0ZWQgYnkgXCJicmVha1wiXG4gICAgRVJST1IsIC8vIDB4N2NcbiAgICBFUlJPUiwgLy8gMHg3ZFxuICAgIEVSUk9SLCAvLyAweDdlXG4gICAgVVRGOF9TVFJJTkdfQlJFQUssIC8vIDB4N2ZcbiAgICAvLyBhcnJheSAoMHgwMC4uMHgxNyBkYXRhIGl0ZW1zIGZvbGxvdylcbiAgICBBUlJBWSwgLy8gMHg4MFxuICAgIEFSUkFZLCAvLyAweDgxXG4gICAgQVJSQVksIC8vIDB4ODJcbiAgICBBUlJBWSwgLy8gMHg4M1xuICAgIEFSUkFZLCAvLyAweDg0XG4gICAgQVJSQVksIC8vIDB4ODVcbiAgICBBUlJBWSwgLy8gMHg4NlxuICAgIEFSUkFZLCAvLyAweDg3XG4gICAgQVJSQVksIC8vIDB4ODhcbiAgICBBUlJBWSwgLy8gMHg4OVxuICAgIEFSUkFZLCAvLyAweDhBXG4gICAgQVJSQVksIC8vIDB4OEJcbiAgICBBUlJBWSwgLy8gMHg4Q1xuICAgIEFSUkFZLCAvLyAweDhEXG4gICAgQVJSQVksIC8vIDB4OEVcbiAgICBBUlJBWSwgLy8gMHg4RlxuICAgIEFSUkFZLCAvLyAweDkwXG4gICAgQVJSQVksIC8vIDB4OTFcbiAgICBBUlJBWSwgLy8gMHg5MlxuICAgIEFSUkFZLCAvLyAweDkzXG4gICAgQVJSQVksIC8vIDB4OTRcbiAgICBBUlJBWSwgLy8gMHg5NVxuICAgIEFSUkFZLCAvLyAweDk2XG4gICAgQVJSQVksIC8vIDB4OTdcbiAgICAvLyBhcnJheSAob25lLWJ5dGUgdWludDhfdCBmbywgYW5kIHRoZW4gbiBkYXRhIGl0ZW1zIGZvbGxvdylcbiAgICBBUlJBWV84LCAvLyAweDk4XG4gICAgLy8gYXJyYXkgKHR3by1ieXRlIHVpbnQxNl90IGZvciBuLCBhbmQgdGhlbiBuIGRhdGEgaXRlbXMgZm9sbG93KVxuICAgIEFSUkFZXzE2LCAvLyAweDk5XG4gICAgLy8gYXJyYXkgKGZvdXItYnl0ZSB1aW50MzJfdCBmb3IgbiwgYW5kIHRoZW4gbiBkYXRhIGl0ZW1zIGZvbGxvdylcbiAgICBBUlJBWV8zMiwgLy8gMHg5YVxuICAgIC8vIGFycmF5IChlaWdodC1ieXRlIHVpbnQ2NF90IGZvciBuLCBhbmQgdGhlbiBuIGRhdGEgaXRlbXMgZm9sbG93KVxuICAgIEFSUkFZXzY0LCAvLyAweDliXG4gICAgLy8gYXJyYXksIGRhdGEgaXRlbXMgZm9sbG93LCB0ZXJtaW5hdGVkIGJ5IFwiYnJlYWtcIlxuICAgIEVSUk9SLCAvLyAweDljXG4gICAgRVJST1IsIC8vIDB4OWRcbiAgICBFUlJPUiwgLy8gMHg5ZVxuICAgIEFSUkFZX0JSRUFLLCAvLyAweDlmXG4gICAgLy8gbWFwICgweDAwLi4weDE3IHBhaXJzIG9mIGRhdGEgaXRlbXMgZm9sbG93KVxuICAgIE1BUCwgLy8gMHhhMFxuICAgIE1BUCwgLy8gMHhhMVxuICAgIE1BUCwgLy8gMHhhMlxuICAgIE1BUCwgLy8gMHhhM1xuICAgIE1BUCwgLy8gMHhhNFxuICAgIE1BUCwgLy8gMHhhNVxuICAgIE1BUCwgLy8gMHhhNlxuICAgIE1BUCwgLy8gMHhhN1xuICAgIE1BUCwgLy8gMHhhOFxuICAgIE1BUCwgLy8gMHhhOVxuICAgIE1BUCwgLy8gMHhhQVxuICAgIE1BUCwgLy8gMHhhQlxuICAgIE1BUCwgLy8gMHhhQ1xuICAgIE1BUCwgLy8gMHhhRFxuICAgIE1BUCwgLy8gMHhhRVxuICAgIE1BUCwgLy8gMHhhRlxuICAgIE1BUCwgLy8gMHhiMFxuICAgIE1BUCwgLy8gMHhiMVxuICAgIE1BUCwgLy8gMHhiMlxuICAgIE1BUCwgLy8gMHhiM1xuICAgIE1BUCwgLy8gMHhiNFxuICAgIE1BUCwgLy8gMHhiNVxuICAgIE1BUCwgLy8gMHhiNlxuICAgIE1BUCwgLy8gMHhiN1xuICAgIC8vIG1hcCAob25lLWJ5dGUgdWludDhfdCBmb3IgbiwgYW5kIHRoZW4gbiBwYWlycyBvZiBkYXRhIGl0ZW1zIGZvbGxvdylcbiAgICBNQVBfOCwgLy8gMHhiOFxuICAgIC8vIG1hcCAodHdvLWJ5dGUgdWludDE2X3QgZm9yIG4sIGFuZCB0aGVuIG4gcGFpcnMgb2YgZGF0YSBpdGVtcyBmb2xsb3cpXG4gICAgTUFQXzE2LCAvLyAweGI5XG4gICAgLy8gbWFwIChmb3VyLWJ5dGUgdWludDMyX3QgZm9yIG4sIGFuZCB0aGVuIG4gcGFpcnMgb2YgZGF0YSBpdGVtcyBmb2xsb3cpXG4gICAgTUFQXzMyLCAvLyAweGJhXG4gICAgLy8gbWFwIChlaWdodC1ieXRlIHVpbnQ2NF90IGZvciBuLCBhbmQgdGhlbiBuIHBhaXJzIG9mIGRhdGEgaXRlbXMgZm9sbG93KVxuICAgIE1BUF82NCwgLy8gMHhiYlxuICAgIEVSUk9SLCAvLyAweGJjXG4gICAgRVJST1IsIC8vIDB4YmRcbiAgICBFUlJPUiwgLy8gMHhiZVxuICAgIC8vIG1hcCwgcGFpcnMgb2YgZGF0YSBpdGVtcyBmb2xsb3csIHRlcm1pbmF0ZWQgYnkgXCJicmVha1wiXG4gICAgTUFQX0JSRUFLLCAvLyAweGJmXG4gICAgLy8gVGV4dC1iYXNlZCBkYXRlL3RpbWUgKGRhdGEgaXRlbSBmb2xsb3dzOyBzZWUgU2VjdGlvbiAyLjQuMSlcbiAgICBUQUdfS05PV04sIC8vIDB4YzBcbiAgICAvLyBFcG9jaC1iYXNlZCBkYXRlL3RpbWUgKGRhdGEgaXRlbSBmb2xsb3dzOyBzZWUgU2VjdGlvbiAyLjQuMSlcbiAgICBUQUdfS05PV04sIC8vIDB4YzFcbiAgICAvLyBQb3NpdGl2ZSBiaWdudW0gKGRhdGEgaXRlbSBcImJ5dGUgc3RyaW5nXCIgZm9sbG93cylcbiAgICBUQUdfS05PV04sIC8vIDB4YzJcbiAgICAvLyBOZWdhdGl2ZSBiaWdudW0gKGRhdGEgaXRlbSBcImJ5dGUgc3RyaW5nXCIgZm9sbG93cylcbiAgICBUQUdfS05PV04sIC8vIDB4YzNcbiAgICAvLyBEZWNpbWFsIEZyYWN0aW9uIChkYXRhIGl0ZW0gXCJhcnJheVwiIGZvbGxvd3M7IHNlZSBTZWN0aW9uIDIuNC4zKVxuICAgIFRBR19LTk9XTiwgLy8gMHhjNFxuICAgIC8vIEJpZ2Zsb2F0IChkYXRhIGl0ZW0gXCJhcnJheVwiIGZvbGxvd3M7IHNlZSBTZWN0aW9uIDIuNC4zKVxuICAgIFRBR19LTk9XTiwgLy8gMHhjNVxuICAgIC8vICh0YWdnZWQgaXRlbSlcbiAgICBUQUdfVU5BU1NJR05FRCwgLy8gMHhjNlxuICAgIFRBR19VTkFTU0lHTkVELCAvLyAweGM3XG4gICAgVEFHX1VOQVNTSUdORUQsIC8vIDB4YzhcbiAgICBUQUdfVU5BU1NJR05FRCwgLy8gMHhjOVxuICAgIFRBR19VTkFTU0lHTkVELCAvLyAweGNhXG4gICAgVEFHX1VOQVNTSUdORUQsIC8vIDB4Y2JcbiAgICBUQUdfVU5BU1NJR05FRCwgLy8gMHhjY1xuICAgIFRBR19VTkFTU0lHTkVELCAvLyAweGNkXG4gICAgVEFHX1VOQVNTSUdORUQsIC8vIDB4Y2VcbiAgICBUQUdfVU5BU1NJR05FRCwgLy8gMHhjZlxuICAgIFRBR19VTkFTU0lHTkVELCAvLyAweGQwXG4gICAgVEFHX1VOQVNTSUdORUQsIC8vIDB4ZDFcbiAgICBUQUdfVU5BU1NJR05FRCwgLy8gMHhkMlxuICAgIFRBR19VTkFTU0lHTkVELCAvLyAweGQzXG4gICAgVEFHX1VOQVNTSUdORUQsIC8vIDB4ZDRcbiAgICAvLyBFeHBlY3RlZCBDb252ZXJzaW9uIChkYXRhIGl0ZW0gZm9sbG93czsgc2VlIFNlY3Rpb24gMi40LjQuMilcbiAgICBUQUdfVU5BU1NJR05FRCwgLy8gMHhkNVxuICAgIFRBR19VTkFTU0lHTkVELCAvLyAweGQ2XG4gICAgVEFHX1VOQVNTSUdORUQsIC8vIDB4ZDdcbiAgICAvLyAobW9yZSB0YWdnZWQgaXRlbXMsIDEvMi80LzggYnl0ZXMgYW5kIHRoZW4gYSBkYXRhIGl0ZW0gZm9sbG93KVxuICAgIFRBR19NT1JFXzEsIC8vIDB4ZDhcbiAgICBUQUdfTU9SRV8yLCAvLyAweGQ5XG4gICAgVEFHX01PUkVfNCwgLy8gMHhkYVxuICAgIFRBR19NT1JFXzgsIC8vIDB4ZGJcbiAgICBFUlJPUiwgLy8gMHhkY1xuICAgIEVSUk9SLCAvLyAweGRkXG4gICAgRVJST1IsIC8vIDB4ZGVcbiAgICBFUlJPUiwgLy8gMHhkZlxuICAgIC8vIChzaW1wbGUgdmFsdWUpXG4gICAgU0lNUExFX1VOQVNTSUdORUQsIC8vIDB4ZTBcbiAgICBTSU1QTEVfVU5BU1NJR05FRCwgLy8gMHhlMVxuICAgIFNJTVBMRV9VTkFTU0lHTkVELCAvLyAweGUyXG4gICAgU0lNUExFX1VOQVNTSUdORUQsIC8vIDB4ZTNcbiAgICBTSU1QTEVfVU5BU1NJR05FRCwgLy8gMHhlNFxuICAgIFNJTVBMRV9VTkFTU0lHTkVELCAvLyAweGU1XG4gICAgU0lNUExFX1VOQVNTSUdORUQsIC8vIDB4ZTZcbiAgICBTSU1QTEVfVU5BU1NJR05FRCwgLy8gMHhlN1xuICAgIFNJTVBMRV9VTkFTU0lHTkVELCAvLyAweGU4XG4gICAgU0lNUExFX1VOQVNTSUdORUQsIC8vIDB4ZTlcbiAgICBTSU1QTEVfVU5BU1NJR05FRCwgLy8gMHhlYVxuICAgIFNJTVBMRV9VTkFTU0lHTkVELCAvLyAweGViXG4gICAgU0lNUExFX1VOQVNTSUdORUQsIC8vIDB4ZWNcbiAgICBTSU1QTEVfVU5BU1NJR05FRCwgLy8gMHhlZFxuICAgIFNJTVBMRV9VTkFTU0lHTkVELCAvLyAweGVlXG4gICAgU0lNUExFX1VOQVNTSUdORUQsIC8vIDB4ZWZcbiAgICBTSU1QTEVfVU5BU1NJR05FRCwgLy8gMHhmMFxuICAgIFNJTVBMRV9VTkFTU0lHTkVELCAvLyAweGYxXG4gICAgU0lNUExFX1VOQVNTSUdORUQsIC8vIDB4ZjJcbiAgICBTSU1QTEVfVU5BU1NJR05FRCwgLy8gMHhmM1xuICAgIC8vIEZhbHNlXG4gICAgU0lNUExFX0ZBTFNFLCAvLyAweGY0XG4gICAgLy8gVHJ1ZVxuICAgIFNJTVBMRV9UUlVFLCAvLyAweGY1XG4gICAgLy8gTnVsbFxuICAgIFNJTVBMRV9OVUxMLCAvLyAweGY2XG4gICAgLy8gVW5kZWZpbmVkXG4gICAgU0lNUExFX1VOREVGSU5FRCwgLy8gMHhmN1xuICAgIC8vIChzaW1wbGUgdmFsdWUsIG9uZSBieXRlIGZvbGxvd3MpXG4gICAgU0lNUExFX0JZVEUsIC8vIDB4ZjhcbiAgICAvLyBIYWxmLVByZWNpc2lvbiBGbG9hdCAodHdvLWJ5dGUgSUVFRSA3NTQpXG4gICAgU0lNUExFX0ZMT0FUX0hBTEYsIC8vIDB4ZjlcbiAgICAvLyBTaW5nbGUtUHJlY2lzaW9uIEZsb2F0IChmb3VyLWJ5dGUgSUVFRSA3NTQpXG4gICAgU0lNUExFX0ZMT0FUX1NJTkdMRSwgLy8gMHhmYVxuICAgIC8vIERvdWJsZS1QcmVjaXNpb24gRmxvYXQgKGVpZ2h0LWJ5dGUgSUVFRSA3NTQpXG4gICAgU0lNUExFX0ZMT0FUX0RPVUJMRSwgLy8gMHhmYlxuICAgIEVSUk9SLCAvLyAweGZjXG4gICAgRVJST1IsIC8vIDB4ZmRcbiAgICBFUlJPUiwgLy8gMHhmZVxuICAgIC8vIFwiYnJlYWtcIiBzdG9wIGNvZGVcbiAgICBCUkVBSyAvLyAweGZmXG4gIF1cblxuICAvLyAtLVxuXG4gIHJldHVybiB7XG4gICAgcGFyc2U6IHBhcnNlXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCB7IEJ1ZmZlciB9ID0gcmVxdWlyZSgnYnVmZmVyJylcbmNvbnN0IGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcbmNvbnN0IEJpZ251bWJlciA9IHJlcXVpcmUoJ2JpZ251bWJlci5qcycpLkJpZ051bWJlclxuXG5jb25zdCBwYXJzZXIgPSByZXF1aXJlKCcuL2RlY29kZXIuYXNtJylcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5jb25zdCBjID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKVxuY29uc3QgU2ltcGxlID0gcmVxdWlyZSgnLi9zaW1wbGUnKVxuY29uc3QgVGFnZ2VkID0gcmVxdWlyZSgnLi90YWdnZWQnKVxuY29uc3QgeyBVUkwgfSA9IHJlcXVpcmUoJ2lzby11cmwnKVxuXG4vKipcbiAqIFRyYW5zZm9ybSBiaW5hcnkgY2JvciBkYXRhIGludG8gSmF2YVNjcmlwdCBvYmplY3RzLlxuICovXG5jbGFzcyBEZWNvZGVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0cz17fV1cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRzLnNpemU9NjU1MzZdIC0gU2l6ZSBvZiB0aGUgYWxsb2NhdGVkIGhlYXAuXG4gICAqL1xuICBjb25zdHJ1Y3RvciAob3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9XG5cbiAgICBpZiAoIW9wdHMuc2l6ZSB8fCBvcHRzLnNpemUgPCAweDEwMDAwKSB7XG4gICAgICBvcHRzLnNpemUgPSAweDEwMDAwXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEVuc3VyZSB0aGUgc2l6ZSBpcyBhIHBvd2VyIG9mIDJcbiAgICAgIG9wdHMuc2l6ZSA9IHV0aWxzLm5leHRQb3dlck9mMihvcHRzLnNpemUpXG4gICAgfVxuXG4gICAgLy8gSGVhcCB1c2UgdG8gc2hhcmUgdGhlIGlucHV0IHdpdGggdGhlIHBhcnNlclxuICAgIHRoaXMuX2hlYXAgPSBuZXcgQXJyYXlCdWZmZXIob3B0cy5zaXplKVxuICAgIHRoaXMuX2hlYXA4ID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5faGVhcClcbiAgICB0aGlzLl9idWZmZXIgPSBCdWZmZXIuZnJvbSh0aGlzLl9oZWFwKVxuXG4gICAgdGhpcy5fcmVzZXQoKVxuXG4gICAgLy8gS25vd24gdGFnc1xuICAgIHRoaXMuX2tub3duVGFncyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgMDogKHZhbCkgPT4gbmV3IERhdGUodmFsKSxcbiAgICAgIDE6ICh2YWwpID0+IG5ldyBEYXRlKHZhbCAqIDEwMDApLFxuICAgICAgMjogKHZhbCkgPT4gdXRpbHMuYXJyYXlCdWZmZXJUb0JpZ251bWJlcih2YWwpLFxuICAgICAgMzogKHZhbCkgPT4gYy5ORUdfT05FLm1pbnVzKHV0aWxzLmFycmF5QnVmZmVyVG9CaWdudW1iZXIodmFsKSksXG4gICAgICA0OiAodikgPT4ge1xuICAgICAgICAvLyBjb25zdCB2ID0gbmV3IFVpbnQ4QXJyYXkodmFsKVxuICAgICAgICByZXR1cm4gYy5URU4ucG93KHZbMF0pLnRpbWVzKHZbMV0pXG4gICAgICB9LFxuICAgICAgNTogKHYpID0+IHtcbiAgICAgICAgLy8gY29uc3QgdiA9IG5ldyBVaW50OEFycmF5KHZhbClcbiAgICAgICAgcmV0dXJuIGMuVFdPLnBvdyh2WzBdKS50aW1lcyh2WzFdKVxuICAgICAgfSxcbiAgICAgIDMyOiAodmFsKSA9PiBuZXcgVVJMKHZhbCksXG4gICAgICAzNTogKHZhbCkgPT4gbmV3IFJlZ0V4cCh2YWwpXG4gICAgfSwgb3B0cy50YWdzKVxuXG4gICAgLy8gSW5pdGlhbGl6ZSBhc20gYmFzZWQgcGFyc2VyXG4gICAgdGhpcy5wYXJzZXIgPSBwYXJzZXIoZ2xvYmFsLCB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgbG9nOiBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLFxuICAgICAgcHVzaEludDogdGhpcy5wdXNoSW50LmJpbmQodGhpcyksXG4gICAgICBwdXNoSW50MzI6IHRoaXMucHVzaEludDMyLmJpbmQodGhpcyksXG4gICAgICBwdXNoSW50MzJOZWc6IHRoaXMucHVzaEludDMyTmVnLmJpbmQodGhpcyksXG4gICAgICBwdXNoSW50NjQ6IHRoaXMucHVzaEludDY0LmJpbmQodGhpcyksXG4gICAgICBwdXNoSW50NjROZWc6IHRoaXMucHVzaEludDY0TmVnLmJpbmQodGhpcyksXG4gICAgICBwdXNoRmxvYXQ6IHRoaXMucHVzaEZsb2F0LmJpbmQodGhpcyksXG4gICAgICBwdXNoRmxvYXRTaW5nbGU6IHRoaXMucHVzaEZsb2F0U2luZ2xlLmJpbmQodGhpcyksXG4gICAgICBwdXNoRmxvYXREb3VibGU6IHRoaXMucHVzaEZsb2F0RG91YmxlLmJpbmQodGhpcyksXG4gICAgICBwdXNoVHJ1ZTogdGhpcy5wdXNoVHJ1ZS5iaW5kKHRoaXMpLFxuICAgICAgcHVzaEZhbHNlOiB0aGlzLnB1c2hGYWxzZS5iaW5kKHRoaXMpLFxuICAgICAgcHVzaFVuZGVmaW5lZDogdGhpcy5wdXNoVW5kZWZpbmVkLmJpbmQodGhpcyksXG4gICAgICBwdXNoTnVsbDogdGhpcy5wdXNoTnVsbC5iaW5kKHRoaXMpLFxuICAgICAgcHVzaEluZmluaXR5OiB0aGlzLnB1c2hJbmZpbml0eS5iaW5kKHRoaXMpLFxuICAgICAgcHVzaEluZmluaXR5TmVnOiB0aGlzLnB1c2hJbmZpbml0eU5lZy5iaW5kKHRoaXMpLFxuICAgICAgcHVzaE5hTjogdGhpcy5wdXNoTmFOLmJpbmQodGhpcyksXG4gICAgICBwdXNoTmFOTmVnOiB0aGlzLnB1c2hOYU5OZWcuYmluZCh0aGlzKSxcbiAgICAgIHB1c2hBcnJheVN0YXJ0OiB0aGlzLnB1c2hBcnJheVN0YXJ0LmJpbmQodGhpcyksXG4gICAgICBwdXNoQXJyYXlTdGFydEZpeGVkOiB0aGlzLnB1c2hBcnJheVN0YXJ0Rml4ZWQuYmluZCh0aGlzKSxcbiAgICAgIHB1c2hBcnJheVN0YXJ0Rml4ZWQzMjogdGhpcy5wdXNoQXJyYXlTdGFydEZpeGVkMzIuYmluZCh0aGlzKSxcbiAgICAgIHB1c2hBcnJheVN0YXJ0Rml4ZWQ2NDogdGhpcy5wdXNoQXJyYXlTdGFydEZpeGVkNjQuYmluZCh0aGlzKSxcbiAgICAgIHB1c2hPYmplY3RTdGFydDogdGhpcy5wdXNoT2JqZWN0U3RhcnQuYmluZCh0aGlzKSxcbiAgICAgIHB1c2hPYmplY3RTdGFydEZpeGVkOiB0aGlzLnB1c2hPYmplY3RTdGFydEZpeGVkLmJpbmQodGhpcyksXG4gICAgICBwdXNoT2JqZWN0U3RhcnRGaXhlZDMyOiB0aGlzLnB1c2hPYmplY3RTdGFydEZpeGVkMzIuYmluZCh0aGlzKSxcbiAgICAgIHB1c2hPYmplY3RTdGFydEZpeGVkNjQ6IHRoaXMucHVzaE9iamVjdFN0YXJ0Rml4ZWQ2NC5iaW5kKHRoaXMpLFxuICAgICAgcHVzaEJ5dGVTdHJpbmc6IHRoaXMucHVzaEJ5dGVTdHJpbmcuYmluZCh0aGlzKSxcbiAgICAgIHB1c2hCeXRlU3RyaW5nU3RhcnQ6IHRoaXMucHVzaEJ5dGVTdHJpbmdTdGFydC5iaW5kKHRoaXMpLFxuICAgICAgcHVzaFV0ZjhTdHJpbmc6IHRoaXMucHVzaFV0ZjhTdHJpbmcuYmluZCh0aGlzKSxcbiAgICAgIHB1c2hVdGY4U3RyaW5nU3RhcnQ6IHRoaXMucHVzaFV0ZjhTdHJpbmdTdGFydC5iaW5kKHRoaXMpLFxuICAgICAgcHVzaFNpbXBsZVVuYXNzaWduZWQ6IHRoaXMucHVzaFNpbXBsZVVuYXNzaWduZWQuYmluZCh0aGlzKSxcbiAgICAgIHB1c2hUYWdVbmFzc2lnbmVkOiB0aGlzLnB1c2hUYWdVbmFzc2lnbmVkLmJpbmQodGhpcyksXG4gICAgICBwdXNoVGFnU3RhcnQ6IHRoaXMucHVzaFRhZ1N0YXJ0LmJpbmQodGhpcyksXG4gICAgICBwdXNoVGFnU3RhcnQ0OiB0aGlzLnB1c2hUYWdTdGFydDQuYmluZCh0aGlzKSxcbiAgICAgIHB1c2hUYWdTdGFydDg6IHRoaXMucHVzaFRhZ1N0YXJ0OC5iaW5kKHRoaXMpLFxuICAgICAgcHVzaEJyZWFrOiB0aGlzLnB1c2hCcmVhay5iaW5kKHRoaXMpXG4gICAgfSwgdGhpcy5faGVhcClcbiAgfVxuXG4gIGdldCBfZGVwdGggKCkge1xuICAgIHJldHVybiB0aGlzLl9wYXJlbnRzLmxlbmd0aFxuICB9XG5cbiAgZ2V0IF9jdXJyZW50UGFyZW50ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50c1t0aGlzLl9kZXB0aCAtIDFdXG4gIH1cblxuICBnZXQgX3JlZiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRQYXJlbnQucmVmXG4gIH1cblxuICAvLyBGaW5pc2ggdGhlIGN1cnJlbnQgcGFyZW50XG4gIF9jbG9zZVBhcmVudCAoKSB7XG4gICAgY29uc3QgcCA9IHRoaXMuX3BhcmVudHMucG9wKClcblxuICAgIGlmIChwLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyAke3AubGVuZ3RofSBlbGVtZW50c2ApXG4gICAgfVxuXG4gICAgc3dpdGNoIChwLnR5cGUpIHtcbiAgICAgIGNhc2UgYy5QQVJFTlQuVEFHOlxuICAgICAgICB0aGlzLl9wdXNoKFxuICAgICAgICAgIHRoaXMuY3JlYXRlVGFnKHAucmVmWzBdLCBwLnJlZlsxXSlcbiAgICAgICAgKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBjLlBBUkVOVC5CWVRFX1NUUklORzpcbiAgICAgICAgdGhpcy5fcHVzaCh0aGlzLmNyZWF0ZUJ5dGVTdHJpbmcocC5yZWYsIHAubGVuZ3RoKSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgYy5QQVJFTlQuVVRGOF9TVFJJTkc6XG4gICAgICAgIHRoaXMuX3B1c2godGhpcy5jcmVhdGVVdGY4U3RyaW5nKHAucmVmLCBwLmxlbmd0aCkpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIGMuUEFSRU5ULk1BUDpcbiAgICAgICAgaWYgKHAudmFsdWVzICUgMiA+IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09kZCBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIG1hcCcpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcHVzaCh0aGlzLmNyZWF0ZU1hcChwLnJlZiwgcC5sZW5ndGgpKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBjLlBBUkVOVC5PQkpFQ1Q6XG4gICAgICAgIGlmIChwLnZhbHVlcyAlIDIgPiAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPZGQgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoZSBtYXAnKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3B1c2godGhpcy5jcmVhdGVPYmplY3QocC5yZWYsIHAubGVuZ3RoKSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgYy5QQVJFTlQuQVJSQVk6XG4gICAgICAgIHRoaXMuX3B1c2godGhpcy5jcmVhdGVBcnJheShwLnJlZiwgcC5sZW5ndGgpKVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY3VycmVudFBhcmVudCAmJiB0aGlzLl9jdXJyZW50UGFyZW50LnR5cGUgPT09IGMuUEFSRU5ULlRBRykge1xuICAgICAgdGhpcy5fZGVjKClcbiAgICB9XG4gIH1cblxuICAvLyBSZWR1Y2UgdGhlIGV4cGVjdGVkIGxlbmd0aCBvZiB0aGUgY3VycmVudCBwYXJlbnQgYnkgb25lXG4gIF9kZWMgKCkge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9jdXJyZW50UGFyZW50XG4gICAgLy8gVGhlIGN1cnJlbnQgcGFyZW50IGRvZXMgbm90IGtub3cgdGhlIGVweGVjdGVkIGNoaWxkIGxlbmd0aFxuXG4gICAgaWYgKHAubGVuZ3RoIDwgMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcC5sZW5ndGgtLVxuXG4gICAgLy8gQWxsIGNoaWxkcmVuIHdlcmUgc2Vlbiwgd2UgY2FuIGNsb3NlIHRoZSBjdXJyZW50IHBhcmVudFxuICAgIGlmIChwLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fY2xvc2VQYXJlbnQoKVxuICAgIH1cbiAgfVxuXG4gIC8vIFB1c2ggYW55IHZhbHVlIHRvIHRoZSBjdXJyZW50IHBhcmVudFxuICBfcHVzaCAodmFsLCBoYXNDaGlsZHJlbikge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9jdXJyZW50UGFyZW50XG4gICAgcC52YWx1ZXMrK1xuXG4gICAgc3dpdGNoIChwLnR5cGUpIHtcbiAgICAgIGNhc2UgYy5QQVJFTlQuQVJSQVk6XG4gICAgICBjYXNlIGMuUEFSRU5ULkJZVEVfU1RSSU5HOlxuICAgICAgY2FzZSBjLlBBUkVOVC5VVEY4X1NUUklORzpcbiAgICAgICAgaWYgKHAubGVuZ3RoID4gLTEpIHtcbiAgICAgICAgICB0aGlzLl9yZWZbdGhpcy5fcmVmLmxlbmd0aCAtIHAubGVuZ3RoXSA9IHZhbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3JlZi5wdXNoKHZhbClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kZWMoKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBjLlBBUkVOVC5PQkpFQ1Q6XG4gICAgICAgIGlmIChwLnRtcEtleSAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fcmVmW3AudG1wS2V5XSA9IHZhbFxuICAgICAgICAgIHAudG1wS2V5ID0gbnVsbFxuICAgICAgICAgIHRoaXMuX2RlYygpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcC50bXBLZXkgPSB2YWxcblxuICAgICAgICAgIGlmICh0eXBlb2YgcC50bXBLZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAvLyB0b28gYmFkLCBjb252ZXJ0IHRvIGEgTWFwXG4gICAgICAgICAgICBwLnR5cGUgPSBjLlBBUkVOVC5NQVBcbiAgICAgICAgICAgIHAucmVmID0gdXRpbHMuYnVpbGRNYXAocC5yZWYpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIGMuUEFSRU5ULk1BUDpcbiAgICAgICAgaWYgKHAudG1wS2V5ICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9yZWYuc2V0KHAudG1wS2V5LCB2YWwpXG4gICAgICAgICAgcC50bXBLZXkgPSBudWxsXG4gICAgICAgICAgdGhpcy5fZGVjKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwLnRtcEtleSA9IHZhbFxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIGMuUEFSRU5ULlRBRzpcbiAgICAgICAgdGhpcy5fcmVmLnB1c2godmFsKVxuICAgICAgICBpZiAoIWhhc0NoaWxkcmVuKSB7XG4gICAgICAgICAgdGhpcy5fZGVjKClcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHBhcmVudCB0eXBlJylcbiAgICB9XG4gIH1cblxuICAvLyBDcmVhdGUgYSBuZXcgcGFyZW50IGluIHRoZSBwYXJlbnRzIGxpc3RcbiAgX2NyZWF0ZVBhcmVudCAob2JqLCB0eXBlLCBsZW4pIHtcbiAgICB0aGlzLl9wYXJlbnRzW3RoaXMuX2RlcHRoXSA9IHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBsZW5ndGg6IGxlbixcbiAgICAgIHJlZjogb2JqLFxuICAgICAgdmFsdWVzOiAwLFxuICAgICAgdG1wS2V5OiBudWxsXG4gICAgfVxuICB9XG5cbiAgLy8gUmVzZXQgYWxsIHN0YXRlIGJhY2sgdG8gdGhlIGJlZ2lubmluZywgYWxzbyB1c2VkIGZvciBpbml0aWF0bGl6YXRpb25cbiAgX3Jlc2V0ICgpIHtcbiAgICB0aGlzLl9yZXMgPSBbXVxuICAgIHRoaXMuX3BhcmVudHMgPSBbe1xuICAgICAgdHlwZTogYy5QQVJFTlQuQVJSQVksXG4gICAgICBsZW5ndGg6IC0xLFxuICAgICAgcmVmOiB0aGlzLl9yZXMsXG4gICAgICB2YWx1ZXM6IDAsXG4gICAgICB0bXBLZXk6IG51bGxcbiAgICB9XVxuICB9XG5cbiAgLy8gLS0gSW50ZXJmYWNlIHRvIGN1c3RvbWl6ZSBkZW9kaW5nIGJlaGF2aW91clxuICBjcmVhdGVUYWcgKHRhZ051bWJlciwgdmFsdWUpIHtcbiAgICBjb25zdCB0eXAgPSB0aGlzLl9rbm93blRhZ3NbdGFnTnVtYmVyXVxuXG4gICAgaWYgKCF0eXApIHtcbiAgICAgIHJldHVybiBuZXcgVGFnZ2VkKHRhZ051bWJlciwgdmFsdWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHR5cCh2YWx1ZSlcbiAgfVxuXG4gIGNyZWF0ZU1hcCAob2JqLCBsZW4pIHtcbiAgICByZXR1cm4gb2JqXG4gIH1cblxuICBjcmVhdGVPYmplY3QgKG9iaiwgbGVuKSB7XG4gICAgcmV0dXJuIG9ialxuICB9XG5cbiAgY3JlYXRlQXJyYXkgKGFyciwgbGVuKSB7XG4gICAgcmV0dXJuIGFyclxuICB9XG5cbiAgY3JlYXRlQnl0ZVN0cmluZyAocmF3LCBsZW4pIHtcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChyYXcpXG4gIH1cblxuICBjcmVhdGVCeXRlU3RyaW5nRnJvbUhlYXAgKHN0YXJ0LCBlbmQpIHtcbiAgICBpZiAoc3RhcnQgPT09IGVuZCkge1xuICAgICAgcmV0dXJuIEJ1ZmZlci5hbGxvYygwKVxuICAgIH1cblxuICAgIHJldHVybiBCdWZmZXIuZnJvbSh0aGlzLl9oZWFwLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG5cbiAgY3JlYXRlSW50ICh2YWwpIHtcbiAgICByZXR1cm4gdmFsXG4gIH1cblxuICBjcmVhdGVJbnQzMiAoZiwgZykge1xuICAgIHJldHVybiB1dGlscy5idWlsZEludDMyKGYsIGcpXG4gIH1cblxuICBjcmVhdGVJbnQ2NCAoZjEsIGYyLCBnMSwgZzIpIHtcbiAgICByZXR1cm4gdXRpbHMuYnVpbGRJbnQ2NChmMSwgZjIsIGcxLCBnMilcbiAgfVxuXG4gIGNyZWF0ZUZsb2F0ICh2YWwpIHtcbiAgICByZXR1cm4gdmFsXG4gIH1cblxuICBjcmVhdGVGbG9hdFNpbmdsZSAoYSwgYiwgYywgZCkge1xuICAgIHJldHVybiBpZWVlNzU0LnJlYWQoW2EsIGIsIGMsIGRdLCAwLCBmYWxzZSwgMjMsIDQpXG4gIH1cblxuICBjcmVhdGVGbG9hdERvdWJsZSAoYSwgYiwgYywgZCwgZSwgZiwgZywgaCkge1xuICAgIHJldHVybiBpZWVlNzU0LnJlYWQoW2EsIGIsIGMsIGQsIGUsIGYsIGcsIGhdLCAwLCBmYWxzZSwgNTIsIDgpXG4gIH1cblxuICBjcmVhdGVJbnQzMk5lZyAoZiwgZykge1xuICAgIHJldHVybiAtMSAtIHV0aWxzLmJ1aWxkSW50MzIoZiwgZylcbiAgfVxuXG4gIGNyZWF0ZUludDY0TmVnIChmMSwgZjIsIGcxLCBnMikge1xuICAgIGNvbnN0IGYgPSB1dGlscy5idWlsZEludDMyKGYxLCBmMilcbiAgICBjb25zdCBnID0gdXRpbHMuYnVpbGRJbnQzMihnMSwgZzIpXG5cbiAgICBpZiAoZiA+IGMuTUFYX1NBRkVfSElHSCkge1xuICAgICAgcmV0dXJuIGMuTkVHX09ORS5taW51cyhuZXcgQmlnbnVtYmVyKGYpLnRpbWVzKGMuU0hJRlQzMikucGx1cyhnKSlcbiAgICB9XG5cbiAgICByZXR1cm4gLTEgLSAoKGYgKiBjLlNISUZUMzIpICsgZylcbiAgfVxuXG4gIGNyZWF0ZVRydWUgKCkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjcmVhdGVGYWxzZSAoKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBjcmVhdGVOdWxsICgpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY3JlYXRlVW5kZWZpbmVkICgpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBjcmVhdGVJbmZpbml0eSAoKSB7XG4gICAgcmV0dXJuIEluZmluaXR5XG4gIH1cblxuICBjcmVhdGVJbmZpbml0eU5lZyAoKSB7XG4gICAgcmV0dXJuIC1JbmZpbml0eVxuICB9XG5cbiAgY3JlYXRlTmFOICgpIHtcbiAgICByZXR1cm4gTmFOXG4gIH1cblxuICBjcmVhdGVOYU5OZWcgKCkge1xuICAgIHJldHVybiAtTmFOXG4gIH1cblxuICBjcmVhdGVVdGY4U3RyaW5nIChyYXcsIGxlbikge1xuICAgIHJldHVybiByYXcuam9pbignJylcbiAgfVxuXG4gIGNyZWF0ZVV0ZjhTdHJpbmdGcm9tSGVhcCAoc3RhcnQsIGVuZCkge1xuICAgIGlmIChzdGFydCA9PT0gZW5kKSB7XG4gICAgICByZXR1cm4gJydcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fYnVmZmVyLnRvU3RyaW5nKCd1dGY4Jywgc3RhcnQsIGVuZClcbiAgfVxuXG4gIGNyZWF0ZVNpbXBsZVVuYXNzaWduZWQgKHZhbCkge1xuICAgIHJldHVybiBuZXcgU2ltcGxlKHZhbClcbiAgfVxuXG4gIC8vIC0tIEludGVyZmFjZSBmb3IgZGVjb2Rlci5hc20uanNcblxuICBwdXNoSW50ICh2YWwpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlSW50KHZhbCkpXG4gIH1cblxuICBwdXNoSW50MzIgKGYsIGcpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlSW50MzIoZiwgZykpXG4gIH1cblxuICBwdXNoSW50NjQgKGYxLCBmMiwgZzEsIGcyKSB7XG4gICAgdGhpcy5fcHVzaCh0aGlzLmNyZWF0ZUludDY0KGYxLCBmMiwgZzEsIGcyKSlcbiAgfVxuXG4gIHB1c2hGbG9hdCAodmFsKSB7XG4gICAgdGhpcy5fcHVzaCh0aGlzLmNyZWF0ZUZsb2F0KHZhbCkpXG4gIH1cblxuICBwdXNoRmxvYXRTaW5nbGUgKGEsIGIsIGMsIGQpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlRmxvYXRTaW5nbGUoYSwgYiwgYywgZCkpXG4gIH1cblxuICBwdXNoRmxvYXREb3VibGUgKGEsIGIsIGMsIGQsIGUsIGYsIGcsIGgpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlRmxvYXREb3VibGUoYSwgYiwgYywgZCwgZSwgZiwgZywgaCkpXG4gIH1cblxuICBwdXNoSW50MzJOZWcgKGYsIGcpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlSW50MzJOZWcoZiwgZykpXG4gIH1cblxuICBwdXNoSW50NjROZWcgKGYxLCBmMiwgZzEsIGcyKSB7XG4gICAgdGhpcy5fcHVzaCh0aGlzLmNyZWF0ZUludDY0TmVnKGYxLCBmMiwgZzEsIGcyKSlcbiAgfVxuXG4gIHB1c2hUcnVlICgpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlVHJ1ZSgpKVxuICB9XG5cbiAgcHVzaEZhbHNlICgpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlRmFsc2UoKSlcbiAgfVxuXG4gIHB1c2hOdWxsICgpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlTnVsbCgpKVxuICB9XG5cbiAgcHVzaFVuZGVmaW5lZCAoKSB7XG4gICAgdGhpcy5fcHVzaCh0aGlzLmNyZWF0ZVVuZGVmaW5lZCgpKVxuICB9XG5cbiAgcHVzaEluZmluaXR5ICgpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlSW5maW5pdHkoKSlcbiAgfVxuXG4gIHB1c2hJbmZpbml0eU5lZyAoKSB7XG4gICAgdGhpcy5fcHVzaCh0aGlzLmNyZWF0ZUluZmluaXR5TmVnKCkpXG4gIH1cblxuICBwdXNoTmFOICgpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlTmFOKCkpXG4gIH1cblxuICBwdXNoTmFOTmVnICgpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlTmFOTmVnKCkpXG4gIH1cblxuICBwdXNoQXJyYXlTdGFydCAoKSB7XG4gICAgdGhpcy5fY3JlYXRlUGFyZW50KFtdLCBjLlBBUkVOVC5BUlJBWSwgLTEpXG4gIH1cblxuICBwdXNoQXJyYXlTdGFydEZpeGVkIChsZW4pIHtcbiAgICB0aGlzLl9jcmVhdGVBcnJheVN0YXJ0Rml4ZWQobGVuKVxuICB9XG5cbiAgcHVzaEFycmF5U3RhcnRGaXhlZDMyIChsZW4xLCBsZW4yKSB7XG4gICAgY29uc3QgbGVuID0gdXRpbHMuYnVpbGRJbnQzMihsZW4xLCBsZW4yKVxuICAgIHRoaXMuX2NyZWF0ZUFycmF5U3RhcnRGaXhlZChsZW4pXG4gIH1cblxuICBwdXNoQXJyYXlTdGFydEZpeGVkNjQgKGxlbjEsIGxlbjIsIGxlbjMsIGxlbjQpIHtcbiAgICBjb25zdCBsZW4gPSB1dGlscy5idWlsZEludDY0KGxlbjEsIGxlbjIsIGxlbjMsIGxlbjQpXG4gICAgdGhpcy5fY3JlYXRlQXJyYXlTdGFydEZpeGVkKGxlbilcbiAgfVxuXG4gIHB1c2hPYmplY3RTdGFydCAoKSB7XG4gICAgdGhpcy5fY3JlYXRlT2JqZWN0U3RhcnRGaXhlZCgtMSlcbiAgfVxuXG4gIHB1c2hPYmplY3RTdGFydEZpeGVkIChsZW4pIHtcbiAgICB0aGlzLl9jcmVhdGVPYmplY3RTdGFydEZpeGVkKGxlbilcbiAgfVxuXG4gIHB1c2hPYmplY3RTdGFydEZpeGVkMzIgKGxlbjEsIGxlbjIpIHtcbiAgICBjb25zdCBsZW4gPSB1dGlscy5idWlsZEludDMyKGxlbjEsIGxlbjIpXG4gICAgdGhpcy5fY3JlYXRlT2JqZWN0U3RhcnRGaXhlZChsZW4pXG4gIH1cblxuICBwdXNoT2JqZWN0U3RhcnRGaXhlZDY0IChsZW4xLCBsZW4yLCBsZW4zLCBsZW40KSB7XG4gICAgY29uc3QgbGVuID0gdXRpbHMuYnVpbGRJbnQ2NChsZW4xLCBsZW4yLCBsZW4zLCBsZW40KVxuICAgIHRoaXMuX2NyZWF0ZU9iamVjdFN0YXJ0Rml4ZWQobGVuKVxuICB9XG5cbiAgcHVzaEJ5dGVTdHJpbmdTdGFydCAoKSB7XG4gICAgdGhpcy5fcGFyZW50c1t0aGlzLl9kZXB0aF0gPSB7XG4gICAgICB0eXBlOiBjLlBBUkVOVC5CWVRFX1NUUklORyxcbiAgICAgIGxlbmd0aDogLTEsXG4gICAgICByZWY6IFtdLFxuICAgICAgdmFsdWVzOiAwLFxuICAgICAgdG1wS2V5OiBudWxsXG4gICAgfVxuICB9XG5cbiAgcHVzaEJ5dGVTdHJpbmcgKHN0YXJ0LCBlbmQpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlQnl0ZVN0cmluZ0Zyb21IZWFwKHN0YXJ0LCBlbmQpKVxuICB9XG5cbiAgcHVzaFV0ZjhTdHJpbmdTdGFydCAoKSB7XG4gICAgdGhpcy5fcGFyZW50c1t0aGlzLl9kZXB0aF0gPSB7XG4gICAgICB0eXBlOiBjLlBBUkVOVC5VVEY4X1NUUklORyxcbiAgICAgIGxlbmd0aDogLTEsXG4gICAgICByZWY6IFtdLFxuICAgICAgdmFsdWVzOiAwLFxuICAgICAgdG1wS2V5OiBudWxsXG4gICAgfVxuICB9XG5cbiAgcHVzaFV0ZjhTdHJpbmcgKHN0YXJ0LCBlbmQpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlVXRmOFN0cmluZ0Zyb21IZWFwKHN0YXJ0LCBlbmQpKVxuICB9XG5cbiAgcHVzaFNpbXBsZVVuYXNzaWduZWQgKHZhbCkge1xuICAgIHRoaXMuX3B1c2godGhpcy5jcmVhdGVTaW1wbGVVbmFzc2lnbmVkKHZhbCkpXG4gIH1cblxuICBwdXNoVGFnU3RhcnQgKHRhZykge1xuICAgIHRoaXMuX3BhcmVudHNbdGhpcy5fZGVwdGhdID0ge1xuICAgICAgdHlwZTogYy5QQVJFTlQuVEFHLFxuICAgICAgbGVuZ3RoOiAxLFxuICAgICAgcmVmOiBbdGFnXVxuICAgIH1cbiAgfVxuXG4gIHB1c2hUYWdTdGFydDQgKGYsIGcpIHtcbiAgICB0aGlzLnB1c2hUYWdTdGFydCh1dGlscy5idWlsZEludDMyKGYsIGcpKVxuICB9XG5cbiAgcHVzaFRhZ1N0YXJ0OCAoZjEsIGYyLCBnMSwgZzIpIHtcbiAgICB0aGlzLnB1c2hUYWdTdGFydCh1dGlscy5idWlsZEludDY0KGYxLCBmMiwgZzEsIGcyKSlcbiAgfVxuXG4gIHB1c2hUYWdVbmFzc2lnbmVkICh0YWdOdW1iZXIpIHtcbiAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlVGFnKHRhZ051bWJlcikpXG4gIH1cblxuICBwdXNoQnJlYWsgKCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50UGFyZW50Lmxlbmd0aCA+IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgYnJlYWsnKVxuICAgIH1cblxuICAgIHRoaXMuX2Nsb3NlUGFyZW50KClcbiAgfVxuXG4gIF9jcmVhdGVPYmplY3RTdGFydEZpeGVkIChsZW4pIHtcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlT2JqZWN0KHt9KSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2NyZWF0ZVBhcmVudCh7fSwgYy5QQVJFTlQuT0JKRUNULCBsZW4pXG4gIH1cblxuICBfY3JlYXRlQXJyYXlTdGFydEZpeGVkIChsZW4pIHtcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICB0aGlzLl9wdXNoKHRoaXMuY3JlYXRlQXJyYXkoW10pKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fY3JlYXRlUGFyZW50KG5ldyBBcnJheShsZW4pLCBjLlBBUkVOVC5BUlJBWSwgbGVuKVxuICB9XG5cbiAgX2RlY29kZSAoaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQuYnl0ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnB1dCB0b28gc2hvcnQnKVxuICAgIH1cblxuICAgIHRoaXMuX3Jlc2V0KClcbiAgICB0aGlzLl9oZWFwOC5zZXQoaW5wdXQpXG4gICAgY29uc3QgY29kZSA9IHRoaXMucGFyc2VyLnBhcnNlKGlucHV0LmJ5dGVMZW5ndGgpXG5cbiAgICBpZiAodGhpcy5fZGVwdGggPiAxKSB7XG4gICAgICB3aGlsZSAodGhpcy5fY3VycmVudFBhcmVudC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fY2xvc2VQYXJlbnQoKVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2RlcHRoID4gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZGV0ZXJtaW5hdGVkIG5lc3RpbmcnKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlID4gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gcGFyc2UnKVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9yZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHZhbGlkIHJlc3VsdCcpXG4gICAgfVxuICB9XG5cbiAgLy8gLS0gUHVibGljIEludGVyZmFjZVxuXG4gIGRlY29kZUZpcnN0IChpbnB1dCkge1xuICAgIHRoaXMuX2RlY29kZShpbnB1dClcblxuICAgIHJldHVybiB0aGlzLl9yZXNbMF1cbiAgfVxuXG4gIGRlY29kZUFsbCAoaW5wdXQpIHtcbiAgICB0aGlzLl9kZWNvZGUoaW5wdXQpXG5cbiAgICByZXR1cm4gdGhpcy5fcmVzXG4gIH1cblxuICAvKipcbiAgICogRGVjb2RlIHRoZSBmaXJzdCBjYm9yIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtCdWZmZXJ8c3RyaW5nfSBpbnB1dFxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2VuYz0naGV4J10gLSBFbmNvZGluZyB1c2VkIGlmIGEgc3RyaW5nIGlzIHBhc3NlZC5cbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBzdGF0aWMgZGVjb2RlIChpbnB1dCwgZW5jKSB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlucHV0ID0gQnVmZmVyLmZyb20oaW5wdXQsIGVuYyB8fCAnaGV4JylcbiAgICB9XG5cbiAgICBjb25zdCBkZWMgPSBuZXcgRGVjb2Rlcih7IHNpemU6IGlucHV0Lmxlbmd0aCB9KVxuICAgIHJldHVybiBkZWMuZGVjb2RlRmlyc3QoaW5wdXQpXG4gIH1cblxuICAvKipcbiAgICogRGVjb2RlIGFsbCBjYm9yIG9iamVjdHMuXG4gICAqXG4gICAqIEBwYXJhbSB7QnVmZmVyfHN0cmluZ30gaW5wdXRcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtlbmM9J2hleCddIC0gRW5jb2RpbmcgdXNlZCBpZiBhIHN0cmluZyBpcyBwYXNzZWQuXG4gICAqIEByZXR1cm5zIHtBcnJheTwqPn1cbiAgICovXG4gIHN0YXRpYyBkZWNvZGVBbGwgKGlucHV0LCBlbmMpIHtcbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgaW5wdXQgPSBCdWZmZXIuZnJvbShpbnB1dCwgZW5jIHx8ICdoZXgnKVxuICAgIH1cblxuICAgIGNvbnN0IGRlYyA9IG5ldyBEZWNvZGVyKHsgc2l6ZTogaW5wdXQubGVuZ3RoIH0pXG4gICAgcmV0dXJuIGRlYy5kZWNvZGVBbGwoaW5wdXQpXG4gIH1cbn1cblxuRGVjb2Rlci5kZWNvZGVGaXJzdCA9IERlY29kZXIuZGVjb2RlXG5cbm1vZHVsZS5leHBvcnRzID0gRGVjb2RlclxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IHsgQnVmZmVyIH0gPSByZXF1aXJlKCdidWZmZXInKVxuY29uc3QgRGVjb2RlciA9IHJlcXVpcmUoJy4vZGVjb2RlcicpXG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG4vKipcbiAqIE91dHB1dCB0aGUgZGlhZ25vc3RpYyBmb3JtYXQgZnJvbSBhIHN0cmVhbSBvZiBDQk9SIGJ5dGVzLlxuICpcbiAqL1xuY2xhc3MgRGlhZ25vc2UgZXh0ZW5kcyBEZWNvZGVyIHtcbiAgY3JlYXRlVGFnICh0YWdOdW1iZXIsIHZhbHVlKSB7XG4gICAgcmV0dXJuIGAke3RhZ051bWJlcn0oJHt2YWx1ZX0pYFxuICB9XG5cbiAgY3JlYXRlSW50ICh2YWwpIHtcbiAgICByZXR1cm4gc3VwZXIuY3JlYXRlSW50KHZhbCkudG9TdHJpbmcoKVxuICB9XG5cbiAgY3JlYXRlSW50MzIgKGYsIGcpIHtcbiAgICByZXR1cm4gc3VwZXIuY3JlYXRlSW50MzIoZiwgZykudG9TdHJpbmcoKVxuICB9XG5cbiAgY3JlYXRlSW50NjQgKGYxLCBmMiwgZzEsIGcyKSB7XG4gICAgcmV0dXJuIHN1cGVyLmNyZWF0ZUludDY0KGYxLCBmMiwgZzEsIGcyKS50b1N0cmluZygpXG4gIH1cblxuICBjcmVhdGVJbnQzMk5lZyAoZiwgZykge1xuICAgIHJldHVybiBzdXBlci5jcmVhdGVJbnQzMk5lZyhmLCBnKS50b1N0cmluZygpXG4gIH1cblxuICBjcmVhdGVJbnQ2NE5lZyAoZjEsIGYyLCBnMSwgZzIpIHtcbiAgICByZXR1cm4gc3VwZXIuY3JlYXRlSW50NjROZWcoZjEsIGYyLCBnMSwgZzIpLnRvU3RyaW5nKClcbiAgfVxuXG4gIGNyZWF0ZVRydWUgKCkge1xuICAgIHJldHVybiAndHJ1ZSdcbiAgfVxuXG4gIGNyZWF0ZUZhbHNlICgpIHtcbiAgICByZXR1cm4gJ2ZhbHNlJ1xuICB9XG5cbiAgY3JlYXRlRmxvYXQgKHZhbCkge1xuICAgIGNvbnN0IGZsID0gc3VwZXIuY3JlYXRlRmxvYXQodmFsKVxuICAgIGlmICh1dGlscy5pc05lZ2F0aXZlWmVybyh2YWwpKSB7XG4gICAgICByZXR1cm4gJy0wXzEnXG4gICAgfVxuXG4gICAgcmV0dXJuIGAke2ZsfV8xYFxuICB9XG5cbiAgY3JlYXRlRmxvYXRTaW5nbGUgKGEsIGIsIGMsIGQpIHtcbiAgICBjb25zdCBmbCA9IHN1cGVyLmNyZWF0ZUZsb2F0U2luZ2xlKGEsIGIsIGMsIGQpXG4gICAgcmV0dXJuIGAke2ZsfV8yYFxuICB9XG5cbiAgY3JlYXRlRmxvYXREb3VibGUgKGEsIGIsIGMsIGQsIGUsIGYsIGcsIGgpIHtcbiAgICBjb25zdCBmbCA9IHN1cGVyLmNyZWF0ZUZsb2F0RG91YmxlKGEsIGIsIGMsIGQsIGUsIGYsIGcsIGgpXG4gICAgcmV0dXJuIGAke2ZsfV8zYFxuICB9XG5cbiAgY3JlYXRlQnl0ZVN0cmluZyAocmF3LCBsZW4pIHtcbiAgICBjb25zdCB2YWwgPSByYXcuam9pbignLCAnKVxuXG4gICAgaWYgKGxlbiA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBgKF8gJHt2YWx9KWBcbiAgICB9XG4gICAgcmV0dXJuIGBoJyR7dmFsfWBcbiAgfVxuXG4gIGNyZWF0ZUJ5dGVTdHJpbmdGcm9tSGVhcCAoc3RhcnQsIGVuZCkge1xuICAgIGNvbnN0IHZhbCA9IChCdWZmZXIuZnJvbShcbiAgICAgIHN1cGVyLmNyZWF0ZUJ5dGVTdHJpbmdGcm9tSGVhcChzdGFydCwgZW5kKVxuICAgICkpLnRvU3RyaW5nKCdoZXgnKVxuXG4gICAgcmV0dXJuIGBoJyR7dmFsfSdgXG4gIH1cblxuICBjcmVhdGVJbmZpbml0eSAoKSB7XG4gICAgcmV0dXJuICdJbmZpbml0eV8xJ1xuICB9XG5cbiAgY3JlYXRlSW5maW5pdHlOZWcgKCkge1xuICAgIHJldHVybiAnLUluZmluaXR5XzEnXG4gIH1cblxuICBjcmVhdGVOYU4gKCkge1xuICAgIHJldHVybiAnTmFOXzEnXG4gIH1cblxuICBjcmVhdGVOYU5OZWcgKCkge1xuICAgIHJldHVybiAnLU5hTl8xJ1xuICB9XG5cbiAgY3JlYXRlTnVsbCAoKSB7XG4gICAgcmV0dXJuICdudWxsJ1xuICB9XG5cbiAgY3JlYXRlVW5kZWZpbmVkICgpIHtcbiAgICByZXR1cm4gJ3VuZGVmaW5lZCdcbiAgfVxuXG4gIGNyZWF0ZVNpbXBsZVVuYXNzaWduZWQgKHZhbCkge1xuICAgIHJldHVybiBgc2ltcGxlKCR7dmFsfSlgXG4gIH1cblxuICBjcmVhdGVBcnJheSAoYXJyLCBsZW4pIHtcbiAgICBjb25zdCB2YWwgPSBzdXBlci5jcmVhdGVBcnJheShhcnIsIGxlbilcblxuICAgIGlmIChsZW4gPT09IC0xKSB7XG4gICAgICAvLyBpbmRlZmluaXRlXG4gICAgICByZXR1cm4gYFtfICR7dmFsLmpvaW4oJywgJyl9XWBcbiAgICB9XG5cbiAgICByZXR1cm4gYFske3ZhbC5qb2luKCcsICcpfV1gXG4gIH1cblxuICBjcmVhdGVNYXAgKG1hcCwgbGVuKSB7XG4gICAgY29uc3QgdmFsID0gc3VwZXIuY3JlYXRlTWFwKG1hcClcbiAgICBjb25zdCBsaXN0ID0gQXJyYXkuZnJvbSh2YWwua2V5cygpKVxuICAgICAgLnJlZHVjZShjb2xsZWN0T2JqZWN0KHZhbCksICcnKVxuXG4gICAgaWYgKGxlbiA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBge18gJHtsaXN0fX1gXG4gICAgfVxuXG4gICAgcmV0dXJuIGB7JHtsaXN0fX1gXG4gIH1cblxuICBjcmVhdGVPYmplY3QgKG9iaiwgbGVuKSB7XG4gICAgY29uc3QgdmFsID0gc3VwZXIuY3JlYXRlT2JqZWN0KG9iailcbiAgICBjb25zdCBtYXAgPSBPYmplY3Qua2V5cyh2YWwpXG4gICAgICAucmVkdWNlKGNvbGxlY3RPYmplY3QodmFsKSwgJycpXG5cbiAgICBpZiAobGVuID09PSAtMSkge1xuICAgICAgcmV0dXJuIGB7XyAke21hcH19YFxuICAgIH1cblxuICAgIHJldHVybiBgeyR7bWFwfX1gXG4gIH1cblxuICBjcmVhdGVVdGY4U3RyaW5nIChyYXcsIGxlbikge1xuICAgIGNvbnN0IHZhbCA9IHJhdy5qb2luKCcsICcpXG5cbiAgICBpZiAobGVuID09PSAtMSkge1xuICAgICAgcmV0dXJuIGAoXyAke3ZhbH0pYFxuICAgIH1cblxuICAgIHJldHVybiBgXCIke3ZhbH1cImBcbiAgfVxuXG4gIGNyZWF0ZVV0ZjhTdHJpbmdGcm9tSGVhcCAoc3RhcnQsIGVuZCkge1xuICAgIGNvbnN0IHZhbCA9IChCdWZmZXIuZnJvbShcbiAgICAgIHN1cGVyLmNyZWF0ZVV0ZjhTdHJpbmdGcm9tSGVhcChzdGFydCwgZW5kKVxuICAgICkpLnRvU3RyaW5nKCd1dGY4JylcblxuICAgIHJldHVybiBgXCIke3ZhbH1cImBcbiAgfVxuXG4gIHN0YXRpYyBkaWFnbm9zZSAoaW5wdXQsIGVuYykge1xuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpbnB1dCA9IEJ1ZmZlci5mcm9tKGlucHV0LCBlbmMgfHwgJ2hleCcpXG4gICAgfVxuXG4gICAgY29uc3QgZGVjID0gbmV3IERpYWdub3NlKClcbiAgICByZXR1cm4gZGVjLmRlY29kZUZpcnN0KGlucHV0KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlhZ25vc2VcblxuZnVuY3Rpb24gY29sbGVjdE9iamVjdCAodmFsKSB7XG4gIHJldHVybiAoYWNjLCBrZXkpID0+IHtcbiAgICBpZiAoYWNjKSB7XG4gICAgICByZXR1cm4gYCR7YWNjfSwgJHtrZXl9OiAke3ZhbFtrZXldfWBcbiAgICB9XG4gICAgcmV0dXJuIGAke2tleX06ICR7dmFsW2tleV19YFxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgeyBCdWZmZXIgfSA9IHJlcXVpcmUoJ2J1ZmZlcicpXG5jb25zdCB7IFVSTCB9ID0gcmVxdWlyZSgnaXNvLXVybCcpXG5jb25zdCBCaWdudW1iZXIgPSByZXF1aXJlKCdiaWdudW1iZXIuanMnKS5CaWdOdW1iZXJcblxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJylcbmNvbnN0IE1UID0gY29uc3RhbnRzLk1UXG5jb25zdCBOVU1CWVRFUyA9IGNvbnN0YW50cy5OVU1CWVRFU1xuY29uc3QgU0hJRlQzMiA9IGNvbnN0YW50cy5TSElGVDMyXG5jb25zdCBTWU1TID0gY29uc3RhbnRzLlNZTVNcbmNvbnN0IFRBRyA9IGNvbnN0YW50cy5UQUdcbmNvbnN0IEhBTEYgPSAoY29uc3RhbnRzLk1ULlNJTVBMRV9GTE9BVCA8PCA1KSB8IGNvbnN0YW50cy5OVU1CWVRFUy5UV09cbmNvbnN0IEZMT0FUID0gKGNvbnN0YW50cy5NVC5TSU1QTEVfRkxPQVQgPDwgNSkgfCBjb25zdGFudHMuTlVNQllURVMuRk9VUlxuY29uc3QgRE9VQkxFID0gKGNvbnN0YW50cy5NVC5TSU1QTEVfRkxPQVQgPDwgNSkgfCBjb25zdGFudHMuTlVNQllURVMuRUlHSFRcbmNvbnN0IFRSVUUgPSAoY29uc3RhbnRzLk1ULlNJTVBMRV9GTE9BVCA8PCA1KSB8IGNvbnN0YW50cy5TSU1QTEUuVFJVRVxuY29uc3QgRkFMU0UgPSAoY29uc3RhbnRzLk1ULlNJTVBMRV9GTE9BVCA8PCA1KSB8IGNvbnN0YW50cy5TSU1QTEUuRkFMU0VcbmNvbnN0IFVOREVGSU5FRCA9IChjb25zdGFudHMuTVQuU0lNUExFX0ZMT0FUIDw8IDUpIHwgY29uc3RhbnRzLlNJTVBMRS5VTkRFRklORURcbmNvbnN0IE5VTEwgPSAoY29uc3RhbnRzLk1ULlNJTVBMRV9GTE9BVCA8PCA1KSB8IGNvbnN0YW50cy5TSU1QTEUuTlVMTFxuXG5jb25zdCBNQVhJTlRfQk4gPSBuZXcgQmlnbnVtYmVyKCcweDIwMDAwMDAwMDAwMDAwJylcbmNvbnN0IEJVRl9OQU4gPSBCdWZmZXIuZnJvbSgnZjk3ZTAwJywgJ2hleCcpXG5jb25zdCBCVUZfSU5GX05FRyA9IEJ1ZmZlci5mcm9tKCdmOWZjMDAnLCAnaGV4JylcbmNvbnN0IEJVRl9JTkZfUE9TID0gQnVmZmVyLmZyb20oJ2Y5N2MwMCcsICdoZXgnKVxuXG5mdW5jdGlvbiB0b1R5cGUgKG9iaikge1xuICAvLyBbb2JqZWN0IFR5cGVdXG4gIC8vIC0tLS0tLS0tOC0tLTFcbiAgcmV0dXJuICh7fSkudG9TdHJpbmcuY2FsbChvYmopLnNsaWNlKDgsIC0xKVxufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBKYXZhU2NyaXB0IHZhbHVlcyBpbnRvIENCT1IgYnl0ZXNcbiAqXG4gKi9cbmNsYXNzIEVuY29kZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKEJ1ZmZlcil9IG9wdGlvbnMuc3RyZWFtXG4gICAqL1xuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgICB0aGlzLnN0cmVhbWluZyA9IHR5cGVvZiBvcHRpb25zLnN0cmVhbSA9PT0gJ2Z1bmN0aW9uJ1xuICAgIHRoaXMub25EYXRhID0gb3B0aW9ucy5zdHJlYW1cblxuICAgIHRoaXMuc2VtYW50aWNUeXBlcyA9IFtcbiAgICAgIFtVUkwsIHRoaXMuX3B1c2hVcmxdLFxuICAgICAgW0JpZ251bWJlciwgdGhpcy5fcHVzaEJpZ051bWJlcl1cbiAgICBdXG5cbiAgICBjb25zdCBhZGRUeXBlcyA9IG9wdGlvbnMuZ2VuVHlwZXMgfHwgW11cbiAgICBjb25zdCBsZW4gPSBhZGRUeXBlcy5sZW5ndGhcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB0aGlzLmFkZFNlbWFudGljVHlwZShcbiAgICAgICAgYWRkVHlwZXNbaV1bMF0sXG4gICAgICAgIGFkZFR5cGVzW2ldWzFdXG4gICAgICApXG4gICAgfVxuXG4gICAgdGhpcy5fcmVzZXQoKVxuICB9XG5cbiAgYWRkU2VtYW50aWNUeXBlICh0eXBlLCBmdW4pIHtcbiAgICBjb25zdCBsZW4gPSB0aGlzLnNlbWFudGljVHlwZXMubGVuZ3RoXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgdHlwID0gdGhpcy5zZW1hbnRpY1R5cGVzW2ldWzBdXG4gICAgICBpZiAodHlwID09PSB0eXBlKSB7XG4gICAgICAgIGNvbnN0IG9sZCA9IHRoaXMuc2VtYW50aWNUeXBlc1tpXVsxXVxuICAgICAgICB0aGlzLnNlbWFudGljVHlwZXNbaV1bMV0gPSBmdW5cbiAgICAgICAgcmV0dXJuIG9sZFxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNlbWFudGljVHlwZXMucHVzaChbdHlwZSwgZnVuXSlcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgcHVzaCAodmFsKSB7XG4gICAgaWYgKCF2YWwpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgdGhpcy5yZXN1bHRbdGhpcy5vZmZzZXRdID0gdmFsXG4gICAgdGhpcy5yZXN1bHRNZXRob2RbdGhpcy5vZmZzZXRdID0gMFxuICAgIHRoaXMucmVzdWx0TGVuZ3RoW3RoaXMub2Zmc2V0XSA9IHZhbC5sZW5ndGhcbiAgICB0aGlzLm9mZnNldCsrXG5cbiAgICBpZiAodGhpcy5zdHJlYW1pbmcpIHtcbiAgICAgIHRoaXMub25EYXRhKHRoaXMuZmluYWxpemUoKSlcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcHVzaFdyaXRlICh2YWwsIG1ldGhvZCwgbGVuKSB7XG4gICAgdGhpcy5yZXN1bHRbdGhpcy5vZmZzZXRdID0gdmFsXG4gICAgdGhpcy5yZXN1bHRNZXRob2RbdGhpcy5vZmZzZXRdID0gbWV0aG9kXG4gICAgdGhpcy5yZXN1bHRMZW5ndGhbdGhpcy5vZmZzZXRdID0gbGVuXG4gICAgdGhpcy5vZmZzZXQrK1xuXG4gICAgaWYgKHRoaXMuc3RyZWFtaW5nKSB7XG4gICAgICB0aGlzLm9uRGF0YSh0aGlzLmZpbmFsaXplKCkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIF9wdXNoVUludDggKHZhbCkge1xuICAgIHJldHVybiB0aGlzLnB1c2hXcml0ZSh2YWwsIDEsIDEpXG4gIH1cblxuICBfcHVzaFVJbnQxNkJFICh2YWwpIHtcbiAgICByZXR1cm4gdGhpcy5wdXNoV3JpdGUodmFsLCAyLCAyKVxuICB9XG5cbiAgX3B1c2hVSW50MzJCRSAodmFsKSB7XG4gICAgcmV0dXJuIHRoaXMucHVzaFdyaXRlKHZhbCwgMywgNClcbiAgfVxuXG4gIF9wdXNoRG91YmxlQkUgKHZhbCkge1xuICAgIHJldHVybiB0aGlzLnB1c2hXcml0ZSh2YWwsIDQsIDgpXG4gIH1cblxuICBfcHVzaE5hTiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHVzaChCVUZfTkFOKVxuICB9XG5cbiAgX3B1c2hJbmZpbml0eSAob2JqKSB7XG4gICAgY29uc3QgaGFsZiA9IChvYmogPCAwKSA/IEJVRl9JTkZfTkVHIDogQlVGX0lORl9QT1NcbiAgICByZXR1cm4gdGhpcy5wdXNoKGhhbGYpXG4gIH1cblxuICBfcHVzaEZsb2F0IChvYmopIHtcbiAgICBjb25zdCBiMiA9IEJ1ZmZlci5hbGxvY1Vuc2FmZSgyKVxuXG4gICAgaWYgKHV0aWxzLndyaXRlSGFsZihiMiwgb2JqKSkge1xuICAgICAgaWYgKHV0aWxzLnBhcnNlSGFsZihiMikgPT09IG9iaikge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHVzaFVJbnQ4KEhBTEYpICYmIHRoaXMucHVzaChiMilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBiNCA9IEJ1ZmZlci5hbGxvY1Vuc2FmZSg0KVxuICAgIGI0LndyaXRlRmxvYXRCRShvYmosIDApXG4gICAgaWYgKGI0LnJlYWRGbG9hdEJFKDApID09PSBvYmopIHtcbiAgICAgIHJldHVybiB0aGlzLl9wdXNoVUludDgoRkxPQVQpICYmIHRoaXMucHVzaChiNClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcHVzaFVJbnQ4KERPVUJMRSkgJiYgdGhpcy5fcHVzaERvdWJsZUJFKG9iailcbiAgfVxuXG4gIF9wdXNoSW50IChvYmosIG10LCBvcmlnKSB7XG4gICAgY29uc3QgbSA9IG10IDw8IDVcbiAgICBpZiAob2JqIDwgMjQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wdXNoVUludDgobSB8IG9iailcbiAgICB9XG5cbiAgICBpZiAob2JqIDw9IDB4ZmYpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wdXNoVUludDgobSB8IE5VTUJZVEVTLk9ORSkgJiYgdGhpcy5fcHVzaFVJbnQ4KG9iailcbiAgICB9XG5cbiAgICBpZiAob2JqIDw9IDB4ZmZmZikge1xuICAgICAgcmV0dXJuIHRoaXMuX3B1c2hVSW50OChtIHwgTlVNQllURVMuVFdPKSAmJiB0aGlzLl9wdXNoVUludDE2QkUob2JqKVxuICAgIH1cblxuICAgIGlmIChvYmogPD0gMHhmZmZmZmZmZikge1xuICAgICAgcmV0dXJuIHRoaXMuX3B1c2hVSW50OChtIHwgTlVNQllURVMuRk9VUikgJiYgdGhpcy5fcHVzaFVJbnQzMkJFKG9iailcbiAgICB9XG5cbiAgICBpZiAob2JqIDw9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcHVzaFVJbnQ4KG0gfCBOVU1CWVRFUy5FSUdIVCkgJiZcbiAgICAgICAgdGhpcy5fcHVzaFVJbnQzMkJFKE1hdGguZmxvb3Iob2JqIC8gU0hJRlQzMikpICYmXG4gICAgICAgIHRoaXMuX3B1c2hVSW50MzJCRShvYmogJSBTSElGVDMyKVxuICAgIH1cblxuICAgIGlmIChtdCA9PT0gTVQuTkVHX0lOVCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3B1c2hGbG9hdChvcmlnKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wdXNoRmxvYXQob2JqKVxuICB9XG5cbiAgX3B1c2hJbnROdW0gKG9iaikge1xuICAgIGlmIChvYmogPCAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcHVzaEludCgtb2JqIC0gMSwgTVQuTkVHX0lOVCwgb2JqKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fcHVzaEludChvYmosIE1ULlBPU19JTlQpXG4gICAgfVxuICB9XG5cbiAgX3B1c2hOdW1iZXIgKG9iaikge1xuICAgIHN3aXRjaCAoZmFsc2UpIHtcbiAgICAgIGNhc2UgKG9iaiA9PT0gb2JqKTogLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICByZXR1cm4gdGhpcy5fcHVzaE5hTihvYmopXG4gICAgICBjYXNlIGlzRmluaXRlKG9iaik6XG4gICAgICAgIHJldHVybiB0aGlzLl9wdXNoSW5maW5pdHkob2JqKVxuICAgICAgY2FzZSAoKG9iaiAlIDEpICE9PSAwKTpcbiAgICAgICAgcmV0dXJuIHRoaXMuX3B1c2hJbnROdW0ob2JqKVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHRoaXMuX3B1c2hGbG9hdChvYmopXG4gICAgfVxuICB9XG5cbiAgX3B1c2hTdHJpbmcgKG9iaikge1xuICAgIGNvbnN0IGxlbiA9IEJ1ZmZlci5ieXRlTGVuZ3RoKG9iaiwgJ3V0ZjgnKVxuICAgIHJldHVybiB0aGlzLl9wdXNoSW50KGxlbiwgTVQuVVRGOF9TVFJJTkcpICYmIHRoaXMucHVzaFdyaXRlKG9iaiwgNSwgbGVuKVxuICB9XG5cbiAgX3B1c2hCb29sZWFuIChvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fcHVzaFVJbnQ4KG9iaiA/IFRSVUUgOiBGQUxTRSlcbiAgfVxuXG4gIF9wdXNoVW5kZWZpbmVkIChvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fcHVzaFVJbnQ4KFVOREVGSU5FRClcbiAgfVxuXG4gIF9wdXNoQXJyYXkgKGdlbiwgb2JqKSB7XG4gICAgY29uc3QgbGVuID0gb2JqLmxlbmd0aFxuICAgIGlmICghZ2VuLl9wdXNoSW50KGxlbiwgTVQuQVJSQVkpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBsZW47IGorKykge1xuICAgICAgaWYgKCFnZW4ucHVzaEFueShvYmpbal0pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgX3B1c2hUYWcgKHRhZykge1xuICAgIHJldHVybiB0aGlzLl9wdXNoSW50KHRhZywgTVQuVEFHKVxuICB9XG5cbiAgX3B1c2hEYXRlIChnZW4sIG9iaikge1xuICAgIC8vIFJvdW5kIGRhdGUsIHRvIGdldCBzZWNvbmRzIHNpbmNlIDE5NzAtMDEtMDEgMDA6MDA6MDAgYXMgZGVmaW5lZCBpblxuICAgIC8vIFNlYy4gMi40LjEgYW5kIGdldCBhIHBvc3NpYmx5IG1vcmUgY29tcGFjdCBlbmNvZGluZy4gTm90ZSB0aGF0IGl0IGlzXG4gICAgLy8gc3RpbGwgYWxsb3dlZCB0byBlbmNvZGUgZnJhY3Rpb25zIG9mIHNlY29uZHMgd2hpY2ggY2FuIGJlIGFjaGlldmVkIGJ5XG4gICAgLy8gY2hhbmdpbmcgb3ZlcndyaXRpbmcgdGhlIGVuY29kZSBmdW5jdGlvbiBmb3IgRGF0ZSBvYmplY3RzLlxuICAgIHJldHVybiBnZW4uX3B1c2hUYWcoVEFHLkRBVEVfRVBPQ0gpICYmIGdlbi5wdXNoQW55KE1hdGgucm91bmQob2JqIC8gMTAwMCkpXG4gIH1cblxuICBfcHVzaEJ1ZmZlciAoZ2VuLCBvYmopIHtcbiAgICByZXR1cm4gZ2VuLl9wdXNoSW50KG9iai5sZW5ndGgsIE1ULkJZVEVfU1RSSU5HKSAmJiBnZW4ucHVzaChvYmopXG4gIH1cblxuICBfcHVzaE5vRmlsdGVyIChnZW4sIG9iaikge1xuICAgIHJldHVybiBnZW4uX3B1c2hCdWZmZXIoZ2VuLCBvYmouc2xpY2UoKSlcbiAgfVxuXG4gIF9wdXNoUmVnZXhwIChnZW4sIG9iaikge1xuICAgIHJldHVybiBnZW4uX3B1c2hUYWcoVEFHLlJFR0VYUCkgJiYgZ2VuLnB1c2hBbnkob2JqLnNvdXJjZSlcbiAgfVxuXG4gIF9wdXNoU2V0IChnZW4sIG9iaikge1xuICAgIGlmICghZ2VuLl9wdXNoSW50KG9iai5zaXplLCBNVC5BUlJBWSkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IHggb2Ygb2JqKSB7XG4gICAgICBpZiAoIWdlbi5wdXNoQW55KHgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgX3B1c2hVcmwgKGdlbiwgb2JqKSB7XG4gICAgcmV0dXJuIGdlbi5fcHVzaFRhZyhUQUcuVVJJKSAmJiBnZW4ucHVzaEFueShvYmouZm9ybWF0KCkpXG4gIH1cblxuICBfcHVzaEJpZ2ludCAob2JqKSB7XG4gICAgbGV0IHRhZyA9IFRBRy5QT1NfQklHSU5UXG4gICAgaWYgKG9iai5pc05lZ2F0aXZlKCkpIHtcbiAgICAgIG9iaiA9IG9iai5uZWdhdGVkKCkubWludXMoMSlcbiAgICAgIHRhZyA9IFRBRy5ORUdfQklHSU5UXG4gICAgfVxuICAgIGxldCBzdHIgPSBvYmoudG9TdHJpbmcoMTYpXG4gICAgaWYgKHN0ci5sZW5ndGggJSAyKSB7XG4gICAgICBzdHIgPSAnMCcgKyBzdHJcbiAgICB9XG4gICAgY29uc3QgYnVmID0gQnVmZmVyLmZyb20oc3RyLCAnaGV4JylcbiAgICByZXR1cm4gdGhpcy5fcHVzaFRhZyh0YWcpICYmIHRoaXMuX3B1c2hCdWZmZXIodGhpcywgYnVmKVxuICB9XG5cbiAgX3B1c2hCaWdOdW1iZXIgKGdlbiwgb2JqKSB7XG4gICAgaWYgKG9iai5pc05hTigpKSB7XG4gICAgICByZXR1cm4gZ2VuLl9wdXNoTmFOKClcbiAgICB9XG4gICAgaWYgKCFvYmouaXNGaW5pdGUoKSkge1xuICAgICAgcmV0dXJuIGdlbi5fcHVzaEluZmluaXR5KG9iai5pc05lZ2F0aXZlKCkgPyAtSW5maW5pdHkgOiBJbmZpbml0eSlcbiAgICB9XG4gICAgaWYgKG9iai5pc0ludGVnZXIoKSkge1xuICAgICAgcmV0dXJuIGdlbi5fcHVzaEJpZ2ludChvYmopXG4gICAgfVxuICAgIGlmICghKGdlbi5fcHVzaFRhZyhUQUcuREVDSU1BTF9GUkFDKSAmJlxuICAgICAgZ2VuLl9wdXNoSW50KDIsIE1ULkFSUkFZKSkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNvbnN0IGRlYyA9IG9iai5kZWNpbWFsUGxhY2VzKClcbiAgICBjb25zdCBzbGlkZSA9IG9iai5tdWx0aXBsaWVkQnkobmV3IEJpZ251bWJlcigxMCkucG93KGRlYykpXG4gICAgaWYgKCFnZW4uX3B1c2hJbnROdW0oLWRlYykpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAoc2xpZGUuYWJzKCkuaXNMZXNzVGhhbihNQVhJTlRfQk4pKSB7XG4gICAgICByZXR1cm4gZ2VuLl9wdXNoSW50TnVtKHNsaWRlLnRvTnVtYmVyKCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZW4uX3B1c2hCaWdpbnQoc2xpZGUpXG4gICAgfVxuICB9XG5cbiAgX3B1c2hNYXAgKGdlbiwgb2JqKSB7XG4gICAgaWYgKCFnZW4uX3B1c2hJbnQob2JqLnNpemUsIE1ULk1BUCkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wdXNoUmF3TWFwKFxuICAgICAgb2JqLnNpemUsXG4gICAgICBBcnJheS5mcm9tKG9iailcbiAgICApXG4gIH1cblxuICBfcHVzaE9iamVjdCAob2JqKSB7XG4gICAgaWYgKCFvYmopIHtcbiAgICAgIHJldHVybiB0aGlzLl9wdXNoVUludDgoTlVMTClcbiAgICB9XG5cbiAgICBjb25zdCBsZW4gPSB0aGlzLnNlbWFudGljVHlwZXMubGVuZ3RoXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIHRoaXMuc2VtYW50aWNUeXBlc1tpXVswXSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZW1hbnRpY1R5cGVzW2ldWzFdLmNhbGwob2JqLCB0aGlzLCBvYmopXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZiA9IG9iai5lbmNvZGVDQk9SXG4gICAgaWYgKHR5cGVvZiBmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gZi5jYWxsKG9iaiwgdGhpcylcbiAgICB9XG5cbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqKVxuICAgIGNvbnN0IGtleUxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgaWYgKCF0aGlzLl9wdXNoSW50KGtleUxlbmd0aCwgTVQuTUFQKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3B1c2hSYXdNYXAoXG4gICAgICBrZXlMZW5ndGgsXG4gICAgICBrZXlzLm1hcCgoaykgPT4gW2ssIG9ialtrXV0pXG4gICAgKVxuICB9XG5cbiAgX3B1c2hSYXdNYXAgKGxlbiwgbWFwKSB7XG4gICAgLy8gU29ydCBrZXlzIGZvciBjYW5vbmNpYWxpemF0aW9uXG4gICAgLy8gMS4gZW5jb2RlIGtleVxuICAgIC8vIDIuIHNob3J0ZXIga2V5IGNvbWVzIGJlZm9yZSBsb25nZXIga2V5XG4gICAgLy8gMy4gc2FtZSBsZW5ndGgga2V5cyBhcmUgc29ydGVkIHdpdGggbG93ZXJcbiAgICAvLyAgICBieXRlIHZhbHVlIGJlZm9yZSBoaWdoZXJcblxuICAgIG1hcCA9IG1hcC5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICAgIGFbMF0gPSBFbmNvZGVyLmVuY29kZShhWzBdKVxuICAgICAgcmV0dXJuIGFcbiAgICB9KS5zb3J0KHV0aWxzLmtleVNvcnRlcilcblxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGlmICghdGhpcy5wdXNoKG1hcFtqXVswXSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5wdXNoQW55KG1hcFtqXVsxXSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBmb3IgYC5wdXNoQW55YFxuICAgKlxuICAgKiBAcGFyYW0geyp9IG9ialxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBvbiBzdWNjZXNzXG4gICAqL1xuICB3cml0ZSAob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMucHVzaEFueShvYmopXG4gIH1cblxuICAvKipcbiAgICogUHVzaCBhbnkgc3VwcG9ydGVkIHR5cGUgb250byB0aGUgZW5jb2RlZCBzdHJlYW1cbiAgICpcbiAgICogQHBhcmFtIHthbnl9IG9ialxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBvbiBzdWNjZXNzXG4gICAqL1xuICBwdXNoQW55IChvYmopIHtcbiAgICBjb25zdCB0eXAgPSB0b1R5cGUob2JqKVxuXG4gICAgc3dpdGNoICh0eXApIHtcbiAgICAgIGNhc2UgJ051bWJlcic6XG4gICAgICAgIHJldHVybiB0aGlzLl9wdXNoTnVtYmVyKG9iailcbiAgICAgIGNhc2UgJ1N0cmluZyc6XG4gICAgICAgIHJldHVybiB0aGlzLl9wdXNoU3RyaW5nKG9iailcbiAgICAgIGNhc2UgJ0Jvb2xlYW4nOlxuICAgICAgICByZXR1cm4gdGhpcy5fcHVzaEJvb2xlYW4ob2JqKVxuICAgICAgY2FzZSAnT2JqZWN0JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX3B1c2hPYmplY3Qob2JqKVxuICAgICAgY2FzZSAnQXJyYXknOlxuICAgICAgICByZXR1cm4gdGhpcy5fcHVzaEFycmF5KHRoaXMsIG9iailcbiAgICAgIGNhc2UgJ1VpbnQ4QXJyYXknOlxuICAgICAgICByZXR1cm4gdGhpcy5fcHVzaEJ1ZmZlcih0aGlzLCBCdWZmZXIuaXNCdWZmZXIob2JqKSA/IG9iaiA6IEJ1ZmZlci5mcm9tKG9iaikpXG4gICAgICBjYXNlICdOdWxsJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX3B1c2hVSW50OChOVUxMKVxuICAgICAgY2FzZSAnVW5kZWZpbmVkJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX3B1c2hVbmRlZmluZWQob2JqKVxuICAgICAgY2FzZSAnTWFwJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX3B1c2hNYXAodGhpcywgb2JqKVxuICAgICAgY2FzZSAnU2V0JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX3B1c2hTZXQodGhpcywgb2JqKVxuICAgICAgY2FzZSAnVVJMJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX3B1c2hVcmwodGhpcywgb2JqKVxuICAgICAgY2FzZSAnQmlnTnVtYmVyJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX3B1c2hCaWdOdW1iZXIodGhpcywgb2JqKVxuICAgICAgY2FzZSAnRGF0ZSc6XG4gICAgICAgIHJldHVybiB0aGlzLl9wdXNoRGF0ZSh0aGlzLCBvYmopXG4gICAgICBjYXNlICdSZWdFeHAnOlxuICAgICAgICByZXR1cm4gdGhpcy5fcHVzaFJlZ2V4cCh0aGlzLCBvYmopXG4gICAgICBjYXNlICdTeW1ib2wnOlxuICAgICAgICBzd2l0Y2ggKG9iaikge1xuICAgICAgICAgIGNhc2UgU1lNUy5OVUxMOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3B1c2hPYmplY3QobnVsbClcbiAgICAgICAgICBjYXNlIFNZTVMuVU5ERUZJTkVEOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3B1c2hVbmRlZmluZWQodW5kZWZpbmVkKVxuICAgICAgICAgIC8vIFRPRE86IEFkZCBwbHVnZ2FibGUgc3VwcG9ydCBmb3Igb3RoZXIgc3ltYm9sc1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gc3ltYm9sOiAnICsgb2JqLnRvU3RyaW5nKCkpXG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biB0eXBlOiAnICsgdHlwZW9mIG9iaiArICcsICcgKyAob2JqID8gb2JqLnRvU3RyaW5nKCkgOiAnJykpXG4gICAgfVxuICB9XG5cbiAgZmluYWxpemUgKCkge1xuICAgIGlmICh0aGlzLm9mZnNldCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnJlc3VsdFxuICAgIGNvbnN0IHJlc3VsdExlbmd0aCA9IHRoaXMucmVzdWx0TGVuZ3RoXG4gICAgY29uc3QgcmVzdWx0TWV0aG9kID0gdGhpcy5yZXN1bHRNZXRob2RcbiAgICBjb25zdCBvZmZzZXQgPSB0aGlzLm9mZnNldFxuXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBzaXplIG9mIHRoZSBidWZmZXJcbiAgICBsZXQgc2l6ZSA9IDBcbiAgICBsZXQgaSA9IDBcblxuICAgIGZvciAoOyBpIDwgb2Zmc2V0OyBpKyspIHtcbiAgICAgIHNpemUgKz0gcmVzdWx0TGVuZ3RoW2ldXG4gICAgfVxuXG4gICAgY29uc3QgcmVzID0gQnVmZmVyLmFsbG9jVW5zYWZlKHNpemUpXG4gICAgbGV0IGluZGV4ID0gMFxuICAgIGxldCBsZW5ndGggPSAwXG5cbiAgICAvLyBXcml0ZSB0aGUgY29udGVudCBpbnRvIHRoZSByZXN1bHQgYnVmZmVyXG4gICAgZm9yIChpID0gMDsgaSA8IG9mZnNldDsgaSsrKSB7XG4gICAgICBsZW5ndGggPSByZXN1bHRMZW5ndGhbaV1cblxuICAgICAgc3dpdGNoIChyZXN1bHRNZXRob2RbaV0pIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIHJlc3VsdFtpXS5jb3B5KHJlcywgaW5kZXgpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIHJlcy53cml0ZVVJbnQ4KHJlc3VsdFtpXSwgaW5kZXgsIHRydWUpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHJlcy53cml0ZVVJbnQxNkJFKHJlc3VsdFtpXSwgaW5kZXgsIHRydWUpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHJlcy53cml0ZVVJbnQzMkJFKHJlc3VsdFtpXSwgaW5kZXgsIHRydWUpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHJlcy53cml0ZURvdWJsZUJFKHJlc3VsdFtpXSwgaW5kZXgsIHRydWUpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIHJlcy53cml0ZShyZXN1bHRbaV0sIGluZGV4LCBsZW5ndGgsICd1dGY4JylcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndW5rb3duIG1ldGhvZCcpXG4gICAgICB9XG5cbiAgICAgIGluZGV4ICs9IGxlbmd0aFxuICAgIH1cblxuICAgIGNvbnN0IHRtcCA9IHJlc1xuXG4gICAgdGhpcy5fcmVzZXQoKVxuXG4gICAgcmV0dXJuIHRtcFxuICB9XG5cbiAgX3Jlc2V0ICgpIHtcbiAgICB0aGlzLnJlc3VsdCA9IFtdXG4gICAgdGhpcy5yZXN1bHRNZXRob2QgPSBbXVxuICAgIHRoaXMucmVzdWx0TGVuZ3RoID0gW11cbiAgICB0aGlzLm9mZnNldCA9IDBcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmNvZGUgdGhlIGdpdmVuIHZhbHVlXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gb1xuICAgKiBAcmV0dXJucyB7QnVmZmVyfVxuICAgKi9cbiAgc3RhdGljIGVuY29kZSAobykge1xuICAgIGNvbnN0IGVuYyA9IG5ldyBFbmNvZGVyKClcbiAgICBjb25zdCByZXQgPSBlbmMucHVzaEFueShvKVxuICAgIGlmICghcmV0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBlbmNvZGUgaW5wdXQnKVxuICAgIH1cblxuICAgIHJldHVybiBlbmMuZmluYWxpemUoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5jb2RlclxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8vIGV4cG9ydHMuQ29tbWVudGVkID0gcmVxdWlyZSgnLi9jb21tZW50ZWQnKVxuZXhwb3J0cy5EaWFnbm9zZSA9IHJlcXVpcmUoJy4vZGlhZ25vc2UnKVxuZXhwb3J0cy5EZWNvZGVyID0gcmVxdWlyZSgnLi9kZWNvZGVyJylcbmV4cG9ydHMuRW5jb2RlciA9IHJlcXVpcmUoJy4vZW5jb2RlcicpXG5leHBvcnRzLlNpbXBsZSA9IHJlcXVpcmUoJy4vc2ltcGxlJylcbmV4cG9ydHMuVGFnZ2VkID0gcmVxdWlyZSgnLi90YWdnZWQnKVxuXG4vLyBleHBvcnRzLmNvbW1lbnQgPSBleHBvcnRzLkNvbW1lbnRlZC5jb21tZW50XG5leHBvcnRzLmRlY29kZUFsbCA9IGV4cG9ydHMuRGVjb2Rlci5kZWNvZGVBbGxcbmV4cG9ydHMuZGVjb2RlRmlyc3QgPSBleHBvcnRzLkRlY29kZXIuZGVjb2RlRmlyc3RcbmV4cG9ydHMuZGlhZ25vc2UgPSBleHBvcnRzLkRpYWdub3NlLmRpYWdub3NlXG5leHBvcnRzLmVuY29kZSA9IGV4cG9ydHMuRW5jb2Rlci5lbmNvZGVcbmV4cG9ydHMuZGVjb2RlID0gZXhwb3J0cy5EZWNvZGVyLmRlY29kZVxuXG5leHBvcnRzLmxldmVsZGIgPSB7XG4gIGRlY29kZTogZXhwb3J0cy5EZWNvZGVyLmRlY29kZUFsbCxcbiAgZW5jb2RlOiBleHBvcnRzLkVuY29kZXIuZW5jb2RlLFxuICBidWZmZXI6IHRydWUsXG4gIG5hbWU6ICdjYm9yJ1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJylcbmNvbnN0IE1UID0gY29uc3RhbnRzLk1UXG5jb25zdCBTSU1QTEUgPSBjb25zdGFudHMuU0lNUExFXG5jb25zdCBTWU1TID0gY29uc3RhbnRzLlNZTVNcblxuLyoqXG4gKiBBIENCT1IgU2ltcGxlIFZhbHVlIHRoYXQgZG9lcyBub3QgbWFwIG9udG8gYSBrbm93biBjb25zdGFudC5cbiAqL1xuY2xhc3MgU2ltcGxlIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgU2ltcGxlLlxuICAgKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IHZhbHVlIC0gdGhlIHNpbXBsZSB2YWx1ZSdzIGludGVnZXIgdmFsdWVcbiAgICovXG4gIGNvbnN0cnVjdG9yICh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgU2ltcGxlIHR5cGU6ICcgKyAodHlwZW9mIHZhbHVlKSlcbiAgICB9XG4gICAgaWYgKCh2YWx1ZSA8IDApIHx8ICh2YWx1ZSA+IDI1NSkgfHwgKCh2YWx1ZSB8IDApICE9PSB2YWx1ZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgbXVzdCBiZSBhIHNtYWxsIHBvc2l0aXZlIGludGVnZXI6ICcgKyB2YWx1ZSlcbiAgICB9XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gIH1cblxuICAvKipcbiAgICogRGVidWcgc3RyaW5nIGZvciBzaW1wbGUgdmFsdWVcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gc2ltcGxlKHZhbHVlKVxuICAgKi9cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnc2ltcGxlKCcgKyB0aGlzLnZhbHVlICsgJyknXG4gIH1cblxuICAvKipcbiAgICogRGVidWcgc3RyaW5nIGZvciBzaW1wbGUgdmFsdWVcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gc2ltcGxlKHZhbHVlKVxuICAgKi9cbiAgaW5zcGVjdCAoKSB7XG4gICAgcmV0dXJuICdzaW1wbGUoJyArIHRoaXMudmFsdWUgKyAnKSdcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXNoIHRoZSBzaW1wbGUgdmFsdWUgb250byB0aGUgQ0JPUiBzdHJlYW1cbiAgICpcbiAgICogQHBhcmFtIHtjYm9yLkVuY29kZXJ9IGdlbiAtIFRoZSBnZW5lcmF0b3IgdG8gcHVzaCBvbnRvXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBlbmNvZGVDQk9SIChnZW4pIHtcbiAgICByZXR1cm4gZ2VuLl9wdXNoSW50KHRoaXMudmFsdWUsIE1ULlNJTVBMRV9GTE9BVClcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyB0aGUgZ2l2ZW4gb2JqZWN0IGEgU2ltcGxlP1xuICAgKlxuICAgKiBAcGFyYW0ge2FueX0gb2JqIC0gb2JqZWN0IHRvIHRlc3RcbiAgICogQHJldHVybnMge2Jvb2x9IC0gaXMgaXQgU2ltcGxlP1xuICAgKi9cbiAgc3RhdGljIGlzU2ltcGxlIChvYmopIHtcbiAgICByZXR1cm4gb2JqIGluc3RhbmNlb2YgU2ltcGxlXG4gIH1cblxuICAvKipcbiAgICogRGVjb2RlIGZyb20gdGhlIENCT1IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiBpbnRvIGEgSmF2YVNjcmlwdCB2YWx1ZS5cbiAgICogSWYgdGhlIENCT1IgaXRlbSBoYXMgbm8gcGFyZW50LCByZXR1cm4gYSBcInNhZmVcIiBzeW1ib2wgaW5zdGVhZCBvZlxuICAgKiBgbnVsbGAgb3IgYHVuZGVmaW5lZGAsIHNvIHRoYXQgdGhlIHZhbHVlIGNhbiBiZSBwYXNzZWQgdGhyb3VnaCBhXG4gICAqIHN0cmVhbSBpbiBvYmplY3QgbW9kZS5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbCAtIHRoZSBDQk9SIGFkZGl0aW9uYWwgaW5mbyB0byBjb252ZXJ0XG4gICAqIEBwYXJhbSB7Ym9vbH0gaGFzUGFyZW50IC0gRG9lcyB0aGUgQ0JPUiBpdGVtIGhhdmUgYSBwYXJlbnQ/XG4gICAqIEByZXR1cm5zIHsobnVsbCB8IHVuZGVmaW5lZCB8IGJvb2xlYW4gfCBzeW1ib2wpfSAtIHRoZSBkZWNvZGVkIHZhbHVlXG4gICAqL1xuICBzdGF0aWMgZGVjb2RlICh2YWwsIGhhc1BhcmVudCkge1xuICAgIGlmIChoYXNQYXJlbnQgPT0gbnVsbCkge1xuICAgICAgaGFzUGFyZW50ID0gdHJ1ZVxuICAgIH1cbiAgICBzd2l0Y2ggKHZhbCkge1xuICAgICAgY2FzZSBTSU1QTEUuRkFMU0U6XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgY2FzZSBTSU1QTEUuVFJVRTpcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIGNhc2UgU0lNUExFLk5VTEw6XG4gICAgICAgIGlmIChoYXNQYXJlbnQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBTWU1TLk5VTExcbiAgICAgICAgfVxuICAgICAgY2FzZSBTSU1QTEUuVU5ERUZJTkVEOlxuICAgICAgICBpZiAoaGFzUGFyZW50KSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBTWU1TLlVOREVGSU5FRFxuICAgICAgICB9XG4gICAgICBjYXNlIC0xOlxuICAgICAgICBpZiAoIWhhc1BhcmVudCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBCUkVBSycpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFNZTVMuQlJFQUtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBuZXcgU2ltcGxlKHZhbClcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIEEgQ0JPUiB0YWdnZWQgaXRlbSwgd2hlcmUgdGhlIHRhZyBkb2VzIG5vdCBoYXZlIHNlbWFudGljcyBzcGVjaWZpZWQgYXQgdGhlXG4gKiBtb21lbnQsIG9yIHRob3NlIHNlbWFudGljcyB0aHJldyBhbiBlcnJvciBkdXJpbmcgcGFyc2luZy4gVHlwaWNhbGx5IHRoaXMgd2lsbFxuICogYmUgYW4gZXh0ZW5zaW9uIHBvaW50IHlvdSdyZSBub3QgeWV0IGV4cGVjdGluZy5cbiAqL1xuY2xhc3MgVGFnZ2VkIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgVGFnZ2VkLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdGFnIC0gdGhlIG51bWJlciBvZiB0aGUgdGFnXG4gICAqIEBwYXJhbSB7YW55fSB2YWx1ZSAtIHRoZSB2YWx1ZSBpbnNpZGUgdGhlIHRhZ1xuICAgKiBAcGFyYW0ge0Vycm9yfSBlcnIgLSB0aGUgZXJyb3IgdGhhdCB3YXMgdGhyb3duIHBhcnNpbmcgdGhlIHRhZywgb3IgbnVsbFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHRhZywgdmFsdWUsIGVycikge1xuICAgIHRoaXMudGFnID0gdGFnXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gICAgdGhpcy5lcnIgPSBlcnJcbiAgICBpZiAodHlwZW9mIHRoaXMudGFnICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHRhZyB0eXBlICgnICsgKHR5cGVvZiB0aGlzLnRhZykgKyAnKScpXG4gICAgfVxuICAgIGlmICgodGhpcy50YWcgPCAwKSB8fCAoKHRoaXMudGFnIHwgMCkgIT09IHRoaXMudGFnKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYWcgbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXI6ICcgKyB0aGlzLnRhZylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB0byBhIFN0cmluZ1xuICAgKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBzdHJpbmcgb2YgdGhlIGZvcm0gJzEoMiknXG4gICAqL1xuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIGAke3RoaXMudGFnfSgke0pTT04uc3RyaW5naWZ5KHRoaXMudmFsdWUpfSlgXG4gIH1cblxuICAvKipcbiAgICogUHVzaCB0aGUgc2ltcGxlIHZhbHVlIG9udG8gdGhlIENCT1Igc3RyZWFtXG4gICAqXG4gICAqIEBwYXJhbSB7Y2Jvci5FbmNvZGVyfSBnZW4gLSBUaGUgZ2VuZXJhdG9yIHRvIHB1c2ggb250b1xuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZW5jb2RlQ0JPUiAoZ2VuKSB7XG4gICAgZ2VuLl9wdXNoVGFnKHRoaXMudGFnKVxuICAgIHJldHVybiBnZW4ucHVzaEFueSh0aGlzLnZhbHVlKVxuICB9XG5cbiAgLyoqXG4gICAqIElmIHdlIGhhdmUgYSBjb252ZXJ0ZXIgZm9yIHRoaXMgdHlwZSwgZG8gdGhlIGNvbnZlcnNpb24uICBTb21lIGNvbnZlcnRlcnNcbiAgICogYXJlIGJ1aWx0LWluLiAgQWRkaXRpb25hbCBvbmVzIGNhbiBiZSBwYXNzZWQgaW4uICBJZiB5b3Ugd2FudCB0byByZW1vdmVcbiAgICogYSBidWlsdC1pbiBjb252ZXJ0ZXIsIHBhc3MgYSBjb252ZXJ0ZXIgaW4gd2hvc2UgdmFsdWUgaXMgJ251bGwnIGluc3RlYWRcbiAgICogb2YgYSBmdW5jdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnZlcnRlcnMgLSBrZXlzIGluIHRoZSBvYmplY3QgYXJlIGEgdGFnIG51bWJlciwgdGhlIHZhbHVlXG4gICAqIGlzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgZGVjb2RlZCBDQk9SIGFuZCByZXR1cm5zIGEgSmF2YVNjcmlwdCB2YWx1ZVxuICAgKiBvZiB0aGUgYXBwcm9wcmlhdGUgdHlwZS4gIFRocm93IGFuIGV4Y2VwdGlvbiBpbiB0aGUgZnVuY3Rpb24gb24gZXJyb3JzLlxuICAgKiBAcmV0dXJucyB7YW55fSAtIHRoZSBjb252ZXJ0ZWQgaXRlbVxuICAgKi9cbiAgY29udmVydCAoY29udmVydGVycykge1xuICAgIGxldCBlciwgZlxuICAgIGYgPSBjb252ZXJ0ZXJzICE9IG51bGwgPyBjb252ZXJ0ZXJzW3RoaXMudGFnXSA6IHVuZGVmaW5lZFxuICAgIGlmICh0eXBlb2YgZiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZiA9IFRhZ2dlZFsnX3RhZycgKyB0aGlzLnRhZ11cbiAgICAgIGlmICh0eXBlb2YgZiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGYuY2FsbChUYWdnZWQsIHRoaXMudmFsdWUpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGVyID0gZXJyb3JcbiAgICAgIHRoaXMuZXJyID0gZXJcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGFnZ2VkXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgeyBCdWZmZXIgfSA9IHJlcXVpcmUoJ2J1ZmZlcicpXG5jb25zdCBCaWdudW1iZXIgPSByZXF1aXJlKCdiaWdudW1iZXIuanMnKS5CaWdOdW1iZXJcblxuY29uc3QgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKVxuY29uc3QgU0hJRlQzMiA9IGNvbnN0YW50cy5TSElGVDMyXG5jb25zdCBTSElGVDE2ID0gY29uc3RhbnRzLlNISUZUMTZcbmNvbnN0IE1BWF9TQUZFX0hJR0ggPSAweDFmZmZmZlxuXG5leHBvcnRzLnBhcnNlSGFsZiA9IGZ1bmN0aW9uIHBhcnNlSGFsZiAoYnVmKSB7XG4gIGNvbnN0IHNpZ24gPSBidWZbMF0gJiAweDgwID8gLTEgOiAxXG4gIGNvbnN0IGV4cCA9IChidWZbMF0gJiAweDdDKSA+PiAyXG4gIGNvbnN0IG1hbnQgPSAoKGJ1ZlswXSAmIDB4MDMpIDw8IDgpIHwgYnVmWzFdXG4gIGlmICghZXhwKSB7XG4gICAgcmV0dXJuIHNpZ24gKiA1Ljk2MDQ2NDQ3NzUzOTA2MjVlLTggKiBtYW50XG4gIH0gZWxzZSBpZiAoZXhwID09PSAweDFmKSB7XG4gICAgcmV0dXJuIHNpZ24gKiAobWFudCA/IDAgLyAwIDogMmUzMDgpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbG9zcy1vZi1wcmVjaXNpb25cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc2lnbiAqIE1hdGgucG93KDIsIGV4cCAtIDI1KSAqICgxMDI0ICsgbWFudClcbiAgfVxufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSB7XG4gICAgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIH1cblxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZXhwb3J0cy5hcnJheUJ1ZmZlclRvQmlnbnVtYmVyID0gZnVuY3Rpb24gKGJ1Zikge1xuICBjb25zdCBsZW4gPSBidWYuYnl0ZUxlbmd0aFxuICBsZXQgcmVzID0gJydcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIHJlcyArPSB0b0hleChidWZbaV0pXG4gIH1cblxuICByZXR1cm4gbmV3IEJpZ251bWJlcihyZXMsIDE2KVxufVxuXG4vLyBjb252ZXJ0IGFuIE9iamVjdCBpbnRvIGEgTWFwXG5leHBvcnRzLmJ1aWxkTWFwID0gKG9iaikgPT4ge1xuICBjb25zdCByZXMgPSBuZXcgTWFwKClcbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG9iailcbiAgY29uc3QgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHJlcy5zZXQoa2V5c1tpXSwgb2JqW2tleXNbaV1dKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZXhwb3J0cy5idWlsZEludDMyID0gKGYsIGcpID0+IHtcbiAgcmV0dXJuIGYgKiBTSElGVDE2ICsgZ1xufVxuXG5leHBvcnRzLmJ1aWxkSW50NjQgPSAoZjEsIGYyLCBnMSwgZzIpID0+IHtcbiAgY29uc3QgZiA9IGV4cG9ydHMuYnVpbGRJbnQzMihmMSwgZjIpXG4gIGNvbnN0IGcgPSBleHBvcnRzLmJ1aWxkSW50MzIoZzEsIGcyKVxuXG4gIGlmIChmID4gTUFYX1NBRkVfSElHSCkge1xuICAgIHJldHVybiBuZXcgQmlnbnVtYmVyKGYpLnRpbWVzKFNISUZUMzIpLnBsdXMoZylcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKGYgKiBTSElGVDMyKSArIGdcbiAgfVxufVxuXG5leHBvcnRzLndyaXRlSGFsZiA9IGZ1bmN0aW9uIHdyaXRlSGFsZiAoYnVmLCBoYWxmKSB7XG4gIC8vIGFzc3VtZSAwLCAtMCwgTmFOLCBJbmZpbml0eSwgYW5kIC1JbmZpbml0eSBoYXZlIGFscmVhZHkgYmVlbiBjYXVnaHRcblxuICAvLyBIQUNLOiBldmVyeW9uZSBzZXR0bGUgaW4uICBUaGlzIGlzbid0IGdvaW5nIHRvIGJlIHByZXR0eS5cbiAgLy8gVHJhbnNsYXRlIGNuLWNib3IncyBDIGNvZGUgKGZyb20gQ2Fyc3RlbiBCb3JtYW4pOlxuXG4gIC8vIHVpbnQzMl90IGJlMzI7XG4gIC8vIHVpbnQxNl90IGJlMTYsIHUxNjtcbiAgLy8gdW5pb24ge1xuICAvLyAgIGZsb2F0IGY7XG4gIC8vICAgdWludDMyX3QgdTtcbiAgLy8gfSB1MzI7XG4gIC8vIHUzMi5mID0gZmxvYXRfdmFsO1xuXG4gIGNvbnN0IHUzMiA9IEJ1ZmZlci5hbGxvY1Vuc2FmZSg0KVxuICB1MzIud3JpdGVGbG9hdEJFKGhhbGYsIDApXG4gIGNvbnN0IHUgPSB1MzIucmVhZFVJbnQzMkJFKDApXG5cbiAgLy8gaWYgKCh1MzIudSAmIDB4MUZGRikgPT0gMCkgeyAvKiB3b3J0aCB0cnlpbmcgaGFsZiAqL1xuXG4gIC8vIGhpbGRqajogSWYgdGhlIGxvd2VyIDEzIGJpdHMgYXJlIDAsIHdlIHdvbid0IGxvc2UgYW55dGhpbmcgaW4gdGhlIGNvbnZlcnNpb25cbiAgaWYgKCh1ICYgMHgxRkZGKSAhPT0gMCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gICBpbnQgczE2ID0gKHUzMi51ID4+IDE2KSAmIDB4ODAwMDtcbiAgLy8gICBpbnQgZXhwID0gKHUzMi51ID4+IDIzKSAmIDB4ZmY7XG4gIC8vICAgaW50IG1hbnQgPSB1MzIudSAmIDB4N2ZmZmZmO1xuXG4gIGxldCBzMTYgPSAodSA+PiAxNikgJiAweDgwMDAgLy8gdG9wIGJpdCBpcyBzaWduXG4gIGNvbnN0IGV4cCA9ICh1ID4+IDIzKSAmIDB4ZmYgLy8gdGhlbiA1IGJpdHMgb2YgZXhwb25lbnRcbiAgY29uc3QgbWFudCA9IHUgJiAweDdmZmZmZlxuXG4gIC8vICAgaWYgKGV4cCA9PSAwICYmIG1hbnQgPT0gMClcbiAgLy8gICAgIDsgICAgICAgICAgICAgIC8qIDAuMCwgLTAuMCAqL1xuXG4gIC8vIGhpbGRqajogemVyb3MgYWxyZWFkeSBoYW5kbGVkLiAgQXNzZXJ0IGlmIHlvdSBkb24ndCBiZWxpZXZlIG1lLlxuXG4gIC8vICAgZWxzZSBpZiAoZXhwID49IDExMyAmJiBleHAgPD0gMTQyKSAvKiBub3JtYWxpemVkICovXG4gIC8vICAgICBzMTYgKz0gKChleHAgLSAxMTIpIDw8IDEwKSArIChtYW50ID4+IDEzKTtcbiAgaWYgKChleHAgPj0gMTEzKSAmJiAoZXhwIDw9IDE0MikpIHtcbiAgICBzMTYgKz0gKChleHAgLSAxMTIpIDw8IDEwKSArIChtYW50ID4+IDEzKVxuXG4gIC8vICAgZWxzZSBpZiAoZXhwID49IDEwMyAmJiBleHAgPCAxMTMpIHsgLyogZGVub3JtLCBleHAxNiA9IDAgKi9cbiAgLy8gICAgIGlmIChtYW50ICYgKCgxIDw8ICgxMjYgLSBleHApKSAtIDEpKVxuICAvLyAgICAgICBnb3RvIGZsb2F0MzI7ICAgICAgICAgLyogbG9zcyBvZiBwcmVjaXNpb24gKi9cbiAgLy8gICAgIHMxNiArPSAoKG1hbnQgKyAweDgwMDAwMCkgPj4gKDEyNiAtIGV4cCkpO1xuICB9IGVsc2UgaWYgKChleHAgPj0gMTAzKSAmJiAoZXhwIDwgMTEzKSkge1xuICAgIGlmIChtYW50ICYgKCgxIDw8ICgxMjYgLSBleHApKSAtIDEpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgczE2ICs9ICgobWFudCArIDB4ODAwMDAwKSA+PiAoMTI2IC0gZXhwKSlcblxuICAgIC8vICAgfSBlbHNlIGlmIChleHAgPT0gMjU1ICYmIG1hbnQgPT0gMCkgeyAvKiBJbmYgKi9cbiAgICAvLyAgICAgczE2ICs9IDB4N2MwMDtcblxuICAgIC8vIGhpbGRqajogSW5maW5pdHkgYWxyZWFkeSBoYW5kbGVkXG5cbiAgLy8gICB9IGVsc2VcbiAgLy8gICAgIGdvdG8gZmxvYXQzMjsgICAgICAgICAgIC8qIGxvc3Mgb2YgcmFuZ2UgKi9cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vICAgZW5zdXJlX3dyaXRhYmxlKDMpO1xuICAvLyAgIHUxNiA9IHMxNjtcbiAgLy8gICBiZTE2ID0gaHRvbjE2cCgoY29uc3QgdWludDhfdCopJnUxNik7XG4gIGJ1Zi53cml0ZVVJbnQxNkJFKHMxNiwgMClcbiAgcmV0dXJuIHRydWVcbn1cblxuZXhwb3J0cy5rZXlTb3J0ZXIgPSBmdW5jdGlvbiAoYSwgYikge1xuICBjb25zdCBsZW5BID0gYVswXS5ieXRlTGVuZ3RoXG4gIGNvbnN0IGxlbkIgPSBiWzBdLmJ5dGVMZW5ndGhcblxuICBpZiAobGVuQSA+IGxlbkIpIHtcbiAgICByZXR1cm4gMVxuICB9XG5cbiAgaWYgKGxlbkIgPiBsZW5BKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cblxuICByZXR1cm4gYVswXS5jb21wYXJlKGJbMF0pXG59XG5cbi8vIEFkYXB0ZWQgZnJvbSBodHRwOi8vd3d3LjJhbGl0eS5jb20vMjAxMi8wMy9zaWduZWR6ZXJvLmh0bWxcbmV4cG9ydHMuaXNOZWdhdGl2ZVplcm8gPSAoeCkgPT4ge1xuICByZXR1cm4geCA9PT0gMCAmJiAoMSAvIHggPCAwKVxufVxuXG5leHBvcnRzLm5leHRQb3dlck9mMiA9IChuKSA9PiB7XG4gIGxldCBjb3VudCA9IDBcbiAgLy8gRmlyc3QgbiBpbiB0aGUgYmVsb3cgY29uZGl0aW9uIGlzIGZvclxuICAvLyB0aGUgY2FzZSB3aGVyZSBuIGlzIDBcbiAgaWYgKG4gJiYgIShuICYgKG4gLSAxKSkpIHtcbiAgICByZXR1cm4gblxuICB9XG5cbiAgd2hpbGUgKG4gIT09IDApIHtcbiAgICBuID4+PSAxXG4gICAgY291bnQgKz0gMVxuICB9XG5cbiAgcmV0dXJuIDEgPDwgY291bnRcbn1cbiIsIiIsIi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGh0dHBzOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuXG52YXIgS19NQVhfTEVOR1RIID0gMHg3ZmZmZmZmZlxuZXhwb3J0cy5rTWF4TGVuZ3RoID0gS19NQVhfTEVOR1RIXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFByaW50IHdhcm5pbmcgYW5kIHJlY29tbWVuZCB1c2luZyBgYnVmZmVyYCB2NC54IHdoaWNoIGhhcyBhbiBPYmplY3RcbiAqICAgICAgICAgICAgICAgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIFdlIHJlcG9ydCB0aGF0IHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGlmIHRoZSBhcmUgbm90IHN1YmNsYXNzYWJsZVxuICogdXNpbmcgX19wcm90b19fLiBGaXJlZm94IDQtMjkgbGFja3Mgc3VwcG9ydCBmb3IgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YFxuICogKFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4KS4gSUUgMTAgbGFja3Mgc3VwcG9ydFxuICogZm9yIF9fcHJvdG9fXyBhbmQgaGFzIGEgYnVnZ3kgdHlwZWQgYXJyYXkgaW1wbGVtZW50YXRpb24uXG4gKi9cbkJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUID0gdHlwZWRBcnJheVN1cHBvcnQoKVxuXG5pZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnNvbGUuZXJyb3IoXG4gICAgJ1RoaXMgYnJvd3NlciBsYWNrcyB0eXBlZCBhcnJheSAoVWludDhBcnJheSkgc3VwcG9ydCB3aGljaCBpcyByZXF1aXJlZCBieSAnICtcbiAgICAnYGJ1ZmZlcmAgdjUueC4gVXNlIGBidWZmZXJgIHY0LnggaWYgeW91IHJlcXVpcmUgb2xkIGJyb3dzZXIgc3VwcG9ydC4nXG4gIClcbn1cblxuZnVuY3Rpb24gdHlwZWRBcnJheVN1cHBvcnQgKCkge1xuICAvLyBDYW4gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWQ/XG4gIHRyeSB7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KDEpXG4gICAgYXJyLl9fcHJvdG9fXyA9IHsgX19wcm90b19fOiBVaW50OEFycmF5LnByb3RvdHlwZSwgZm9vOiBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9IH1cbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MlxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlci5wcm90b3R5cGUsICdwYXJlbnQnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKHRoaXMpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyXG4gIH1cbn0pXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIucHJvdG90eXBlLCAnb2Zmc2V0Jywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0aGlzKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHJldHVybiB0aGlzLmJ5dGVPZmZzZXRcbiAgfVxufSlcblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKGxlbmd0aCA+IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgXCInICsgbGVuZ3RoICsgJ1wiIGlzIGludmFsaWQgZm9yIG9wdGlvbiBcInNpemVcIicpXG4gIH1cbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgYnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGJ1ZlxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgc3RyaW5nLiBSZWNlaXZlZCB0eXBlIG51bWJlcidcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jVW5zYWZlKGFyZylcbiAgfVxuICByZXR1cm4gZnJvbShhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuLy8gRml4IHN1YmFycmF5KCkgaW4gRVMyMDE2LiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvOTdcbmlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wuc3BlY2llcyAhPSBudWxsICYmXG4gICAgQnVmZmVyW1N5bWJvbC5zcGVjaWVzXSA9PT0gQnVmZmVyKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIsIFN5bWJvbC5zcGVjaWVzLCB7XG4gICAgdmFsdWU6IG51bGwsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiBmYWxzZVxuICB9KVxufVxuXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxuZnVuY3Rpb24gZnJvbSAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0KVxuICB9XG5cbiAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5TGlrZSh2YWx1ZSlcbiAgfVxuXG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksICcgK1xuICAgICAgJ29yIEFycmF5LWxpa2UgT2JqZWN0LiBSZWNlaXZlZCB0eXBlICcgKyAodHlwZW9mIHZhbHVlKVxuICAgIClcbiAgfVxuXG4gIGlmIChpc0luc3RhbmNlKHZhbHVlLCBBcnJheUJ1ZmZlcikgfHxcbiAgICAgICh2YWx1ZSAmJiBpc0luc3RhbmNlKHZhbHVlLmJ1ZmZlciwgQXJyYXlCdWZmZXIpKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJ2YWx1ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIG9mIHR5cGUgbnVtYmVyLiBSZWNlaXZlZCB0eXBlIG51bWJlcidcbiAgICApXG4gIH1cblxuICB2YXIgdmFsdWVPZiA9IHZhbHVlLnZhbHVlT2YgJiYgdmFsdWUudmFsdWVPZigpXG4gIGlmICh2YWx1ZU9mICE9IG51bGwgJiYgdmFsdWVPZiAhPT0gdmFsdWUpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWVPZiwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgdmFyIGIgPSBmcm9tT2JqZWN0KHZhbHVlKVxuICBpZiAoYikgcmV0dXJuIGJcblxuICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvUHJpbWl0aXZlICE9IG51bGwgJiZcbiAgICAgIHR5cGVvZiB2YWx1ZVtTeW1ib2wudG9QcmltaXRpdmVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKFxuICAgICAgdmFsdWVbU3ltYm9sLnRvUHJpbWl0aXZlXSgnc3RyaW5nJyksIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aFxuICAgIClcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgJ1RoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksICcgK1xuICAgICdvciBBcnJheS1saWtlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB2YWx1ZSlcbiAgKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHRvIEJ1ZmZlcihhcmcsIGVuY29kaW5nKSBidXQgdGhyb3dzIGEgVHlwZUVycm9yXG4gKiBpZiB2YWx1ZSBpcyBhIG51bWJlci5cbiAqIEJ1ZmZlci5mcm9tKHN0clssIGVuY29kaW5nXSlcbiAqIEJ1ZmZlci5mcm9tKGFycmF5KVxuICogQnVmZmVyLmZyb20oYnVmZmVyKVxuICogQnVmZmVyLmZyb20oYXJyYXlCdWZmZXJbLCBieXRlT2Zmc2V0WywgbGVuZ3RoXV0pXG4gKiovXG5CdWZmZXIuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBmcm9tKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbi8vIE5vdGU6IENoYW5nZSBwcm90b3R5cGUgKmFmdGVyKiBCdWZmZXIuZnJvbSBpcyBkZWZpbmVkIHRvIHdvcmthcm91bmQgQ2hyb21lIGJ1Zzpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvMTQ4XG5CdWZmZXIucHJvdG90eXBlLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXkucHJvdG90eXBlXG5CdWZmZXIuX19wcm90b19fID0gVWludDhBcnJheVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgbnVtYmVyJylcbiAgfSBlbHNlIGlmIChzaXplIDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgXCInICsgc2l6ZSArICdcIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJzaXplXCInKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldHRlZCBhcyBhIHN0YXJ0IG9mZnNldC5cbiAgICByZXR1cm4gdHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJ1xuICAgICAgPyBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICAgIDogY3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbClcbiAgfVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBmaWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogYWxsb2Moc2l6ZVssIGZpbGxbLCBlbmNvZGluZ11dKVxuICoqL1xuQnVmZmVyLmFsbG9jID0gZnVuY3Rpb24gKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIHJldHVybiBhbGxvYyhzaXplLCBmaWxsLCBlbmNvZGluZylcbn1cblxuZnVuY3Rpb24gYWxsb2NVbnNhZmUgKHNpemUpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUgPCAwID8gMCA6IGNoZWNrZWQoc2l6ZSkgfCAwKVxufVxuXG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gQnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gU2xvd0J1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICovXG5CdWZmZXIuYWxsb2NVbnNhZmVTbG93ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgfVxuXG4gIGlmICghQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICB9XG5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuXG4gIHZhciBhY3R1YWwgPSBidWYud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIGJ1ZiA9IGJ1Zi5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggPCAwID8gMCA6IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICBidWZbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyIChhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcIm9mZnNldFwiIGlzIG91dHNpZGUgb2YgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQgKyAobGVuZ3RoIHx8IDApKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1wibGVuZ3RoXCIgaXMgb3V0c2lkZSBvZiBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIHZhciBidWZcbiAgaWYgKGJ5dGVPZmZzZXQgPT09IHVuZGVmaW5lZCAmJiBsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5KVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIGJ1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAob2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIHZhciBsZW4gPSBjaGVja2VkKG9iai5sZW5ndGgpIHwgMFxuICAgIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuKVxuXG4gICAgaWYgKGJ1Zi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBidWZcbiAgICB9XG5cbiAgICBvYmouY29weShidWYsIDAsIDAsIGxlbilcbiAgICByZXR1cm4gYnVmXG4gIH1cblxuICBpZiAob2JqLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHR5cGVvZiBvYmoubGVuZ3RoICE9PSAnbnVtYmVyJyB8fCBudW1iZXJJc05hTihvYmoubGVuZ3RoKSkge1xuICAgICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcigwKVxuICAgIH1cbiAgICByZXR1cm4gZnJvbUFycmF5TGlrZShvYmopXG4gIH1cblxuICBpZiAob2JqLnR5cGUgPT09ICdCdWZmZXInICYmIEFycmF5LmlzQXJyYXkob2JqLmRhdGEpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqLmRhdGEpXG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tlZCAobGVuZ3RoKSB7XG4gIC8vIE5vdGU6IGNhbm5vdCB1c2UgYGxlbmd0aCA8IEtfTUFYX0xFTkdUSGAgaGVyZSBiZWNhdXNlIHRoYXQgZmFpbHMgd2hlblxuICAvLyBsZW5ndGggaXMgTmFOICh3aGljaCBpcyBvdGhlcndpc2UgY29lcmNlZCB0byB6ZXJvLilcbiAgaWYgKGxlbmd0aCA+PSBLX01BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnc2l6ZTogMHgnICsgS19NQVhfTEVOR1RILnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuICB9XG4gIHJldHVybiBsZW5ndGggfCAwXG59XG5cbmZ1bmN0aW9uIFNsb3dCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAoK2xlbmd0aCAhPSBsZW5ndGgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICBsZW5ndGggPSAwXG4gIH1cbiAgcmV0dXJuIEJ1ZmZlci5hbGxvYygrbGVuZ3RoKVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlciAoYikge1xuICByZXR1cm4gYiAhPSBudWxsICYmIGIuX2lzQnVmZmVyID09PSB0cnVlICYmXG4gICAgYiAhPT0gQnVmZmVyLnByb3RvdHlwZSAvLyBzbyBCdWZmZXIuaXNCdWZmZXIoQnVmZmVyLnByb3RvdHlwZSkgd2lsbCBiZSBmYWxzZVxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGEsIGIpIHtcbiAgaWYgKGlzSW5zdGFuY2UoYSwgVWludDhBcnJheSkpIGEgPSBCdWZmZXIuZnJvbShhLCBhLm9mZnNldCwgYS5ieXRlTGVuZ3RoKVxuICBpZiAoaXNJbnN0YW5jZShiLCBVaW50OEFycmF5KSkgYiA9IEJ1ZmZlci5mcm9tKGIsIGIub2Zmc2V0LCBiLmJ5dGVMZW5ndGgpXG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGEpIHx8ICFCdWZmZXIuaXNCdWZmZXIoYikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcImJ1ZjFcIiwgXCJidWYyXCIgYXJndW1lbnRzIG11c3QgYmUgb25lIG9mIHR5cGUgQnVmZmVyIG9yIFVpbnQ4QXJyYXknXG4gICAgKVxuICB9XG5cbiAgaWYgKGEgPT09IGIpIHJldHVybiAwXG5cbiAgdmFyIHggPSBhLmxlbmd0aFxuICB2YXIgeSA9IGIubGVuZ3RoXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgeCA9IGFbaV1cbiAgICAgIHkgPSBiW2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiBpc0VuY29kaW5nIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdsYXRpbjEnOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gIH1cblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gQnVmZmVyLmFsbG9jKDApXG4gIH1cblxuICB2YXIgaVxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBsZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIGxlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBidWYgPSBsaXN0W2ldXG4gICAgaWYgKGlzSW5zdGFuY2UoYnVmLCBVaW50OEFycmF5KSkge1xuICAgICAgYnVmID0gQnVmZmVyLmZyb20oYnVmKVxuICAgIH1cbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICAgIH1cbiAgICBidWYuY29weShidWZmZXIsIHBvcylcbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKSB8fCBpc0luc3RhbmNlKHN0cmluZywgQXJyYXlCdWZmZXIpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBvciBBcnJheUJ1ZmZlci4gJyArXG4gICAgICAnUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIHN0cmluZ1xuICAgIClcbiAgfVxuXG4gIHZhciBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBtdXN0TWF0Y2ggPSAoYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdID09PSB0cnVlKVxuICBpZiAoIW11c3RNYXRjaCAmJiBsZW4gPT09IDApIHJldHVybiAwXG5cbiAgLy8gVXNlIGEgZm9yIGxvb3AgdG8gYXZvaWQgcmVjdXJzaW9uXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxlblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIGxlbiAqIDJcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBsZW4gPj4+IDFcbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHtcbiAgICAgICAgICByZXR1cm4gbXVzdE1hdGNoID8gLTEgOiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aCAvLyBhc3N1bWUgdXRmOFxuICAgICAgICB9XG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcblxuZnVuY3Rpb24gc2xvd1RvU3RyaW5nIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuXG4gIC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoYXQgXCJ0aGlzLmxlbmd0aCA8PSBNQVhfVUlOVDMyXCIgc2luY2UgaXQncyBhIHJlYWQtb25seVxuICAvLyBwcm9wZXJ0eSBvZiBhIHR5cGVkIGFycmF5LlxuXG4gIC8vIFRoaXMgYmVoYXZlcyBuZWl0aGVyIGxpa2UgU3RyaW5nIG5vciBVaW50OEFycmF5IGluIHRoYXQgd2Ugc2V0IHN0YXJ0L2VuZFxuICAvLyB0byB0aGVpciB1cHBlci9sb3dlciBib3VuZHMgaWYgdGhlIHZhbHVlIHBhc3NlZCBpcyBvdXQgb2YgcmFuZ2UuXG4gIC8vIHVuZGVmaW5lZCBpcyBoYW5kbGVkIHNwZWNpYWxseSBhcyBwZXIgRUNNQS0yNjIgNnRoIEVkaXRpb24sXG4gIC8vIFNlY3Rpb24gMTMuMy4zLjcgUnVudGltZSBTZW1hbnRpY3M6IEtleWVkQmluZGluZ0luaXRpYWxpemF0aW9uLlxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCB8fCBzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICAvLyBSZXR1cm4gZWFybHkgaWYgc3RhcnQgPiB0aGlzLmxlbmd0aC4gRG9uZSBoZXJlIHRvIHByZXZlbnQgcG90ZW50aWFsIHVpbnQzMlxuICAvLyBjb2VyY2lvbiBmYWlsIGJlbG93LlxuICBpZiAoc3RhcnQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChlbmQgPD0gMCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgLy8gRm9yY2UgY29lcnNpb24gdG8gdWludDMyLiBUaGlzIHdpbGwgYWxzbyBjb2VyY2UgZmFsc2V5L05hTiB2YWx1ZXMgdG8gMC5cbiAgZW5kID4+Pj0gMFxuICBzdGFydCA+Pj49IDBcblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHV0ZjE2bGVTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoZW5jb2RpbmcgKyAnJykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuLy8gVGhpcyBwcm9wZXJ0eSBpcyB1c2VkIGJ5IGBCdWZmZXIuaXNCdWZmZXJgIChhbmQgdGhlIGBpcy1idWZmZXJgIG5wbSBwYWNrYWdlKVxuLy8gdG8gZGV0ZWN0IGEgQnVmZmVyIGluc3RhbmNlLiBJdCdzIG5vdCBwb3NzaWJsZSB0byB1c2UgYGluc3RhbmNlb2YgQnVmZmVyYFxuLy8gcmVsaWFibHkgaW4gYSBicm93c2VyaWZ5IGNvbnRleHQgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBtdWx0aXBsZSBkaWZmZXJlbnRcbi8vIGNvcGllcyBvZiB0aGUgJ2J1ZmZlcicgcGFja2FnZSBpbiB1c2UuIFRoaXMgbWV0aG9kIHdvcmtzIGV2ZW4gZm9yIEJ1ZmZlclxuLy8gaW5zdGFuY2VzIHRoYXQgd2VyZSBjcmVhdGVkIGZyb20gYW5vdGhlciBjb3B5IG9mIHRoZSBgYnVmZmVyYCBwYWNrYWdlLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMTU0XG5CdWZmZXIucHJvdG90eXBlLl9pc0J1ZmZlciA9IHRydWVcblxuZnVuY3Rpb24gc3dhcCAoYiwgbiwgbSkge1xuICB2YXIgaSA9IGJbbl1cbiAgYltuXSA9IGJbbV1cbiAgYlttXSA9IGlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMTYgPSBmdW5jdGlvbiBzd2FwMTYgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDIgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDE2LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAxKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDMyID0gZnVuY3Rpb24gc3dhcDMyICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA0ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAzMi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgMilcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXA2NCA9IGZ1bmN0aW9uIHN3YXA2NCAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgOCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gOCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDcpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDYpXG4gICAgc3dhcCh0aGlzLCBpICsgMiwgaSArIDUpXG4gICAgc3dhcCh0aGlzLCBpICsgMywgaSArIDQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW5ndGggPT09IDApIHJldHVybiAnJ1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCAwLCBsZW5ndGgpXG4gIHJldHVybiBzbG93VG9TdHJpbmcuYXBwbHkodGhpcywgYXJndW1lbnRzKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvTG9jYWxlU3RyaW5nID0gQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZ1xuXG5CdWZmZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyAoYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIGlmICh0aGlzID09PSBiKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcywgYikgPT09IDBcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLnJlcGxhY2UoLyguezJ9KS9nLCAnJDEgJykudHJpbSgpXG4gIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgcmV0dXJuICc8QnVmZmVyICcgKyBzdHIgKyAnPidcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAodGFyZ2V0LCBzdGFydCwgZW5kLCB0aGlzU3RhcnQsIHRoaXNFbmQpIHtcbiAgaWYgKGlzSW5zdGFuY2UodGFyZ2V0LCBVaW50OEFycmF5KSkge1xuICAgIHRhcmdldCA9IEJ1ZmZlci5mcm9tKHRhcmdldCwgdGFyZ2V0Lm9mZnNldCwgdGFyZ2V0LmJ5dGVMZW5ndGgpXG4gIH1cbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwidGFyZ2V0XCIgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBCdWZmZXIgb3IgVWludDhBcnJheS4gJyArXG4gICAgICAnUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB0YXJnZXQpXG4gICAgKVxuICB9XG5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICBpZiAoZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmQgPSB0YXJnZXQgPyB0YXJnZXQubGVuZ3RoIDogMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNTdGFydCA9IDBcbiAgfVxuICBpZiAodGhpc0VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc0VuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoc3RhcnQgPCAwIHx8IGVuZCA+IHRhcmdldC5sZW5ndGggfHwgdGhpc1N0YXJ0IDwgMCB8fCB0aGlzRW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCAmJiBzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCkge1xuICAgIHJldHVybiAtMVxuICB9XG4gIGlmIChzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMVxuICB9XG5cbiAgc3RhcnQgPj4+PSAwXG4gIGVuZCA+Pj49IDBcbiAgdGhpc1N0YXJ0ID4+Pj0gMFxuICB0aGlzRW5kID4+Pj0gMFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQpIHJldHVybiAwXG5cbiAgdmFyIHggPSB0aGlzRW5kIC0gdGhpc1N0YXJ0XG4gIHZhciB5ID0gZW5kIC0gc3RhcnRcbiAgdmFyIGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgdmFyIHRoaXNDb3B5ID0gdGhpcy5zbGljZSh0aGlzU3RhcnQsIHRoaXNFbmQpXG4gIHZhciB0YXJnZXRDb3B5ID0gdGFyZ2V0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIGlmICh0aGlzQ29weVtpXSAhPT0gdGFyZ2V0Q29weVtpXSkge1xuICAgICAgeCA9IHRoaXNDb3B5W2ldXG4gICAgICB5ID0gdGFyZ2V0Q29weVtpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbi8vIEZpbmRzIGVpdGhlciB0aGUgZmlyc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0ID49IGBieXRlT2Zmc2V0YCxcbi8vIE9SIHRoZSBsYXN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA8PSBgYnl0ZU9mZnNldGAuXG4vL1xuLy8gQXJndW1lbnRzOlxuLy8gLSBidWZmZXIgLSBhIEJ1ZmZlciB0byBzZWFyY2hcbi8vIC0gdmFsIC0gYSBzdHJpbmcsIEJ1ZmZlciwgb3IgbnVtYmVyXG4vLyAtIGJ5dGVPZmZzZXQgLSBhbiBpbmRleCBpbnRvIGBidWZmZXJgOyB3aWxsIGJlIGNsYW1wZWQgdG8gYW4gaW50MzJcbi8vIC0gZW5jb2RpbmcgLSBhbiBvcHRpb25hbCBlbmNvZGluZywgcmVsZXZhbnQgaXMgdmFsIGlzIGEgc3RyaW5nXG4vLyAtIGRpciAtIHRydWUgZm9yIGluZGV4T2YsIGZhbHNlIGZvciBsYXN0SW5kZXhPZlxuZnVuY3Rpb24gYmlkaXJlY3Rpb25hbEluZGV4T2YgKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIC8vIEVtcHR5IGJ1ZmZlciBtZWFucyBubyBtYXRjaFxuICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xXG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXRcbiAgaWYgKHR5cGVvZiBieXRlT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gYnl0ZU9mZnNldFxuICAgIGJ5dGVPZmZzZXQgPSAwXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA+IDB4N2ZmZmZmZmYpIHtcbiAgICBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAtMHg4MDAwMDAwMCkge1xuICAgIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICB9XG4gIGJ5dGVPZmZzZXQgPSArYnl0ZU9mZnNldCAvLyBDb2VyY2UgdG8gTnVtYmVyLlxuICBpZiAobnVtYmVySXNOYU4oYnl0ZU9mZnNldCkpIHtcbiAgICAvLyBieXRlT2Zmc2V0OiBpdCBpdCdzIHVuZGVmaW5lZCwgbnVsbCwgTmFOLCBcImZvb1wiLCBldGMsIHNlYXJjaCB3aG9sZSBidWZmZXJcbiAgICBieXRlT2Zmc2V0ID0gZGlyID8gMCA6IChidWZmZXIubGVuZ3RoIC0gMSlcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0OiBuZWdhdGl2ZSBvZmZzZXRzIHN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIGlmIChieXRlT2Zmc2V0IDwgMCkgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggKyBieXRlT2Zmc2V0XG4gIGlmIChieXRlT2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBpZiAoZGlyKSByZXR1cm4gLTFcbiAgICBlbHNlIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoIC0gMVxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAwKSB7XG4gICAgaWYgKGRpcikgYnl0ZU9mZnNldCA9IDBcbiAgICBlbHNlIHJldHVybiAtMVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIHZhbFxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWwgPSBCdWZmZXIuZnJvbSh2YWwsIGVuY29kaW5nKVxuICB9XG5cbiAgLy8gRmluYWxseSwgc2VhcmNoIGVpdGhlciBpbmRleE9mIChpZiBkaXIgaXMgdHJ1ZSkgb3IgbGFzdEluZGV4T2ZcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWwpKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcvYnVmZmVyIGFsd2F5cyBmYWlsc1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDB4RkYgLy8gU2VhcmNoIGZvciBhIGJ5dGUgdmFsdWUgWzAtMjU1XVxuICAgIGlmICh0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKGRpcikge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCBbIHZhbCBdLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuZnVuY3Rpb24gYXJyYXlJbmRleE9mIChhcnIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICB2YXIgaW5kZXhTaXplID0gMVxuICB2YXIgYXJyTGVuZ3RoID0gYXJyLmxlbmd0aFxuICB2YXIgdmFsTGVuZ3RoID0gdmFsLmxlbmd0aFxuXG4gIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAoZW5jb2RpbmcgPT09ICd1Y3MyJyB8fCBlbmNvZGluZyA9PT0gJ3Vjcy0yJyB8fFxuICAgICAgICBlbmNvZGluZyA9PT0gJ3V0ZjE2bGUnIHx8IGVuY29kaW5nID09PSAndXRmLTE2bGUnKSB7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA8IDIgfHwgdmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9XG4gICAgICBpbmRleFNpemUgPSAyXG4gICAgICBhcnJMZW5ndGggLz0gMlxuICAgICAgdmFsTGVuZ3RoIC89IDJcbiAgICAgIGJ5dGVPZmZzZXQgLz0gMlxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWQgKGJ1ZiwgaSkge1xuICAgIGlmIChpbmRleFNpemUgPT09IDEpIHtcbiAgICAgIHJldHVybiBidWZbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJ1Zi5yZWFkVUludDE2QkUoaSAqIGluZGV4U2l6ZSlcbiAgICB9XG4gIH1cblxuICB2YXIgaVxuICBpZiAoZGlyKSB7XG4gICAgdmFyIGZvdW5kSW5kZXggPSAtMVxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPCBhcnJMZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJlYWQoYXJyLCBpKSA9PT0gcmVhZCh2YWwsIGZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4KSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbExlbmd0aCkgcmV0dXJuIGZvdW5kSW5kZXggKiBpbmRleFNpemVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ICE9PSAtMSkgaSAtPSBpIC0gZm91bmRJbmRleFxuICAgICAgICBmb3VuZEluZGV4ID0gLTFcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGJ5dGVPZmZzZXQgKyB2YWxMZW5ndGggPiBhcnJMZW5ndGgpIGJ5dGVPZmZzZXQgPSBhcnJMZW5ndGggLSB2YWxMZW5ndGhcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGZvdW5kID0gdHJ1ZVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWxMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAocmVhZChhcnIsIGkgKyBqKSAhPT0gcmVhZCh2YWwsIGopKSB7XG4gICAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiB0aGlzLmluZGV4T2YodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykgIT09IC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIHRydWUpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUubGFzdEluZGV4T2YgPSBmdW5jdGlvbiBsYXN0SW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBpZiAobnVtYmVySXNOYU4ocGFyc2VkKSkgcmV0dXJuIGlcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBwYXJzZWRcbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiB1dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBhc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGxhdGluMVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGFzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gdWNzMldyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nKVxuICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIG9mZnNldFssIGxlbmd0aF1bLCBlbmNvZGluZ10pXG4gIH0gZWxzZSBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggPj4+IDBcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSBlbmNvZGluZyA9ICd1dGY4J1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdCdWZmZXIud3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0WywgbGVuZ3RoXSkgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCdcbiAgICApXG4gIH1cblxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICAvLyBXYXJuaW5nOiBtYXhMZW5ndGggbm90IHRha2VuIGludG8gYWNjb3VudCBpbiBiYXNlNjRXcml0ZVxuICAgICAgICByZXR1cm4gYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHVjczJXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG4gIHZhciByZXMgPSBbXVxuXG4gIHZhciBpID0gc3RhcnRcbiAgd2hpbGUgKGkgPCBlbmQpIHtcbiAgICB2YXIgZmlyc3RCeXRlID0gYnVmW2ldXG4gICAgdmFyIGNvZGVQb2ludCA9IG51bGxcbiAgICB2YXIgYnl0ZXNQZXJTZXF1ZW5jZSA9IChmaXJzdEJ5dGUgPiAweEVGKSA/IDRcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4REYpID8gM1xuICAgICAgICA6IChmaXJzdEJ5dGUgPiAweEJGKSA/IDJcbiAgICAgICAgICA6IDFcblxuICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA8PSBlbmQpIHtcbiAgICAgIHZhciBzZWNvbmRCeXRlLCB0aGlyZEJ5dGUsIGZvdXJ0aEJ5dGUsIHRlbXBDb2RlUG9pbnRcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4MUYpIDw8IDB4NiB8IChzZWNvbmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Rikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweEMgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGRiAmJiAodGVtcENvZGVQb2ludCA8IDB4RDgwMCB8fCB0ZW1wQ29kZVBvaW50ID4gMHhERkZGKSkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBmb3VydGhCeXRlID0gYnVmW2kgKyAzXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAoZm91cnRoQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHgxMiB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHhDIHwgKHRoaXJkQnl0ZSAmIDB4M0YpIDw8IDB4NiB8IChmb3VydGhCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhGRkZGICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlUG9pbnQgPT09IG51bGwpIHtcbiAgICAgIC8vIHdlIGRpZCBub3QgZ2VuZXJhdGUgYSB2YWxpZCBjb2RlUG9pbnQgc28gaW5zZXJ0IGFcbiAgICAgIC8vIHJlcGxhY2VtZW50IGNoYXIgKFUrRkZGRCkgYW5kIGFkdmFuY2Ugb25seSAxIGJ5dGVcbiAgICAgIGNvZGVQb2ludCA9IDB4RkZGRFxuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDFcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuICAgICAgLy8gZW5jb2RlIHRvIHV0ZjE2IChzdXJyb2dhdGUgcGFpciBkYW5jZSlcbiAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwXG4gICAgICByZXMucHVzaChjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApXG4gICAgICBjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRlxuICAgIH1cblxuICAgIHJlcy5wdXNoKGNvZGVQb2ludClcbiAgICBpICs9IGJ5dGVzUGVyU2VxdWVuY2VcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKVxufVxuXG4vLyBCYXNlZCBvbiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjc0NzI3Mi82ODA3NDIsIHRoZSBicm93c2VyIHdpdGhcbi8vIHRoZSBsb3dlc3QgbGltaXQgaXMgQ2hyb21lLCB3aXRoIDB4MTAwMDAgYXJncy5cbi8vIFdlIGdvIDEgbWFnbml0dWRlIGxlc3MsIGZvciBzYWZldHlcbnZhciBNQVhfQVJHVU1FTlRTX0xFTkdUSCA9IDB4MTAwMFxuXG5mdW5jdGlvbiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkgKGNvZGVQb2ludHMpIHtcbiAgdmFyIGxlbiA9IGNvZGVQb2ludHMubGVuZ3RoXG4gIGlmIChsZW4gPD0gTUFYX0FSR1VNRU5UU19MRU5HVEgpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShTdHJpbmcsIGNvZGVQb2ludHMpIC8vIGF2b2lkIGV4dHJhIHNsaWNlKClcbiAgfVxuXG4gIC8vIERlY29kZSBpbiBjaHVua3MgdG8gYXZvaWQgXCJjYWxsIHN0YWNrIHNpemUgZXhjZWVkZWRcIi5cbiAgdmFyIHJlcyA9ICcnXG4gIHZhciBpID0gMFxuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFxuICAgICAgU3RyaW5nLFxuICAgICAgY29kZVBvaW50cy5zbGljZShpLCBpICs9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKVxuICAgIClcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldICYgMHg3RilcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGxhdGluMVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGhleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyAoYnl0ZXNbaSArIDFdICogMjU2KSlcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICB2YXIgbmV3QnVmID0gdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKVxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICBuZXdCdWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gbmV3QnVmXG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb2Zmc2V0IGlzIG5vdCB1aW50JylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RyeWluZyB0byBhY2Nlc3MgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50TEUgPSBmdW5jdGlvbiByZWFkVUludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG4gIH1cblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdXG4gIHZhciBtdWwgPSAxXG4gIHdoaWxlIChieXRlTGVuZ3RoID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50TEUgPSBmdW5jdGlvbiByZWFkSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludEJFID0gZnVuY3Rpb24gcmVhZEludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aFxuICB2YXIgbXVsID0gMVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWldXG4gIHdoaWxlIChpID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0taV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gcmVhZEludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIGlmICghKHRoaXNbb2Zmc2V0XSAmIDB4ODApKSByZXR1cm4gKHRoaXNbb2Zmc2V0XSlcbiAgcmV0dXJuICgoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTEpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiByZWFkSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gcmVhZEludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0pIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSA8PCAyNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDI0KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiByZWFkRmxvYXRMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gcmVhZEZsb2F0QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gcmVhZERvdWJsZUxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gcmVhZERvdWJsZUJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDUyLCA4KVxufVxuXG5mdW5jdGlvbiBjaGVja0ludCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiYnVmZmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBpcyBvdXQgb2YgYm91bmRzJylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFID0gZnVuY3Rpb24gd3JpdGVVSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlVUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweGZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEUgPSBmdW5jdGlvbiB3cml0ZUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsICg4ICogYnl0ZUxlbmd0aCkgLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IDBcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpIC0gMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludEJFID0gZnVuY3Rpb24gd3JpdGVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSArIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuZnVuY3Rpb24gY2hlY2tJRUVFNzU0IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAob2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDQsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gd3JpdGVGbG9hdEJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA4LCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxuICByZXR1cm4gb2Zmc2V0ICsgOFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkgKHRhcmdldCwgdGFyZ2V0U3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcignYXJndW1lbnQgc2hvdWxkIGJlIGEgQnVmZmVyJylcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldFN0YXJ0ID49IHRhcmdldC5sZW5ndGgpIHRhcmdldFN0YXJ0ID0gdGFyZ2V0Lmxlbmd0aFxuICBpZiAoIXRhcmdldFN0YXJ0KSB0YXJnZXRTdGFydCA9IDBcbiAgaWYgKGVuZCA+IDAgJiYgZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gMFxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCB0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGlmICh0YXJnZXRTdGFydCA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIH1cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChlbmQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCA8IGVuZCAtIHN0YXJ0KSB7XG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0ICsgc3RhcnRcbiAgfVxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBVc2UgYnVpbHQtaW4gd2hlbiBhdmFpbGFibGUsIG1pc3NpbmcgZnJvbSBJRTExXG4gICAgdGhpcy5jb3B5V2l0aGluKHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKVxuICB9IGVsc2UgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yICh2YXIgaSA9IGxlbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgIHRhcmdldCxcbiAgICAgIHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCksXG4gICAgICB0YXJnZXRTdGFydFxuICAgIClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gVXNhZ2U6XG4vLyAgICBidWZmZXIuZmlsbChudW1iZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKGJ1ZmZlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoc3RyaW5nWywgb2Zmc2V0WywgZW5kXV1bLCBlbmNvZGluZ10pXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWwsIHN0YXJ0LCBlbmQsIGVuY29kaW5nKSB7XG4gIC8vIEhhbmRsZSBzdHJpbmcgY2FzZXM6XG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IHN0YXJ0XG4gICAgICBzdGFydCA9IDBcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5kID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBlbmRcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuY29kaW5nIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgfVxuICAgIGlmICh2YWwubGVuZ3RoID09PSAxKSB7XG4gICAgICB2YXIgY29kZSA9IHZhbC5jaGFyQ29kZUF0KDApXG4gICAgICBpZiAoKGVuY29kaW5nID09PSAndXRmOCcgJiYgY29kZSA8IDEyOCkgfHxcbiAgICAgICAgICBlbmNvZGluZyA9PT0gJ2xhdGluMScpIHtcbiAgICAgICAgLy8gRmFzdCBwYXRoOiBJZiBgdmFsYCBmaXRzIGludG8gYSBzaW5nbGUgYnl0ZSwgdXNlIHRoYXQgbnVtZXJpYyB2YWx1ZS5cbiAgICAgICAgdmFsID0gY29kZVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDI1NVxuICB9XG5cbiAgLy8gSW52YWxpZCByYW5nZXMgYXJlIG5vdCBzZXQgdG8gYSBkZWZhdWx0LCBzbyBjYW4gcmFuZ2UgY2hlY2sgZWFybHkuXG4gIGlmIChzdGFydCA8IDAgfHwgdGhpcy5sZW5ndGggPCBzdGFydCB8fCB0aGlzLmxlbmd0aCA8IGVuZCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdPdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sZW5ndGggOiBlbmQgPj4+IDBcblxuICBpZiAoIXZhbCkgdmFsID0gMFxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICAgIHRoaXNbaV0gPSB2YWxcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGJ5dGVzID0gQnVmZmVyLmlzQnVmZmVyKHZhbClcbiAgICAgID8gdmFsXG4gICAgICA6IEJ1ZmZlci5mcm9tKHZhbCwgZW5jb2RpbmcpXG4gICAgdmFyIGxlbiA9IGJ5dGVzLmxlbmd0aFxuICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSB2YWx1ZSBcIicgKyB2YWwgK1xuICAgICAgICAnXCIgaXMgaW52YWxpZCBmb3IgYXJndW1lbnQgXCJ2YWx1ZVwiJylcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGVuZCAtIHN0YXJ0OyArK2kpIHtcbiAgICAgIHRoaXNbaSArIHN0YXJ0XSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG52YXIgSU5WQUxJRF9CQVNFNjRfUkUgPSAvW14rLzAtOUEtWmEtei1fXS9nXG5cbmZ1bmN0aW9uIGJhc2U2NGNsZWFuIChzdHIpIHtcbiAgLy8gTm9kZSB0YWtlcyBlcXVhbCBzaWducyBhcyBlbmQgb2YgdGhlIEJhc2U2NCBlbmNvZGluZ1xuICBzdHIgPSBzdHIuc3BsaXQoJz0nKVswXVxuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyLnRyaW0oKS5yZXBsYWNlKElOVkFMSURfQkFTRTY0X1JFLCAnJylcbiAgLy8gTm9kZSBjb252ZXJ0cyBzdHJpbmdzIHdpdGggbGVuZ3RoIDwgMiB0byAnJ1xuICBpZiAoc3RyLmxlbmd0aCA8IDIpIHJldHVybiAnJ1xuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgdmFyIGNvZGVQb2ludFxuICB2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgdmFyIGJ5dGVzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICghbGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMiBsZWFkcyBpbiBhIHJvd1xuICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgY29kZVBvaW50ID0gKGxlYWRTdXJyb2dhdGUgLSAweEQ4MDAgPDwgMTAgfCBjb2RlUG9pbnQgLSAweERDMDApICsgMHgxMDAwMFxuICAgIH0gZWxzZSBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgLy8gdmFsaWQgYm1wIGNoYXIsIGJ1dCBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgfVxuXG4gICAgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDgwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2IHwgMHhDMCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyB8IDB4RTAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDEyIHwgMHhGMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb2RlIHBvaW50JylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcblxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KGJhc2U2NGNsZWFuKHN0cikpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbi8vIEFycmF5QnVmZmVyIG9yIFVpbnQ4QXJyYXkgb2JqZWN0cyBmcm9tIG90aGVyIGNvbnRleHRzIChpLmUuIGlmcmFtZXMpIGRvIG5vdCBwYXNzXG4vLyB0aGUgYGluc3RhbmNlb2ZgIGNoZWNrIGJ1dCB0aGV5IHNob3VsZCBiZSB0cmVhdGVkIGFzIG9mIHRoYXQgdHlwZS5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvaXNzdWVzLzE2NlxuZnVuY3Rpb24gaXNJbnN0YW5jZSAob2JqLCB0eXBlKSB7XG4gIHJldHVybiBvYmogaW5zdGFuY2VvZiB0eXBlIHx8XG4gICAgKG9iaiAhPSBudWxsICYmIG9iai5jb25zdHJ1Y3RvciAhPSBudWxsICYmIG9iai5jb25zdHJ1Y3Rvci5uYW1lICE9IG51bGwgJiZcbiAgICAgIG9iai5jb25zdHJ1Y3Rvci5uYW1lID09PSB0eXBlLm5hbWUpXG59XG5mdW5jdGlvbiBudW1iZXJJc05hTiAob2JqKSB7XG4gIC8vIEZvciBJRTExIHN1cHBvcnRcbiAgcmV0dXJuIG9iaiAhPT0gb2JqIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG59XG4iLCIvKiEgaWVlZTc1NC4gQlNELTMtQ2xhdXNlIExpY2Vuc2UuIEZlcm9zcyBBYm91a2hhZGlqZWggPGh0dHBzOi8vZmVyb3NzLm9yZy9vcGVuc291cmNlPiAqL1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSAoZSAqIDI1NikgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSAobSAqIDI1NikgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gKG5CeXRlcyAqIDgpIC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICgodmFsdWUgKiBjKSAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IHtcbiAgVVJMV2l0aExlZ2FjeVN1cHBvcnQsXG4gIGZvcm1hdCxcbiAgVVJMU2VhcmNoUGFyYW1zLFxuICBkZWZhdWx0QmFzZVxufSA9IHJlcXVpcmUoJy4vc3JjL3VybCcpXG5jb25zdCByZWxhdGl2ZSA9IHJlcXVpcmUoJy4vc3JjL3JlbGF0aXZlJylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFVSTDogVVJMV2l0aExlZ2FjeVN1cHBvcnQsXG4gIFVSTFNlYXJjaFBhcmFtcyxcbiAgZm9ybWF0LFxuICByZWxhdGl2ZSxcbiAgZGVmYXVsdEJhc2Vcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCB7IFVSTFdpdGhMZWdhY3lTdXBwb3J0LCBmb3JtYXQgfSA9IHJlcXVpcmUoJy4vdXJsJylcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZyB8IHVuZGVmaW5lZH0gdXJsXG4gKiBAcGFyYW0ge2FueX0gW2xvY2F0aW9uXVxuICogQHBhcmFtIHthbnl9IFtwcm90b2NvbE1hcF1cbiAqIEBwYXJhbSB7YW55fSBbZGVmYXVsdFByb3RvY29sXVxuICovXG5tb2R1bGUuZXhwb3J0cyA9ICh1cmwsIGxvY2F0aW9uID0ge30sIHByb3RvY29sTWFwID0ge30sIGRlZmF1bHRQcm90b2NvbCkgPT4ge1xuICBsZXQgcHJvdG9jb2wgPSBsb2NhdGlvbi5wcm90b2NvbFxuICAgID8gbG9jYXRpb24ucHJvdG9jb2wucmVwbGFjZSgnOicsICcnKVxuICAgIDogJ2h0dHAnXG5cbiAgLy8gQ2hlY2sgcHJvdG9jb2wgbWFwXG4gIHByb3RvY29sID0gKHByb3RvY29sTWFwW3Byb3RvY29sXSB8fCBkZWZhdWx0UHJvdG9jb2wgfHwgcHJvdG9jb2wpICsgJzonXG4gIGxldCB1cmxQYXJzZWRcblxuICB0cnkge1xuICAgIHVybFBhcnNlZCA9IG5ldyBVUkxXaXRoTGVnYWN5U3VwcG9ydCh1cmwpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHVybFBhcnNlZCA9IHt9XG4gIH1cblxuICBjb25zdCBiYXNlID0gT2JqZWN0LmFzc2lnbih7fSwgbG9jYXRpb24sIHtcbiAgICBwcm90b2NvbDogcHJvdG9jb2wgfHwgdXJsUGFyc2VkLnByb3RvY29sLFxuICAgIGhvc3Q6IGxvY2F0aW9uLmhvc3QgfHwgdXJsUGFyc2VkLmhvc3RcbiAgfSlcblxuICByZXR1cm4gbmV3IFVSTFdpdGhMZWdhY3lTdXBwb3J0KHVybCwgZm9ybWF0KGJhc2UpKS50b1N0cmluZygpXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgaXNSZWFjdE5hdGl2ZSA9XG4gICAgdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJ1xuXG5mdW5jdGlvbiBnZXREZWZhdWx0QmFzZSAoKSB7XG4gIGlmIChpc1JlYWN0TmF0aXZlKSB7XG4gICAgcmV0dXJuICdodHRwOi8vbG9jYWxob3N0J1xuICB9XG5cbiAgcmV0dXJuIHNlbGYubG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgc2VsZi5sb2NhdGlvbi5ob3N0XG59XG5cbmNvbnN0IFVSTCA9IHNlbGYuVVJMXG5jb25zdCBkZWZhdWx0QmFzZSA9IGdldERlZmF1bHRCYXNlKClcblxuY2xhc3MgVVJMV2l0aExlZ2FjeVN1cHBvcnQge1xuICBjb25zdHJ1Y3RvciAodXJsID0gJycsIGJhc2UgPSBkZWZhdWx0QmFzZSkge1xuICAgIHRoaXMuc3VwZXIgPSBuZXcgVVJMKHVybCwgYmFzZSlcbiAgICB0aGlzLnBhdGggPSB0aGlzLnBhdGhuYW1lICsgdGhpcy5zZWFyY2hcbiAgICB0aGlzLmF1dGggPVxuICAgICAgICAgICAgdGhpcy51c2VybmFtZSAmJiB0aGlzLnBhc3N3b3JkXG4gICAgICAgICAgICAgID8gdGhpcy51c2VybmFtZSArICc6JyArIHRoaXMucGFzc3dvcmRcbiAgICAgICAgICAgICAgOiBudWxsXG5cbiAgICB0aGlzLnF1ZXJ5ID1cbiAgICAgICAgICAgIHRoaXMuc2VhcmNoICYmIHRoaXMuc2VhcmNoLnN0YXJ0c1dpdGgoJz8nKVxuICAgICAgICAgICAgICA/IHRoaXMuc2VhcmNoLnNsaWNlKDEpXG4gICAgICAgICAgICAgIDogbnVsbFxuICB9XG5cbiAgZ2V0IGhhc2ggKCkge1xuICAgIHJldHVybiB0aGlzLnN1cGVyLmhhc2hcbiAgfVxuXG4gIGdldCBob3N0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5zdXBlci5ob3N0XG4gIH1cblxuICBnZXQgaG9zdG5hbWUgKCkge1xuICAgIHJldHVybiB0aGlzLnN1cGVyLmhvc3RuYW1lXG4gIH1cblxuICBnZXQgaHJlZiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3VwZXIuaHJlZlxuICB9XG5cbiAgZ2V0IG9yaWdpbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3VwZXIub3JpZ2luXG4gIH1cblxuICBnZXQgcGFzc3dvcmQgKCkge1xuICAgIHJldHVybiB0aGlzLnN1cGVyLnBhc3N3b3JkXG4gIH1cblxuICBnZXQgcGF0aG5hbWUgKCkge1xuICAgIHJldHVybiB0aGlzLnN1cGVyLnBhdGhuYW1lXG4gIH1cblxuICBnZXQgcG9ydCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3VwZXIucG9ydFxuICB9XG5cbiAgZ2V0IHByb3RvY29sICgpIHtcbiAgICByZXR1cm4gdGhpcy5zdXBlci5wcm90b2NvbFxuICB9XG5cbiAgZ2V0IHNlYXJjaCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3VwZXIuc2VhcmNoXG4gIH1cblxuICBnZXQgc2VhcmNoUGFyYW1zICgpIHtcbiAgICByZXR1cm4gdGhpcy5zdXBlci5zZWFyY2hQYXJhbXNcbiAgfVxuXG4gIGdldCB1c2VybmFtZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3VwZXIudXNlcm5hbWVcbiAgfVxuXG4gIHNldCBoYXNoIChoYXNoKSB7XG4gICAgdGhpcy5zdXBlci5oYXNoID0gaGFzaFxuICB9XG5cbiAgc2V0IGhvc3QgKGhvc3QpIHtcbiAgICB0aGlzLnN1cGVyLmhvc3QgPSBob3N0XG4gIH1cblxuICBzZXQgaG9zdG5hbWUgKGhvc3RuYW1lKSB7XG4gICAgdGhpcy5zdXBlci5ob3N0bmFtZSA9IGhvc3RuYW1lXG4gIH1cblxuICBzZXQgaHJlZiAoaHJlZikge1xuICAgIHRoaXMuc3VwZXIuaHJlZiA9IGhyZWZcbiAgfVxuXG4gIHNldCBwYXNzd29yZCAocGFzc3dvcmQpIHtcbiAgICB0aGlzLnN1cGVyLnBhc3N3b3JkID0gcGFzc3dvcmRcbiAgfVxuXG4gIHNldCBwYXRobmFtZSAocGF0aG5hbWUpIHtcbiAgICB0aGlzLnN1cGVyLnBhdGhuYW1lID0gcGF0aG5hbWVcbiAgfVxuXG4gIHNldCBwb3J0IChwb3J0KSB7XG4gICAgdGhpcy5zdXBlci5wb3J0ID0gcG9ydFxuICB9XG5cbiAgc2V0IHByb3RvY29sIChwcm90b2NvbCkge1xuICAgIHRoaXMuc3VwZXIucHJvdG9jb2wgPSBwcm90b2NvbFxuICB9XG5cbiAgc2V0IHNlYXJjaCAoc2VhcmNoKSB7XG4gICAgdGhpcy5zdXBlci5zZWFyY2ggPSBzZWFyY2hcbiAgfVxuXG4gIHNldCB1c2VybmFtZSAodXNlcm5hbWUpIHtcbiAgICB0aGlzLnN1cGVyLnVzZXJuYW1lID0gdXNlcm5hbWVcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2FueX0gb1xuICAgKi9cbiAgc3RhdGljIGNyZWF0ZU9iamVjdFVSTCAobykge1xuICAgIHJldHVybiBVUkwuY3JlYXRlT2JqZWN0VVJMKG8pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9cbiAgICovXG4gIHN0YXRpYyByZXZva2VPYmplY3RVUkwgKG8pIHtcbiAgICBVUkwucmV2b2tlT2JqZWN0VVJMKG8pXG4gIH1cblxuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB0aGlzLnN1cGVyLnRvSlNPTigpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3VwZXIudG9TdHJpbmcoKVxuICB9XG5cbiAgZm9ybWF0ICgpIHtcbiAgICByZXR1cm4gdGhpcy50b1N0cmluZygpXG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZyB8IGltcG9ydCgndXJsJykuVXJsT2JqZWN0fSBvYmpcbiAqL1xuZnVuY3Rpb24gZm9ybWF0IChvYmopIHtcbiAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChvYmopXG5cbiAgICByZXR1cm4gdXJsLnRvU3RyaW5nKClcbiAgfVxuXG4gIGlmICghKG9iaiBpbnN0YW5jZW9mIFVSTCkpIHtcbiAgICBjb25zdCB1c2VyUGFzcyA9XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIGl0cyBub3Qgc3VwcG9ydGVkIGluIG5vZGUgYnV0IHdlIG5vcm1hbGlzZVxuICAgICAgICAgICAgb2JqLnVzZXJuYW1lICYmIG9iai5wYXNzd29yZFxuICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIGl0cyBub3Qgc3VwcG9ydGVkIGluIG5vZGUgYnV0IHdlIG5vcm1hbGlzZVxuICAgICAgICAgICAgICA/IGAke29iai51c2VybmFtZX06JHtvYmoucGFzc3dvcmR9QGBcbiAgICAgICAgICAgICAgOiAnJ1xuICAgIGNvbnN0IGF1dGggPSBvYmouYXV0aCA/IG9iai5hdXRoICsgJ0AnIDogJydcbiAgICBjb25zdCBwb3J0ID0gb2JqLnBvcnQgPyAnOicgKyBvYmoucG9ydCA6ICcnXG4gICAgY29uc3QgcHJvdG9jb2wgPSBvYmoucHJvdG9jb2wgPyBvYmoucHJvdG9jb2wgKyAnLy8nIDogJydcbiAgICBjb25zdCBob3N0ID0gb2JqLmhvc3QgfHwgJydcbiAgICBjb25zdCBob3N0bmFtZSA9IG9iai5ob3N0bmFtZSB8fCAnJ1xuICAgIGNvbnN0IHNlYXJjaCA9IG9iai5zZWFyY2ggfHwgKG9iai5xdWVyeSA/ICc/JyArIG9iai5xdWVyeSA6ICcnKVxuICAgIGNvbnN0IGhhc2ggPSBvYmouaGFzaCB8fCAnJ1xuICAgIGNvbnN0IHBhdGhuYW1lID0gb2JqLnBhdGhuYW1lIHx8ICcnXG4gICAgLy8gQHRzLWlnbm9yZSAtIHBhdGggaXMgbm90IHN1cHBvcnRlZCBpbiBub2RlIGJ1dCB3ZSBub3JtYWxpc2VcbiAgICBjb25zdCBwYXRoID0gb2JqLnBhdGggfHwgcGF0aG5hbWUgKyBzZWFyY2hcblxuICAgIHJldHVybiBgJHtwcm90b2NvbH0ke3VzZXJQYXNzIHx8IGF1dGh9JHtcbiAgICAgICAgICAgIGhvc3QgfHwgaG9zdG5hbWUgKyBwb3J0XG4gICAgICAgIH0ke3BhdGh9JHtoYXNofWBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVVJMV2l0aExlZ2FjeVN1cHBvcnQsXG4gIFVSTFNlYXJjaFBhcmFtczogc2VsZi5VUkxTZWFyY2hQYXJhbXMsXG4gIGRlZmF1bHRCYXNlLFxuICBmb3JtYXRcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAcGFyYW0gdHlwZU1hcCBbT2JqZWN0XSBNYXAgb2YgTUlNRSB0eXBlIC0+IEFycmF5W2V4dGVuc2lvbnNdXG4gKiBAcGFyYW0gLi4uXG4gKi9cbmZ1bmN0aW9uIE1pbWUoKSB7XG4gIHRoaXMuX3R5cGVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdGhpcy5fZXh0ZW5zaW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLmRlZmluZShhcmd1bWVudHNbaV0pO1xuICB9XG5cbiAgdGhpcy5kZWZpbmUgPSB0aGlzLmRlZmluZS5iaW5kKHRoaXMpO1xuICB0aGlzLmdldFR5cGUgPSB0aGlzLmdldFR5cGUuYmluZCh0aGlzKTtcbiAgdGhpcy5nZXRFeHRlbnNpb24gPSB0aGlzLmdldEV4dGVuc2lvbi5iaW5kKHRoaXMpO1xufVxuXG4vKipcbiAqIERlZmluZSBtaW1ldHlwZSAtPiBleHRlbnNpb24gbWFwcGluZ3MuICBFYWNoIGtleSBpcyBhIG1pbWUtdHlwZSB0aGF0IG1hcHNcbiAqIHRvIGFuIGFycmF5IG9mIGV4dGVuc2lvbnMgYXNzb2NpYXRlZCB3aXRoIHRoZSB0eXBlLiAgVGhlIGZpcnN0IGV4dGVuc2lvbiBpc1xuICogdXNlZCBhcyB0aGUgZGVmYXVsdCBleHRlbnNpb24gZm9yIHRoZSB0eXBlLlxuICpcbiAqIGUuZy4gbWltZS5kZWZpbmUoeydhdWRpby9vZ2cnLCBbJ29nYScsICdvZ2cnLCAnc3B4J119KTtcbiAqXG4gKiBJZiBhIHR5cGUgZGVjbGFyZXMgYW4gZXh0ZW5zaW9uIHRoYXQgaGFzIGFscmVhZHkgYmVlbiBkZWZpbmVkLCBhbiBlcnJvciB3aWxsXG4gKiBiZSB0aHJvd24uICBUbyBzdXBwcmVzcyB0aGlzIGVycm9yIGFuZCBmb3JjZSB0aGUgZXh0ZW5zaW9uIHRvIGJlIGFzc29jaWF0ZWRcbiAqIHdpdGggdGhlIG5ldyB0eXBlLCBwYXNzIGBmb3JjZWA9dHJ1ZS4gIEFsdGVybmF0aXZlbHksIHlvdSBtYXkgcHJlZml4IHRoZVxuICogZXh0ZW5zaW9uIHdpdGggXCIqXCIgdG8gbWFwIHRoZSB0eXBlIHRvIGV4dGVuc2lvbiwgd2l0aG91dCBtYXBwaW5nIHRoZVxuICogZXh0ZW5zaW9uIHRvIHRoZSB0eXBlLlxuICpcbiAqIGUuZy4gbWltZS5kZWZpbmUoeydhdWRpby93YXYnLCBbJ3dhdiddfSwgeydhdWRpby94LXdhdicsIFsnKndhdiddfSk7XG4gKlxuICpcbiAqIEBwYXJhbSBtYXAgKE9iamVjdCkgdHlwZSBkZWZpbml0aW9uc1xuICogQHBhcmFtIGZvcmNlIChCb29sZWFuKSBpZiB0cnVlLCBmb3JjZSBvdmVycmlkaW5nIG9mIGV4aXN0aW5nIGRlZmluaXRpb25zXG4gKi9cbk1pbWUucHJvdG90eXBlLmRlZmluZSA9IGZ1bmN0aW9uKHR5cGVNYXAsIGZvcmNlKSB7XG4gIGZvciAobGV0IHR5cGUgaW4gdHlwZU1hcCkge1xuICAgIGxldCBleHRlbnNpb25zID0gdHlwZU1hcFt0eXBlXS5tYXAoZnVuY3Rpb24odCkge1xuICAgICAgcmV0dXJuIHQudG9Mb3dlckNhc2UoKTtcbiAgICB9KTtcbiAgICB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHRlbnNpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBleHQgPSBleHRlbnNpb25zW2ldO1xuXG4gICAgICAvLyAnKicgcHJlZml4ID0gbm90IHRoZSBwcmVmZXJyZWQgdHlwZSBmb3IgdGhpcyBleHRlbnNpb24uICBTbyBmaXh1cCB0aGVcbiAgICAgIC8vIGV4dGVuc2lvbiwgYW5kIHNraXAgaXQuXG4gICAgICBpZiAoZXh0WzBdID09PSAnKicpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghZm9yY2UgJiYgKGV4dCBpbiB0aGlzLl90eXBlcykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdBdHRlbXB0IHRvIGNoYW5nZSBtYXBwaW5nIGZvciBcIicgKyBleHQgK1xuICAgICAgICAgICdcIiBleHRlbnNpb24gZnJvbSBcIicgKyB0aGlzLl90eXBlc1tleHRdICsgJ1wiIHRvIFwiJyArIHR5cGUgK1xuICAgICAgICAgICdcIi4gUGFzcyBgZm9yY2U9dHJ1ZWAgdG8gYWxsb3cgdGhpcywgb3RoZXJ3aXNlIHJlbW92ZSBcIicgKyBleHQgK1xuICAgICAgICAgICdcIiBmcm9tIHRoZSBsaXN0IG9mIGV4dGVuc2lvbnMgZm9yIFwiJyArIHR5cGUgKyAnXCIuJ1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl90eXBlc1tleHRdID0gdHlwZTtcbiAgICB9XG5cbiAgICAvLyBVc2UgZmlyc3QgZXh0ZW5zaW9uIGFzIGRlZmF1bHRcbiAgICBpZiAoZm9yY2UgfHwgIXRoaXMuX2V4dGVuc2lvbnNbdHlwZV0pIHtcbiAgICAgIGNvbnN0IGV4dCA9IGV4dGVuc2lvbnNbMF07XG4gICAgICB0aGlzLl9leHRlbnNpb25zW3R5cGVdID0gKGV4dFswXSAhPT0gJyonKSA/IGV4dCA6IGV4dC5zdWJzdHIoMSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIExvb2t1cCBhIG1pbWUgdHlwZSBiYXNlZCBvbiBleHRlbnNpb25cbiAqL1xuTWltZS5wcm90b3R5cGUuZ2V0VHlwZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcGF0aCA9IFN0cmluZyhwYXRoKTtcbiAgbGV0IGxhc3QgPSBwYXRoLnJlcGxhY2UoL14uKlsvXFxcXF0vLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgbGV0IGV4dCA9IGxhc3QucmVwbGFjZSgvXi4qXFwuLywgJycpLnRvTG93ZXJDYXNlKCk7XG5cbiAgbGV0IGhhc1BhdGggPSBsYXN0Lmxlbmd0aCA8IHBhdGgubGVuZ3RoO1xuICBsZXQgaGFzRG90ID0gZXh0Lmxlbmd0aCA8IGxhc3QubGVuZ3RoIC0gMTtcblxuICByZXR1cm4gKGhhc0RvdCB8fCAhaGFzUGF0aCkgJiYgdGhpcy5fdHlwZXNbZXh0XSB8fCBudWxsO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gZmlsZSBleHRlbnNpb24gYXNzb2NpYXRlZCB3aXRoIGEgbWltZSB0eXBlXG4gKi9cbk1pbWUucHJvdG90eXBlLmdldEV4dGVuc2lvbiA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdHlwZSA9IC9eXFxzKihbXjtcXHNdKikvLnRlc3QodHlwZSkgJiYgUmVnRXhwLiQxO1xuICByZXR1cm4gdHlwZSAmJiB0aGlzLl9leHRlbnNpb25zW3R5cGUudG9Mb3dlckNhc2UoKV0gfHwgbnVsbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWltZTtcbiIsIid1c2Ugc3RyaWN0JztcblxubGV0IE1pbWUgPSByZXF1aXJlKCcuL01pbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gbmV3IE1pbWUocmVxdWlyZSgnLi90eXBlcy9zdGFuZGFyZCcpLCByZXF1aXJlKCcuL3R5cGVzL290aGVyJykpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XCJhcHBsaWNhdGlvbi9wcnMuY3d3XCI6W1wiY3d3XCJdLFwiYXBwbGljYXRpb24vdm5kLjEwMDBtaW5kcy5kZWNpc2lvbi1tb2RlbCt4bWxcIjpbXCIxa21cIl0sXCJhcHBsaWNhdGlvbi92bmQuM2dwcC5waWMtYnctbGFyZ2VcIjpbXCJwbGJcIl0sXCJhcHBsaWNhdGlvbi92bmQuM2dwcC5waWMtYnctc21hbGxcIjpbXCJwc2JcIl0sXCJhcHBsaWNhdGlvbi92bmQuM2dwcC5waWMtYnctdmFyXCI6W1wicHZiXCJdLFwiYXBwbGljYXRpb24vdm5kLjNncHAyLnRjYXBcIjpbXCJ0Y2FwXCJdLFwiYXBwbGljYXRpb24vdm5kLjNtLnBvc3QtaXQtbm90ZXNcIjpbXCJwd25cIl0sXCJhcHBsaWNhdGlvbi92bmQuYWNjcGFjLnNpbXBseS5hc29cIjpbXCJhc29cIl0sXCJhcHBsaWNhdGlvbi92bmQuYWNjcGFjLnNpbXBseS5pbXBcIjpbXCJpbXBcIl0sXCJhcHBsaWNhdGlvbi92bmQuYWN1Y29ib2xcIjpbXCJhY3VcIl0sXCJhcHBsaWNhdGlvbi92bmQuYWN1Y29ycFwiOltcImF0Y1wiLFwiYWN1dGNcIl0sXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUuYWlyLWFwcGxpY2F0aW9uLWluc3RhbGxlci1wYWNrYWdlK3ppcFwiOltcImFpclwiXSxcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5mb3Jtc2NlbnRyYWwuZmNkdFwiOltcImZjZHRcIl0sXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUuZnhwXCI6W1wiZnhwXCIsXCJmeHBsXCJdLFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLnhkcCt4bWxcIjpbXCJ4ZHBcIl0sXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUueGZkZlwiOltcInhmZGZcIl0sXCJhcHBsaWNhdGlvbi92bmQuYWhlYWQuc3BhY2VcIjpbXCJhaGVhZFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5haXJ6aXAuZmlsZXNlY3VyZS5hemZcIjpbXCJhemZcIl0sXCJhcHBsaWNhdGlvbi92bmQuYWlyemlwLmZpbGVzZWN1cmUuYXpzXCI6W1wiYXpzXCJdLFwiYXBwbGljYXRpb24vdm5kLmFtYXpvbi5lYm9va1wiOltcImF6d1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5hbWVyaWNhbmR5bmFtaWNzLmFjY1wiOltcImFjY1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5hbWlnYS5hbWlcIjpbXCJhbWlcIl0sXCJhcHBsaWNhdGlvbi92bmQuYW5kcm9pZC5wYWNrYWdlLWFyY2hpdmVcIjpbXCJhcGtcIl0sXCJhcHBsaWNhdGlvbi92bmQuYW5zZXItd2ViLWNlcnRpZmljYXRlLWlzc3VlLWluaXRpYXRpb25cIjpbXCJjaWlcIl0sXCJhcHBsaWNhdGlvbi92bmQuYW5zZXItd2ViLWZ1bmRzLXRyYW5zZmVyLWluaXRpYXRpb25cIjpbXCJmdGlcIl0sXCJhcHBsaWNhdGlvbi92bmQuYW50aXguZ2FtZS1jb21wb25lbnRcIjpbXCJhdHhcIl0sXCJhcHBsaWNhdGlvbi92bmQuYXBwbGUuaW5zdGFsbGVyK3htbFwiOltcIm1wa2dcIl0sXCJhcHBsaWNhdGlvbi92bmQuYXBwbGUua2V5bm90ZVwiOltcImtleVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5hcHBsZS5tcGVndXJsXCI6W1wibTN1OFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5hcHBsZS5udW1iZXJzXCI6W1wibnVtYmVyc1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5hcHBsZS5wYWdlc1wiOltcInBhZ2VzXCJdLFwiYXBwbGljYXRpb24vdm5kLmFwcGxlLnBrcGFzc1wiOltcInBrcGFzc1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5hcmlzdGFuZXR3b3Jrcy5zd2lcIjpbXCJzd2lcIl0sXCJhcHBsaWNhdGlvbi92bmQuYXN0cmFlYS1zb2Z0d2FyZS5pb3RhXCI6W1wiaW90YVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5hdWRpb2dyYXBoXCI6W1wiYWVwXCJdLFwiYXBwbGljYXRpb24vdm5kLmJhbHNhbWlxLmJtbWwreG1sXCI6W1wiYm1tbFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5ibHVlaWNlLm11bHRpcGFzc1wiOltcIm1wbVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5ibWlcIjpbXCJibWlcIl0sXCJhcHBsaWNhdGlvbi92bmQuYnVzaW5lc3NvYmplY3RzXCI6W1wicmVwXCJdLFwiYXBwbGljYXRpb24vdm5kLmNoZW1kcmF3K3htbFwiOltcImNkeG1sXCJdLFwiYXBwbGljYXRpb24vdm5kLmNoaXBudXRzLmthcmFva2UtbW1kXCI6W1wibW1kXCJdLFwiYXBwbGljYXRpb24vdm5kLmNpbmRlcmVsbGFcIjpbXCJjZHlcIl0sXCJhcHBsaWNhdGlvbi92bmQuY2l0YXRpb25zdHlsZXMuc3R5bGUreG1sXCI6W1wiY3NsXCJdLFwiYXBwbGljYXRpb24vdm5kLmNsYXltb3JlXCI6W1wiY2xhXCJdLFwiYXBwbGljYXRpb24vdm5kLmNsb2FudG8ucnA5XCI6W1wicnA5XCJdLFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIjpbXCJjNGdcIixcImM0ZFwiLFwiYzRmXCIsXCJjNHBcIixcImM0dVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5jbHVldHJ1c3QuY2FydG9tb2JpbGUtY29uZmlnXCI6W1wiYzExYW1jXCJdLFwiYXBwbGljYXRpb24vdm5kLmNsdWV0cnVzdC5jYXJ0b21vYmlsZS1jb25maWctcGtnXCI6W1wiYzExYW16XCJdLFwiYXBwbGljYXRpb24vdm5kLmNvbW1vbnNwYWNlXCI6W1wiY3NwXCJdLFwiYXBwbGljYXRpb24vdm5kLmNvbnRhY3QuY21zZ1wiOltcImNkYmNtc2dcIl0sXCJhcHBsaWNhdGlvbi92bmQuY29zbW9jYWxsZXJcIjpbXCJjbWNcIl0sXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlclwiOltcImNsa3hcIl0sXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci5rZXlib2FyZFwiOltcImNsa2tcIl0sXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci5wYWxldHRlXCI6W1wiY2xrcFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyLnRlbXBsYXRlXCI6W1wiY2xrdFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyLndvcmRiYW5rXCI6W1wiY2xrd1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5jcml0aWNhbHRvb2xzLndicyt4bWxcIjpbXCJ3YnNcIl0sXCJhcHBsaWNhdGlvbi92bmQuY3RjLXBvc21sXCI6W1wicG1sXCJdLFwiYXBwbGljYXRpb24vdm5kLmN1cHMtcHBkXCI6W1wicHBkXCJdLFwiYXBwbGljYXRpb24vdm5kLmN1cmwuY2FyXCI6W1wiY2FyXCJdLFwiYXBwbGljYXRpb24vdm5kLmN1cmwucGN1cmxcIjpbXCJwY3VybFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5kYXJ0XCI6W1wiZGFydFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5kYXRhLXZpc2lvbi5yZHpcIjpbXCJyZHpcIl0sXCJhcHBsaWNhdGlvbi92bmQuZGJmXCI6W1wiZGJmXCJdLFwiYXBwbGljYXRpb24vdm5kLmRlY2UuZGF0YVwiOltcInV2ZlwiLFwidXZ2ZlwiLFwidXZkXCIsXCJ1dnZkXCJdLFwiYXBwbGljYXRpb24vdm5kLmRlY2UudHRtbCt4bWxcIjpbXCJ1dnRcIixcInV2dnRcIl0sXCJhcHBsaWNhdGlvbi92bmQuZGVjZS51bnNwZWNpZmllZFwiOltcInV2eFwiLFwidXZ2eFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnppcFwiOltcInV2elwiLFwidXZ2elwiXSxcImFwcGxpY2F0aW9uL3ZuZC5kZW5vdm8uZmNzZWxheW91dC1saW5rXCI6W1wiZmVfbGF1bmNoXCJdLFwiYXBwbGljYXRpb24vdm5kLmRuYVwiOltcImRuYVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5kb2xieS5tbHBcIjpbXCJtbHBcIl0sXCJhcHBsaWNhdGlvbi92bmQuZHBncmFwaFwiOltcImRwZ1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5kcmVhbWZhY3RvcnlcIjpbXCJkZmFjXCJdLFwiYXBwbGljYXRpb24vdm5kLmRzLWtleXBvaW50XCI6W1wia3B4eFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5kdmIuYWl0XCI6W1wiYWl0XCJdLFwiYXBwbGljYXRpb24vdm5kLmR2Yi5zZXJ2aWNlXCI6W1wic3ZjXCJdLFwiYXBwbGljYXRpb24vdm5kLmR5bmFnZW9cIjpbXCJnZW9cIl0sXCJhcHBsaWNhdGlvbi92bmQuZWNvd2luLmNoYXJ0XCI6W1wibWFnXCJdLFwiYXBwbGljYXRpb24vdm5kLmVubGl2ZW5cIjpbXCJubWxcIl0sXCJhcHBsaWNhdGlvbi92bmQuZXBzb24uZXNmXCI6W1wiZXNmXCJdLFwiYXBwbGljYXRpb24vdm5kLmVwc29uLm1zZlwiOltcIm1zZlwiXSxcImFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5xdWlja2FuaW1lXCI6W1wicWFtXCJdLFwiYXBwbGljYXRpb24vdm5kLmVwc29uLnNhbHRcIjpbXCJzbHRcIl0sXCJhcHBsaWNhdGlvbi92bmQuZXBzb24uc3NmXCI6W1wic3NmXCJdLFwiYXBwbGljYXRpb24vdm5kLmVzemlnbm8zK3htbFwiOltcImVzM1wiLFwiZXQzXCJdLFwiYXBwbGljYXRpb24vdm5kLmV6cGl4LWFsYnVtXCI6W1wiZXoyXCJdLFwiYXBwbGljYXRpb24vdm5kLmV6cGl4LXBhY2thZ2VcIjpbXCJlejNcIl0sXCJhcHBsaWNhdGlvbi92bmQuZmRmXCI6W1wiZmRmXCJdLFwiYXBwbGljYXRpb24vdm5kLmZkc24ubXNlZWRcIjpbXCJtc2VlZFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5mZHNuLnNlZWRcIjpbXCJzZWVkXCIsXCJkYXRhbGVzc1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5mbG9ncmFwaGl0XCI6W1wiZ3BoXCJdLFwiYXBwbGljYXRpb24vdm5kLmZsdXh0aW1lLmNsaXBcIjpbXCJmdGNcIl0sXCJhcHBsaWNhdGlvbi92bmQuZnJhbWVtYWtlclwiOltcImZtXCIsXCJmcmFtZVwiLFwibWFrZXJcIixcImJvb2tcIl0sXCJhcHBsaWNhdGlvbi92bmQuZnJvZ2Fucy5mbmNcIjpbXCJmbmNcIl0sXCJhcHBsaWNhdGlvbi92bmQuZnJvZ2Fucy5sdGZcIjpbXCJsdGZcIl0sXCJhcHBsaWNhdGlvbi92bmQuZnNjLndlYmxhdW5jaFwiOltcImZzY1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzXCI6W1wib2FzXCJdLFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXMyXCI6W1wib2EyXCJdLFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXMzXCI6W1wib2EzXCJdLFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXNncFwiOltcImZnNVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzcHJzXCI6W1wiYmgyXCJdLFwiYXBwbGljYXRpb24vdm5kLmZ1aml4ZXJveC5kZGRcIjpbXCJkZGRcIl0sXCJhcHBsaWNhdGlvbi92bmQuZnVqaXhlcm94LmRvY3V3b3Jrc1wiOltcInhkd1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5mdWppeGVyb3guZG9jdXdvcmtzLmJpbmRlclwiOltcInhiZFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5mdXp6eXNoZWV0XCI6W1wiZnpzXCJdLFwiYXBwbGljYXRpb24vdm5kLmdlbm9tYXRpeC50dXhlZG9cIjpbXCJ0eGRcIl0sXCJhcHBsaWNhdGlvbi92bmQuZ2VvZ2VicmEuZmlsZVwiOltcImdnYlwiXSxcImFwcGxpY2F0aW9uL3ZuZC5nZW9nZWJyYS50b29sXCI6W1wiZ2d0XCJdLFwiYXBwbGljYXRpb24vdm5kLmdlb21ldHJ5LWV4cGxvcmVyXCI6W1wiZ2V4XCIsXCJncmVcIl0sXCJhcHBsaWNhdGlvbi92bmQuZ2VvbmV4dFwiOltcImd4dFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5nZW9wbGFuXCI6W1wiZzJ3XCJdLFwiYXBwbGljYXRpb24vdm5kLmdlb3NwYWNlXCI6W1wiZzN3XCJdLFwiYXBwbGljYXRpb24vdm5kLmdteFwiOltcImdteFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtYXBwcy5kb2N1bWVudFwiOltcImdkb2NcIl0sXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLWFwcHMucHJlc2VudGF0aW9uXCI6W1wiZ3NsaWRlc1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtYXBwcy5zcHJlYWRzaGVldFwiOltcImdzaGVldFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtZWFydGgua21sK3htbFwiOltcImttbFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtZWFydGgua216XCI6W1wia216XCJdLFwiYXBwbGljYXRpb24vdm5kLmdyYWZlcVwiOltcImdxZlwiLFwiZ3FzXCJdLFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1hY2NvdW50XCI6W1wiZ2FjXCJdLFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1oZWxwXCI6W1wiZ2hmXCJdLFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1pZGVudGl0eS1tZXNzYWdlXCI6W1wiZ2ltXCJdLFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1pbmplY3RvclwiOltcImdydlwiXSxcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtdG9vbC1tZXNzYWdlXCI6W1wiZ3RtXCJdLFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS10b29sLXRlbXBsYXRlXCI6W1widHBsXCJdLFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS12Y2FyZFwiOltcInZjZ1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5oYWwreG1sXCI6W1wiaGFsXCJdLFwiYXBwbGljYXRpb24vdm5kLmhhbmRoZWxkLWVudGVydGFpbm1lbnQreG1sXCI6W1wiem1tXCJdLFwiYXBwbGljYXRpb24vdm5kLmhiY2lcIjpbXCJoYmNpXCJdLFwiYXBwbGljYXRpb24vdm5kLmhoZS5sZXNzb24tcGxheWVyXCI6W1wibGVzXCJdLFwiYXBwbGljYXRpb24vdm5kLmhwLWhwZ2xcIjpbXCJocGdsXCJdLFwiYXBwbGljYXRpb24vdm5kLmhwLWhwaWRcIjpbXCJocGlkXCJdLFwiYXBwbGljYXRpb24vdm5kLmhwLWhwc1wiOltcImhwc1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5ocC1qbHl0XCI6W1wiamx0XCJdLFwiYXBwbGljYXRpb24vdm5kLmhwLXBjbFwiOltcInBjbFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5ocC1wY2x4bFwiOltcInBjbHhsXCJdLFwiYXBwbGljYXRpb24vdm5kLmh5ZHJvc3RhdGl4LnNvZi1kYXRhXCI6W1wic2ZkLWhkc3R4XCJdLFwiYXBwbGljYXRpb24vdm5kLmlibS5taW5pcGF5XCI6W1wibXB5XCJdLFwiYXBwbGljYXRpb24vdm5kLmlibS5tb2RjYXBcIjpbXCJhZnBcIixcImxpc3RhZnBcIixcImxpc3QzODIwXCJdLFwiYXBwbGljYXRpb24vdm5kLmlibS5yaWdodHMtbWFuYWdlbWVudFwiOltcImlybVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5pYm0uc2VjdXJlLWNvbnRhaW5lclwiOltcInNjXCJdLFwiYXBwbGljYXRpb24vdm5kLmljY3Byb2ZpbGVcIjpbXCJpY2NcIixcImljbVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5pZ2xvYWRlclwiOltcImlnbFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5pbW1lcnZpc2lvbi1pdnBcIjpbXCJpdnBcIl0sXCJhcHBsaWNhdGlvbi92bmQuaW1tZXJ2aXNpb24taXZ1XCI6W1wiaXZ1XCJdLFwiYXBwbGljYXRpb24vdm5kLmluc29ycy5pZ21cIjpbXCJpZ21cIl0sXCJhcHBsaWNhdGlvbi92bmQuaW50ZXJjb24uZm9ybW5ldFwiOltcInhwd1wiLFwieHB4XCJdLFwiYXBwbGljYXRpb24vdm5kLmludGVyZ2VvXCI6W1wiaTJnXCJdLFwiYXBwbGljYXRpb24vdm5kLmludHUucWJvXCI6W1wicWJvXCJdLFwiYXBwbGljYXRpb24vdm5kLmludHUucWZ4XCI6W1wicWZ4XCJdLFwiYXBwbGljYXRpb24vdm5kLmlwdW5wbHVnZ2VkLnJjcHJvZmlsZVwiOltcInJjcHJvZmlsZVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5pcmVwb3NpdG9yeS5wYWNrYWdlK3htbFwiOltcImlycFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5pcy14cHJcIjpbXCJ4cHJcIl0sXCJhcHBsaWNhdGlvbi92bmQuaXNhYy5mY3NcIjpbXCJmY3NcIl0sXCJhcHBsaWNhdGlvbi92bmQuamFtXCI6W1wiamFtXCJdLFwiYXBwbGljYXRpb24vdm5kLmpjcC5qYXZhbWUubWlkbGV0LXJtc1wiOltcInJtc1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5qaXNwXCI6W1wiamlzcFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5qb29zdC5qb2RhLWFyY2hpdmVcIjpbXCJqb2RhXCJdLFwiYXBwbGljYXRpb24vdm5kLmthaG9vdHpcIjpbXCJrdHpcIixcImt0clwiXSxcImFwcGxpY2F0aW9uL3ZuZC5rZGUua2FyYm9uXCI6W1wia2FyYm9uXCJdLFwiYXBwbGljYXRpb24vdm5kLmtkZS5rY2hhcnRcIjpbXCJjaHJ0XCJdLFwiYXBwbGljYXRpb24vdm5kLmtkZS5rZm9ybXVsYVwiOltcImtmb1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5rZGUua2l2aW9cIjpbXCJmbHdcIl0sXCJhcHBsaWNhdGlvbi92bmQua2RlLmtvbnRvdXJcIjpbXCJrb25cIl0sXCJhcHBsaWNhdGlvbi92bmQua2RlLmtwcmVzZW50ZXJcIjpbXCJrcHJcIixcImtwdFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3NwcmVhZFwiOltcImtzcFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3dvcmRcIjpbXCJrd2RcIixcImt3dFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5rZW5hbWVhYXBwXCI6W1wiaHRrZVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5raWRzcGlyYXRpb25cIjpbXCJraWFcIl0sXCJhcHBsaWNhdGlvbi92bmQua2luYXJcIjpbXCJrbmVcIixcImtucFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5rb2FuXCI6W1wic2twXCIsXCJza2RcIixcInNrdFwiLFwic2ttXCJdLFwiYXBwbGljYXRpb24vdm5kLmtvZGFrLWRlc2NyaXB0b3JcIjpbXCJzc2VcIl0sXCJhcHBsaWNhdGlvbi92bmQubGFzLmxhcyt4bWxcIjpbXCJsYXN4bWxcIl0sXCJhcHBsaWNhdGlvbi92bmQubGxhbWFncmFwaGljcy5saWZlLWJhbGFuY2UuZGVza3RvcFwiOltcImxiZFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5sbGFtYWdyYXBoaWNzLmxpZmUtYmFsYW5jZS5leGNoYW5nZSt4bWxcIjpbXCJsYmVcIl0sXCJhcHBsaWNhdGlvbi92bmQubG90dXMtMS0yLTNcIjpbXCIxMjNcIl0sXCJhcHBsaWNhdGlvbi92bmQubG90dXMtYXBwcm9hY2hcIjpbXCJhcHJcIl0sXCJhcHBsaWNhdGlvbi92bmQubG90dXMtZnJlZWxhbmNlXCI6W1wicHJlXCJdLFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLW5vdGVzXCI6W1wibnNmXCJdLFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLW9yZ2FuaXplclwiOltcIm9yZ1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1zY3JlZW5jYW1cIjpbXCJzY21cIl0sXCJhcHBsaWNhdGlvbi92bmQubG90dXMtd29yZHByb1wiOltcImx3cFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5tYWNwb3J0cy5wb3J0cGtnXCI6W1wicG9ydHBrZ1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5tY2RcIjpbXCJtY2RcIl0sXCJhcHBsaWNhdGlvbi92bmQubWVkY2FsY2RhdGFcIjpbXCJtYzFcIl0sXCJhcHBsaWNhdGlvbi92bmQubWVkaWFzdGF0aW9uLmNka2V5XCI6W1wiY2RrZXlcIl0sXCJhcHBsaWNhdGlvbi92bmQubWZlclwiOltcIm13ZlwiXSxcImFwcGxpY2F0aW9uL3ZuZC5tZm1wXCI6W1wibWZtXCJdLFwiYXBwbGljYXRpb24vdm5kLm1pY3JvZ3JhZnguZmxvXCI6W1wiZmxvXCJdLFwiYXBwbGljYXRpb24vdm5kLm1pY3JvZ3JhZnguaWd4XCI6W1wiaWd4XCJdLFwiYXBwbGljYXRpb24vdm5kLm1pZlwiOltcIm1pZlwiXSxcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMuZGFmXCI6W1wiZGFmXCJdLFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5kaXNcIjpbXCJkaXNcIl0sXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLm1ia1wiOltcIm1ia1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMubXF5XCI6W1wibXF5XCJdLFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5tc2xcIjpbXCJtc2xcIl0sXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLnBsY1wiOltcInBsY1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMudHhmXCI6W1widHhmXCJdLFwiYXBwbGljYXRpb24vdm5kLm1vcGh1bi5hcHBsaWNhdGlvblwiOltcIm1wblwiXSxcImFwcGxpY2F0aW9uL3ZuZC5tb3BodW4uY2VydGlmaWNhdGVcIjpbXCJtcGNcIl0sXCJhcHBsaWNhdGlvbi92bmQubW96aWxsYS54dWwreG1sXCI6W1wieHVsXCJdLFwiYXBwbGljYXRpb24vdm5kLm1zLWFydGdhbHJ5XCI6W1wiY2lsXCJdLFwiYXBwbGljYXRpb24vdm5kLm1zLWNhYi1jb21wcmVzc2VkXCI6W1wiY2FiXCJdLFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCI6W1wieGxzXCIsXCJ4bG1cIixcInhsYVwiLFwieGxjXCIsXCJ4bHRcIixcInhsd1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5hZGRpbi5tYWNyb2VuYWJsZWQuMTJcIjpbXCJ4bGFtXCJdLFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnNoZWV0LmJpbmFyeS5tYWNyb2VuYWJsZWQuMTJcIjpbXCJ4bHNiXCJdLFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnNoZWV0Lm1hY3JvZW5hYmxlZC4xMlwiOltcInhsc21cIl0sXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyXCI6W1wieGx0bVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5tcy1mb250b2JqZWN0XCI6W1wiZW90XCJdLFwiYXBwbGljYXRpb24vdm5kLm1zLWh0bWxoZWxwXCI6W1wiY2htXCJdLFwiYXBwbGljYXRpb24vdm5kLm1zLWltc1wiOltcImltc1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5tcy1scm1cIjpbXCJscm1cIl0sXCJhcHBsaWNhdGlvbi92bmQubXMtb2ZmaWNldGhlbWVcIjpbXCJ0aG14XCJdLFwiYXBwbGljYXRpb24vdm5kLm1zLW91dGxvb2tcIjpbXCJtc2dcIl0sXCJhcHBsaWNhdGlvbi92bmQubXMtcGtpLnNlY2NhdFwiOltcImNhdFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5tcy1wa2kuc3RsXCI6W1wiKnN0bFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50XCI6W1wicHB0XCIsXCJwcHNcIixcInBvdFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LmFkZGluLm1hY3JvZW5hYmxlZC4xMlwiOltcInBwYW1cIl0sXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC5wcmVzZW50YXRpb24ubWFjcm9lbmFibGVkLjEyXCI6W1wicHB0bVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnNsaWRlLm1hY3JvZW5hYmxlZC4xMlwiOltcInNsZG1cIl0sXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC5zbGlkZXNob3cubWFjcm9lbmFibGVkLjEyXCI6W1wicHBzbVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMlwiOltcInBvdG1cIl0sXCJhcHBsaWNhdGlvbi92bmQubXMtcHJvamVjdFwiOltcIm1wcFwiLFwibXB0XCJdLFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmQuZG9jdW1lbnQubWFjcm9lbmFibGVkLjEyXCI6W1wiZG9jbVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3JkLnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMlwiOltcImRvdG1cIl0sXCJhcHBsaWNhdGlvbi92bmQubXMtd29ya3NcIjpbXCJ3cHNcIixcIndrc1wiLFwid2NtXCIsXCJ3ZGJcIl0sXCJhcHBsaWNhdGlvbi92bmQubXMtd3BsXCI6W1wid3BsXCJdLFwiYXBwbGljYXRpb24vdm5kLm1zLXhwc2RvY3VtZW50XCI6W1wieHBzXCJdLFwiYXBwbGljYXRpb24vdm5kLm1zZXFcIjpbXCJtc2VxXCJdLFwiYXBwbGljYXRpb24vdm5kLm11c2ljaWFuXCI6W1wibXVzXCJdLFwiYXBwbGljYXRpb24vdm5kLm11dmVlLnN0eWxlXCI6W1wibXN0eVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5teW5mY1wiOltcInRhZ2xldFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5uZXVyb2xhbmd1YWdlLm5sdVwiOltcIm5sdVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5uaXRmXCI6W1wibnRmXCIsXCJuaXRmXCJdLFwiYXBwbGljYXRpb24vdm5kLm5vYmxlbmV0LWRpcmVjdG9yeVwiOltcIm5uZFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5ub2JsZW5ldC1zZWFsZXJcIjpbXCJubnNcIl0sXCJhcHBsaWNhdGlvbi92bmQubm9ibGVuZXQtd2ViXCI6W1wibm53XCJdLFwiYXBwbGljYXRpb24vdm5kLm5va2lhLm4tZ2FnZS5hYyt4bWxcIjpbXCIqYWNcIl0sXCJhcHBsaWNhdGlvbi92bmQubm9raWEubi1nYWdlLmRhdGFcIjpbXCJuZ2RhdFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5ub2tpYS5uLWdhZ2Uuc3ltYmlhbi5pbnN0YWxsXCI6W1wibi1nYWdlXCJdLFwiYXBwbGljYXRpb24vdm5kLm5va2lhLnJhZGlvLXByZXNldFwiOltcInJwc3RcIl0sXCJhcHBsaWNhdGlvbi92bmQubm9raWEucmFkaW8tcHJlc2V0c1wiOltcInJwc3NcIl0sXCJhcHBsaWNhdGlvbi92bmQubm92YWRpZ20uZWRtXCI6W1wiZWRtXCJdLFwiYXBwbGljYXRpb24vdm5kLm5vdmFkaWdtLmVkeFwiOltcImVkeFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5ub3ZhZGlnbS5leHRcIjpbXCJleHRcIl0sXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmNoYXJ0XCI6W1wib2RjXCJdLFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5jaGFydC10ZW1wbGF0ZVwiOltcIm90Y1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZGF0YWJhc2VcIjpbXCJvZGJcIl0sXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmZvcm11bGFcIjpbXCJvZGZcIl0sXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmZvcm11bGEtdGVtcGxhdGVcIjpbXCJvZGZ0XCJdLFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5ncmFwaGljc1wiOltcIm9kZ1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZ3JhcGhpY3MtdGVtcGxhdGVcIjpbXCJvdGdcIl0sXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmltYWdlXCI6W1wib2RpXCJdLFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5pbWFnZS10ZW1wbGF0ZVwiOltcIm90aVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQucHJlc2VudGF0aW9uXCI6W1wib2RwXCJdLFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5wcmVzZW50YXRpb24tdGVtcGxhdGVcIjpbXCJvdHBcIl0sXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnNwcmVhZHNoZWV0XCI6W1wib2RzXCJdLFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5zcHJlYWRzaGVldC10ZW1wbGF0ZVwiOltcIm90c1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dFwiOltcIm9kdFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dC1tYXN0ZXJcIjpbXCJvZG1cIl0sXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtdGVtcGxhdGVcIjpbXCJvdHRcIl0sXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtd2ViXCI6W1wib3RoXCJdLFwiYXBwbGljYXRpb24vdm5kLm9scGMtc3VnYXJcIjpbXCJ4b1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5vbWEuZGQyK3htbFwiOltcImRkMlwiXSxcImFwcGxpY2F0aW9uL3ZuZC5vcGVuYmxveC5nYW1lK3htbFwiOltcIm9iZ3hcIl0sXCJhcHBsaWNhdGlvbi92bmQub3Blbm9mZmljZW9yZy5leHRlbnNpb25cIjpbXCJveHRcIl0sXCJhcHBsaWNhdGlvbi92bmQub3BlbnN0cmVldG1hcC5kYXRhK3htbFwiOltcIm9zbVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5wcmVzZW50YXRpb25cIjpbXCJwcHR4XCJdLFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnNsaWRlXCI6W1wic2xkeFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5zbGlkZXNob3dcIjpbXCJwcHN4XCJdLFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnRlbXBsYXRlXCI6W1wicG90eFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0XCI6W1wieGxzeFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnRlbXBsYXRlXCI6W1wieGx0eFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50XCI6W1wiZG9jeFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLnRlbXBsYXRlXCI6W1wiZG90eFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5vc2dlby5tYXBndWlkZS5wYWNrYWdlXCI6W1wibWdwXCJdLFwiYXBwbGljYXRpb24vdm5kLm9zZ2kuZHBcIjpbXCJkcFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5vc2dpLnN1YnN5c3RlbVwiOltcImVzYVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5wYWxtXCI6W1wicGRiXCIsXCJwcWFcIixcIm9wcmNcIl0sXCJhcHBsaWNhdGlvbi92bmQucGF3YWFmaWxlXCI6W1wicGF3XCJdLFwiYXBwbGljYXRpb24vdm5kLnBnLmZvcm1hdFwiOltcInN0clwiXSxcImFwcGxpY2F0aW9uL3ZuZC5wZy5vc2FzbGlcIjpbXCJlaTZcIl0sXCJhcHBsaWNhdGlvbi92bmQucGljc2VsXCI6W1wiZWZpZlwiXSxcImFwcGxpY2F0aW9uL3ZuZC5wbWkud2lkZ2V0XCI6W1wid2dcIl0sXCJhcHBsaWNhdGlvbi92bmQucG9ja2V0bGVhcm5cIjpbXCJwbGZcIl0sXCJhcHBsaWNhdGlvbi92bmQucG93ZXJidWlsZGVyNlwiOltcInBiZFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5wcmV2aWV3c3lzdGVtcy5ib3hcIjpbXCJib3hcIl0sXCJhcHBsaWNhdGlvbi92bmQucHJvdGV1cy5tYWdhemluZVwiOltcIm1nelwiXSxcImFwcGxpY2F0aW9uL3ZuZC5wdWJsaXNoYXJlLWRlbHRhLXRyZWVcIjpbXCJxcHNcIl0sXCJhcHBsaWNhdGlvbi92bmQucHZpLnB0aWQxXCI6W1wicHRpZFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiOltcInF4ZFwiLFwicXh0XCIsXCJxd2RcIixcInF3dFwiLFwicXhsXCIsXCJxeGJcIl0sXCJhcHBsaWNhdGlvbi92bmQucmFyXCI6W1wicmFyXCJdLFwiYXBwbGljYXRpb24vdm5kLnJlYWx2bmMuYmVkXCI6W1wiYmVkXCJdLFwiYXBwbGljYXRpb24vdm5kLnJlY29yZGFyZS5tdXNpY3htbFwiOltcIm14bFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5yZWNvcmRhcmUubXVzaWN4bWwreG1sXCI6W1wibXVzaWN4bWxcIl0sXCJhcHBsaWNhdGlvbi92bmQucmlnLmNyeXB0b25vdGVcIjpbXCJjcnlwdG9ub3RlXCJdLFwiYXBwbGljYXRpb24vdm5kLnJpbS5jb2RcIjpbXCJjb2RcIl0sXCJhcHBsaWNhdGlvbi92bmQucm4tcmVhbG1lZGlhXCI6W1wicm1cIl0sXCJhcHBsaWNhdGlvbi92bmQucm4tcmVhbG1lZGlhLXZiclwiOltcInJtdmJcIl0sXCJhcHBsaWNhdGlvbi92bmQucm91dGU2Ni5saW5rNjYreG1sXCI6W1wibGluazY2XCJdLFwiYXBwbGljYXRpb24vdm5kLnNhaWxpbmd0cmFja2VyLnRyYWNrXCI6W1wic3RcIl0sXCJhcHBsaWNhdGlvbi92bmQuc2VlbWFpbFwiOltcInNlZVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5zZW1hXCI6W1wic2VtYVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5zZW1kXCI6W1wic2VtZFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5zZW1mXCI6W1wic2VtZlwiXSxcImFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5mb3JtZGF0YVwiOltcImlmbVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5mb3JtdGVtcGxhdGVcIjpbXCJpdHBcIl0sXCJhcHBsaWNhdGlvbi92bmQuc2hhbmEuaW5mb3JtZWQuaW50ZXJjaGFuZ2VcIjpbXCJpaWZcIl0sXCJhcHBsaWNhdGlvbi92bmQuc2hhbmEuaW5mb3JtZWQucGFja2FnZVwiOltcImlwa1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5zaW10ZWNoLW1pbmRtYXBwZXJcIjpbXCJ0d2RcIixcInR3ZHNcIl0sXCJhcHBsaWNhdGlvbi92bmQuc21hZlwiOltcIm1tZlwiXSxcImFwcGxpY2F0aW9uL3ZuZC5zbWFydC50ZWFjaGVyXCI6W1widGVhY2hlclwiXSxcImFwcGxpY2F0aW9uL3ZuZC5zb2Z0d2FyZTYwMi5maWxsZXIuZm9ybSt4bWxcIjpbXCJmb1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5zb2xlbnQuc2RrbSt4bWxcIjpbXCJzZGttXCIsXCJzZGtkXCJdLFwiYXBwbGljYXRpb24vdm5kLnNwb3RmaXJlLmR4cFwiOltcImR4cFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5zcG90ZmlyZS5zZnNcIjpbXCJzZnNcIl0sXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmNhbGNcIjpbXCJzZGNcIl0sXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmRyYXdcIjpbXCJzZGFcIl0sXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmltcHJlc3NcIjpbXCJzZGRcIl0sXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLm1hdGhcIjpbXCJzbWZcIl0sXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLndyaXRlclwiOltcInNkd1wiLFwidm9yXCJdLFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi53cml0ZXItZ2xvYmFsXCI6W1wic2dsXCJdLFwiYXBwbGljYXRpb24vdm5kLnN0ZXBtYW5pYS5wYWNrYWdlXCI6W1wic216aXBcIl0sXCJhcHBsaWNhdGlvbi92bmQuc3RlcG1hbmlhLnN0ZXBjaGFydFwiOltcInNtXCJdLFwiYXBwbGljYXRpb24vdm5kLnN1bi53YWRsK3htbFwiOltcIndhZGxcIl0sXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5jYWxjXCI6W1wic3hjXCJdLFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuY2FsYy50ZW1wbGF0ZVwiOltcInN0Y1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmRyYXdcIjpbXCJzeGRcIl0sXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5kcmF3LnRlbXBsYXRlXCI6W1wic3RkXCJdLFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuaW1wcmVzc1wiOltcInN4aVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmltcHJlc3MudGVtcGxhdGVcIjpbXCJzdGlcIl0sXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5tYXRoXCI6W1wic3htXCJdLFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyXCI6W1wic3h3XCJdLFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyLmdsb2JhbFwiOltcInN4Z1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLndyaXRlci50ZW1wbGF0ZVwiOltcInN0d1wiXSxcImFwcGxpY2F0aW9uL3ZuZC5zdXMtY2FsZW5kYXJcIjpbXCJzdXNcIixcInN1c3BcIl0sXCJhcHBsaWNhdGlvbi92bmQuc3ZkXCI6W1wic3ZkXCJdLFwiYXBwbGljYXRpb24vdm5kLnN5bWJpYW4uaW5zdGFsbFwiOltcInNpc1wiLFwic2lzeFwiXSxcImFwcGxpY2F0aW9uL3ZuZC5zeW5jbWwreG1sXCI6W1wieHNtXCJdLFwiYXBwbGljYXRpb24vdm5kLnN5bmNtbC5kbSt3YnhtbFwiOltcImJkbVwiXSxcImFwcGxpY2F0aW9uL3ZuZC5zeW5jbWwuZG0reG1sXCI6W1wieGRtXCJdLFwiYXBwbGljYXRpb24vdm5kLnN5bmNtbC5kbWRkZit4bWxcIjpbXCJkZGZcIl0sXCJhcHBsaWNhdGlvbi92bmQudGFvLmludGVudC1tb2R1bGUtYXJjaGl2ZVwiOltcInRhb1wiXSxcImFwcGxpY2F0aW9uL3ZuZC50Y3BkdW1wLnBjYXBcIjpbXCJwY2FwXCIsXCJjYXBcIixcImRtcFwiXSxcImFwcGxpY2F0aW9uL3ZuZC50bW9iaWxlLWxpdmV0dlwiOltcInRtb1wiXSxcImFwcGxpY2F0aW9uL3ZuZC50cmlkLnRwdFwiOltcInRwdFwiXSxcImFwcGxpY2F0aW9uL3ZuZC50cmlzY2FwZS5teHNcIjpbXCJteHNcIl0sXCJhcHBsaWNhdGlvbi92bmQudHJ1ZWFwcFwiOltcInRyYVwiXSxcImFwcGxpY2F0aW9uL3ZuZC51ZmRsXCI6W1widWZkXCIsXCJ1ZmRsXCJdLFwiYXBwbGljYXRpb24vdm5kLnVpcS50aGVtZVwiOltcInV0elwiXSxcImFwcGxpY2F0aW9uL3ZuZC51bWFqaW5cIjpbXCJ1bWpcIl0sXCJhcHBsaWNhdGlvbi92bmQudW5pdHlcIjpbXCJ1bml0eXdlYlwiXSxcImFwcGxpY2F0aW9uL3ZuZC51b21sK3htbFwiOltcInVvbWxcIl0sXCJhcHBsaWNhdGlvbi92bmQudmN4XCI6W1widmN4XCJdLFwiYXBwbGljYXRpb24vdm5kLnZpc2lvXCI6W1widnNkXCIsXCJ2c3RcIixcInZzc1wiLFwidnN3XCJdLFwiYXBwbGljYXRpb24vdm5kLnZpc2lvbmFyeVwiOltcInZpc1wiXSxcImFwcGxpY2F0aW9uL3ZuZC52c2ZcIjpbXCJ2c2ZcIl0sXCJhcHBsaWNhdGlvbi92bmQud2FwLndieG1sXCI6W1wid2J4bWxcIl0sXCJhcHBsaWNhdGlvbi92bmQud2FwLndtbGNcIjpbXCJ3bWxjXCJdLFwiYXBwbGljYXRpb24vdm5kLndhcC53bWxzY3JpcHRjXCI6W1wid21sc2NcIl0sXCJhcHBsaWNhdGlvbi92bmQud2VidHVyYm9cIjpbXCJ3dGJcIl0sXCJhcHBsaWNhdGlvbi92bmQud29sZnJhbS5wbGF5ZXJcIjpbXCJuYnBcIl0sXCJhcHBsaWNhdGlvbi92bmQud29yZHBlcmZlY3RcIjpbXCJ3cGRcIl0sXCJhcHBsaWNhdGlvbi92bmQud3FkXCI6W1wid3FkXCJdLFwiYXBwbGljYXRpb24vdm5kLnd0LnN0ZlwiOltcInN0ZlwiXSxcImFwcGxpY2F0aW9uL3ZuZC54YXJhXCI6W1wieGFyXCJdLFwiYXBwbGljYXRpb24vdm5kLnhmZGxcIjpbXCJ4ZmRsXCJdLFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5odi1kaWNcIjpbXCJodmRcIl0sXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLmh2LXNjcmlwdFwiOltcImh2c1wiXSxcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuaHYtdm9pY2VcIjpbXCJodnBcIl0sXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLm9wZW5zY29yZWZvcm1hdFwiOltcIm9zZlwiXSxcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEub3BlbnNjb3JlZm9ybWF0Lm9zZnB2Zyt4bWxcIjpbXCJvc2ZwdmdcIl0sXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLnNtYWYtYXVkaW9cIjpbXCJzYWZcIl0sXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLnNtYWYtcGhyYXNlXCI6W1wic3BmXCJdLFwiYXBwbGljYXRpb24vdm5kLnllbGxvd3JpdmVyLWN1c3RvbS1tZW51XCI6W1wiY21wXCJdLFwiYXBwbGljYXRpb24vdm5kLnp1bFwiOltcInppclwiLFwiemlyelwiXSxcImFwcGxpY2F0aW9uL3ZuZC56emF6ei5kZWNrK3htbFwiOltcInphelwiXSxcImFwcGxpY2F0aW9uL3gtN3otY29tcHJlc3NlZFwiOltcIjd6XCJdLFwiYXBwbGljYXRpb24veC1hYml3b3JkXCI6W1wiYWJ3XCJdLFwiYXBwbGljYXRpb24veC1hY2UtY29tcHJlc3NlZFwiOltcImFjZVwiXSxcImFwcGxpY2F0aW9uL3gtYXBwbGUtZGlza2ltYWdlXCI6W1wiKmRtZ1wiXSxcImFwcGxpY2F0aW9uL3gtYXJqXCI6W1wiYXJqXCJdLFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblwiOltcImFhYlwiLFwieDMyXCIsXCJ1MzJcIixcInZveFwiXSxcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1tYXBcIjpbXCJhYW1cIl0sXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtc2VnXCI6W1wiYWFzXCJdLFwiYXBwbGljYXRpb24veC1iY3Bpb1wiOltcImJjcGlvXCJdLFwiYXBwbGljYXRpb24veC1iZG9jXCI6W1wiKmJkb2NcIl0sXCJhcHBsaWNhdGlvbi94LWJpdHRvcnJlbnRcIjpbXCJ0b3JyZW50XCJdLFwiYXBwbGljYXRpb24veC1ibG9yYlwiOltcImJsYlwiLFwiYmxvcmJcIl0sXCJhcHBsaWNhdGlvbi94LWJ6aXBcIjpbXCJielwiXSxcImFwcGxpY2F0aW9uL3gtYnppcDJcIjpbXCJiejJcIixcImJvelwiXSxcImFwcGxpY2F0aW9uL3gtY2JyXCI6W1wiY2JyXCIsXCJjYmFcIixcImNidFwiLFwiY2J6XCIsXCJjYjdcIl0sXCJhcHBsaWNhdGlvbi94LWNkbGlua1wiOltcInZjZFwiXSxcImFwcGxpY2F0aW9uL3gtY2ZzLWNvbXByZXNzZWRcIjpbXCJjZnNcIl0sXCJhcHBsaWNhdGlvbi94LWNoYXRcIjpbXCJjaGF0XCJdLFwiYXBwbGljYXRpb24veC1jaGVzcy1wZ25cIjpbXCJwZ25cIl0sXCJhcHBsaWNhdGlvbi94LWNocm9tZS1leHRlbnNpb25cIjpbXCJjcnhcIl0sXCJhcHBsaWNhdGlvbi94LWNvY29hXCI6W1wiY2NvXCJdLFwiYXBwbGljYXRpb24veC1jb25mZXJlbmNlXCI6W1wibnNjXCJdLFwiYXBwbGljYXRpb24veC1jcGlvXCI6W1wiY3Bpb1wiXSxcImFwcGxpY2F0aW9uL3gtY3NoXCI6W1wiY3NoXCJdLFwiYXBwbGljYXRpb24veC1kZWJpYW4tcGFja2FnZVwiOltcIipkZWJcIixcInVkZWJcIl0sXCJhcHBsaWNhdGlvbi94LWRnYy1jb21wcmVzc2VkXCI6W1wiZGdjXCJdLFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiOltcImRpclwiLFwiZGNyXCIsXCJkeHJcIixcImNzdFwiLFwiY2N0XCIsXCJjeHRcIixcInczZFwiLFwiZmdkXCIsXCJzd2FcIl0sXCJhcHBsaWNhdGlvbi94LWRvb21cIjpbXCJ3YWRcIl0sXCJhcHBsaWNhdGlvbi94LWR0Ym5jeCt4bWxcIjpbXCJuY3hcIl0sXCJhcHBsaWNhdGlvbi94LWR0Ym9vayt4bWxcIjpbXCJkdGJcIl0sXCJhcHBsaWNhdGlvbi94LWR0YnJlc291cmNlK3htbFwiOltcInJlc1wiXSxcImFwcGxpY2F0aW9uL3gtZHZpXCI6W1wiZHZpXCJdLFwiYXBwbGljYXRpb24veC1lbnZveVwiOltcImV2eVwiXSxcImFwcGxpY2F0aW9uL3gtZXZhXCI6W1wiZXZhXCJdLFwiYXBwbGljYXRpb24veC1mb250LWJkZlwiOltcImJkZlwiXSxcImFwcGxpY2F0aW9uL3gtZm9udC1naG9zdHNjcmlwdFwiOltcImdzZlwiXSxcImFwcGxpY2F0aW9uL3gtZm9udC1saW51eC1wc2ZcIjpbXCJwc2ZcIl0sXCJhcHBsaWNhdGlvbi94LWZvbnQtcGNmXCI6W1wicGNmXCJdLFwiYXBwbGljYXRpb24veC1mb250LXNuZlwiOltcInNuZlwiXSxcImFwcGxpY2F0aW9uL3gtZm9udC10eXBlMVwiOltcInBmYVwiLFwicGZiXCIsXCJwZm1cIixcImFmbVwiXSxcImFwcGxpY2F0aW9uL3gtZnJlZWFyY1wiOltcImFyY1wiXSxcImFwcGxpY2F0aW9uL3gtZnV0dXJlc3BsYXNoXCI6W1wic3BsXCJdLFwiYXBwbGljYXRpb24veC1nY2EtY29tcHJlc3NlZFwiOltcImdjYVwiXSxcImFwcGxpY2F0aW9uL3gtZ2x1bHhcIjpbXCJ1bHhcIl0sXCJhcHBsaWNhdGlvbi94LWdudW1lcmljXCI6W1wiZ251bWVyaWNcIl0sXCJhcHBsaWNhdGlvbi94LWdyYW1wcy14bWxcIjpbXCJncmFtcHNcIl0sXCJhcHBsaWNhdGlvbi94LWd0YXJcIjpbXCJndGFyXCJdLFwiYXBwbGljYXRpb24veC1oZGZcIjpbXCJoZGZcIl0sXCJhcHBsaWNhdGlvbi94LWh0dHBkLXBocFwiOltcInBocFwiXSxcImFwcGxpY2F0aW9uL3gtaW5zdGFsbC1pbnN0cnVjdGlvbnNcIjpbXCJpbnN0YWxsXCJdLFwiYXBwbGljYXRpb24veC1pc285NjYwLWltYWdlXCI6W1wiKmlzb1wiXSxcImFwcGxpY2F0aW9uL3gtamF2YS1hcmNoaXZlLWRpZmZcIjpbXCJqYXJkaWZmXCJdLFwiYXBwbGljYXRpb24veC1qYXZhLWpubHAtZmlsZVwiOltcImpubHBcIl0sXCJhcHBsaWNhdGlvbi94LWtlZXBhc3MyXCI6W1wia2RieFwiXSxcImFwcGxpY2F0aW9uL3gtbGF0ZXhcIjpbXCJsYXRleFwiXSxcImFwcGxpY2F0aW9uL3gtbHVhLWJ5dGVjb2RlXCI6W1wibHVhY1wiXSxcImFwcGxpY2F0aW9uL3gtbHpoLWNvbXByZXNzZWRcIjpbXCJsemhcIixcImxoYVwiXSxcImFwcGxpY2F0aW9uL3gtbWFrZXNlbGZcIjpbXCJydW5cIl0sXCJhcHBsaWNhdGlvbi94LW1pZVwiOltcIm1pZVwiXSxcImFwcGxpY2F0aW9uL3gtbW9iaXBvY2tldC1lYm9va1wiOltcInByY1wiLFwibW9iaVwiXSxcImFwcGxpY2F0aW9uL3gtbXMtYXBwbGljYXRpb25cIjpbXCJhcHBsaWNhdGlvblwiXSxcImFwcGxpY2F0aW9uL3gtbXMtc2hvcnRjdXRcIjpbXCJsbmtcIl0sXCJhcHBsaWNhdGlvbi94LW1zLXdtZFwiOltcIndtZFwiXSxcImFwcGxpY2F0aW9uL3gtbXMtd216XCI6W1wid216XCJdLFwiYXBwbGljYXRpb24veC1tcy14YmFwXCI6W1wieGJhcFwiXSxcImFwcGxpY2F0aW9uL3gtbXNhY2Nlc3NcIjpbXCJtZGJcIl0sXCJhcHBsaWNhdGlvbi94LW1zYmluZGVyXCI6W1wib2JkXCJdLFwiYXBwbGljYXRpb24veC1tc2NhcmRmaWxlXCI6W1wiY3JkXCJdLFwiYXBwbGljYXRpb24veC1tc2NsaXBcIjpbXCJjbHBcIl0sXCJhcHBsaWNhdGlvbi94LW1zZG9zLXByb2dyYW1cIjpbXCIqZXhlXCJdLFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCI6W1wiKmV4ZVwiLFwiKmRsbFwiLFwiY29tXCIsXCJiYXRcIixcIiptc2lcIl0sXCJhcHBsaWNhdGlvbi94LW1zbWVkaWF2aWV3XCI6W1wibXZiXCIsXCJtMTNcIixcIm0xNFwiXSxcImFwcGxpY2F0aW9uL3gtbXNtZXRhZmlsZVwiOltcIip3bWZcIixcIip3bXpcIixcIiplbWZcIixcImVtelwiXSxcImFwcGxpY2F0aW9uL3gtbXNtb25leVwiOltcIm1ueVwiXSxcImFwcGxpY2F0aW9uL3gtbXNwdWJsaXNoZXJcIjpbXCJwdWJcIl0sXCJhcHBsaWNhdGlvbi94LW1zc2NoZWR1bGVcIjpbXCJzY2RcIl0sXCJhcHBsaWNhdGlvbi94LW1zdGVybWluYWxcIjpbXCJ0cm1cIl0sXCJhcHBsaWNhdGlvbi94LW1zd3JpdGVcIjpbXCJ3cmlcIl0sXCJhcHBsaWNhdGlvbi94LW5ldGNkZlwiOltcIm5jXCIsXCJjZGZcIl0sXCJhcHBsaWNhdGlvbi94LW5zLXByb3h5LWF1dG9jb25maWdcIjpbXCJwYWNcIl0sXCJhcHBsaWNhdGlvbi94LW56YlwiOltcIm56YlwiXSxcImFwcGxpY2F0aW9uL3gtcGVybFwiOltcInBsXCIsXCJwbVwiXSxcImFwcGxpY2F0aW9uL3gtcGlsb3RcIjpbXCIqcHJjXCIsXCIqcGRiXCJdLFwiYXBwbGljYXRpb24veC1wa2NzMTJcIjpbXCJwMTJcIixcInBmeFwiXSxcImFwcGxpY2F0aW9uL3gtcGtjczctY2VydGlmaWNhdGVzXCI6W1wicDdiXCIsXCJzcGNcIl0sXCJhcHBsaWNhdGlvbi94LXBrY3M3LWNlcnRyZXFyZXNwXCI6W1wicDdyXCJdLFwiYXBwbGljYXRpb24veC1yYXItY29tcHJlc3NlZFwiOltcIipyYXJcIl0sXCJhcHBsaWNhdGlvbi94LXJlZGhhdC1wYWNrYWdlLW1hbmFnZXJcIjpbXCJycG1cIl0sXCJhcHBsaWNhdGlvbi94LXJlc2VhcmNoLWluZm8tc3lzdGVtc1wiOltcInJpc1wiXSxcImFwcGxpY2F0aW9uL3gtc2VhXCI6W1wic2VhXCJdLFwiYXBwbGljYXRpb24veC1zaFwiOltcInNoXCJdLFwiYXBwbGljYXRpb24veC1zaGFyXCI6W1wic2hhclwiXSxcImFwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoXCI6W1wic3dmXCJdLFwiYXBwbGljYXRpb24veC1zaWx2ZXJsaWdodC1hcHBcIjpbXCJ4YXBcIl0sXCJhcHBsaWNhdGlvbi94LXNxbFwiOltcInNxbFwiXSxcImFwcGxpY2F0aW9uL3gtc3R1ZmZpdFwiOltcInNpdFwiXSxcImFwcGxpY2F0aW9uL3gtc3R1ZmZpdHhcIjpbXCJzaXR4XCJdLFwiYXBwbGljYXRpb24veC1zdWJyaXBcIjpbXCJzcnRcIl0sXCJhcHBsaWNhdGlvbi94LXN2NGNwaW9cIjpbXCJzdjRjcGlvXCJdLFwiYXBwbGljYXRpb24veC1zdjRjcmNcIjpbXCJzdjRjcmNcIl0sXCJhcHBsaWNhdGlvbi94LXQzdm0taW1hZ2VcIjpbXCJ0M1wiXSxcImFwcGxpY2F0aW9uL3gtdGFkc1wiOltcImdhbVwiXSxcImFwcGxpY2F0aW9uL3gtdGFyXCI6W1widGFyXCJdLFwiYXBwbGljYXRpb24veC10Y2xcIjpbXCJ0Y2xcIixcInRrXCJdLFwiYXBwbGljYXRpb24veC10ZXhcIjpbXCJ0ZXhcIl0sXCJhcHBsaWNhdGlvbi94LXRleC10Zm1cIjpbXCJ0Zm1cIl0sXCJhcHBsaWNhdGlvbi94LXRleGluZm9cIjpbXCJ0ZXhpbmZvXCIsXCJ0ZXhpXCJdLFwiYXBwbGljYXRpb24veC10Z2lmXCI6W1wiKm9ialwiXSxcImFwcGxpY2F0aW9uL3gtdXN0YXJcIjpbXCJ1c3RhclwiXSxcImFwcGxpY2F0aW9uL3gtdmlydHVhbGJveC1oZGRcIjpbXCJoZGRcIl0sXCJhcHBsaWNhdGlvbi94LXZpcnR1YWxib3gtb3ZhXCI6W1wib3ZhXCJdLFwiYXBwbGljYXRpb24veC12aXJ0dWFsYm94LW92ZlwiOltcIm92ZlwiXSxcImFwcGxpY2F0aW9uL3gtdmlydHVhbGJveC12Ym94XCI6W1widmJveFwiXSxcImFwcGxpY2F0aW9uL3gtdmlydHVhbGJveC12Ym94LWV4dHBhY2tcIjpbXCJ2Ym94LWV4dHBhY2tcIl0sXCJhcHBsaWNhdGlvbi94LXZpcnR1YWxib3gtdmRpXCI6W1widmRpXCJdLFwiYXBwbGljYXRpb24veC12aXJ0dWFsYm94LXZoZFwiOltcInZoZFwiXSxcImFwcGxpY2F0aW9uL3gtdmlydHVhbGJveC12bWRrXCI6W1widm1ka1wiXSxcImFwcGxpY2F0aW9uL3gtd2Fpcy1zb3VyY2VcIjpbXCJzcmNcIl0sXCJhcHBsaWNhdGlvbi94LXdlYi1hcHAtbWFuaWZlc3QranNvblwiOltcIndlYmFwcFwiXSxcImFwcGxpY2F0aW9uL3gteDUwOS1jYS1jZXJ0XCI6W1wiZGVyXCIsXCJjcnRcIixcInBlbVwiXSxcImFwcGxpY2F0aW9uL3gteGZpZ1wiOltcImZpZ1wiXSxcImFwcGxpY2F0aW9uL3gteGxpZmYreG1sXCI6W1wiKnhsZlwiXSxcImFwcGxpY2F0aW9uL3gteHBpbnN0YWxsXCI6W1wieHBpXCJdLFwiYXBwbGljYXRpb24veC14elwiOltcInh6XCJdLFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiOltcInoxXCIsXCJ6MlwiLFwiejNcIixcIno0XCIsXCJ6NVwiLFwiejZcIixcIno3XCIsXCJ6OFwiXSxcImF1ZGlvL3ZuZC5kZWNlLmF1ZGlvXCI6W1widXZhXCIsXCJ1dnZhXCJdLFwiYXVkaW8vdm5kLmRpZ2l0YWwtd2luZHNcIjpbXCJlb2xcIl0sXCJhdWRpby92bmQuZHJhXCI6W1wiZHJhXCJdLFwiYXVkaW8vdm5kLmR0c1wiOltcImR0c1wiXSxcImF1ZGlvL3ZuZC5kdHMuaGRcIjpbXCJkdHNoZFwiXSxcImF1ZGlvL3ZuZC5sdWNlbnQudm9pY2VcIjpbXCJsdnBcIl0sXCJhdWRpby92bmQubXMtcGxheXJlYWR5Lm1lZGlhLnB5YVwiOltcInB5YVwiXSxcImF1ZGlvL3ZuZC5udWVyYS5lY2VscDQ4MDBcIjpbXCJlY2VscDQ4MDBcIl0sXCJhdWRpby92bmQubnVlcmEuZWNlbHA3NDcwXCI6W1wiZWNlbHA3NDcwXCJdLFwiYXVkaW8vdm5kLm51ZXJhLmVjZWxwOTYwMFwiOltcImVjZWxwOTYwMFwiXSxcImF1ZGlvL3ZuZC5yaXBcIjpbXCJyaXBcIl0sXCJhdWRpby94LWFhY1wiOltcImFhY1wiXSxcImF1ZGlvL3gtYWlmZlwiOltcImFpZlwiLFwiYWlmZlwiLFwiYWlmY1wiXSxcImF1ZGlvL3gtY2FmXCI6W1wiY2FmXCJdLFwiYXVkaW8veC1mbGFjXCI6W1wiZmxhY1wiXSxcImF1ZGlvL3gtbTRhXCI6W1wiKm00YVwiXSxcImF1ZGlvL3gtbWF0cm9za2FcIjpbXCJta2FcIl0sXCJhdWRpby94LW1wZWd1cmxcIjpbXCJtM3VcIl0sXCJhdWRpby94LW1zLXdheFwiOltcIndheFwiXSxcImF1ZGlvL3gtbXMtd21hXCI6W1wid21hXCJdLFwiYXVkaW8veC1wbi1yZWFsYXVkaW9cIjpbXCJyYW1cIixcInJhXCJdLFwiYXVkaW8veC1wbi1yZWFsYXVkaW8tcGx1Z2luXCI6W1wicm1wXCJdLFwiYXVkaW8veC1yZWFsYXVkaW9cIjpbXCIqcmFcIl0sXCJhdWRpby94LXdhdlwiOltcIip3YXZcIl0sXCJjaGVtaWNhbC94LWNkeFwiOltcImNkeFwiXSxcImNoZW1pY2FsL3gtY2lmXCI6W1wiY2lmXCJdLFwiY2hlbWljYWwveC1jbWRmXCI6W1wiY21kZlwiXSxcImNoZW1pY2FsL3gtY21sXCI6W1wiY21sXCJdLFwiY2hlbWljYWwveC1jc21sXCI6W1wiY3NtbFwiXSxcImNoZW1pY2FsL3gteHl6XCI6W1wieHl6XCJdLFwiaW1hZ2UvcHJzLmJ0aWZcIjpbXCJidGlmXCJdLFwiaW1hZ2UvcHJzLnB0aVwiOltcInB0aVwiXSxcImltYWdlL3ZuZC5hZG9iZS5waG90b3Nob3BcIjpbXCJwc2RcIl0sXCJpbWFnZS92bmQuYWlyemlwLmFjY2VsZXJhdG9yLmF6dlwiOltcImF6dlwiXSxcImltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcIjpbXCJ1dmlcIixcInV2dmlcIixcInV2Z1wiLFwidXZ2Z1wiXSxcImltYWdlL3ZuZC5kanZ1XCI6W1wiZGp2dVwiLFwiZGp2XCJdLFwiaW1hZ2Uvdm5kLmR2Yi5zdWJ0aXRsZVwiOltcIipzdWJcIl0sXCJpbWFnZS92bmQuZHdnXCI6W1wiZHdnXCJdLFwiaW1hZ2Uvdm5kLmR4ZlwiOltcImR4ZlwiXSxcImltYWdlL3ZuZC5mYXN0Ymlkc2hlZXRcIjpbXCJmYnNcIl0sXCJpbWFnZS92bmQuZnB4XCI6W1wiZnB4XCJdLFwiaW1hZ2Uvdm5kLmZzdFwiOltcImZzdFwiXSxcImltYWdlL3ZuZC5mdWppeGVyb3guZWRtaWNzLW1tclwiOltcIm1tclwiXSxcImltYWdlL3ZuZC5mdWppeGVyb3guZWRtaWNzLXJsY1wiOltcInJsY1wiXSxcImltYWdlL3ZuZC5taWNyb3NvZnQuaWNvblwiOltcImljb1wiXSxcImltYWdlL3ZuZC5tcy1kZHNcIjpbXCJkZHNcIl0sXCJpbWFnZS92bmQubXMtbW9kaVwiOltcIm1kaVwiXSxcImltYWdlL3ZuZC5tcy1waG90b1wiOltcIndkcFwiXSxcImltYWdlL3ZuZC5uZXQtZnB4XCI6W1wibnB4XCJdLFwiaW1hZ2Uvdm5kLnBjby5iMTZcIjpbXCJiMTZcIl0sXCJpbWFnZS92bmQudGVuY2VudC50YXBcIjpbXCJ0YXBcIl0sXCJpbWFnZS92bmQudmFsdmUuc291cmNlLnRleHR1cmVcIjpbXCJ2dGZcIl0sXCJpbWFnZS92bmQud2FwLndibXBcIjpbXCJ3Ym1wXCJdLFwiaW1hZ2Uvdm5kLnhpZmZcIjpbXCJ4aWZcIl0sXCJpbWFnZS92bmQuemJydXNoLnBjeFwiOltcInBjeFwiXSxcImltYWdlL3gtM2RzXCI6W1wiM2RzXCJdLFwiaW1hZ2UveC1jbXUtcmFzdGVyXCI6W1wicmFzXCJdLFwiaW1hZ2UveC1jbXhcIjpbXCJjbXhcIl0sXCJpbWFnZS94LWZyZWVoYW5kXCI6W1wiZmhcIixcImZoY1wiLFwiZmg0XCIsXCJmaDVcIixcImZoN1wiXSxcImltYWdlL3gtaWNvblwiOltcIippY29cIl0sXCJpbWFnZS94LWpuZ1wiOltcImpuZ1wiXSxcImltYWdlL3gtbXJzaWQtaW1hZ2VcIjpbXCJzaWRcIl0sXCJpbWFnZS94LW1zLWJtcFwiOltcIipibXBcIl0sXCJpbWFnZS94LXBjeFwiOltcIipwY3hcIl0sXCJpbWFnZS94LXBpY3RcIjpbXCJwaWNcIixcInBjdFwiXSxcImltYWdlL3gtcG9ydGFibGUtYW55bWFwXCI6W1wicG5tXCJdLFwiaW1hZ2UveC1wb3J0YWJsZS1iaXRtYXBcIjpbXCJwYm1cIl0sXCJpbWFnZS94LXBvcnRhYmxlLWdyYXltYXBcIjpbXCJwZ21cIl0sXCJpbWFnZS94LXBvcnRhYmxlLXBpeG1hcFwiOltcInBwbVwiXSxcImltYWdlL3gtcmdiXCI6W1wicmdiXCJdLFwiaW1hZ2UveC10Z2FcIjpbXCJ0Z2FcIl0sXCJpbWFnZS94LXhiaXRtYXBcIjpbXCJ4Ym1cIl0sXCJpbWFnZS94LXhwaXhtYXBcIjpbXCJ4cG1cIl0sXCJpbWFnZS94LXh3aW5kb3dkdW1wXCI6W1wieHdkXCJdLFwibWVzc2FnZS92bmQud2ZhLndzY1wiOltcIndzY1wiXSxcIm1vZGVsL3ZuZC5jb2xsYWRhK3htbFwiOltcImRhZVwiXSxcIm1vZGVsL3ZuZC5kd2ZcIjpbXCJkd2ZcIl0sXCJtb2RlbC92bmQuZ2RsXCI6W1wiZ2RsXCJdLFwibW9kZWwvdm5kLmd0d1wiOltcImd0d1wiXSxcIm1vZGVsL3ZuZC5tdHNcIjpbXCJtdHNcIl0sXCJtb2RlbC92bmQub3BlbmdleFwiOltcIm9nZXhcIl0sXCJtb2RlbC92bmQucGFyYXNvbGlkLnRyYW5zbWl0LmJpbmFyeVwiOltcInhfYlwiXSxcIm1vZGVsL3ZuZC5wYXJhc29saWQudHJhbnNtaXQudGV4dFwiOltcInhfdFwiXSxcIm1vZGVsL3ZuZC51c2R6K3ppcFwiOltcInVzZHpcIl0sXCJtb2RlbC92bmQudmFsdmUuc291cmNlLmNvbXBpbGVkLW1hcFwiOltcImJzcFwiXSxcIm1vZGVsL3ZuZC52dHVcIjpbXCJ2dHVcIl0sXCJ0ZXh0L3Bycy5saW5lcy50YWdcIjpbXCJkc2NcIl0sXCJ0ZXh0L3ZuZC5jdXJsXCI6W1wiY3VybFwiXSxcInRleHQvdm5kLmN1cmwuZGN1cmxcIjpbXCJkY3VybFwiXSxcInRleHQvdm5kLmN1cmwubWN1cmxcIjpbXCJtY3VybFwiXSxcInRleHQvdm5kLmN1cmwuc2N1cmxcIjpbXCJzY3VybFwiXSxcInRleHQvdm5kLmR2Yi5zdWJ0aXRsZVwiOltcInN1YlwiXSxcInRleHQvdm5kLmZseVwiOltcImZseVwiXSxcInRleHQvdm5kLmZtaS5mbGV4c3RvclwiOltcImZseFwiXSxcInRleHQvdm5kLmdyYXBodml6XCI6W1wiZ3ZcIl0sXCJ0ZXh0L3ZuZC5pbjNkLjNkbWxcIjpbXCIzZG1sXCJdLFwidGV4dC92bmQuaW4zZC5zcG90XCI6W1wic3BvdFwiXSxcInRleHQvdm5kLnN1bi5qMm1lLmFwcC1kZXNjcmlwdG9yXCI6W1wiamFkXCJdLFwidGV4dC92bmQud2FwLndtbFwiOltcIndtbFwiXSxcInRleHQvdm5kLndhcC53bWxzY3JpcHRcIjpbXCJ3bWxzXCJdLFwidGV4dC94LWFzbVwiOltcInNcIixcImFzbVwiXSxcInRleHQveC1jXCI6W1wiY1wiLFwiY2NcIixcImN4eFwiLFwiY3BwXCIsXCJoXCIsXCJoaFwiLFwiZGljXCJdLFwidGV4dC94LWNvbXBvbmVudFwiOltcImh0Y1wiXSxcInRleHQveC1mb3J0cmFuXCI6W1wiZlwiLFwiZm9yXCIsXCJmNzdcIixcImY5MFwiXSxcInRleHQveC1oYW5kbGViYXJzLXRlbXBsYXRlXCI6W1wiaGJzXCJdLFwidGV4dC94LWphdmEtc291cmNlXCI6W1wiamF2YVwiXSxcInRleHQveC1sdWFcIjpbXCJsdWFcIl0sXCJ0ZXh0L3gtbWFya2Rvd25cIjpbXCJta2RcIl0sXCJ0ZXh0L3gtbmZvXCI6W1wibmZvXCJdLFwidGV4dC94LW9wbWxcIjpbXCJvcG1sXCJdLFwidGV4dC94LW9yZ1wiOltcIipvcmdcIl0sXCJ0ZXh0L3gtcGFzY2FsXCI6W1wicFwiLFwicGFzXCJdLFwidGV4dC94LXByb2Nlc3NpbmdcIjpbXCJwZGVcIl0sXCJ0ZXh0L3gtc2Fzc1wiOltcInNhc3NcIl0sXCJ0ZXh0L3gtc2Nzc1wiOltcInNjc3NcIl0sXCJ0ZXh0L3gtc2V0ZXh0XCI6W1wiZXR4XCJdLFwidGV4dC94LXNmdlwiOltcInNmdlwiXSxcInRleHQveC1zdXNlLXltcFwiOltcInltcFwiXSxcInRleHQveC11dWVuY29kZVwiOltcInV1XCJdLFwidGV4dC94LXZjYWxlbmRhclwiOltcInZjc1wiXSxcInRleHQveC12Y2FyZFwiOltcInZjZlwiXSxcInZpZGVvL3ZuZC5kZWNlLmhkXCI6W1widXZoXCIsXCJ1dnZoXCJdLFwidmlkZW8vdm5kLmRlY2UubW9iaWxlXCI6W1widXZtXCIsXCJ1dnZtXCJdLFwidmlkZW8vdm5kLmRlY2UucGRcIjpbXCJ1dnBcIixcInV2dnBcIl0sXCJ2aWRlby92bmQuZGVjZS5zZFwiOltcInV2c1wiLFwidXZ2c1wiXSxcInZpZGVvL3ZuZC5kZWNlLnZpZGVvXCI6W1widXZ2XCIsXCJ1dnZ2XCJdLFwidmlkZW8vdm5kLmR2Yi5maWxlXCI6W1wiZHZiXCJdLFwidmlkZW8vdm5kLmZ2dFwiOltcImZ2dFwiXSxcInZpZGVvL3ZuZC5tcGVndXJsXCI6W1wibXh1XCIsXCJtNHVcIl0sXCJ2aWRlby92bmQubXMtcGxheXJlYWR5Lm1lZGlhLnB5dlwiOltcInB5dlwiXSxcInZpZGVvL3ZuZC51dnZ1Lm1wNFwiOltcInV2dVwiLFwidXZ2dVwiXSxcInZpZGVvL3ZuZC52aXZvXCI6W1widml2XCJdLFwidmlkZW8veC1mNHZcIjpbXCJmNHZcIl0sXCJ2aWRlby94LWZsaVwiOltcImZsaVwiXSxcInZpZGVvL3gtZmx2XCI6W1wiZmx2XCJdLFwidmlkZW8veC1tNHZcIjpbXCJtNHZcIl0sXCJ2aWRlby94LW1hdHJvc2thXCI6W1wibWt2XCIsXCJtazNkXCIsXCJta3NcIl0sXCJ2aWRlby94LW1uZ1wiOltcIm1uZ1wiXSxcInZpZGVvL3gtbXMtYXNmXCI6W1wiYXNmXCIsXCJhc3hcIl0sXCJ2aWRlby94LW1zLXZvYlwiOltcInZvYlwiXSxcInZpZGVvL3gtbXMtd21cIjpbXCJ3bVwiXSxcInZpZGVvL3gtbXMtd212XCI6W1wid212XCJdLFwidmlkZW8veC1tcy13bXhcIjpbXCJ3bXhcIl0sXCJ2aWRlby94LW1zLXd2eFwiOltcInd2eFwiXSxcInZpZGVvL3gtbXN2aWRlb1wiOltcImF2aVwiXSxcInZpZGVvL3gtc2dpLW1vdmllXCI6W1wibW92aWVcIl0sXCJ2aWRlby94LXNtdlwiOltcInNtdlwiXSxcIngtY29uZmVyZW5jZS94LWNvb2x0YWxrXCI6W1wiaWNlXCJdfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcImFwcGxpY2F0aW9uL2FuZHJldy1pbnNldFwiOltcImV6XCJdLFwiYXBwbGljYXRpb24vYXBwbGl4d2FyZVwiOltcImF3XCJdLFwiYXBwbGljYXRpb24vYXRvbSt4bWxcIjpbXCJhdG9tXCJdLFwiYXBwbGljYXRpb24vYXRvbWNhdCt4bWxcIjpbXCJhdG9tY2F0XCJdLFwiYXBwbGljYXRpb24vYXRvbWRlbGV0ZWQreG1sXCI6W1wiYXRvbWRlbGV0ZWRcIl0sXCJhcHBsaWNhdGlvbi9hdG9tc3ZjK3htbFwiOltcImF0b21zdmNcIl0sXCJhcHBsaWNhdGlvbi9hdHNjLWR3ZCt4bWxcIjpbXCJkd2RcIl0sXCJhcHBsaWNhdGlvbi9hdHNjLWhlbGQreG1sXCI6W1wiaGVsZFwiXSxcImFwcGxpY2F0aW9uL2F0c2MtcnNhdCt4bWxcIjpbXCJyc2F0XCJdLFwiYXBwbGljYXRpb24vYmRvY1wiOltcImJkb2NcIl0sXCJhcHBsaWNhdGlvbi9jYWxlbmRhcit4bWxcIjpbXCJ4Y3NcIl0sXCJhcHBsaWNhdGlvbi9jY3htbCt4bWxcIjpbXCJjY3htbFwiXSxcImFwcGxpY2F0aW9uL2NkZngreG1sXCI6W1wiY2RmeFwiXSxcImFwcGxpY2F0aW9uL2NkbWktY2FwYWJpbGl0eVwiOltcImNkbWlhXCJdLFwiYXBwbGljYXRpb24vY2RtaS1jb250YWluZXJcIjpbXCJjZG1pY1wiXSxcImFwcGxpY2F0aW9uL2NkbWktZG9tYWluXCI6W1wiY2RtaWRcIl0sXCJhcHBsaWNhdGlvbi9jZG1pLW9iamVjdFwiOltcImNkbWlvXCJdLFwiYXBwbGljYXRpb24vY2RtaS1xdWV1ZVwiOltcImNkbWlxXCJdLFwiYXBwbGljYXRpb24vY3Utc2VlbWVcIjpbXCJjdVwiXSxcImFwcGxpY2F0aW9uL2Rhc2greG1sXCI6W1wibXBkXCJdLFwiYXBwbGljYXRpb24vZGF2bW91bnQreG1sXCI6W1wiZGF2bW91bnRcIl0sXCJhcHBsaWNhdGlvbi9kb2Nib29rK3htbFwiOltcImRia1wiXSxcImFwcGxpY2F0aW9uL2Rzc2MrZGVyXCI6W1wiZHNzY1wiXSxcImFwcGxpY2F0aW9uL2Rzc2MreG1sXCI6W1wieGRzc2NcIl0sXCJhcHBsaWNhdGlvbi9lY21hc2NyaXB0XCI6W1wiZWNtYVwiLFwiZXNcIl0sXCJhcHBsaWNhdGlvbi9lbW1hK3htbFwiOltcImVtbWFcIl0sXCJhcHBsaWNhdGlvbi9lbW90aW9ubWwreG1sXCI6W1wiZW1vdGlvbm1sXCJdLFwiYXBwbGljYXRpb24vZXB1Yit6aXBcIjpbXCJlcHViXCJdLFwiYXBwbGljYXRpb24vZXhpXCI6W1wiZXhpXCJdLFwiYXBwbGljYXRpb24vZmR0K3htbFwiOltcImZkdFwiXSxcImFwcGxpY2F0aW9uL2ZvbnQtdGRwZnJcIjpbXCJwZnJcIl0sXCJhcHBsaWNhdGlvbi9nZW8ranNvblwiOltcImdlb2pzb25cIl0sXCJhcHBsaWNhdGlvbi9nbWwreG1sXCI6W1wiZ21sXCJdLFwiYXBwbGljYXRpb24vZ3B4K3htbFwiOltcImdweFwiXSxcImFwcGxpY2F0aW9uL2d4ZlwiOltcImd4ZlwiXSxcImFwcGxpY2F0aW9uL2d6aXBcIjpbXCJnelwiXSxcImFwcGxpY2F0aW9uL2hqc29uXCI6W1wiaGpzb25cIl0sXCJhcHBsaWNhdGlvbi9oeXBlcnN0dWRpb1wiOltcInN0a1wiXSxcImFwcGxpY2F0aW9uL2lua21sK3htbFwiOltcImlua1wiLFwiaW5rbWxcIl0sXCJhcHBsaWNhdGlvbi9pcGZpeFwiOltcImlwZml4XCJdLFwiYXBwbGljYXRpb24vaXRzK3htbFwiOltcIml0c1wiXSxcImFwcGxpY2F0aW9uL2phdmEtYXJjaGl2ZVwiOltcImphclwiLFwid2FyXCIsXCJlYXJcIl0sXCJhcHBsaWNhdGlvbi9qYXZhLXNlcmlhbGl6ZWQtb2JqZWN0XCI6W1wic2VyXCJdLFwiYXBwbGljYXRpb24vamF2YS12bVwiOltcImNsYXNzXCJdLFwiYXBwbGljYXRpb24vamF2YXNjcmlwdFwiOltcImpzXCIsXCJtanNcIl0sXCJhcHBsaWNhdGlvbi9qc29uXCI6W1wianNvblwiLFwibWFwXCJdLFwiYXBwbGljYXRpb24vanNvbjVcIjpbXCJqc29uNVwiXSxcImFwcGxpY2F0aW9uL2pzb25tbCtqc29uXCI6W1wianNvbm1sXCJdLFwiYXBwbGljYXRpb24vbGQranNvblwiOltcImpzb25sZFwiXSxcImFwcGxpY2F0aW9uL2xncit4bWxcIjpbXCJsZ3JcIl0sXCJhcHBsaWNhdGlvbi9sb3N0K3htbFwiOltcImxvc3R4bWxcIl0sXCJhcHBsaWNhdGlvbi9tYWMtYmluaGV4NDBcIjpbXCJocXhcIl0sXCJhcHBsaWNhdGlvbi9tYWMtY29tcGFjdHByb1wiOltcImNwdFwiXSxcImFwcGxpY2F0aW9uL21hZHMreG1sXCI6W1wibWFkc1wiXSxcImFwcGxpY2F0aW9uL21hbmlmZXN0K2pzb25cIjpbXCJ3ZWJtYW5pZmVzdFwiXSxcImFwcGxpY2F0aW9uL21hcmNcIjpbXCJtcmNcIl0sXCJhcHBsaWNhdGlvbi9tYXJjeG1sK3htbFwiOltcIm1yY3hcIl0sXCJhcHBsaWNhdGlvbi9tYXRoZW1hdGljYVwiOltcIm1hXCIsXCJuYlwiLFwibWJcIl0sXCJhcHBsaWNhdGlvbi9tYXRobWwreG1sXCI6W1wibWF0aG1sXCJdLFwiYXBwbGljYXRpb24vbWJveFwiOltcIm1ib3hcIl0sXCJhcHBsaWNhdGlvbi9tZWRpYXNlcnZlcmNvbnRyb2wreG1sXCI6W1wibXNjbWxcIl0sXCJhcHBsaWNhdGlvbi9tZXRhbGluayt4bWxcIjpbXCJtZXRhbGlua1wiXSxcImFwcGxpY2F0aW9uL21ldGFsaW5rNCt4bWxcIjpbXCJtZXRhNFwiXSxcImFwcGxpY2F0aW9uL21ldHMreG1sXCI6W1wibWV0c1wiXSxcImFwcGxpY2F0aW9uL21tdC1hZWkreG1sXCI6W1wibWFlaVwiXSxcImFwcGxpY2F0aW9uL21tdC11c2QreG1sXCI6W1wibXVzZFwiXSxcImFwcGxpY2F0aW9uL21vZHMreG1sXCI6W1wibW9kc1wiXSxcImFwcGxpY2F0aW9uL21wMjFcIjpbXCJtMjFcIixcIm1wMjFcIl0sXCJhcHBsaWNhdGlvbi9tcDRcIjpbXCJtcDRzXCIsXCJtNHBcIl0sXCJhcHBsaWNhdGlvbi9tcmItY29uc3VtZXIreG1sXCI6W1wiKnhkZlwiXSxcImFwcGxpY2F0aW9uL21yYi1wdWJsaXNoK3htbFwiOltcIip4ZGZcIl0sXCJhcHBsaWNhdGlvbi9tc3dvcmRcIjpbXCJkb2NcIixcImRvdFwiXSxcImFwcGxpY2F0aW9uL214ZlwiOltcIm14ZlwiXSxcImFwcGxpY2F0aW9uL24tcXVhZHNcIjpbXCJucVwiXSxcImFwcGxpY2F0aW9uL24tdHJpcGxlc1wiOltcIm50XCJdLFwiYXBwbGljYXRpb24vbm9kZVwiOltcImNqc1wiXSxcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiOltcImJpblwiLFwiZG1zXCIsXCJscmZcIixcIm1hclwiLFwic29cIixcImRpc3RcIixcImRpc3R6XCIsXCJwa2dcIixcImJwa1wiLFwiZHVtcFwiLFwiZWxjXCIsXCJkZXBsb3lcIixcImV4ZVwiLFwiZGxsXCIsXCJkZWJcIixcImRtZ1wiLFwiaXNvXCIsXCJpbWdcIixcIm1zaVwiLFwibXNwXCIsXCJtc21cIixcImJ1ZmZlclwiXSxcImFwcGxpY2F0aW9uL29kYVwiOltcIm9kYVwiXSxcImFwcGxpY2F0aW9uL29lYnBzLXBhY2thZ2UreG1sXCI6W1wib3BmXCJdLFwiYXBwbGljYXRpb24vb2dnXCI6W1wib2d4XCJdLFwiYXBwbGljYXRpb24vb21kb2MreG1sXCI6W1wib21kb2NcIl0sXCJhcHBsaWNhdGlvbi9vbmVub3RlXCI6W1wib25ldG9jXCIsXCJvbmV0b2MyXCIsXCJvbmV0bXBcIixcIm9uZXBrZ1wiXSxcImFwcGxpY2F0aW9uL294cHNcIjpbXCJveHBzXCJdLFwiYXBwbGljYXRpb24vcDJwLW92ZXJsYXkreG1sXCI6W1wicmVsb1wiXSxcImFwcGxpY2F0aW9uL3BhdGNoLW9wcy1lcnJvcit4bWxcIjpbXCIqeGVyXCJdLFwiYXBwbGljYXRpb24vcGRmXCI6W1wicGRmXCJdLFwiYXBwbGljYXRpb24vcGdwLWVuY3J5cHRlZFwiOltcInBncFwiXSxcImFwcGxpY2F0aW9uL3BncC1zaWduYXR1cmVcIjpbXCJhc2NcIixcInNpZ1wiXSxcImFwcGxpY2F0aW9uL3BpY3MtcnVsZXNcIjpbXCJwcmZcIl0sXCJhcHBsaWNhdGlvbi9wa2NzMTBcIjpbXCJwMTBcIl0sXCJhcHBsaWNhdGlvbi9wa2NzNy1taW1lXCI6W1wicDdtXCIsXCJwN2NcIl0sXCJhcHBsaWNhdGlvbi9wa2NzNy1zaWduYXR1cmVcIjpbXCJwN3NcIl0sXCJhcHBsaWNhdGlvbi9wa2NzOFwiOltcInA4XCJdLFwiYXBwbGljYXRpb24vcGtpeC1hdHRyLWNlcnRcIjpbXCJhY1wiXSxcImFwcGxpY2F0aW9uL3BraXgtY2VydFwiOltcImNlclwiXSxcImFwcGxpY2F0aW9uL3BraXgtY3JsXCI6W1wiY3JsXCJdLFwiYXBwbGljYXRpb24vcGtpeC1wa2lwYXRoXCI6W1wicGtpcGF0aFwiXSxcImFwcGxpY2F0aW9uL3BraXhjbXBcIjpbXCJwa2lcIl0sXCJhcHBsaWNhdGlvbi9wbHMreG1sXCI6W1wicGxzXCJdLFwiYXBwbGljYXRpb24vcG9zdHNjcmlwdFwiOltcImFpXCIsXCJlcHNcIixcInBzXCJdLFwiYXBwbGljYXRpb24vcHJvdmVuYW5jZSt4bWxcIjpbXCJwcm92eFwiXSxcImFwcGxpY2F0aW9uL3Bza2MreG1sXCI6W1wicHNrY3htbFwiXSxcImFwcGxpY2F0aW9uL3JhbWwreWFtbFwiOltcInJhbWxcIl0sXCJhcHBsaWNhdGlvbi9yZGYreG1sXCI6W1wicmRmXCIsXCJvd2xcIl0sXCJhcHBsaWNhdGlvbi9yZWdpbmZvK3htbFwiOltcInJpZlwiXSxcImFwcGxpY2F0aW9uL3JlbGF4LW5nLWNvbXBhY3Qtc3ludGF4XCI6W1wicm5jXCJdLFwiYXBwbGljYXRpb24vcmVzb3VyY2UtbGlzdHMreG1sXCI6W1wicmxcIl0sXCJhcHBsaWNhdGlvbi9yZXNvdXJjZS1saXN0cy1kaWZmK3htbFwiOltcInJsZFwiXSxcImFwcGxpY2F0aW9uL3Jscy1zZXJ2aWNlcyt4bWxcIjpbXCJyc1wiXSxcImFwcGxpY2F0aW9uL3JvdXRlLWFwZCt4bWxcIjpbXCJyYXBkXCJdLFwiYXBwbGljYXRpb24vcm91dGUtcy10c2lkK3htbFwiOltcInNsc1wiXSxcImFwcGxpY2F0aW9uL3JvdXRlLXVzZCt4bWxcIjpbXCJydXNkXCJdLFwiYXBwbGljYXRpb24vcnBraS1naG9zdGJ1c3RlcnNcIjpbXCJnYnJcIl0sXCJhcHBsaWNhdGlvbi9ycGtpLW1hbmlmZXN0XCI6W1wibWZ0XCJdLFwiYXBwbGljYXRpb24vcnBraS1yb2FcIjpbXCJyb2FcIl0sXCJhcHBsaWNhdGlvbi9yc2QreG1sXCI6W1wicnNkXCJdLFwiYXBwbGljYXRpb24vcnNzK3htbFwiOltcInJzc1wiXSxcImFwcGxpY2F0aW9uL3J0ZlwiOltcInJ0ZlwiXSxcImFwcGxpY2F0aW9uL3NibWwreG1sXCI6W1wic2JtbFwiXSxcImFwcGxpY2F0aW9uL3NjdnAtY3YtcmVxdWVzdFwiOltcInNjcVwiXSxcImFwcGxpY2F0aW9uL3NjdnAtY3YtcmVzcG9uc2VcIjpbXCJzY3NcIl0sXCJhcHBsaWNhdGlvbi9zY3ZwLXZwLXJlcXVlc3RcIjpbXCJzcHFcIl0sXCJhcHBsaWNhdGlvbi9zY3ZwLXZwLXJlc3BvbnNlXCI6W1wic3BwXCJdLFwiYXBwbGljYXRpb24vc2RwXCI6W1wic2RwXCJdLFwiYXBwbGljYXRpb24vc2VubWwreG1sXCI6W1wic2VubWx4XCJdLFwiYXBwbGljYXRpb24vc2Vuc21sK3htbFwiOltcInNlbnNtbHhcIl0sXCJhcHBsaWNhdGlvbi9zZXQtcGF5bWVudC1pbml0aWF0aW9uXCI6W1wic2V0cGF5XCJdLFwiYXBwbGljYXRpb24vc2V0LXJlZ2lzdHJhdGlvbi1pbml0aWF0aW9uXCI6W1wic2V0cmVnXCJdLFwiYXBwbGljYXRpb24vc2hmK3htbFwiOltcInNoZlwiXSxcImFwcGxpY2F0aW9uL3NpZXZlXCI6W1wic2l2XCIsXCJzaWV2ZVwiXSxcImFwcGxpY2F0aW9uL3NtaWwreG1sXCI6W1wic21pXCIsXCJzbWlsXCJdLFwiYXBwbGljYXRpb24vc3BhcnFsLXF1ZXJ5XCI6W1wicnFcIl0sXCJhcHBsaWNhdGlvbi9zcGFycWwtcmVzdWx0cyt4bWxcIjpbXCJzcnhcIl0sXCJhcHBsaWNhdGlvbi9zcmdzXCI6W1wiZ3JhbVwiXSxcImFwcGxpY2F0aW9uL3NyZ3MreG1sXCI6W1wiZ3J4bWxcIl0sXCJhcHBsaWNhdGlvbi9zcnUreG1sXCI6W1wic3J1XCJdLFwiYXBwbGljYXRpb24vc3NkbCt4bWxcIjpbXCJzc2RsXCJdLFwiYXBwbGljYXRpb24vc3NtbCt4bWxcIjpbXCJzc21sXCJdLFwiYXBwbGljYXRpb24vc3dpZCt4bWxcIjpbXCJzd2lkdGFnXCJdLFwiYXBwbGljYXRpb24vdGVpK3htbFwiOltcInRlaVwiLFwidGVpY29ycHVzXCJdLFwiYXBwbGljYXRpb24vdGhyYXVkK3htbFwiOltcInRmaVwiXSxcImFwcGxpY2F0aW9uL3RpbWVzdGFtcGVkLWRhdGFcIjpbXCJ0c2RcIl0sXCJhcHBsaWNhdGlvbi90b21sXCI6W1widG9tbFwiXSxcImFwcGxpY2F0aW9uL3R0bWwreG1sXCI6W1widHRtbFwiXSxcImFwcGxpY2F0aW9uL3VianNvblwiOltcInVialwiXSxcImFwcGxpY2F0aW9uL3VyYy1yZXNzaGVldCt4bWxcIjpbXCJyc2hlZXRcIl0sXCJhcHBsaWNhdGlvbi91cmMtdGFyZ2V0ZGVzYyt4bWxcIjpbXCJ0ZFwiXSxcImFwcGxpY2F0aW9uL3ZvaWNleG1sK3htbFwiOltcInZ4bWxcIl0sXCJhcHBsaWNhdGlvbi93YXNtXCI6W1wid2FzbVwiXSxcImFwcGxpY2F0aW9uL3dpZGdldFwiOltcIndndFwiXSxcImFwcGxpY2F0aW9uL3dpbmhscFwiOltcImhscFwiXSxcImFwcGxpY2F0aW9uL3dzZGwreG1sXCI6W1wid3NkbFwiXSxcImFwcGxpY2F0aW9uL3dzcG9saWN5K3htbFwiOltcIndzcG9saWN5XCJdLFwiYXBwbGljYXRpb24veGFtbCt4bWxcIjpbXCJ4YW1sXCJdLFwiYXBwbGljYXRpb24veGNhcC1hdHQreG1sXCI6W1wieGF2XCJdLFwiYXBwbGljYXRpb24veGNhcC1jYXBzK3htbFwiOltcInhjYVwiXSxcImFwcGxpY2F0aW9uL3hjYXAtZGlmZit4bWxcIjpbXCJ4ZGZcIl0sXCJhcHBsaWNhdGlvbi94Y2FwLWVsK3htbFwiOltcInhlbFwiXSxcImFwcGxpY2F0aW9uL3hjYXAtZXJyb3IreG1sXCI6W1wieGVyXCJdLFwiYXBwbGljYXRpb24veGNhcC1ucyt4bWxcIjpbXCJ4bnNcIl0sXCJhcHBsaWNhdGlvbi94ZW5jK3htbFwiOltcInhlbmNcIl0sXCJhcHBsaWNhdGlvbi94aHRtbCt4bWxcIjpbXCJ4aHRtbFwiLFwieGh0XCJdLFwiYXBwbGljYXRpb24veGxpZmYreG1sXCI6W1wieGxmXCJdLFwiYXBwbGljYXRpb24veG1sXCI6W1wieG1sXCIsXCJ4c2xcIixcInhzZFwiLFwicm5nXCJdLFwiYXBwbGljYXRpb24veG1sLWR0ZFwiOltcImR0ZFwiXSxcImFwcGxpY2F0aW9uL3hvcCt4bWxcIjpbXCJ4b3BcIl0sXCJhcHBsaWNhdGlvbi94cHJvYyt4bWxcIjpbXCJ4cGxcIl0sXCJhcHBsaWNhdGlvbi94c2x0K3htbFwiOltcIip4c2xcIixcInhzbHRcIl0sXCJhcHBsaWNhdGlvbi94c3BmK3htbFwiOltcInhzcGZcIl0sXCJhcHBsaWNhdGlvbi94dit4bWxcIjpbXCJteG1sXCIsXCJ4aHZtbFwiLFwieHZtbFwiLFwieHZtXCJdLFwiYXBwbGljYXRpb24veWFuZ1wiOltcInlhbmdcIl0sXCJhcHBsaWNhdGlvbi95aW4reG1sXCI6W1wieWluXCJdLFwiYXBwbGljYXRpb24vemlwXCI6W1wiemlwXCJdLFwiYXVkaW8vM2dwcFwiOltcIiozZ3BwXCJdLFwiYXVkaW8vYWRwY21cIjpbXCJhZHBcIl0sXCJhdWRpby9hbXJcIjpbXCJhbXJcIl0sXCJhdWRpby9iYXNpY1wiOltcImF1XCIsXCJzbmRcIl0sXCJhdWRpby9taWRpXCI6W1wibWlkXCIsXCJtaWRpXCIsXCJrYXJcIixcInJtaVwiXSxcImF1ZGlvL21vYmlsZS14bWZcIjpbXCJteG1mXCJdLFwiYXVkaW8vbXAzXCI6W1wiKm1wM1wiXSxcImF1ZGlvL21wNFwiOltcIm00YVwiLFwibXA0YVwiXSxcImF1ZGlvL21wZWdcIjpbXCJtcGdhXCIsXCJtcDJcIixcIm1wMmFcIixcIm1wM1wiLFwibTJhXCIsXCJtM2FcIl0sXCJhdWRpby9vZ2dcIjpbXCJvZ2FcIixcIm9nZ1wiLFwic3B4XCIsXCJvcHVzXCJdLFwiYXVkaW8vczNtXCI6W1wiczNtXCJdLFwiYXVkaW8vc2lsa1wiOltcInNpbFwiXSxcImF1ZGlvL3dhdlwiOltcIndhdlwiXSxcImF1ZGlvL3dhdmVcIjpbXCIqd2F2XCJdLFwiYXVkaW8vd2VibVwiOltcIndlYmFcIl0sXCJhdWRpby94bVwiOltcInhtXCJdLFwiZm9udC9jb2xsZWN0aW9uXCI6W1widHRjXCJdLFwiZm9udC9vdGZcIjpbXCJvdGZcIl0sXCJmb250L3R0ZlwiOltcInR0ZlwiXSxcImZvbnQvd29mZlwiOltcIndvZmZcIl0sXCJmb250L3dvZmYyXCI6W1wid29mZjJcIl0sXCJpbWFnZS9hY2VzXCI6W1wiZXhyXCJdLFwiaW1hZ2UvYXBuZ1wiOltcImFwbmdcIl0sXCJpbWFnZS9hdmlmXCI6W1wiYXZpZlwiXSxcImltYWdlL2JtcFwiOltcImJtcFwiXSxcImltYWdlL2NnbVwiOltcImNnbVwiXSxcImltYWdlL2RpY29tLXJsZVwiOltcImRybGVcIl0sXCJpbWFnZS9lbWZcIjpbXCJlbWZcIl0sXCJpbWFnZS9maXRzXCI6W1wiZml0c1wiXSxcImltYWdlL2czZmF4XCI6W1wiZzNcIl0sXCJpbWFnZS9naWZcIjpbXCJnaWZcIl0sXCJpbWFnZS9oZWljXCI6W1wiaGVpY1wiXSxcImltYWdlL2hlaWMtc2VxdWVuY2VcIjpbXCJoZWljc1wiXSxcImltYWdlL2hlaWZcIjpbXCJoZWlmXCJdLFwiaW1hZ2UvaGVpZi1zZXF1ZW5jZVwiOltcImhlaWZzXCJdLFwiaW1hZ2UvaGVqMmtcIjpbXCJoZWoyXCJdLFwiaW1hZ2UvaHNqMlwiOltcImhzajJcIl0sXCJpbWFnZS9pZWZcIjpbXCJpZWZcIl0sXCJpbWFnZS9qbHNcIjpbXCJqbHNcIl0sXCJpbWFnZS9qcDJcIjpbXCJqcDJcIixcImpwZzJcIl0sXCJpbWFnZS9qcGVnXCI6W1wianBlZ1wiLFwianBnXCIsXCJqcGVcIl0sXCJpbWFnZS9qcGhcIjpbXCJqcGhcIl0sXCJpbWFnZS9qcGhjXCI6W1wiamhjXCJdLFwiaW1hZ2UvanBtXCI6W1wianBtXCJdLFwiaW1hZ2UvanB4XCI6W1wianB4XCIsXCJqcGZcIl0sXCJpbWFnZS9qeHJcIjpbXCJqeHJcIl0sXCJpbWFnZS9qeHJhXCI6W1wianhyYVwiXSxcImltYWdlL2p4cnNcIjpbXCJqeHJzXCJdLFwiaW1hZ2UvanhzXCI6W1wianhzXCJdLFwiaW1hZ2UvanhzY1wiOltcImp4c2NcIl0sXCJpbWFnZS9qeHNpXCI6W1wianhzaVwiXSxcImltYWdlL2p4c3NcIjpbXCJqeHNzXCJdLFwiaW1hZ2Uva3R4XCI6W1wia3R4XCJdLFwiaW1hZ2Uva3R4MlwiOltcImt0eDJcIl0sXCJpbWFnZS9wbmdcIjpbXCJwbmdcIl0sXCJpbWFnZS9zZ2lcIjpbXCJzZ2lcIl0sXCJpbWFnZS9zdmcreG1sXCI6W1wic3ZnXCIsXCJzdmd6XCJdLFwiaW1hZ2UvdDM4XCI6W1widDM4XCJdLFwiaW1hZ2UvdGlmZlwiOltcInRpZlwiLFwidGlmZlwiXSxcImltYWdlL3RpZmYtZnhcIjpbXCJ0ZnhcIl0sXCJpbWFnZS93ZWJwXCI6W1wid2VicFwiXSxcImltYWdlL3dtZlwiOltcIndtZlwiXSxcIm1lc3NhZ2UvZGlzcG9zaXRpb24tbm90aWZpY2F0aW9uXCI6W1wiZGlzcG9zaXRpb24tbm90aWZpY2F0aW9uXCJdLFwibWVzc2FnZS9nbG9iYWxcIjpbXCJ1OG1zZ1wiXSxcIm1lc3NhZ2UvZ2xvYmFsLWRlbGl2ZXJ5LXN0YXR1c1wiOltcInU4ZHNuXCJdLFwibWVzc2FnZS9nbG9iYWwtZGlzcG9zaXRpb24tbm90aWZpY2F0aW9uXCI6W1widThtZG5cIl0sXCJtZXNzYWdlL2dsb2JhbC1oZWFkZXJzXCI6W1widThoZHJcIl0sXCJtZXNzYWdlL3JmYzgyMlwiOltcImVtbFwiLFwibWltZVwiXSxcIm1vZGVsLzNtZlwiOltcIjNtZlwiXSxcIm1vZGVsL2dsdGYranNvblwiOltcImdsdGZcIl0sXCJtb2RlbC9nbHRmLWJpbmFyeVwiOltcImdsYlwiXSxcIm1vZGVsL2lnZXNcIjpbXCJpZ3NcIixcImlnZXNcIl0sXCJtb2RlbC9tZXNoXCI6W1wibXNoXCIsXCJtZXNoXCIsXCJzaWxvXCJdLFwibW9kZWwvbXRsXCI6W1wibXRsXCJdLFwibW9kZWwvb2JqXCI6W1wib2JqXCJdLFwibW9kZWwvc3RsXCI6W1wic3RsXCJdLFwibW9kZWwvdnJtbFwiOltcIndybFwiLFwidnJtbFwiXSxcIm1vZGVsL3gzZCtiaW5hcnlcIjpbXCIqeDNkYlwiLFwieDNkYnpcIl0sXCJtb2RlbC94M2QrZmFzdGluZm9zZXRcIjpbXCJ4M2RiXCJdLFwibW9kZWwveDNkK3ZybWxcIjpbXCIqeDNkdlwiLFwieDNkdnpcIl0sXCJtb2RlbC94M2QreG1sXCI6W1wieDNkXCIsXCJ4M2R6XCJdLFwibW9kZWwveDNkLXZybWxcIjpbXCJ4M2R2XCJdLFwidGV4dC9jYWNoZS1tYW5pZmVzdFwiOltcImFwcGNhY2hlXCIsXCJtYW5pZmVzdFwiXSxcInRleHQvY2FsZW5kYXJcIjpbXCJpY3NcIixcImlmYlwiXSxcInRleHQvY29mZmVlc2NyaXB0XCI6W1wiY29mZmVlXCIsXCJsaXRjb2ZmZWVcIl0sXCJ0ZXh0L2Nzc1wiOltcImNzc1wiXSxcInRleHQvY3N2XCI6W1wiY3N2XCJdLFwidGV4dC9odG1sXCI6W1wiaHRtbFwiLFwiaHRtXCIsXCJzaHRtbFwiXSxcInRleHQvamFkZVwiOltcImphZGVcIl0sXCJ0ZXh0L2pzeFwiOltcImpzeFwiXSxcInRleHQvbGVzc1wiOltcImxlc3NcIl0sXCJ0ZXh0L21hcmtkb3duXCI6W1wibWFya2Rvd25cIixcIm1kXCJdLFwidGV4dC9tYXRobWxcIjpbXCJtbWxcIl0sXCJ0ZXh0L21keFwiOltcIm1keFwiXSxcInRleHQvbjNcIjpbXCJuM1wiXSxcInRleHQvcGxhaW5cIjpbXCJ0eHRcIixcInRleHRcIixcImNvbmZcIixcImRlZlwiLFwibGlzdFwiLFwibG9nXCIsXCJpblwiLFwiaW5pXCJdLFwidGV4dC9yaWNodGV4dFwiOltcInJ0eFwiXSxcInRleHQvcnRmXCI6W1wiKnJ0ZlwiXSxcInRleHQvc2dtbFwiOltcInNnbWxcIixcInNnbVwiXSxcInRleHQvc2hleFwiOltcInNoZXhcIl0sXCJ0ZXh0L3NsaW1cIjpbXCJzbGltXCIsXCJzbG1cIl0sXCJ0ZXh0L3NwZHhcIjpbXCJzcGR4XCJdLFwidGV4dC9zdHlsdXNcIjpbXCJzdHlsdXNcIixcInN0eWxcIl0sXCJ0ZXh0L3RhYi1zZXBhcmF0ZWQtdmFsdWVzXCI6W1widHN2XCJdLFwidGV4dC90cm9mZlwiOltcInRcIixcInRyXCIsXCJyb2ZmXCIsXCJtYW5cIixcIm1lXCIsXCJtc1wiXSxcInRleHQvdHVydGxlXCI6W1widHRsXCJdLFwidGV4dC91cmktbGlzdFwiOltcInVyaVwiLFwidXJpc1wiLFwidXJsc1wiXSxcInRleHQvdmNhcmRcIjpbXCJ2Y2FyZFwiXSxcInRleHQvdnR0XCI6W1widnR0XCJdLFwidGV4dC94bWxcIjpbXCIqeG1sXCJdLFwidGV4dC95YW1sXCI6W1wieWFtbFwiLFwieW1sXCJdLFwidmlkZW8vM2dwcFwiOltcIjNncFwiLFwiM2dwcFwiXSxcInZpZGVvLzNncHAyXCI6W1wiM2cyXCJdLFwidmlkZW8vaDI2MVwiOltcImgyNjFcIl0sXCJ2aWRlby9oMjYzXCI6W1wiaDI2M1wiXSxcInZpZGVvL2gyNjRcIjpbXCJoMjY0XCJdLFwidmlkZW8vaXNvLnNlZ21lbnRcIjpbXCJtNHNcIl0sXCJ2aWRlby9qcGVnXCI6W1wianBndlwiXSxcInZpZGVvL2pwbVwiOltcIipqcG1cIixcImpwZ21cIl0sXCJ2aWRlby9tajJcIjpbXCJtajJcIixcIm1qcDJcIl0sXCJ2aWRlby9tcDJ0XCI6W1widHNcIl0sXCJ2aWRlby9tcDRcIjpbXCJtcDRcIixcIm1wNHZcIixcIm1wZzRcIl0sXCJ2aWRlby9tcGVnXCI6W1wibXBlZ1wiLFwibXBnXCIsXCJtcGVcIixcIm0xdlwiLFwibTJ2XCJdLFwidmlkZW8vb2dnXCI6W1wib2d2XCJdLFwidmlkZW8vcXVpY2t0aW1lXCI6W1wicXRcIixcIm1vdlwiXSxcInZpZGVvL3dlYm1cIjpbXCJ3ZWJtXCJdfTsiLCIvLyAncGF0aCcgbW9kdWxlIGV4dHJhY3RlZCBmcm9tIE5vZGUuanMgdjguMTEuMSAob25seSB0aGUgcG9zaXggcGFydClcbi8vIHRyYW5zcGxpdGVkIHdpdGggQmFiZWxcblxuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gYXNzZXJ0UGF0aChwYXRoKSB7XG4gIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQYXRoIG11c3QgYmUgYSBzdHJpbmcuIFJlY2VpdmVkICcgKyBKU09OLnN0cmluZ2lmeShwYXRoKSk7XG4gIH1cbn1cblxuLy8gUmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIHdpdGggZGlyZWN0b3J5IG5hbWVzXG5mdW5jdGlvbiBub3JtYWxpemVTdHJpbmdQb3NpeChwYXRoLCBhbGxvd0Fib3ZlUm9vdCkge1xuICB2YXIgcmVzID0gJyc7XG4gIHZhciBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gIHZhciBsYXN0U2xhc2ggPSAtMTtcbiAgdmFyIGRvdHMgPSAwO1xuICB2YXIgY29kZTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPD0gcGF0aC5sZW5ndGg7ICsraSkge1xuICAgIGlmIChpIDwgcGF0aC5sZW5ndGgpXG4gICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgIGVsc2UgaWYgKGNvZGUgPT09IDQ3IC8qLyovKVxuICAgICAgYnJlYWs7XG4gICAgZWxzZVxuICAgICAgY29kZSA9IDQ3IC8qLyovO1xuICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgaWYgKGxhc3RTbGFzaCA9PT0gaSAtIDEgfHwgZG90cyA9PT0gMSkge1xuICAgICAgICAvLyBOT09QXG4gICAgICB9IGVsc2UgaWYgKGxhc3RTbGFzaCAhPT0gaSAtIDEgJiYgZG90cyA9PT0gMikge1xuICAgICAgICBpZiAocmVzLmxlbmd0aCA8IDIgfHwgbGFzdFNlZ21lbnRMZW5ndGggIT09IDIgfHwgcmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aCAtIDEpICE9PSA0NiAvKi4qLyB8fCByZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMikgIT09IDQ2IC8qLiovKSB7XG4gICAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICB2YXIgbGFzdFNsYXNoSW5kZXggPSByZXMubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgICAgICAgIGlmIChsYXN0U2xhc2hJbmRleCAhPT0gcmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgaWYgKGxhc3RTbGFzaEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJlcyA9ICcnO1xuICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgbGFzdFNsYXNoSW5kZXgpO1xuICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gcmVzLmxlbmd0aCAtIDEgLSByZXMubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgICAgICAgICBkb3RzID0gMDtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChyZXMubGVuZ3RoID09PSAyIHx8IHJlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJlcyA9ICcnO1xuICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xuICAgICAgICAgICAgbGFzdFNsYXNoID0gaTtcbiAgICAgICAgICAgIGRvdHMgPSAwO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHJlcyArPSAnLy4uJztcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXMgPSAnLi4nO1xuICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAwKVxuICAgICAgICAgIHJlcyArPSAnLycgKyBwYXRoLnNsaWNlKGxhc3RTbGFzaCArIDEsIGkpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVzID0gcGF0aC5zbGljZShsYXN0U2xhc2ggKyAxLCBpKTtcbiAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSBpIC0gbGFzdFNsYXNoIC0gMTtcbiAgICAgIH1cbiAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICBkb3RzID0gMDtcbiAgICB9IGVsc2UgaWYgKGNvZGUgPT09IDQ2IC8qLiovICYmIGRvdHMgIT09IC0xKSB7XG4gICAgICArK2RvdHM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvdHMgPSAtMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gX2Zvcm1hdChzZXAsIHBhdGhPYmplY3QpIHtcbiAgdmFyIGRpciA9IHBhdGhPYmplY3QuZGlyIHx8IHBhdGhPYmplY3Qucm9vdDtcbiAgdmFyIGJhc2UgPSBwYXRoT2JqZWN0LmJhc2UgfHwgKHBhdGhPYmplY3QubmFtZSB8fCAnJykgKyAocGF0aE9iamVjdC5leHQgfHwgJycpO1xuICBpZiAoIWRpcikge1xuICAgIHJldHVybiBiYXNlO1xuICB9XG4gIGlmIChkaXIgPT09IHBhdGhPYmplY3Qucm9vdCkge1xuICAgIHJldHVybiBkaXIgKyBiYXNlO1xuICB9XG4gIHJldHVybiBkaXIgKyBzZXAgKyBiYXNlO1xufVxuXG52YXIgcG9zaXggPSB7XG4gIC8vIHBhdGgucmVzb2x2ZShbZnJvbSAuLi5dLCB0bylcbiAgcmVzb2x2ZTogZnVuY3Rpb24gcmVzb2x2ZSgpIHtcbiAgICB2YXIgcmVzb2x2ZWRQYXRoID0gJyc7XG4gICAgdmFyIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcbiAgICB2YXIgY3dkO1xuXG4gICAgZm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgICAgIHZhciBwYXRoO1xuICAgICAgaWYgKGkgPj0gMClcbiAgICAgICAgcGF0aCA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoY3dkID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgY3dkID0gcHJvY2Vzcy5jd2QoKTtcbiAgICAgICAgcGF0aCA9IGN3ZDtcbiAgICAgIH1cblxuICAgICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgICAgLy8gU2tpcCBlbXB0eSBlbnRyaWVzXG4gICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQ29kZUF0KDApID09PSA0NyAvKi8qLztcbiAgICB9XG5cbiAgICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gICAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXG5cbiAgICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVTdHJpbmdQb3NpeChyZXNvbHZlZFBhdGgsICFyZXNvbHZlZEFic29sdXRlKTtcblxuICAgIGlmIChyZXNvbHZlZEFic29sdXRlKSB7XG4gICAgICBpZiAocmVzb2x2ZWRQYXRoLmxlbmd0aCA+IDApXG4gICAgICAgIHJldHVybiAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiAnLyc7XG4gICAgfSBlbHNlIGlmIChyZXNvbHZlZFBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHJlc29sdmVkUGF0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcuJztcbiAgICB9XG4gIH0sXG5cbiAgbm9ybWFsaXplOiBmdW5jdGlvbiBub3JtYWxpemUocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG5cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiAnLic7XG5cbiAgICB2YXIgaXNBYnNvbHV0ZSA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gNDcgLyovKi87XG4gICAgdmFyIHRyYWlsaW5nU2VwYXJhdG9yID0gcGF0aC5jaGFyQ29kZUF0KHBhdGgubGVuZ3RoIC0gMSkgPT09IDQ3IC8qLyovO1xuXG4gICAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gICAgcGF0aCA9IG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGgsICFpc0Fic29sdXRlKTtcblxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCAmJiAhaXNBYnNvbHV0ZSkgcGF0aCA9ICcuJztcbiAgICBpZiAocGF0aC5sZW5ndGggPiAwICYmIHRyYWlsaW5nU2VwYXJhdG9yKSBwYXRoICs9ICcvJztcblxuICAgIGlmIChpc0Fic29sdXRlKSByZXR1cm4gJy8nICsgcGF0aDtcbiAgICByZXR1cm4gcGF0aDtcbiAgfSxcblxuICBpc0Fic29sdXRlOiBmdW5jdGlvbiBpc0Fic29sdXRlKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuICAgIHJldHVybiBwYXRoLmxlbmd0aCA+IDAgJiYgcGF0aC5jaGFyQ29kZUF0KDApID09PSA0NyAvKi8qLztcbiAgfSxcblxuICBqb2luOiBmdW5jdGlvbiBqb2luKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgcmV0dXJuICcuJztcbiAgICB2YXIgam9pbmVkO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgYXJnID0gYXJndW1lbnRzW2ldO1xuICAgICAgYXNzZXJ0UGF0aChhcmcpO1xuICAgICAgaWYgKGFyZy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChqb2luZWQgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICBqb2luZWQgPSBhcmc7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBqb2luZWQgKz0gJy8nICsgYXJnO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoam9pbmVkID09PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gJy4nO1xuICAgIHJldHVybiBwb3NpeC5ub3JtYWxpemUoam9pbmVkKTtcbiAgfSxcblxuICByZWxhdGl2ZTogZnVuY3Rpb24gcmVsYXRpdmUoZnJvbSwgdG8pIHtcbiAgICBhc3NlcnRQYXRoKGZyb20pO1xuICAgIGFzc2VydFBhdGgodG8pO1xuXG4gICAgaWYgKGZyb20gPT09IHRvKSByZXR1cm4gJyc7XG5cbiAgICBmcm9tID0gcG9zaXgucmVzb2x2ZShmcm9tKTtcbiAgICB0byA9IHBvc2l4LnJlc29sdmUodG8pO1xuXG4gICAgaWYgKGZyb20gPT09IHRvKSByZXR1cm4gJyc7XG5cbiAgICAvLyBUcmltIGFueSBsZWFkaW5nIGJhY2tzbGFzaGVzXG4gICAgdmFyIGZyb21TdGFydCA9IDE7XG4gICAgZm9yICg7IGZyb21TdGFydCA8IGZyb20ubGVuZ3RoOyArK2Zyb21TdGFydCkge1xuICAgICAgaWYgKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQpICE9PSA0NyAvKi8qLylcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHZhciBmcm9tRW5kID0gZnJvbS5sZW5ndGg7XG4gICAgdmFyIGZyb21MZW4gPSBmcm9tRW5kIC0gZnJvbVN0YXJ0O1xuXG4gICAgLy8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xuICAgIHZhciB0b1N0YXJ0ID0gMTtcbiAgICBmb3IgKDsgdG9TdGFydCA8IHRvLmxlbmd0aDsgKyt0b1N0YXJ0KSB7XG4gICAgICBpZiAodG8uY2hhckNvZGVBdCh0b1N0YXJ0KSAhPT0gNDcgLyovKi8pXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB2YXIgdG9FbmQgPSB0by5sZW5ndGg7XG4gICAgdmFyIHRvTGVuID0gdG9FbmQgLSB0b1N0YXJ0O1xuXG4gICAgLy8gQ29tcGFyZSBwYXRocyB0byBmaW5kIHRoZSBsb25nZXN0IGNvbW1vbiBwYXRoIGZyb20gcm9vdFxuICAgIHZhciBsZW5ndGggPSBmcm9tTGVuIDwgdG9MZW4gPyBmcm9tTGVuIDogdG9MZW47XG4gICAgdmFyIGxhc3RDb21tb25TZXAgPSAtMTtcbiAgICB2YXIgaSA9IDA7XG4gICAgZm9yICg7IGkgPD0gbGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChpID09PSBsZW5ndGgpIHtcbiAgICAgICAgaWYgKHRvTGVuID4gbGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCArIGkpID09PSA0NyAvKi8qLykge1xuICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGB0b2AuXG4gICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvby9iYXInOyB0bz0nL2Zvby9iYXIvYmF6J1xuICAgICAgICAgICAgcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQgKyBpICsgMSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgZnJvbWAgaXMgdGhlIHJvb3RcbiAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvJzsgdG89Jy9mb28nXG4gICAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChmcm9tTGVuID4gbGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGB0b2AgaXMgdGhlIGV4YWN0IGJhc2UgcGF0aCBmb3IgYGZyb21gLlxuICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28vYmFyL2Jheic7IHRvPScvZm9vL2JhcidcbiAgICAgICAgICAgIGxhc3RDb21tb25TZXAgPSBpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgcm9vdC5cbiAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vJzsgdG89Jy8nXG4gICAgICAgICAgICBsYXN0Q29tbW9uU2VwID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB2YXIgZnJvbUNvZGUgPSBmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSk7XG4gICAgICB2YXIgdG9Db2RlID0gdG8uY2hhckNvZGVBdCh0b1N0YXJ0ICsgaSk7XG4gICAgICBpZiAoZnJvbUNvZGUgIT09IHRvQ29kZSlcbiAgICAgICAgYnJlYWs7XG4gICAgICBlbHNlIGlmIChmcm9tQ29kZSA9PT0gNDcgLyovKi8pXG4gICAgICAgIGxhc3RDb21tb25TZXAgPSBpO1xuICAgIH1cblxuICAgIHZhciBvdXQgPSAnJztcbiAgICAvLyBHZW5lcmF0ZSB0aGUgcmVsYXRpdmUgcGF0aCBiYXNlZCBvbiB0aGUgcGF0aCBkaWZmZXJlbmNlIGJldHdlZW4gYHRvYFxuICAgIC8vIGFuZCBgZnJvbWBcbiAgICBmb3IgKGkgPSBmcm9tU3RhcnQgKyBsYXN0Q29tbW9uU2VwICsgMTsgaSA8PSBmcm9tRW5kOyArK2kpIHtcbiAgICAgIGlmIChpID09PSBmcm9tRW5kIHx8IGZyb20uY2hhckNvZGVBdChpKSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgaWYgKG91dC5sZW5ndGggPT09IDApXG4gICAgICAgICAgb3V0ICs9ICcuLic7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvdXQgKz0gJy8uLic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTGFzdGx5LCBhcHBlbmQgdGhlIHJlc3Qgb2YgdGhlIGRlc3RpbmF0aW9uIChgdG9gKSBwYXRoIHRoYXQgY29tZXMgYWZ0ZXJcbiAgICAvLyB0aGUgY29tbW9uIHBhdGggcGFydHNcbiAgICBpZiAob3V0Lmxlbmd0aCA+IDApXG4gICAgICByZXR1cm4gb3V0ICsgdG8uc2xpY2UodG9TdGFydCArIGxhc3RDb21tb25TZXApO1xuICAgIGVsc2Uge1xuICAgICAgdG9TdGFydCArPSBsYXN0Q29tbW9uU2VwO1xuICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCkgPT09IDQ3IC8qLyovKVxuICAgICAgICArK3RvU3RhcnQ7XG4gICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCk7XG4gICAgfVxuICB9LFxuXG4gIF9tYWtlTG9uZzogZnVuY3Rpb24gX21ha2VMb25nKHBhdGgpIHtcbiAgICByZXR1cm4gcGF0aDtcbiAgfSxcblxuICBkaXJuYW1lOiBmdW5jdGlvbiBkaXJuYW1lKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcbiAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdCgwKTtcbiAgICB2YXIgaGFzUm9vdCA9IGNvZGUgPT09IDQ3IC8qLyovO1xuICAgIHZhciBlbmQgPSAtMTtcbiAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcbiAgICBmb3IgKHZhciBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDE7IC0taSkge1xuICAgICAgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XG4gICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvclxuICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW5kID09PSAtMSkgcmV0dXJuIGhhc1Jvb3QgPyAnLycgOiAnLic7XG4gICAgaWYgKGhhc1Jvb3QgJiYgZW5kID09PSAxKSByZXR1cm4gJy8vJztcbiAgICByZXR1cm4gcGF0aC5zbGljZSgwLCBlbmQpO1xuICB9LFxuXG4gIGJhc2VuYW1lOiBmdW5jdGlvbiBiYXNlbmFtZShwYXRoLCBleHQpIHtcbiAgICBpZiAoZXh0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGV4dCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZXh0XCIgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG5cbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIHZhciBlbmQgPSAtMTtcbiAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcbiAgICB2YXIgaTtcblxuICAgIGlmIChleHQgIT09IHVuZGVmaW5lZCAmJiBleHQubGVuZ3RoID4gMCAmJiBleHQubGVuZ3RoIDw9IHBhdGgubGVuZ3RoKSB7XG4gICAgICBpZiAoZXh0Lmxlbmd0aCA9PT0gcGF0aC5sZW5ndGggJiYgZXh0ID09PSBwYXRoKSByZXR1cm4gJyc7XG4gICAgICB2YXIgZXh0SWR4ID0gZXh0Lmxlbmd0aCAtIDE7XG4gICAgICB2YXIgZmlyc3ROb25TbGFzaEVuZCA9IC0xO1xuICAgICAgZm9yIChpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxuICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChmaXJzdE5vblNsYXNoRW5kID09PSAtMSkge1xuICAgICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIHJlbWVtYmVyIHRoaXMgaW5kZXggaW4gY2FzZVxuICAgICAgICAgICAgLy8gd2UgbmVlZCBpdCBpZiB0aGUgZXh0ZW5zaW9uIGVuZHMgdXAgbm90IG1hdGNoaW5nXG4gICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgICAgIGZpcnN0Tm9uU2xhc2hFbmQgPSBpICsgMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGV4dElkeCA+PSAwKSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gbWF0Y2ggdGhlIGV4cGxpY2l0IGV4dGVuc2lvblxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IGV4dC5jaGFyQ29kZUF0KGV4dElkeCkpIHtcbiAgICAgICAgICAgICAgaWYgKC0tZXh0SWR4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIG1hdGNoZWQgdGhlIGV4dGVuc2lvbiwgc28gbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyIHBhdGhcbiAgICAgICAgICAgICAgICAvLyBjb21wb25lbnRcbiAgICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBFeHRlbnNpb24gZG9lcyBub3QgbWF0Y2gsIHNvIG91ciByZXN1bHQgaXMgdGhlIGVudGlyZSBwYXRoXG4gICAgICAgICAgICAgIC8vIGNvbXBvbmVudFxuICAgICAgICAgICAgICBleHRJZHggPSAtMTtcbiAgICAgICAgICAgICAgZW5kID0gZmlyc3ROb25TbGFzaEVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXJ0ID09PSBlbmQpIGVuZCA9IGZpcnN0Tm9uU2xhc2hFbmQ7ZWxzZSBpZiAoZW5kID09PSAtMSkgZW5kID0gcGF0aC5sZW5ndGg7XG4gICAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydCwgZW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBpZiAocGF0aC5jaGFyQ29kZUF0KGkpID09PSA0NyAvKi8qLykge1xuICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxuICAgICAgICAgIC8vIHBhdGggY29tcG9uZW50XG4gICAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICAgICAgZW5kID0gaSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVuZCA9PT0gLTEpIHJldHVybiAnJztcbiAgICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgIH1cbiAgfSxcblxuICBleHRuYW1lOiBmdW5jdGlvbiBleHRuYW1lKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuICAgIHZhciBzdGFydERvdCA9IC0xO1xuICAgIHZhciBzdGFydFBhcnQgPSAwO1xuICAgIHZhciBlbmQgPSAtMTtcbiAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcbiAgICAvLyBUcmFjayB0aGUgc3RhdGUgb2YgY2hhcmFjdGVycyAoaWYgYW55KSB3ZSBzZWUgYmVmb3JlIG91ciBmaXJzdCBkb3QgYW5kXG4gICAgLy8gYWZ0ZXIgYW55IHBhdGggc2VwYXJhdG9yIHdlIGZpbmRcbiAgICB2YXIgcHJlRG90U3RhdGUgPSAwO1xuICAgIGZvciAodmFyIGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgIHN0YXJ0UGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICBpZiAoZW5kID09PSAtMSkge1xuICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAgIC8vIGV4dGVuc2lvblxuICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgZW5kID0gaSArIDE7XG4gICAgICB9XG4gICAgICBpZiAoY29kZSA9PT0gNDYgLyouKi8pIHtcbiAgICAgICAgICAvLyBJZiB0aGlzIGlzIG91ciBmaXJzdCBkb3QsIG1hcmsgaXQgYXMgdGhlIHN0YXJ0IG9mIG91ciBleHRlbnNpb25cbiAgICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xKVxuICAgICAgICAgICAgc3RhcnREb3QgPSBpO1xuICAgICAgICAgIGVsc2UgaWYgKHByZURvdFN0YXRlICE9PSAxKVxuICAgICAgICAgICAgcHJlRG90U3RhdGUgPSAxO1xuICAgICAgfSBlbHNlIGlmIChzdGFydERvdCAhPT0gLTEpIHtcbiAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBhbmQgbm9uLXBhdGggc2VwYXJhdG9yIGJlZm9yZSBvdXIgZG90LCBzbyB3ZSBzaG91bGRcbiAgICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cbiAgICAgICAgcHJlRG90U3RhdGUgPSAtMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3RhcnREb3QgPT09IC0xIHx8IGVuZCA9PT0gLTEgfHxcbiAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBjaGFyYWN0ZXIgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBkb3RcbiAgICAgICAgcHJlRG90U3RhdGUgPT09IDAgfHxcbiAgICAgICAgLy8gVGhlIChyaWdodC1tb3N0KSB0cmltbWVkIHBhdGggY29tcG9uZW50IGlzIGV4YWN0bHkgJy4uJ1xuICAgICAgICBwcmVEb3RTdGF0ZSA9PT0gMSAmJiBzdGFydERvdCA9PT0gZW5kIC0gMSAmJiBzdGFydERvdCA9PT0gc3RhcnRQYXJ0ICsgMSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydERvdCwgZW5kKTtcbiAgfSxcblxuICBmb3JtYXQ6IGZ1bmN0aW9uIGZvcm1hdChwYXRoT2JqZWN0KSB7XG4gICAgaWYgKHBhdGhPYmplY3QgPT09IG51bGwgfHwgdHlwZW9mIHBhdGhPYmplY3QgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXCJwYXRoT2JqZWN0XCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIHBhdGhPYmplY3QpO1xuICAgIH1cbiAgICByZXR1cm4gX2Zvcm1hdCgnLycsIHBhdGhPYmplY3QpO1xuICB9LFxuXG4gIHBhcnNlOiBmdW5jdGlvbiBwYXJzZShwYXRoKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgIHZhciByZXQgPSB7IHJvb3Q6ICcnLCBkaXI6ICcnLCBiYXNlOiAnJywgZXh0OiAnJywgbmFtZTogJycgfTtcbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiByZXQ7XG4gICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoMCk7XG4gICAgdmFyIGlzQWJzb2x1dGUgPSBjb2RlID09PSA0NyAvKi8qLztcbiAgICB2YXIgc3RhcnQ7XG4gICAgaWYgKGlzQWJzb2x1dGUpIHtcbiAgICAgIHJldC5yb290ID0gJy8nO1xuICAgICAgc3RhcnQgPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHZhciBzdGFydERvdCA9IC0xO1xuICAgIHZhciBzdGFydFBhcnQgPSAwO1xuICAgIHZhciBlbmQgPSAtMTtcbiAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcbiAgICB2YXIgaSA9IHBhdGgubGVuZ3RoIC0gMTtcblxuICAgIC8vIFRyYWNrIHRoZSBzdGF0ZSBvZiBjaGFyYWN0ZXJzIChpZiBhbnkpIHdlIHNlZSBiZWZvcmUgb3VyIGZpcnN0IGRvdCBhbmRcbiAgICAvLyBhZnRlciBhbnkgcGF0aCBzZXBhcmF0b3Igd2UgZmluZFxuICAgIHZhciBwcmVEb3RTdGF0ZSA9IDA7XG5cbiAgICAvLyBHZXQgbm9uLWRpciBpbmZvXG4gICAgZm9yICg7IGkgPj0gc3RhcnQ7IC0taSkge1xuICAgICAgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgIHN0YXJ0UGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICBpZiAoZW5kID09PSAtMSkge1xuICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAgIC8vIGV4dGVuc2lvblxuICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgZW5kID0gaSArIDE7XG4gICAgICB9XG4gICAgICBpZiAoY29kZSA9PT0gNDYgLyouKi8pIHtcbiAgICAgICAgICAvLyBJZiB0aGlzIGlzIG91ciBmaXJzdCBkb3QsIG1hcmsgaXQgYXMgdGhlIHN0YXJ0IG9mIG91ciBleHRlbnNpb25cbiAgICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xKSBzdGFydERvdCA9IGk7ZWxzZSBpZiAocHJlRG90U3RhdGUgIT09IDEpIHByZURvdFN0YXRlID0gMTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFydERvdCAhPT0gLTEpIHtcbiAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBhbmQgbm9uLXBhdGggc2VwYXJhdG9yIGJlZm9yZSBvdXIgZG90LCBzbyB3ZSBzaG91bGRcbiAgICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cbiAgICAgICAgcHJlRG90U3RhdGUgPSAtMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3RhcnREb3QgPT09IC0xIHx8IGVuZCA9PT0gLTEgfHxcbiAgICAvLyBXZSBzYXcgYSBub24tZG90IGNoYXJhY3RlciBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRvdFxuICAgIHByZURvdFN0YXRlID09PSAwIHx8XG4gICAgLy8gVGhlIChyaWdodC1tb3N0KSB0cmltbWVkIHBhdGggY29tcG9uZW50IGlzIGV4YWN0bHkgJy4uJ1xuICAgIHByZURvdFN0YXRlID09PSAxICYmIHN0YXJ0RG90ID09PSBlbmQgLSAxICYmIHN0YXJ0RG90ID09PSBzdGFydFBhcnQgKyAxKSB7XG4gICAgICBpZiAoZW5kICE9PSAtMSkge1xuICAgICAgICBpZiAoc3RhcnRQYXJ0ID09PSAwICYmIGlzQWJzb2x1dGUpIHJldC5iYXNlID0gcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKDEsIGVuZCk7ZWxzZSByZXQuYmFzZSA9IHJldC5uYW1lID0gcGF0aC5zbGljZShzdGFydFBhcnQsIGVuZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzdGFydFBhcnQgPT09IDAgJiYgaXNBYnNvbHV0ZSkge1xuICAgICAgICByZXQubmFtZSA9IHBhdGguc2xpY2UoMSwgc3RhcnREb3QpO1xuICAgICAgICByZXQuYmFzZSA9IHBhdGguc2xpY2UoMSwgZW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldC5uYW1lID0gcGF0aC5zbGljZShzdGFydFBhcnQsIHN0YXJ0RG90KTtcbiAgICAgICAgcmV0LmJhc2UgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgZW5kKTtcbiAgICAgIH1cbiAgICAgIHJldC5leHQgPSBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xuICAgIH1cblxuICAgIGlmIChzdGFydFBhcnQgPiAwKSByZXQuZGlyID0gcGF0aC5zbGljZSgwLCBzdGFydFBhcnQgLSAxKTtlbHNlIGlmIChpc0Fic29sdXRlKSByZXQuZGlyID0gJy8nO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfSxcblxuICBzZXA6ICcvJyxcbiAgZGVsaW1pdGVyOiAnOicsXG4gIHdpbjMyOiBudWxsLFxuICBwb3NpeDogbnVsbFxufTtcblxucG9zaXgucG9zaXggPSBwb3NpeDtcblxubW9kdWxlLmV4cG9ydHMgPSBwb3NpeDtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiEgaHR0cHM6Ly9tdGhzLmJlL3B1bnljb2RlIHYxLjQuMSBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0LyoqIERldGVjdCBmcmVlIHZhcmlhYmxlcyAqL1xuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmXG5cdFx0IWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdCFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoXG5cdFx0ZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwuc2VsZiA9PT0gZnJlZUdsb2JhbFxuXHQpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYHB1bnljb2RlYCBvYmplY3QuXG5cdCAqIEBuYW1lIHB1bnljb2RlXG5cdCAqIEB0eXBlIE9iamVjdFxuXHQgKi9cblx0dmFyIHB1bnljb2RlLFxuXG5cdC8qKiBIaWdoZXN0IHBvc2l0aXZlIHNpZ25lZCAzMi1iaXQgZmxvYXQgdmFsdWUgKi9cblx0bWF4SW50ID0gMjE0NzQ4MzY0NywgLy8gYWthLiAweDdGRkZGRkZGIG9yIDJeMzEtMVxuXG5cdC8qKiBCb290c3RyaW5nIHBhcmFtZXRlcnMgKi9cblx0YmFzZSA9IDM2LFxuXHR0TWluID0gMSxcblx0dE1heCA9IDI2LFxuXHRza2V3ID0gMzgsXG5cdGRhbXAgPSA3MDAsXG5cdGluaXRpYWxCaWFzID0gNzIsXG5cdGluaXRpYWxOID0gMTI4LCAvLyAweDgwXG5cdGRlbGltaXRlciA9ICctJywgLy8gJ1xceDJEJ1xuXG5cdC8qKiBSZWd1bGFyIGV4cHJlc3Npb25zICovXG5cdHJlZ2V4UHVueWNvZGUgPSAvXnhuLS0vLFxuXHRyZWdleE5vbkFTQ0lJID0gL1teXFx4MjAtXFx4N0VdLywgLy8gdW5wcmludGFibGUgQVNDSUkgY2hhcnMgKyBub24tQVNDSUkgY2hhcnNcblx0cmVnZXhTZXBhcmF0b3JzID0gL1tcXHgyRVxcdTMwMDJcXHVGRjBFXFx1RkY2MV0vZywgLy8gUkZDIDM0OTAgc2VwYXJhdG9yc1xuXG5cdC8qKiBFcnJvciBtZXNzYWdlcyAqL1xuXHRlcnJvcnMgPSB7XG5cdFx0J292ZXJmbG93JzogJ092ZXJmbG93OiBpbnB1dCBuZWVkcyB3aWRlciBpbnRlZ2VycyB0byBwcm9jZXNzJyxcblx0XHQnbm90LWJhc2ljJzogJ0lsbGVnYWwgaW5wdXQgPj0gMHg4MCAobm90IGEgYmFzaWMgY29kZSBwb2ludCknLFxuXHRcdCdpbnZhbGlkLWlucHV0JzogJ0ludmFsaWQgaW5wdXQnXG5cdH0sXG5cblx0LyoqIENvbnZlbmllbmNlIHNob3J0Y3V0cyAqL1xuXHRiYXNlTWludXNUTWluID0gYmFzZSAtIHRNaW4sXG5cdGZsb29yID0gTWF0aC5mbG9vcixcblx0c3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZSxcblxuXHQvKiogVGVtcG9yYXJ5IHZhcmlhYmxlICovXG5cdGtleTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGVycm9yIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBlcnJvciB0eXBlLlxuXHQgKiBAcmV0dXJucyB7RXJyb3J9IFRocm93cyBhIGBSYW5nZUVycm9yYCB3aXRoIHRoZSBhcHBsaWNhYmxlIGVycm9yIG1lc3NhZ2UuXG5cdCAqL1xuXHRmdW5jdGlvbiBlcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoZXJyb3JzW3R5cGVdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgYEFycmF5I21hcGAgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5IGFycmF5XG5cdCAqIGl0ZW0uXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcChhcnJheSwgZm4pIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHZhciByZXN1bHQgPSBbXTtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdHJlc3VsdFtsZW5ndGhdID0gZm4oYXJyYXlbbGVuZ3RoXSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogQSBzaW1wbGUgYEFycmF5I21hcGAtbGlrZSB3cmFwcGVyIHRvIHdvcmsgd2l0aCBkb21haW4gbmFtZSBzdHJpbmdzIG9yIGVtYWlsXG5cdCAqIGFkZHJlc3Nlcy5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5XG5cdCAqIGNoYXJhY3Rlci5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBzdHJpbmcgb2YgY2hhcmFjdGVycyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2tcblx0ICogZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXBEb21haW4oc3RyaW5nLCBmbikge1xuXHRcdHZhciBwYXJ0cyA9IHN0cmluZy5zcGxpdCgnQCcpO1xuXHRcdHZhciByZXN1bHQgPSAnJztcblx0XHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gSW4gZW1haWwgYWRkcmVzc2VzLCBvbmx5IHRoZSBkb21haW4gbmFtZSBzaG91bGQgYmUgcHVueWNvZGVkLiBMZWF2ZVxuXHRcdFx0Ly8gdGhlIGxvY2FsIHBhcnQgKGkuZS4gZXZlcnl0aGluZyB1cCB0byBgQGApIGludGFjdC5cblx0XHRcdHJlc3VsdCA9IHBhcnRzWzBdICsgJ0AnO1xuXHRcdFx0c3RyaW5nID0gcGFydHNbMV07XG5cdFx0fVxuXHRcdC8vIEF2b2lkIGBzcGxpdChyZWdleClgIGZvciBJRTggY29tcGF0aWJpbGl0eS4gU2VlICMxNy5cblx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleFNlcGFyYXRvcnMsICdcXHgyRScpO1xuXHRcdHZhciBsYWJlbHMgPSBzdHJpbmcuc3BsaXQoJy4nKTtcblx0XHR2YXIgZW5jb2RlZCA9IG1hcChsYWJlbHMsIGZuKS5qb2luKCcuJyk7XG5cdFx0cmV0dXJuIHJlc3VsdCArIGVuY29kZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBudW1lcmljIGNvZGUgcG9pbnRzIG9mIGVhY2ggVW5pY29kZVxuXHQgKiBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZy4gV2hpbGUgSmF2YVNjcmlwdCB1c2VzIFVDUy0yIGludGVybmFsbHksXG5cdCAqIHRoaXMgZnVuY3Rpb24gd2lsbCBjb252ZXJ0IGEgcGFpciBvZiBzdXJyb2dhdGUgaGFsdmVzIChlYWNoIG9mIHdoaWNoXG5cdCAqIFVDUy0yIGV4cG9zZXMgYXMgc2VwYXJhdGUgY2hhcmFjdGVycykgaW50byBhIHNpbmdsZSBjb2RlIHBvaW50LFxuXHQgKiBtYXRjaGluZyBVVEYtMTYuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZW5jb2RlYFxuXHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZGVjb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gVGhlIG5ldyBhcnJheSBvZiBjb2RlIHBvaW50cy5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBjb3VudGVyID0gMCxcblx0XHQgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcblx0XHQgICAgdmFsdWUsXG5cdFx0ICAgIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgc3RyaW5nIGJhc2VkIG9uIGFuIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZGVjb2RlYFxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBlbmNvZGVcblx0ICogQHBhcmFtIHtBcnJheX0gY29kZVBvaW50cyBUaGUgYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHJldHVybiBtYXAoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGJhc2ljIGNvZGUgcG9pbnQgaW50byBhIGRpZ2l0L2ludGVnZXIuXG5cdCAqIEBzZWUgYGRpZ2l0VG9CYXNpYygpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gY29kZVBvaW50IFRoZSBiYXNpYyBudW1lcmljIGNvZGUgcG9pbnQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludCAoZm9yIHVzZSBpblxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG5cdCAqIHRoZSBjb2RlIHBvaW50IGRvZXMgbm90IHJlcHJlc2VudCBhIHZhbHVlLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzaWNUb0RpZ2l0KGNvZGVQb2ludCkge1xuXHRcdGlmIChjb2RlUG9pbnQgLSA0OCA8IDEwKSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gMjI7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA2NSA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gNjU7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA5NyA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gOTc7XG5cdFx0fVxuXHRcdHJldHVybiBiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHNlZSBgYmFzaWNUb0RpZ2l0KClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBiYXNpYyBjb2RlIHBvaW50IHdob3NlIHZhbHVlICh3aGVuIHVzZWQgZm9yXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaXMgYGRpZ2l0YCwgd2hpY2ggbmVlZHMgdG8gYmUgaW4gdGhlIHJhbmdlXG5cdCAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuXHQgKiB1c2VkOyBlbHNlLCB0aGUgbG93ZXJjYXNlIGZvcm0gaXMgdXNlZC4gVGhlIGJlaGF2aW9yIGlzIHVuZGVmaW5lZFxuXHQgKiBpZiBgZmxhZ2AgaXMgbm9uLXplcm8gYW5kIGBkaWdpdGAgaGFzIG5vIHVwcGVyY2FzZSBmb3JtLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJpYXMgYWRhcHRhdGlvbiBmdW5jdGlvbiBhcyBwZXIgc2VjdGlvbiAzLjQgb2YgUkZDIDM0OTIuXG5cdCAqIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNDkyI3NlY3Rpb24tMy40XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBhZGFwdChkZWx0YSwgbnVtUG9pbnRzLCBmaXJzdFRpbWUpIHtcblx0XHR2YXIgayA9IDA7XG5cdFx0ZGVsdGEgPSBmaXJzdFRpbWUgPyBmbG9vcihkZWx0YSAvIGRhbXApIDogZGVsdGEgPj4gMTtcblx0XHRkZWx0YSArPSBmbG9vcihkZWx0YSAvIG51bVBvaW50cyk7XG5cdFx0Zm9yICgvKiBubyBpbml0aWFsaXphdGlvbiAqLzsgZGVsdGEgPiBiYXNlTWludXNUTWluICogdE1heCA+PiAxOyBrICs9IGJhc2UpIHtcblx0XHRcdGRlbHRhID0gZmxvb3IoZGVsdGEgLyBiYXNlTWludXNUTWluKTtcblx0XHR9XG5cdFx0cmV0dXJuIGZsb29yKGsgKyAoYmFzZU1pbnVzVE1pbiArIDEpICogZGVsdGEgLyAoZGVsdGEgKyBza2V3KSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzIHRvIGEgc3RyaW5nIG9mIFVuaWNvZGVcblx0ICogc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG5cdFx0Ly8gRG9uJ3QgdXNlIFVDUy0yXG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aCxcblx0XHQgICAgb3V0LFxuXHRcdCAgICBpID0gMCxcblx0XHQgICAgbiA9IGluaXRpYWxOLFxuXHRcdCAgICBiaWFzID0gaW5pdGlhbEJpYXMsXG5cdFx0ICAgIGJhc2ljLFxuXHRcdCAgICBqLFxuXHRcdCAgICBpbmRleCxcblx0XHQgICAgb2xkaSxcblx0XHQgICAgdyxcblx0XHQgICAgayxcblx0XHQgICAgZGlnaXQsXG5cdFx0ICAgIHQsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBiYXNlTWludXNUO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50czogbGV0IGBiYXNpY2AgYmUgdGhlIG51bWJlciBvZiBpbnB1dCBjb2RlXG5cdFx0Ly8gcG9pbnRzIGJlZm9yZSB0aGUgbGFzdCBkZWxpbWl0ZXIsIG9yIGAwYCBpZiB0aGVyZSBpcyBub25lLCB0aGVuIGNvcHlcblx0XHQvLyB0aGUgZmlyc3QgYmFzaWMgY29kZSBwb2ludHMgdG8gdGhlIG91dHB1dC5cblxuXHRcdGJhc2ljID0gaW5wdXQubGFzdEluZGV4T2YoZGVsaW1pdGVyKTtcblx0XHRpZiAoYmFzaWMgPCAwKSB7XG5cdFx0XHRiYXNpYyA9IDA7XG5cdFx0fVxuXG5cdFx0Zm9yIChqID0gMDsgaiA8IGJhc2ljOyArK2opIHtcblx0XHRcdC8vIGlmIGl0J3Mgbm90IGEgYmFzaWMgY29kZSBwb2ludFxuXHRcdFx0aWYgKGlucHV0LmNoYXJDb2RlQXQoaikgPj0gMHg4MCkge1xuXHRcdFx0XHRlcnJvcignbm90LWJhc2ljJyk7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQucHVzaChpbnB1dC5jaGFyQ29kZUF0KGopKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGRlY29kaW5nIGxvb3A6IHN0YXJ0IGp1c3QgYWZ0ZXIgdGhlIGxhc3QgZGVsaW1pdGVyIGlmIGFueSBiYXNpYyBjb2RlXG5cdFx0Ly8gcG9pbnRzIHdlcmUgY29waWVkOyBzdGFydCBhdCB0aGUgYmVnaW5uaW5nIG90aGVyd2lzZS5cblxuXHRcdGZvciAoaW5kZXggPSBiYXNpYyA+IDAgPyBiYXNpYyArIDEgOiAwOyBpbmRleCA8IGlucHV0TGVuZ3RoOyAvKiBubyBmaW5hbCBleHByZXNzaW9uICovKSB7XG5cblx0XHRcdC8vIGBpbmRleGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IGNoYXJhY3RlciB0byBiZSBjb25zdW1lZC5cblx0XHRcdC8vIERlY29kZSBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyIGludG8gYGRlbHRhYCxcblx0XHRcdC8vIHdoaWNoIGdldHMgYWRkZWQgdG8gYGlgLiBUaGUgb3ZlcmZsb3cgY2hlY2tpbmcgaXMgZWFzaWVyXG5cdFx0XHQvLyBpZiB3ZSBpbmNyZWFzZSBgaWAgYXMgd2UgZ28sIHRoZW4gc3VidHJhY3Qgb2ZmIGl0cyBzdGFydGluZ1xuXHRcdFx0Ly8gdmFsdWUgYXQgdGhlIGVuZCB0byBvYnRhaW4gYGRlbHRhYC5cblx0XHRcdGZvciAob2xkaSA9IGksIHcgPSAxLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblxuXHRcdFx0XHRpZiAoaW5kZXggPj0gaW5wdXRMZW5ndGgpIHtcblx0XHRcdFx0XHRlcnJvcignaW52YWxpZC1pbnB1dCcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZGlnaXQgPSBiYXNpY1RvRGlnaXQoaW5wdXQuY2hhckNvZGVBdChpbmRleCsrKSk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0ID49IGJhc2UgfHwgZGlnaXQgPiBmbG9vcigobWF4SW50IC0gaSkgLyB3KSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aSArPSBkaWdpdCAqIHc7XG5cdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA8IHQpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0aWYgKHcgPiBmbG9vcihtYXhJbnQgLyBiYXNlTWludXNUKSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dyAqPSBiYXNlTWludXNUO1xuXG5cdFx0XHR9XG5cblx0XHRcdG91dCA9IG91dHB1dC5sZW5ndGggKyAxO1xuXHRcdFx0YmlhcyA9IGFkYXB0KGkgLSBvbGRpLCBvdXQsIG9sZGkgPT0gMCk7XG5cblx0XHRcdC8vIGBpYCB3YXMgc3VwcG9zZWQgdG8gd3JhcCBhcm91bmQgZnJvbSBgb3V0YCB0byBgMGAsXG5cdFx0XHQvLyBpbmNyZW1lbnRpbmcgYG5gIGVhY2ggdGltZSwgc28gd2UnbGwgZml4IHRoYXQgbm93OlxuXHRcdFx0aWYgKGZsb29yKGkgLyBvdXQpID4gbWF4SW50IC0gbikge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0biArPSBmbG9vcihpIC8gb3V0KTtcblx0XHRcdGkgJT0gb3V0O1xuXG5cdFx0XHQvLyBJbnNlcnQgYG5gIGF0IHBvc2l0aW9uIGBpYCBvZiB0aGUgb3V0cHV0XG5cdFx0XHRvdXRwdXQuc3BsaWNlKGkrKywgMCwgbik7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdWNzMmVuY29kZShvdXRwdXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scyAoZS5nLiBhIGRvbWFpbiBuYW1lIGxhYmVsKSB0byBhXG5cdCAqIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGVuY29kZShpbnB1dCkge1xuXHRcdHZhciBuLFxuXHRcdCAgICBkZWx0YSxcblx0XHQgICAgaGFuZGxlZENQQ291bnQsXG5cdFx0ICAgIGJhc2ljTGVuZ3RoLFxuXHRcdCAgICBiaWFzLFxuXHRcdCAgICBqLFxuXHRcdCAgICBtLFxuXHRcdCAgICBxLFxuXHRcdCAgICBrLFxuXHRcdCAgICB0LFxuXHRcdCAgICBjdXJyZW50VmFsdWUsXG5cdFx0ICAgIG91dHB1dCA9IFtdLFxuXHRcdCAgICAvKiogYGlucHV0TGVuZ3RoYCB3aWxsIGhvbGQgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyBpbiBgaW5wdXRgLiAqL1xuXHRcdCAgICBpbnB1dExlbmd0aCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50UGx1c09uZSxcblx0XHQgICAgYmFzZU1pbnVzVCxcblx0XHQgICAgcU1pbnVzVDtcblxuXHRcdC8vIENvbnZlcnQgdGhlIGlucHV0IGluIFVDUy0yIHRvIFVuaWNvZGVcblx0XHRpbnB1dCA9IHVjczJkZWNvZGUoaW5wdXQpO1xuXG5cdFx0Ly8gQ2FjaGUgdGhlIGxlbmd0aFxuXHRcdGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSB0aGUgc3RhdGVcblx0XHRuID0gaW5pdGlhbE47XG5cdFx0ZGVsdGEgPSAwO1xuXHRcdGJpYXMgPSBpbml0aWFsQmlhcztcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHNcblx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgMHg4MCkge1xuXHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoY3VycmVudFZhbHVlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aGFuZGxlZENQQ291bnQgPSBiYXNpY0xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG5cblx0XHQvLyBgaGFuZGxlZENQQ291bnRgIGlzIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgdGhhdCBoYXZlIGJlZW4gaGFuZGxlZDtcblx0XHQvLyBgYmFzaWNMZW5ndGhgIGlzIHRoZSBudW1iZXIgb2YgYmFzaWMgY29kZSBwb2ludHMuXG5cblx0XHQvLyBGaW5pc2ggdGhlIGJhc2ljIHN0cmluZyAtIGlmIGl0IGlzIG5vdCBlbXB0eSAtIHdpdGggYSBkZWxpbWl0ZXJcblx0XHRpZiAoYmFzaWNMZW5ndGgpIHtcblx0XHRcdG91dHB1dC5wdXNoKGRlbGltaXRlcik7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBlbmNvZGluZyBsb29wOlxuXHRcdHdoaWxlIChoYW5kbGVkQ1BDb3VudCA8IGlucHV0TGVuZ3RoKSB7XG5cblx0XHRcdC8vIEFsbCBub24tYmFzaWMgY29kZSBwb2ludHMgPCBuIGhhdmUgYmVlbiBoYW5kbGVkIGFscmVhZHkuIEZpbmQgdGhlIG5leHRcblx0XHRcdC8vIGxhcmdlciBvbmU6XG5cdFx0XHRmb3IgKG0gPSBtYXhJbnQsIGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA+PSBuICYmIGN1cnJlbnRWYWx1ZSA8IG0pIHtcblx0XHRcdFx0XHRtID0gY3VycmVudFZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluY3JlYXNlIGBkZWx0YWAgZW5vdWdoIHRvIGFkdmFuY2UgdGhlIGRlY29kZXIncyA8bixpPiBzdGF0ZSB0byA8bSwwPixcblx0XHRcdC8vIGJ1dCBndWFyZCBhZ2FpbnN0IG92ZXJmbG93XG5cdFx0XHRoYW5kbGVkQ1BDb3VudFBsdXNPbmUgPSBoYW5kbGVkQ1BDb3VudCArIDE7XG5cdFx0XHRpZiAobSAtIG4gPiBmbG9vcigobWF4SW50IC0gZGVsdGEpIC8gaGFuZGxlZENQQ291bnRQbHVzT25lKSkge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0ZGVsdGEgKz0gKG0gLSBuKSAqIGhhbmRsZWRDUENvdW50UGx1c09uZTtcblx0XHRcdG4gPSBtO1xuXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgbiAmJiArK2RlbHRhID4gbWF4SW50KSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID09IG4pIHtcblx0XHRcdFx0XHQvLyBSZXByZXNlbnQgZGVsdGEgYXMgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlclxuXHRcdFx0XHRcdGZvciAocSA9IGRlbHRhLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblx0XHRcdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXHRcdFx0XHRcdFx0aWYgKHEgPCB0KSB7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cU1pbnVzVCA9IHEgLSB0O1xuXHRcdFx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRcdFx0b3V0cHV0LnB1c2goXG5cdFx0XHRcdFx0XHRcdHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWModCArIHFNaW51c1QgJSBiYXNlTWludXNULCAwKSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRxID0gZmxvb3IocU1pbnVzVCAvIGJhc2VNaW51c1QpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWMocSwgMCkpKTtcblx0XHRcdFx0XHRiaWFzID0gYWRhcHQoZGVsdGEsIGhhbmRsZWRDUENvdW50UGx1c09uZSwgaGFuZGxlZENQQ291bnQgPT0gYmFzaWNMZW5ndGgpO1xuXHRcdFx0XHRcdGRlbHRhID0gMDtcblx0XHRcdFx0XHQrK2hhbmRsZWRDUENvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdCsrZGVsdGE7XG5cdFx0XHQrK247XG5cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dC5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzXG5cdCAqIHRvIFVuaWNvZGUuIE9ubHkgdGhlIFB1bnljb2RlZCBwYXJ0cyBvZiB0aGUgaW5wdXQgd2lsbCBiZSBjb252ZXJ0ZWQsIGkuZS5cblx0ICogaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgb24gYSBzdHJpbmcgdGhhdCBoYXMgYWxyZWFkeSBiZWVuXG5cdCAqIGNvbnZlcnRlZCB0byBVbmljb2RlLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZWQgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBjb252ZXJ0IHRvIFVuaWNvZGUuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBVbmljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBQdW55Y29kZVxuXHQgKiBzdHJpbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b1VuaWNvZGUoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleFB1bnljb2RlLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/IGRlY29kZShzdHJpbmcuc2xpY2UoNCkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBVbmljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIFB1bnljb2RlLiBPbmx5IHRoZSBub24tQVNDSUkgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLFxuXHQgKiBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCdzIGFscmVhZHkgaW5cblx0ICogQVNDSUkuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG8gY29udmVydCwgYXMgYVxuXHQgKiBVbmljb2RlIHN0cmluZy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFB1bnljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkb21haW4gbmFtZSBvclxuXHQgKiBlbWFpbCBhZGRyZXNzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9BU0NJSShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4Tm9uQVNDSUkudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gJ3huLS0nICsgZW5jb2RlKHN0cmluZylcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKiogRGVmaW5lIHRoZSBwdWJsaWMgQVBJICovXG5cdHB1bnljb2RlID0ge1xuXHRcdC8qKlxuXHRcdCAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBQdW55Y29kZS5qcyB2ZXJzaW9uIG51bWJlci5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKi9cblx0XHQndmVyc2lvbic6ICcxLjQuMScsXG5cdFx0LyoqXG5cdFx0ICogQW4gb2JqZWN0IG9mIG1ldGhvZHMgdG8gY29udmVydCBmcm9tIEphdmFTY3JpcHQncyBpbnRlcm5hbCBjaGFyYWN0ZXJcblx0XHQgKiByZXByZXNlbnRhdGlvbiAoVUNTLTIpIHRvIFVuaWNvZGUgY29kZSBwb2ludHMsIGFuZCBiYWNrLlxuXHRcdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIE9iamVjdFxuXHRcdCAqL1xuXHRcdCd1Y3MyJzoge1xuXHRcdFx0J2RlY29kZSc6IHVjczJkZWNvZGUsXG5cdFx0XHQnZW5jb2RlJzogdWNzMmVuY29kZVxuXHRcdH0sXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCd0b0FTQ0lJJzogdG9BU0NJSSxcblx0XHQndG9Vbmljb2RlJzogdG9Vbmljb2RlXG5cdH07XG5cblx0LyoqIEV4cG9zZSBgcHVueWNvZGVgICovXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKCdwdW55Y29kZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHB1bnljb2RlO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUpIHtcblx0XHRpZiAobW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMpIHtcblx0XHRcdC8vIGluIE5vZGUuanMsIGlvLmpzLCBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IHB1bnljb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yIChrZXkgaW4gcHVueWNvZGUpIHtcblx0XHRcdFx0cHVueWNvZGUuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IHB1bnljb2RlW2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5wdW55Y29kZSA9IHB1bnljb2RlO1xuXHR9XG5cbn0odGhpcykpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gSWYgb2JqLmhhc093blByb3BlcnR5IGhhcyBiZWVuIG92ZXJyaWRkZW4sIHRoZW4gY2FsbGluZ1xuLy8gb2JqLmhhc093blByb3BlcnR5KHByb3ApIHdpbGwgYnJlYWsuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvMTcwN1xuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxcywgc2VwLCBlcSwgb3B0aW9ucykge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgdmFyIG9iaiA9IHt9O1xuXG4gIGlmICh0eXBlb2YgcXMgIT09ICdzdHJpbmcnIHx8IHFzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgcmVnZXhwID0gL1xcKy9nO1xuICBxcyA9IHFzLnNwbGl0KHNlcCk7XG5cbiAgdmFyIG1heEtleXMgPSAxMDAwO1xuICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5tYXhLZXlzID09PSAnbnVtYmVyJykge1xuICAgIG1heEtleXMgPSBvcHRpb25zLm1heEtleXM7XG4gIH1cblxuICB2YXIgbGVuID0gcXMubGVuZ3RoO1xuICAvLyBtYXhLZXlzIDw9IDAgbWVhbnMgdGhhdCB3ZSBzaG91bGQgbm90IGxpbWl0IGtleXMgY291bnRcbiAgaWYgKG1heEtleXMgPiAwICYmIGxlbiA+IG1heEtleXMpIHtcbiAgICBsZW4gPSBtYXhLZXlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciB4ID0gcXNbaV0ucmVwbGFjZShyZWdleHAsICclMjAnKSxcbiAgICAgICAgaWR4ID0geC5pbmRleE9mKGVxKSxcbiAgICAgICAga3N0ciwgdnN0ciwgaywgdjtcblxuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAga3N0ciA9IHguc3Vic3RyKDAsIGlkeCk7XG4gICAgICB2c3RyID0geC5zdWJzdHIoaWR4ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtzdHIgPSB4O1xuICAgICAgdnN0ciA9ICcnO1xuICAgIH1cblxuICAgIGsgPSBkZWNvZGVVUklDb21wb25lbnQoa3N0cik7XG4gICAgdiA9IGRlY29kZVVSSUNvbXBvbmVudCh2c3RyKTtcblxuICAgIGlmICghaGFzT3duUHJvcGVydHkob2JqLCBrKSkge1xuICAgICAgb2JqW2tdID0gdjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgb2JqW2tdLnB1c2godik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ialtrXSA9IFtvYmpba10sIHZdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlQcmltaXRpdmUgPSBmdW5jdGlvbih2KSB7XG4gIHN3aXRjaCAodHlwZW9mIHYpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHY7XG5cbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB2ID8gJ3RydWUnIDogJ2ZhbHNlJztcblxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNGaW5pdGUodikgPyB2IDogJyc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgc2VwLCBlcSwgbmFtZSkge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtYXAob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbihrKSB7XG4gICAgICB2YXIga3MgPSBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKGspKSArIGVxO1xuICAgICAgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgICByZXR1cm4gbWFwKG9ialtrXSwgZnVuY3Rpb24odikge1xuICAgICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUodikpO1xuICAgICAgICB9KS5qb2luKHNlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9ialtrXSkpO1xuICAgICAgfVxuICAgIH0pLmpvaW4oc2VwKTtcblxuICB9XG5cbiAgaWYgKCFuYW1lKSByZXR1cm4gJyc7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG5hbWUpKSArIGVxICtcbiAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqKSk7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGYpO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICByZXMucHVzaChmKHhzW2ldLCBpKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmRlY29kZSA9IGV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuZXhwb3J0cy5lbmNvZGUgPSBleHBvcnRzLnN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vZW5jb2RlJyk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHVueWNvZGUgPSByZXF1aXJlKCdwdW55Y29kZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZXhwb3J0cy5wYXJzZSA9IHVybFBhcnNlO1xuZXhwb3J0cy5yZXNvbHZlID0gdXJsUmVzb2x2ZTtcbmV4cG9ydHMucmVzb2x2ZU9iamVjdCA9IHVybFJlc29sdmVPYmplY3Q7XG5leHBvcnRzLmZvcm1hdCA9IHVybEZvcm1hdDtcblxuZXhwb3J0cy5VcmwgPSBVcmw7XG5cbmZ1bmN0aW9uIFVybCgpIHtcbiAgdGhpcy5wcm90b2NvbCA9IG51bGw7XG4gIHRoaXMuc2xhc2hlcyA9IG51bGw7XG4gIHRoaXMuYXV0aCA9IG51bGw7XG4gIHRoaXMuaG9zdCA9IG51bGw7XG4gIHRoaXMucG9ydCA9IG51bGw7XG4gIHRoaXMuaG9zdG5hbWUgPSBudWxsO1xuICB0aGlzLmhhc2ggPSBudWxsO1xuICB0aGlzLnNlYXJjaCA9IG51bGw7XG4gIHRoaXMucXVlcnkgPSBudWxsO1xuICB0aGlzLnBhdGhuYW1lID0gbnVsbDtcbiAgdGhpcy5wYXRoID0gbnVsbDtcbiAgdGhpcy5ocmVmID0gbnVsbDtcbn1cblxuLy8gUmVmZXJlbmNlOiBSRkMgMzk4NiwgUkZDIDE4MDgsIFJGQyAyMzk2XG5cbi8vIGRlZmluZSB0aGVzZSBoZXJlIHNvIGF0IGxlYXN0IHRoZXkgb25seSBoYXZlIHRvIGJlXG4vLyBjb21waWxlZCBvbmNlIG9uIHRoZSBmaXJzdCBtb2R1bGUgbG9hZC5cbnZhciBwcm90b2NvbFBhdHRlcm4gPSAvXihbYS16MC05ListXSs6KS9pLFxuICAgIHBvcnRQYXR0ZXJuID0gLzpbMC05XSokLyxcblxuICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgYSBzaW1wbGUgcGF0aCBVUkxcbiAgICBzaW1wbGVQYXRoUGF0dGVybiA9IC9eKFxcL1xcLz8oPyFcXC8pW15cXD9cXHNdKikoXFw/W15cXHNdKik/JC8sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyByZXNlcnZlZCBmb3IgZGVsaW1pdGluZyBVUkxzLlxuICAgIC8vIFdlIGFjdHVhbGx5IGp1c3QgYXV0by1lc2NhcGUgdGhlc2UuXG4gICAgZGVsaW1zID0gWyc8JywgJz4nLCAnXCInLCAnYCcsICcgJywgJ1xccicsICdcXG4nLCAnXFx0J10sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyBub3QgYWxsb3dlZCBmb3IgdmFyaW91cyByZWFzb25zLlxuICAgIHVud2lzZSA9IFsneycsICd9JywgJ3wnLCAnXFxcXCcsICdeJywgJ2AnXS5jb25jYXQoZGVsaW1zKSxcblxuICAgIC8vIEFsbG93ZWQgYnkgUkZDcywgYnV0IGNhdXNlIG9mIFhTUyBhdHRhY2tzLiAgQWx3YXlzIGVzY2FwZSB0aGVzZS5cbiAgICBhdXRvRXNjYXBlID0gWydcXCcnXS5jb25jYXQodW53aXNlKSxcbiAgICAvLyBDaGFyYWN0ZXJzIHRoYXQgYXJlIG5ldmVyIGV2ZXIgYWxsb3dlZCBpbiBhIGhvc3RuYW1lLlxuICAgIC8vIE5vdGUgdGhhdCBhbnkgaW52YWxpZCBjaGFycyBhcmUgYWxzbyBoYW5kbGVkLCBidXQgdGhlc2VcbiAgICAvLyBhcmUgdGhlIG9uZXMgdGhhdCBhcmUgKmV4cGVjdGVkKiB0byBiZSBzZWVuLCBzbyB3ZSBmYXN0LXBhdGhcbiAgICAvLyB0aGVtLlxuICAgIG5vbkhvc3RDaGFycyA9IFsnJScsICcvJywgJz8nLCAnOycsICcjJ10uY29uY2F0KGF1dG9Fc2NhcGUpLFxuICAgIGhvc3RFbmRpbmdDaGFycyA9IFsnLycsICc/JywgJyMnXSxcbiAgICBob3N0bmFtZU1heExlbiA9IDI1NSxcbiAgICBob3N0bmFtZVBhcnRQYXR0ZXJuID0gL15bK2EtejAtOUEtWl8tXXswLDYzfSQvLFxuICAgIGhvc3RuYW1lUGFydFN0YXJ0ID0gL14oWythLXowLTlBLVpfLV17MCw2M30pKC4qKSQvLFxuICAgIC8vIHByb3RvY29scyB0aGF0IGNhbiBhbGxvdyBcInVuc2FmZVwiIGFuZCBcInVud2lzZVwiIGNoYXJzLlxuICAgIHVuc2FmZVByb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgbmV2ZXIgaGF2ZSBhIGhvc3RuYW1lLlxuICAgIGhvc3RsZXNzUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBhbHdheXMgY29udGFpbiBhIC8vIGJpdC5cbiAgICBzbGFzaGVkUHJvdG9jb2wgPSB7XG4gICAgICAnaHR0cCc6IHRydWUsXG4gICAgICAnaHR0cHMnOiB0cnVlLFxuICAgICAgJ2Z0cCc6IHRydWUsXG4gICAgICAnZ29waGVyJzogdHJ1ZSxcbiAgICAgICdmaWxlJzogdHJ1ZSxcbiAgICAgICdodHRwOic6IHRydWUsXG4gICAgICAnaHR0cHM6JzogdHJ1ZSxcbiAgICAgICdmdHA6JzogdHJ1ZSxcbiAgICAgICdnb3BoZXI6JzogdHJ1ZSxcbiAgICAgICdmaWxlOic6IHRydWVcbiAgICB9LFxuICAgIHF1ZXJ5c3RyaW5nID0gcmVxdWlyZSgncXVlcnlzdHJpbmcnKTtcblxuZnVuY3Rpb24gdXJsUGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAodXJsICYmIHV0aWwuaXNPYmplY3QodXJsKSAmJiB1cmwgaW5zdGFuY2VvZiBVcmwpIHJldHVybiB1cmw7XG5cbiAgdmFyIHUgPSBuZXcgVXJsO1xuICB1LnBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpO1xuICByZXR1cm4gdTtcbn1cblxuVXJsLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKCF1dGlsLmlzU3RyaW5nKHVybCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUGFyYW1ldGVyICd1cmwnIG11c3QgYmUgYSBzdHJpbmcsIG5vdCBcIiArIHR5cGVvZiB1cmwpO1xuICB9XG5cbiAgLy8gQ29weSBjaHJvbWUsIElFLCBvcGVyYSBiYWNrc2xhc2gtaGFuZGxpbmcgYmVoYXZpb3IuXG4gIC8vIEJhY2sgc2xhc2hlcyBiZWZvcmUgdGhlIHF1ZXJ5IHN0cmluZyBnZXQgY29udmVydGVkIHRvIGZvcndhcmQgc2xhc2hlc1xuICAvLyBTZWU6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0yNTkxNlxuICB2YXIgcXVlcnlJbmRleCA9IHVybC5pbmRleE9mKCc/JyksXG4gICAgICBzcGxpdHRlciA9XG4gICAgICAgICAgKHF1ZXJ5SW5kZXggIT09IC0xICYmIHF1ZXJ5SW5kZXggPCB1cmwuaW5kZXhPZignIycpKSA/ICc/JyA6ICcjJyxcbiAgICAgIHVTcGxpdCA9IHVybC5zcGxpdChzcGxpdHRlciksXG4gICAgICBzbGFzaFJlZ2V4ID0gL1xcXFwvZztcbiAgdVNwbGl0WzBdID0gdVNwbGl0WzBdLnJlcGxhY2Uoc2xhc2hSZWdleCwgJy8nKTtcbiAgdXJsID0gdVNwbGl0LmpvaW4oc3BsaXR0ZXIpO1xuXG4gIHZhciByZXN0ID0gdXJsO1xuXG4gIC8vIHRyaW0gYmVmb3JlIHByb2NlZWRpbmcuXG4gIC8vIFRoaXMgaXMgdG8gc3VwcG9ydCBwYXJzZSBzdHVmZiBsaWtlIFwiICBodHRwOi8vZm9vLmNvbSAgXFxuXCJcbiAgcmVzdCA9IHJlc3QudHJpbSgpO1xuXG4gIGlmICghc2xhc2hlc0Rlbm90ZUhvc3QgJiYgdXJsLnNwbGl0KCcjJykubGVuZ3RoID09PSAxKSB7XG4gICAgLy8gVHJ5IGZhc3QgcGF0aCByZWdleHBcbiAgICB2YXIgc2ltcGxlUGF0aCA9IHNpbXBsZVBhdGhQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gICAgaWYgKHNpbXBsZVBhdGgpIHtcbiAgICAgIHRoaXMucGF0aCA9IHJlc3Q7XG4gICAgICB0aGlzLmhyZWYgPSByZXN0O1xuICAgICAgdGhpcy5wYXRobmFtZSA9IHNpbXBsZVBhdGhbMV07XG4gICAgICBpZiAoc2ltcGxlUGF0aFsyXSkge1xuICAgICAgICB0aGlzLnNlYXJjaCA9IHNpbXBsZVBhdGhbMl07XG4gICAgICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMuc2VhcmNoLnN1YnN0cigxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHRoaXMuc2VhcmNoLnN1YnN0cigxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfVxuXG4gIHZhciBwcm90byA9IHByb3RvY29sUGF0dGVybi5leGVjKHJlc3QpO1xuICBpZiAocHJvdG8pIHtcbiAgICBwcm90byA9IHByb3RvWzBdO1xuICAgIHZhciBsb3dlclByb3RvID0gcHJvdG8udG9Mb3dlckNhc2UoKTtcbiAgICB0aGlzLnByb3RvY29sID0gbG93ZXJQcm90bztcbiAgICByZXN0ID0gcmVzdC5zdWJzdHIocHJvdG8ubGVuZ3RoKTtcbiAgfVxuXG4gIC8vIGZpZ3VyZSBvdXQgaWYgaXQncyBnb3QgYSBob3N0XG4gIC8vIHVzZXJAc2VydmVyIGlzICphbHdheXMqIGludGVycHJldGVkIGFzIGEgaG9zdG5hbWUsIGFuZCB1cmxcbiAgLy8gcmVzb2x1dGlvbiB3aWxsIHRyZWF0IC8vZm9vL2JhciBhcyBob3N0PWZvbyxwYXRoPWJhciBiZWNhdXNlIHRoYXQnc1xuICAvLyBob3cgdGhlIGJyb3dzZXIgcmVzb2x2ZXMgcmVsYXRpdmUgVVJMcy5cbiAgaWYgKHNsYXNoZXNEZW5vdGVIb3N0IHx8IHByb3RvIHx8IHJlc3QubWF0Y2goL15cXC9cXC9bXkBcXC9dK0BbXkBcXC9dKy8pKSB7XG4gICAgdmFyIHNsYXNoZXMgPSByZXN0LnN1YnN0cigwLCAyKSA9PT0gJy8vJztcbiAgICBpZiAoc2xhc2hlcyAmJiAhKHByb3RvICYmIGhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dKSkge1xuICAgICAgcmVzdCA9IHJlc3Quc3Vic3RyKDIpO1xuICAgICAgdGhpcy5zbGFzaGVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dICYmXG4gICAgICAoc2xhc2hlcyB8fCAocHJvdG8gJiYgIXNsYXNoZWRQcm90b2NvbFtwcm90b10pKSkge1xuXG4gICAgLy8gdGhlcmUncyBhIGhvc3RuYW1lLlxuICAgIC8vIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiAvLCA/LCA7LCBvciAjIGVuZHMgdGhlIGhvc3QuXG4gICAgLy9cbiAgICAvLyBJZiB0aGVyZSBpcyBhbiBAIGluIHRoZSBob3N0bmFtZSwgdGhlbiBub24taG9zdCBjaGFycyAqYXJlKiBhbGxvd2VkXG4gICAgLy8gdG8gdGhlIGxlZnQgb2YgdGhlIGxhc3QgQCBzaWduLCB1bmxlc3Mgc29tZSBob3N0LWVuZGluZyBjaGFyYWN0ZXJcbiAgICAvLyBjb21lcyAqYmVmb3JlKiB0aGUgQC1zaWduLlxuICAgIC8vIFVSTHMgYXJlIG9ibm94aW91cy5cbiAgICAvL1xuICAgIC8vIGV4OlxuICAgIC8vIGh0dHA6Ly9hQGJAYy8gPT4gdXNlcjphQGIgaG9zdDpjXG4gICAgLy8gaHR0cDovL2FAYj9AYyA9PiB1c2VyOmEgaG9zdDpjIHBhdGg6Lz9AY1xuXG4gICAgLy8gdjAuMTIgVE9ETyhpc2FhY3MpOiBUaGlzIGlzIG5vdCBxdWl0ZSBob3cgQ2hyb21lIGRvZXMgdGhpbmdzLlxuICAgIC8vIFJldmlldyBvdXIgdGVzdCBjYXNlIGFnYWluc3QgYnJvd3NlcnMgbW9yZSBjb21wcmVoZW5zaXZlbHkuXG5cbiAgICAvLyBmaW5kIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBhbnkgaG9zdEVuZGluZ0NoYXJzXG4gICAgdmFyIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvc3RFbmRpbmdDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihob3N0RW5kaW5nQ2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cblxuICAgIC8vIGF0IHRoaXMgcG9pbnQsIGVpdGhlciB3ZSBoYXZlIGFuIGV4cGxpY2l0IHBvaW50IHdoZXJlIHRoZVxuICAgIC8vIGF1dGggcG9ydGlvbiBjYW5ub3QgZ28gcGFzdCwgb3IgdGhlIGxhc3QgQCBjaGFyIGlzIHRoZSBkZWNpZGVyLlxuICAgIHZhciBhdXRoLCBhdFNpZ247XG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKSB7XG4gICAgICAvLyBhdFNpZ24gY2FuIGJlIGFueXdoZXJlLlxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhdFNpZ24gbXVzdCBiZSBpbiBhdXRoIHBvcnRpb24uXG4gICAgICAvLyBodHRwOi8vYUBiL2NAZCA9PiBob3N0OmIgYXV0aDphIHBhdGg6L2NAZFxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcsIGhvc3RFbmQpO1xuICAgIH1cblxuICAgIC8vIE5vdyB3ZSBoYXZlIGEgcG9ydGlvbiB3aGljaCBpcyBkZWZpbml0ZWx5IHRoZSBhdXRoLlxuICAgIC8vIFB1bGwgdGhhdCBvZmYuXG4gICAgaWYgKGF0U2lnbiAhPT0gLTEpIHtcbiAgICAgIGF1dGggPSByZXN0LnNsaWNlKDAsIGF0U2lnbik7XG4gICAgICByZXN0ID0gcmVzdC5zbGljZShhdFNpZ24gKyAxKTtcbiAgICAgIHRoaXMuYXV0aCA9IGRlY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICB9XG5cbiAgICAvLyB0aGUgaG9zdCBpcyB0aGUgcmVtYWluaW5nIHRvIHRoZSBsZWZ0IG9mIHRoZSBmaXJzdCBub24taG9zdCBjaGFyXG4gICAgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9uSG9zdENoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKG5vbkhvc3RDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuICAgIC8vIGlmIHdlIHN0aWxsIGhhdmUgbm90IGhpdCBpdCwgdGhlbiB0aGUgZW50aXJlIHRoaW5nIGlzIGEgaG9zdC5cbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpXG4gICAgICBob3N0RW5kID0gcmVzdC5sZW5ndGg7XG5cbiAgICB0aGlzLmhvc3QgPSByZXN0LnNsaWNlKDAsIGhvc3RFbmQpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKGhvc3RFbmQpO1xuXG4gICAgLy8gcHVsbCBvdXQgcG9ydC5cbiAgICB0aGlzLnBhcnNlSG9zdCgpO1xuXG4gICAgLy8gd2UndmUgaW5kaWNhdGVkIHRoYXQgdGhlcmUgaXMgYSBob3N0bmFtZSxcbiAgICAvLyBzbyBldmVuIGlmIGl0J3MgZW1wdHksIGl0IGhhcyB0byBiZSBwcmVzZW50LlxuICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuXG4gICAgLy8gaWYgaG9zdG5hbWUgYmVnaW5zIHdpdGggWyBhbmQgZW5kcyB3aXRoIF1cbiAgICAvLyBhc3N1bWUgdGhhdCBpdCdzIGFuIElQdjYgYWRkcmVzcy5cbiAgICB2YXIgaXB2Nkhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZVswXSA9PT0gJ1snICYmXG4gICAgICAgIHRoaXMuaG9zdG5hbWVbdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAxXSA9PT0gJ10nO1xuXG4gICAgLy8gdmFsaWRhdGUgYSBsaXR0bGUuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHZhciBob3N0cGFydHMgPSB0aGlzLmhvc3RuYW1lLnNwbGl0KC9cXC4vKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gaG9zdHBhcnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgcGFydCA9IGhvc3RwYXJ0c1tpXTtcbiAgICAgICAgaWYgKCFwYXJ0KSBjb250aW51ZTtcbiAgICAgICAgaWYgKCFwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgdmFyIG5ld3BhcnQgPSAnJztcbiAgICAgICAgICBmb3IgKHZhciBqID0gMCwgayA9IHBhcnQubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICBpZiAocGFydC5jaGFyQ29kZUF0KGopID4gMTI3KSB7XG4gICAgICAgICAgICAgIC8vIHdlIHJlcGxhY2Ugbm9uLUFTQ0lJIGNoYXIgd2l0aCBhIHRlbXBvcmFyeSBwbGFjZWhvbGRlclxuICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRoaXMgdG8gbWFrZSBzdXJlIHNpemUgb2YgaG9zdG5hbWUgaXMgbm90XG4gICAgICAgICAgICAgIC8vIGJyb2tlbiBieSByZXBsYWNpbmcgbm9uLUFTQ0lJIGJ5IG5vdGhpbmdcbiAgICAgICAgICAgICAgbmV3cGFydCArPSAneCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9IHBhcnRbal07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHdlIHRlc3QgYWdhaW4gd2l0aCBBU0NJSSBjaGFyIG9ubHlcbiAgICAgICAgICBpZiAoIW5ld3BhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICAgIHZhciB2YWxpZFBhcnRzID0gaG9zdHBhcnRzLnNsaWNlKDAsIGkpO1xuICAgICAgICAgICAgdmFyIG5vdEhvc3QgPSBob3N0cGFydHMuc2xpY2UoaSArIDEpO1xuICAgICAgICAgICAgdmFyIGJpdCA9IHBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0U3RhcnQpO1xuICAgICAgICAgICAgaWYgKGJpdCkge1xuICAgICAgICAgICAgICB2YWxpZFBhcnRzLnB1c2goYml0WzFdKTtcbiAgICAgICAgICAgICAgbm90SG9zdC51bnNoaWZ0KGJpdFsyXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90SG9zdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcmVzdCA9ICcvJyArIG5vdEhvc3Quam9pbignLicpICsgcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaG9zdG5hbWUgPSB2YWxpZFBhcnRzLmpvaW4oJy4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmhvc3RuYW1lLmxlbmd0aCA+IGhvc3RuYW1lTWF4TGVuKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGhvc3RuYW1lcyBhcmUgYWx3YXlzIGxvd2VyIGNhc2UuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cblxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICAvLyBJRE5BIFN1cHBvcnQ6IFJldHVybnMgYSBwdW55Y29kZWQgcmVwcmVzZW50YXRpb24gb2YgXCJkb21haW5cIi5cbiAgICAgIC8vIEl0IG9ubHkgY29udmVydHMgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHRoYXRcbiAgICAgIC8vIGhhdmUgbm9uLUFTQ0lJIGNoYXJhY3RlcnMsIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWZcbiAgICAgIC8vIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCBhbHJlYWR5IGlzIEFTQ0lJLW9ubHkuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gcHVueWNvZGUudG9BU0NJSSh0aGlzLmhvc3RuYW1lKTtcbiAgICB9XG5cbiAgICB2YXIgcCA9IHRoaXMucG9ydCA/ICc6JyArIHRoaXMucG9ydCA6ICcnO1xuICAgIHZhciBoID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcbiAgICB0aGlzLmhvc3QgPSBoICsgcDtcbiAgICB0aGlzLmhyZWYgKz0gdGhpcy5ob3N0O1xuXG4gICAgLy8gc3RyaXAgWyBhbmQgXSBmcm9tIHRoZSBob3N0bmFtZVxuICAgIC8vIHRoZSBob3N0IGZpZWxkIHN0aWxsIHJldGFpbnMgdGhlbSwgdGhvdWdoXG4gICAgaWYgKGlwdjZIb3N0bmFtZSkge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUuc3Vic3RyKDEsIHRoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBpZiAocmVzdFswXSAhPT0gJy8nKSB7XG4gICAgICAgIHJlc3QgPSAnLycgKyByZXN0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIG5vdyByZXN0IGlzIHNldCB0byB0aGUgcG9zdC1ob3N0IHN0dWZmLlxuICAvLyBjaG9wIG9mZiBhbnkgZGVsaW0gY2hhcnMuXG4gIGlmICghdW5zYWZlUHJvdG9jb2xbbG93ZXJQcm90b10pIHtcblxuICAgIC8vIEZpcnN0LCBtYWtlIDEwMCUgc3VyZSB0aGF0IGFueSBcImF1dG9Fc2NhcGVcIiBjaGFycyBnZXRcbiAgICAvLyBlc2NhcGVkLCBldmVuIGlmIGVuY29kZVVSSUNvbXBvbmVudCBkb2Vzbid0IHRoaW5rIHRoZXlcbiAgICAvLyBuZWVkIHRvIGJlLlxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXV0b0VzY2FwZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBhZSA9IGF1dG9Fc2NhcGVbaV07XG4gICAgICBpZiAocmVzdC5pbmRleE9mKGFlKSA9PT0gLTEpXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgdmFyIGVzYyA9IGVuY29kZVVSSUNvbXBvbmVudChhZSk7XG4gICAgICBpZiAoZXNjID09PSBhZSkge1xuICAgICAgICBlc2MgPSBlc2NhcGUoYWUpO1xuICAgICAgfVxuICAgICAgcmVzdCA9IHJlc3Quc3BsaXQoYWUpLmpvaW4oZXNjKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIGNob3Agb2ZmIGZyb20gdGhlIHRhaWwgZmlyc3QuXG4gIHZhciBoYXNoID0gcmVzdC5pbmRleE9mKCcjJyk7XG4gIGlmIChoYXNoICE9PSAtMSkge1xuICAgIC8vIGdvdCBhIGZyYWdtZW50IHN0cmluZy5cbiAgICB0aGlzLmhhc2ggPSByZXN0LnN1YnN0cihoYXNoKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBoYXNoKTtcbiAgfVxuICB2YXIgcW0gPSByZXN0LmluZGV4T2YoJz8nKTtcbiAgaWYgKHFtICE9PSAtMSkge1xuICAgIHRoaXMuc2VhcmNoID0gcmVzdC5zdWJzdHIocW0pO1xuICAgIHRoaXMucXVlcnkgPSByZXN0LnN1YnN0cihxbSArIDEpO1xuICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlzdHJpbmcucGFyc2UodGhpcy5xdWVyeSk7XG4gICAgfVxuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIHFtKTtcbiAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgLy8gbm8gcXVlcnkgc3RyaW5nLCBidXQgcGFyc2VRdWVyeVN0cmluZyBzdGlsbCByZXF1ZXN0ZWRcbiAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgfVxuICBpZiAocmVzdCkgdGhpcy5wYXRobmFtZSA9IHJlc3Q7XG4gIGlmIChzbGFzaGVkUHJvdG9jb2xbbG93ZXJQcm90b10gJiZcbiAgICAgIHRoaXMuaG9zdG5hbWUgJiYgIXRoaXMucGF0aG5hbWUpIHtcbiAgICB0aGlzLnBhdGhuYW1lID0gJy8nO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICBpZiAodGhpcy5wYXRobmFtZSB8fCB0aGlzLnNlYXJjaCkge1xuICAgIHZhciBwID0gdGhpcy5wYXRobmFtZSB8fCAnJztcbiAgICB2YXIgcyA9IHRoaXMuc2VhcmNoIHx8ICcnO1xuICAgIHRoaXMucGF0aCA9IHAgKyBzO1xuICB9XG5cbiAgLy8gZmluYWxseSwgcmVjb25zdHJ1Y3QgdGhlIGhyZWYgYmFzZWQgb24gd2hhdCBoYXMgYmVlbiB2YWxpZGF0ZWQuXG4gIHRoaXMuaHJlZiA9IHRoaXMuZm9ybWF0KCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZm9ybWF0IGEgcGFyc2VkIG9iamVjdCBpbnRvIGEgdXJsIHN0cmluZ1xuZnVuY3Rpb24gdXJsRm9ybWF0KG9iaikge1xuICAvLyBlbnN1cmUgaXQncyBhbiBvYmplY3QsIGFuZCBub3QgYSBzdHJpbmcgdXJsLlxuICAvLyBJZiBpdCdzIGFuIG9iaiwgdGhpcyBpcyBhIG5vLW9wLlxuICAvLyB0aGlzIHdheSwgeW91IGNhbiBjYWxsIHVybF9mb3JtYXQoKSBvbiBzdHJpbmdzXG4gIC8vIHRvIGNsZWFuIHVwIHBvdGVudGlhbGx5IHdvbmt5IHVybHMuXG4gIGlmICh1dGlsLmlzU3RyaW5nKG9iaikpIG9iaiA9IHVybFBhcnNlKG9iaik7XG4gIGlmICghKG9iaiBpbnN0YW5jZW9mIFVybCkpIHJldHVybiBVcmwucHJvdG90eXBlLmZvcm1hdC5jYWxsKG9iaik7XG4gIHJldHVybiBvYmouZm9ybWF0KCk7XG59XG5cblVybC5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhdXRoID0gdGhpcy5hdXRoIHx8ICcnO1xuICBpZiAoYXV0aCkge1xuICAgIGF1dGggPSBlbmNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgYXV0aCA9IGF1dGgucmVwbGFjZSgvJTNBL2ksICc6Jyk7XG4gICAgYXV0aCArPSAnQCc7XG4gIH1cblxuICB2YXIgcHJvdG9jb2wgPSB0aGlzLnByb3RvY29sIHx8ICcnLFxuICAgICAgcGF0aG5hbWUgPSB0aGlzLnBhdGhuYW1lIHx8ICcnLFxuICAgICAgaGFzaCA9IHRoaXMuaGFzaCB8fCAnJyxcbiAgICAgIGhvc3QgPSBmYWxzZSxcbiAgICAgIHF1ZXJ5ID0gJyc7XG5cbiAgaWYgKHRoaXMuaG9zdCkge1xuICAgIGhvc3QgPSBhdXRoICsgdGhpcy5ob3N0O1xuICB9IGVsc2UgaWYgKHRoaXMuaG9zdG5hbWUpIHtcbiAgICBob3N0ID0gYXV0aCArICh0aGlzLmhvc3RuYW1lLmluZGV4T2YoJzonKSA9PT0gLTEgP1xuICAgICAgICB0aGlzLmhvc3RuYW1lIDpcbiAgICAgICAgJ1snICsgdGhpcy5ob3N0bmFtZSArICddJyk7XG4gICAgaWYgKHRoaXMucG9ydCkge1xuICAgICAgaG9zdCArPSAnOicgKyB0aGlzLnBvcnQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMucXVlcnkgJiZcbiAgICAgIHV0aWwuaXNPYmplY3QodGhpcy5xdWVyeSkgJiZcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMucXVlcnkpLmxlbmd0aCkge1xuICAgIHF1ZXJ5ID0gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KHRoaXMucXVlcnkpO1xuICB9XG5cbiAgdmFyIHNlYXJjaCA9IHRoaXMuc2VhcmNoIHx8IChxdWVyeSAmJiAoJz8nICsgcXVlcnkpKSB8fCAnJztcblxuICBpZiAocHJvdG9jb2wgJiYgcHJvdG9jb2wuc3Vic3RyKC0xKSAhPT0gJzonKSBwcm90b2NvbCArPSAnOic7XG5cbiAgLy8gb25seSB0aGUgc2xhc2hlZFByb3RvY29scyBnZXQgdGhlIC8vLiAgTm90IG1haWx0bzosIHhtcHA6LCBldGMuXG4gIC8vIHVubGVzcyB0aGV5IGhhZCB0aGVtIHRvIGJlZ2luIHdpdGguXG4gIGlmICh0aGlzLnNsYXNoZXMgfHxcbiAgICAgICghcHJvdG9jb2wgfHwgc2xhc2hlZFByb3RvY29sW3Byb3RvY29sXSkgJiYgaG9zdCAhPT0gZmFsc2UpIHtcbiAgICBob3N0ID0gJy8vJyArIChob3N0IHx8ICcnKTtcbiAgICBpZiAocGF0aG5hbWUgJiYgcGF0aG5hbWUuY2hhckF0KDApICE9PSAnLycpIHBhdGhuYW1lID0gJy8nICsgcGF0aG5hbWU7XG4gIH0gZWxzZSBpZiAoIWhvc3QpIHtcbiAgICBob3N0ID0gJyc7XG4gIH1cblxuICBpZiAoaGFzaCAmJiBoYXNoLmNoYXJBdCgwKSAhPT0gJyMnKSBoYXNoID0gJyMnICsgaGFzaDtcbiAgaWYgKHNlYXJjaCAmJiBzZWFyY2guY2hhckF0KDApICE9PSAnPycpIHNlYXJjaCA9ICc/JyArIHNlYXJjaDtcblxuICBwYXRobmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoL1s/I10vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KG1hdGNoKTtcbiAgfSk7XG4gIHNlYXJjaCA9IHNlYXJjaC5yZXBsYWNlKCcjJywgJyUyMycpO1xuXG4gIHJldHVybiBwcm90b2NvbCArIGhvc3QgKyBwYXRobmFtZSArIHNlYXJjaCArIGhhc2g7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlKHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmUocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICByZXR1cm4gdGhpcy5yZXNvbHZlT2JqZWN0KHVybFBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSkpLmZvcm1hdCgpO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZU9iamVjdChzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIGlmICghc291cmNlKSByZXR1cm4gcmVsYXRpdmU7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlT2JqZWN0KHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlT2JqZWN0ID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgaWYgKHV0aWwuaXNTdHJpbmcocmVsYXRpdmUpKSB7XG4gICAgdmFyIHJlbCA9IG5ldyBVcmwoKTtcbiAgICByZWwucGFyc2UocmVsYXRpdmUsIGZhbHNlLCB0cnVlKTtcbiAgICByZWxhdGl2ZSA9IHJlbDtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBuZXcgVXJsKCk7XG4gIHZhciB0a2V5cyA9IE9iamVjdC5rZXlzKHRoaXMpO1xuICBmb3IgKHZhciB0ayA9IDA7IHRrIDwgdGtleXMubGVuZ3RoOyB0aysrKSB7XG4gICAgdmFyIHRrZXkgPSB0a2V5c1t0a107XG4gICAgcmVzdWx0W3RrZXldID0gdGhpc1t0a2V5XTtcbiAgfVxuXG4gIC8vIGhhc2ggaXMgYWx3YXlzIG92ZXJyaWRkZW4sIG5vIG1hdHRlciB3aGF0LlxuICAvLyBldmVuIGhyZWY9XCJcIiB3aWxsIHJlbW92ZSBpdC5cbiAgcmVzdWx0Lmhhc2ggPSByZWxhdGl2ZS5oYXNoO1xuXG4gIC8vIGlmIHRoZSByZWxhdGl2ZSB1cmwgaXMgZW1wdHksIHRoZW4gdGhlcmUncyBub3RoaW5nIGxlZnQgdG8gZG8gaGVyZS5cbiAgaWYgKHJlbGF0aXZlLmhyZWYgPT09ICcnKSB7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGhyZWZzIGxpa2UgLy9mb28vYmFyIGFsd2F5cyBjdXQgdG8gdGhlIHByb3RvY29sLlxuICBpZiAocmVsYXRpdmUuc2xhc2hlcyAmJiAhcmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAvLyB0YWtlIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBwcm90b2NvbCBmcm9tIHJlbGF0aXZlXG4gICAgdmFyIHJrZXlzID0gT2JqZWN0LmtleXMocmVsYXRpdmUpO1xuICAgIGZvciAodmFyIHJrID0gMDsgcmsgPCBya2V5cy5sZW5ndGg7IHJrKyspIHtcbiAgICAgIHZhciBya2V5ID0gcmtleXNbcmtdO1xuICAgICAgaWYgKHJrZXkgIT09ICdwcm90b2NvbCcpXG4gICAgICAgIHJlc3VsdFtya2V5XSA9IHJlbGF0aXZlW3JrZXldO1xuICAgIH1cblxuICAgIC8vdXJsUGFyc2UgYXBwZW5kcyB0cmFpbGluZyAvIHRvIHVybHMgbGlrZSBodHRwOi8vd3d3LmV4YW1wbGUuY29tXG4gICAgaWYgKHNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdICYmXG4gICAgICAgIHJlc3VsdC5ob3N0bmFtZSAmJiAhcmVzdWx0LnBhdGhuYW1lKSB7XG4gICAgICByZXN1bHQucGF0aCA9IHJlc3VsdC5wYXRobmFtZSA9ICcvJztcbiAgICB9XG5cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKHJlbGF0aXZlLnByb3RvY29sICYmIHJlbGF0aXZlLnByb3RvY29sICE9PSByZXN1bHQucHJvdG9jb2wpIHtcbiAgICAvLyBpZiBpdCdzIGEga25vd24gdXJsIHByb3RvY29sLCB0aGVuIGNoYW5naW5nXG4gICAgLy8gdGhlIHByb3RvY29sIGRvZXMgd2VpcmQgdGhpbmdzXG4gICAgLy8gZmlyc3QsIGlmIGl0J3Mgbm90IGZpbGU6LCB0aGVuIHdlIE1VU1QgaGF2ZSBhIGhvc3QsXG4gICAgLy8gYW5kIGlmIHRoZXJlIHdhcyBhIHBhdGhcbiAgICAvLyB0byBiZWdpbiB3aXRoLCB0aGVuIHdlIE1VU1QgaGF2ZSBhIHBhdGguXG4gICAgLy8gaWYgaXQgaXMgZmlsZTosIHRoZW4gdGhlIGhvc3QgaXMgZHJvcHBlZCxcbiAgICAvLyBiZWNhdXNlIHRoYXQncyBrbm93biB0byBiZSBob3N0bGVzcy5cbiAgICAvLyBhbnl0aGluZyBlbHNlIGlzIGFzc3VtZWQgdG8gYmUgYWJzb2x1dGUuXG4gICAgaWYgKCFzbGFzaGVkUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICAgIGZvciAodmFyIHYgPSAwOyB2IDwga2V5cy5sZW5ndGg7IHYrKykge1xuICAgICAgICB2YXIgayA9IGtleXNbdl07XG4gICAgICAgIHJlc3VsdFtrXSA9IHJlbGF0aXZlW2tdO1xuICAgICAgfVxuICAgICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJlc3VsdC5wcm90b2NvbCA9IHJlbGF0aXZlLnByb3RvY29sO1xuICAgIGlmICghcmVsYXRpdmUuaG9zdCAmJiAhaG9zdGxlc3NQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciByZWxQYXRoID0gKHJlbGF0aXZlLnBhdGhuYW1lIHx8ICcnKS5zcGxpdCgnLycpO1xuICAgICAgd2hpbGUgKHJlbFBhdGgubGVuZ3RoICYmICEocmVsYXRpdmUuaG9zdCA9IHJlbFBhdGguc2hpZnQoKSkpO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0KSByZWxhdGl2ZS5ob3N0ID0gJyc7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3RuYW1lKSByZWxhdGl2ZS5ob3N0bmFtZSA9ICcnO1xuICAgICAgaWYgKHJlbFBhdGhbMF0gIT09ICcnKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgaWYgKHJlbFBhdGgubGVuZ3RoIDwgMikgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbFBhdGguam9pbignLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxhdGl2ZS5wYXRobmFtZTtcbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICByZXN1bHQuaG9zdCA9IHJlbGF0aXZlLmhvc3QgfHwgJyc7XG4gICAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoO1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3Q7XG4gICAgcmVzdWx0LnBvcnQgPSByZWxhdGl2ZS5wb3J0O1xuICAgIC8vIHRvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5wYXRobmFtZSB8fCByZXN1bHQuc2VhcmNoKSB7XG4gICAgICB2YXIgcCA9IHJlc3VsdC5wYXRobmFtZSB8fCAnJztcbiAgICAgIHZhciBzID0gcmVzdWx0LnNlYXJjaCB8fCAnJztcbiAgICAgIHJlc3VsdC5wYXRoID0gcCArIHM7XG4gICAgfVxuICAgIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmFyIGlzU291cmNlQWJzID0gKHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpLFxuICAgICAgaXNSZWxBYnMgPSAoXG4gICAgICAgICAgcmVsYXRpdmUuaG9zdCB8fFxuICAgICAgICAgIHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nXG4gICAgICApLFxuICAgICAgbXVzdEVuZEFicyA9IChpc1JlbEFicyB8fCBpc1NvdXJjZUFicyB8fFxuICAgICAgICAgICAgICAgICAgICAocmVzdWx0Lmhvc3QgJiYgcmVsYXRpdmUucGF0aG5hbWUpKSxcbiAgICAgIHJlbW92ZUFsbERvdHMgPSBtdXN0RW5kQWJzLFxuICAgICAgc3JjUGF0aCA9IHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHJlbFBhdGggPSByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcHN5Y2hvdGljID0gcmVzdWx0LnByb3RvY29sICYmICFzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXTtcblxuICAvLyBpZiB0aGUgdXJsIGlzIGEgbm9uLXNsYXNoZWQgdXJsLCB0aGVuIHJlbGF0aXZlXG4gIC8vIGxpbmtzIGxpa2UgLi4vLi4gc2hvdWxkIGJlIGFibGVcbiAgLy8gdG8gY3Jhd2wgdXAgdG8gdGhlIGhvc3RuYW1lLCBhcyB3ZWxsLiAgVGhpcyBpcyBzdHJhbmdlLlxuICAvLyByZXN1bHQucHJvdG9jb2wgaGFzIGFscmVhZHkgYmVlbiBzZXQgYnkgbm93LlxuICAvLyBMYXRlciBvbiwgcHV0IHRoZSBmaXJzdCBwYXRoIHBhcnQgaW50byB0aGUgaG9zdCBmaWVsZC5cbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9ICcnO1xuICAgIHJlc3VsdC5wb3J0ID0gbnVsbDtcbiAgICBpZiAocmVzdWx0Lmhvc3QpIHtcbiAgICAgIGlmIChzcmNQYXRoWzBdID09PSAnJykgc3JjUGF0aFswXSA9IHJlc3VsdC5ob3N0O1xuICAgICAgZWxzZSBzcmNQYXRoLnVuc2hpZnQocmVzdWx0Lmhvc3QpO1xuICAgIH1cbiAgICByZXN1bHQuaG9zdCA9ICcnO1xuICAgIGlmIChyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgPSBudWxsO1xuICAgICAgcmVsYXRpdmUucG9ydCA9IG51bGw7XG4gICAgICBpZiAocmVsYXRpdmUuaG9zdCkge1xuICAgICAgICBpZiAocmVsUGF0aFswXSA9PT0gJycpIHJlbFBhdGhbMF0gPSByZWxhdGl2ZS5ob3N0O1xuICAgICAgICBlbHNlIHJlbFBhdGgudW5zaGlmdChyZWxhdGl2ZS5ob3N0KTtcbiAgICAgIH1cbiAgICAgIHJlbGF0aXZlLmhvc3QgPSBudWxsO1xuICAgIH1cbiAgICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyAmJiAocmVsUGF0aFswXSA9PT0gJycgfHwgc3JjUGF0aFswXSA9PT0gJycpO1xuICB9XG5cbiAgaWYgKGlzUmVsQWJzKSB7XG4gICAgLy8gaXQncyBhYnNvbHV0ZS5cbiAgICByZXN1bHQuaG9zdCA9IChyZWxhdGl2ZS5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0IDogcmVzdWx0Lmhvc3Q7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gKHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3RuYW1lID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3RuYW1lIDogcmVzdWx0Lmhvc3RuYW1lO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgc3JjUGF0aCA9IHJlbFBhdGg7XG4gICAgLy8gZmFsbCB0aHJvdWdoIHRvIHRoZSBkb3QtaGFuZGxpbmcgYmVsb3cuXG4gIH0gZWxzZSBpZiAocmVsUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBpdCdzIHJlbGF0aXZlXG4gICAgLy8gdGhyb3cgYXdheSB0aGUgZXhpc3RpbmcgZmlsZSwgYW5kIHRha2UgdGhlIG5ldyBwYXRoIGluc3RlYWQuXG4gICAgaWYgKCFzcmNQYXRoKSBzcmNQYXRoID0gW107XG4gICAgc3JjUGF0aC5wb3AoKTtcbiAgICBzcmNQYXRoID0gc3JjUGF0aC5jb25jYXQocmVsUGF0aCk7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgfSBlbHNlIGlmICghdXRpbC5pc051bGxPclVuZGVmaW5lZChyZWxhdGl2ZS5zZWFyY2gpKSB7XG4gICAgLy8ganVzdCBwdWxsIG91dCB0aGUgc2VhcmNoLlxuICAgIC8vIGxpa2UgaHJlZj0nP2ZvbycuXG4gICAgLy8gUHV0IHRoaXMgYWZ0ZXIgdGhlIG90aGVyIHR3byBjYXNlcyBiZWNhdXNlIGl0IHNpbXBsaWZpZXMgdGhlIGJvb2xlYW5zXG4gICAgaWYgKHBzeWNob3RpYykge1xuICAgICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBzcmNQYXRoLnNoaWZ0KCk7XG4gICAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgICAvL3RoaXMgZXNwZWNpYWxseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmICghdXRpbC5pc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhdXRpbC5pc051bGwocmVzdWx0LnNlYXJjaCkpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBubyBwYXRoIGF0IGFsbC4gIGVhc3kuXG4gICAgLy8gd2UndmUgYWxyZWFkeSBoYW5kbGVkIHRoZSBvdGhlciBzdHVmZiBhYm92ZS5cbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnNlYXJjaCkge1xuICAgICAgcmVzdWx0LnBhdGggPSAnLycgKyByZXN1bHQuc2VhcmNoO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBpZiBhIHVybCBFTkRzIGluIC4gb3IgLi4sIHRoZW4gaXQgbXVzdCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgLy8gaG93ZXZlciwgaWYgaXQgZW5kcyBpbiBhbnl0aGluZyBlbHNlIG5vbi1zbGFzaHksXG4gIC8vIHRoZW4gaXQgbXVzdCBOT1QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIHZhciBsYXN0ID0gc3JjUGF0aC5zbGljZSgtMSlbMF07XG4gIHZhciBoYXNUcmFpbGluZ1NsYXNoID0gKFxuICAgICAgKHJlc3VsdC5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgfHwgc3JjUGF0aC5sZW5ndGggPiAxKSAmJlxuICAgICAgKGxhc3QgPT09ICcuJyB8fCBsYXN0ID09PSAnLi4nKSB8fCBsYXN0ID09PSAnJyk7XG5cbiAgLy8gc3RyaXAgc2luZ2xlIGRvdHMsIHJlc29sdmUgZG91YmxlIGRvdHMgdG8gcGFyZW50IGRpclxuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gc3JjUGF0aC5sZW5ndGg7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGFzdCA9IHNyY1BhdGhbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKCFtdXN0RW5kQWJzICYmICFyZW1vdmVBbGxEb3RzKSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBzcmNQYXRoLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgc3JjUGF0aFswXSAhPT0gJycgJiZcbiAgICAgICghc3JjUGF0aFswXSB8fCBzcmNQYXRoWzBdLmNoYXJBdCgwKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoaGFzVHJhaWxpbmdTbGFzaCAmJiAoc3JjUGF0aC5qb2luKCcvJykuc3Vic3RyKC0xKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgucHVzaCgnJyk7XG4gIH1cblxuICB2YXIgaXNBYnNvbHV0ZSA9IHNyY1BhdGhbMF0gPT09ICcnIHx8XG4gICAgICAoc3JjUGF0aFswXSAmJiBzcmNQYXRoWzBdLmNoYXJBdCgwKSA9PT0gJy8nKTtcblxuICAvLyBwdXQgdGhlIGhvc3QgYmFja1xuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBpc0Fic29sdXRlID8gJycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjUGF0aC5sZW5ndGggPyBzcmNQYXRoLnNoaWZ0KCkgOiAnJztcbiAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzIHx8IChyZXN1bHQuaG9zdCAmJiBzcmNQYXRoLmxlbmd0aCk7XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IHNyY1BhdGguam9pbignLycpO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IHJlcXVlc3QuaHR0cFxuICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgfVxuICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGggfHwgcmVzdWx0LmF1dGg7XG4gIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5VcmwucHJvdG90eXBlLnBhcnNlSG9zdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaG9zdCA9IHRoaXMuaG9zdDtcbiAgdmFyIHBvcnQgPSBwb3J0UGF0dGVybi5leGVjKGhvc3QpO1xuICBpZiAocG9ydCkge1xuICAgIHBvcnQgPSBwb3J0WzBdO1xuICAgIGlmIChwb3J0ICE9PSAnOicpIHtcbiAgICAgIHRoaXMucG9ydCA9IHBvcnQuc3Vic3RyKDEpO1xuICAgIH1cbiAgICBob3N0ID0gaG9zdC5zdWJzdHIoMCwgaG9zdC5sZW5ndGggLSBwb3J0Lmxlbmd0aCk7XG4gIH1cbiAgaWYgKGhvc3QpIHRoaXMuaG9zdG5hbWUgPSBob3N0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzU3RyaW5nOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gdHlwZW9mKGFyZykgPT09ICdzdHJpbmcnO1xuICB9LFxuICBpc09iamVjdDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbiAgfSxcbiAgaXNOdWxsT3JVbmRlZmluZWQ6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT0gbnVsbDtcbiAgfVxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgQ0JPUiA9IHJlcXVpcmUoJ2JvcmMnKTtcbmNvbnN0IGtub3duU2VjdGlvbnMgPSBbXG4gICAgJ2NyaXRpY2FsJyxcbiAgICAnaW5kZXgnLFxuICAgICdtYW5pZmVzdCcsXG4gICAgJ3Jlc3BvbnNlcycsXG4gICAgJ3NpZ25hdHVyZXMnLFxuXTtcbi8qKiBUaGlzIGNsYXNzIHJlcHJlc2VudHMgcGFyc2VkIFdlYiBCdW5kbGUuICovXG5jbGFzcyBCdW5kbGUge1xuICAgIGNvbnN0cnVjdG9yKGJ1ZmZlcikge1xuICAgICAgICB0aGlzLnNlY3Rpb25zID0ge307XG4gICAgICAgIHRoaXMucmVzcG9uc2VzID0ge307IC8vIE9mZnNldC1pbi1yZXNwb25zZXMgLT4gcmVzcFxuICAgICAgICBjb25zdCB3Ym4gPSBhc0FycmF5KENCT1IuZGVjb2RlKGJ1ZmZlcikpO1xuICAgICAgICBpZiAod2JuLmxlbmd0aCAhPT0gNikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyB0b3BsZXZlbCBzdHJ1Y3R1cmUnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbbWFnaWMsIHZlcnNpb24sIHByaW1hcnlVUkwsIHNlY3Rpb25MZW5ndGhzQ0JPUiwgc2VjdGlvbnMsIGxlbmd0aCxdID0gd2JuO1xuICAgICAgICBpZiAoYnl0ZXN0cmluZ1RvU3RyaW5nKG1hZ2ljKSAhPT0gJ/CfjJDwn5OmJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyBtYWdpYycpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmVyc2lvbiA9IGJ5dGVzdHJpbmdUb1N0cmluZyh2ZXJzaW9uKS5yZXBsYWNlKC9cXDArJC8sICcnKTsgLy8gU3RyaXAgb2ZmIHRoZSAnXFwwJyBwYWRkaW5ncy5cbiAgICAgICAgdGhpcy5wcmltYXJ5VVJMID0gYXNTdHJpbmcocHJpbWFyeVVSTCk7XG4gICAgICAgIGNvbnN0IHNlY3Rpb25MZW5ndGhzID0gYXNBcnJheShDQk9SLmRlY29kZShhc0J5dGVzdHJpbmcoc2VjdGlvbkxlbmd0aHNDQk9SKSkpO1xuICAgICAgICBjb25zdCBzZWN0aW9uc0FycmF5ID0gYXNBcnJheShzZWN0aW9ucyk7XG4gICAgICAgIGlmIChzZWN0aW9uTGVuZ3Rocy5sZW5ndGggIT09IHNlY3Rpb25zQXJyYXkubGVuZ3RoICogMikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTnVtYmVyIG9mIGVsZW1lbnRzIGluIHNlY3Rpb24tbGVuZ3RocyBhbmQgaW4gc2VjdGlvbnMgZG9uJ3QgbWF0Y2hcIik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWN0aW9uc0FycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnNlY3Rpb25zW2FzU3RyaW5nKHNlY3Rpb25MZW5ndGhzW2kgKiAyXSldID0gc2VjdGlvbnNBcnJheVtpXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zZWN0aW9uc1snY3JpdGljYWwnXSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGFzQXJyYXkodGhpcy5zZWN0aW9uc1snY3JpdGljYWwnXSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWtub3duU2VjdGlvbnMuaW5jbHVkZXMoYXNTdHJpbmcobmFtZSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdW5rbm93biBzZWN0aW9uICR7bmFtZX0gaXMgbWFya2VkIGFzIGNyaXRpY2FsYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRoZSBpbmRleCBzZWN0aW9uIHJlY29yZHMgKG9mZnNldCwgbGVuZ3RoKSBvZiBlYWNoIHJlc3BvbnNlLCBidXQgb3VyXG4gICAgICAgIC8vIENCT1IgZGVjb2RlciBkb2Vzbid0IHByZXNlcnZlIGxvY2F0aW9uIGluZm9ybWF0aW9uLiBTbywgcmVjYWxjdWxhdGVcbiAgICAgICAgLy8gb2Zmc2V0IGFuZCBsZW5ndGggb2YgZWFjaCByZXNwb25zZSBoZXJlLiBUaGlzIGlzIGluZWZmaWNpZW50LCBidXQgd29ya3MuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlcyA9IGFzQXJyYXkodGhpcy5zZWN0aW9uc1sncmVzcG9uc2VzJ10pO1xuICAgICAgICBsZXQgb2Zmc2V0SW5SZXNwb25zZXMgPSBlbmNvZGVkTGVuZ3RoKHJlc3BvbnNlcy5sZW5ndGgpO1xuICAgICAgICBmb3IgKGNvbnN0IHJlc3Agb2YgcmVzcG9uc2VzKSB7XG4gICAgICAgICAgICB0aGlzLnJlc3BvbnNlc1tvZmZzZXRJblJlc3BvbnNlc10gPSBuZXcgUmVzcG9uc2UoYXNBcnJheShyZXNwKSk7XG4gICAgICAgICAgICBvZmZzZXRJblJlc3BvbnNlcyArPSBlbmNvZGVkTGVuZ3RoKHJlc3ApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBtYW5pZmVzdFVSTCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VjdGlvbnNbJ21hbmlmZXN0J10pIHtcbiAgICAgICAgICAgIHJldHVybiBhc1N0cmluZyh0aGlzLnNlY3Rpb25zWydtYW5pZmVzdCddKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0IHVybHMoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmluZGV4U2VjdGlvbik7XG4gICAgfVxuICAgIGdldFJlc3BvbnNlKHVybCkge1xuICAgICAgICBjb25zdCBpbmRleEVudHJ5ID0gYXNBcnJheSh0aGlzLmluZGV4U2VjdGlvblt1cmxdKTtcbiAgICAgICAgaWYgKCFpbmRleEVudHJ5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGVudHJ5IGZvciAnICsgdXJsKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbdmFyaWFudHMsIG9mZnNldCwgbGVuZ3RoXSA9IGluZGV4RW50cnk7XG4gICAgICAgIGlmIChhc0J5dGVzdHJpbmcodmFyaWFudHMpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdWYXJpYW50cyBhcmUgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleEVudHJ5Lmxlbmd0aCAhPT0gMykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGxlbmd0aCBvZiBpbmRleCBlbnRyeSBmb3IgJyArIHVybCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzcCA9IHRoaXMucmVzcG9uc2VzW2FzTnVtYmVyKG9mZnNldCldO1xuICAgICAgICBpZiAoIXJlc3ApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVzcG9uc2UgZm9yICR7dXJsfSBpcyBub3QgZm91bmQgKGJyb2tlbiBpbmRleClgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcDtcbiAgICB9XG4gICAgZ2V0IGluZGV4U2VjdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFzTWFwKHRoaXMuc2VjdGlvbnNbJ2luZGV4J10pO1xuICAgIH1cbn1cbmV4cG9ydHMuQnVuZGxlID0gQnVuZGxlO1xuLyoqIFRoaXMgY2xhc3MgcmVwcmVzZW50cyBhbiBIVFRQIHJlc291cmNlIGluIFdlYiBCdW5kbGUuICovXG5jbGFzcyBSZXNwb25zZSB7XG4gICAgY29uc3RydWN0b3IocmVzcG9uc2VzU2VjdGlvbkl0ZW0pIHtcbiAgICAgICAgaWYgKHJlc3BvbnNlc1NlY3Rpb25JdGVtLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyByZXNwb25zZSBzdHJ1Y3R1cmUnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHN0YXR1cywgaGVhZGVycyB9ID0gZGVjb2RlUmVzcG9uc2VNYXAoYXNCeXRlc3RyaW5nKHJlc3BvbnNlc1NlY3Rpb25JdGVtWzBdKSk7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBoZWFkZXJzO1xuICAgICAgICB0aGlzLmJvZHkgPSBhc0J5dGVzdHJpbmcocmVzcG9uc2VzU2VjdGlvbkl0ZW1bMV0pO1xuICAgIH1cbn1cbmV4cG9ydHMuUmVzcG9uc2UgPSBSZXNwb25zZTtcbmZ1bmN0aW9uIGVuY29kZWRMZW5ndGgodmFsdWUpIHtcbiAgICByZXR1cm4gQ0JPUi5lbmNvZGUodmFsdWUpLmJ5dGVMZW5ndGg7XG59XG5mdW5jdGlvbiBkZWNvZGVSZXNwb25zZU1hcChjYm9yKSB7XG4gICAgY29uc3QgZGVjb2RlZCA9IENCT1IuZGVjb2RlKGNib3IpO1xuICAgIGlmICghKGRlY29kZWQgaW5zdGFuY2VvZiBNYXApKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV3JvbmcgaGVhZGVyIG1hcCBzdHJ1Y3R1cmUnKTtcbiAgICB9XG4gICAgbGV0IHN0YXR1cyA9IG51bGw7XG4gICAgY29uc3QgaGVhZGVycyA9IHt9O1xuICAgIGZvciAobGV0IFtrZXksIHZhbF0gb2YgZGVjb2RlZC5lbnRyaWVzKCkpIHtcbiAgICAgICAga2V5ID0gYnl0ZXN0cmluZ1RvU3RyaW5nKGtleSk7XG4gICAgICAgIHZhbCA9IGJ5dGVzdHJpbmdUb1N0cmluZyh2YWwpO1xuICAgICAgICBpZiAoa2V5ID09PSAnOnN0YXR1cycpIHtcbiAgICAgICAgICAgIHN0YXR1cyA9IE51bWJlcih2YWwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGtleS5zdGFydHNXaXRoKCc6JykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwc3VlZG8gaGVhZGVyICcgKyBrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaGVhZGVyc1trZXldID0gdmFsO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghc3RhdHVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gOnN0YXR1cyBpbiByZXNwb25zZSBoZWFkZXIgbWFwJyk7XG4gICAgfVxuICAgIHJldHVybiB7IHN0YXR1cywgaGVhZGVycyB9O1xufVxuLy8gVHlwZSBhc3NlcnRpb25zIGFuZCBjb252ZXJzaW9ucyBmb3IgQ0JPUi1kZWNvZGVkIG9iamVjdHMuXG5mdW5jdGlvbiBhc0FycmF5KHgpIHtcbiAgICBpZiAoeCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0FycmF5IGV4cGVjdGVkLCBidXQgZ290ICcgKyB0eXBlb2YgeCk7XG59XG5mdW5jdGlvbiBhc01hcCh4KSB7XG4gICAgaWYgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsICYmICEoeCBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNYXAgZXhwZWN0ZWQsIGJ1dCBnb3QgJyArIHR5cGVvZiB4KTtcbn1cbmZ1bmN0aW9uIGFzTnVtYmVyKHgpIHtcbiAgICBpZiAodHlwZW9mIHggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ051bWJlciBleHBlY3RlZCwgYnV0IGdvdCAnICsgdHlwZW9mIHgpO1xufVxuZnVuY3Rpb24gYXNTdHJpbmcoeCkge1xuICAgIGlmICh0eXBlb2YgeCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIGV4cGVjdGVkLCBidXQgZ290ICcgKyB0eXBlb2YgeCk7XG59XG5mdW5jdGlvbiBhc0J5dGVzdHJpbmcoeCkge1xuICAgIGlmICh4IGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J5dGVzdHJpbmcgZXhwZWN0ZWQsIGJ1dCBnb3QgJyArIHR5cGVvZiB4KTtcbn1cbmZ1bmN0aW9uIGJ5dGVzdHJpbmdUb1N0cmluZyhic3RyKSB7XG4gICAgaWYgKCEoYnN0ciBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCeXRlc3RyaW5nIGV4cGVjdGVkJyk7XG4gICAgfVxuICAgIHJldHVybiBic3RyLnRvU3RyaW5nKCd1dGYtOCcpO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBDQk9SID0gcmVxdWlyZSgnYm9yYycpO1xuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5jb25zdCBtaW1lID0gcmVxdWlyZShcIm1pbWVcIik7XG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCB1cmxfMSA9IHJlcXVpcmUoXCJ1cmxcIik7XG5jbGFzcyBCdW5kbGVCdWlsZGVyIHtcbiAgICBjb25zdHJ1Y3RvcihwcmltYXJ5VVJMKSB7XG4gICAgICAgIHRoaXMucHJpbWFyeVVSTCA9IHByaW1hcnlVUkw7XG4gICAgICAgIHRoaXMuc2VjdGlvbkxlbmd0aHMgPSBbXTtcbiAgICAgICAgdGhpcy5zZWN0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLnJlc3BvbnNlcyA9IFtdO1xuICAgICAgICB0aGlzLmluZGV4ID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmN1cnJlbnRSZXNwb25zZXNPZmZzZXQgPSAwO1xuICAgICAgICB2YWxpZGF0ZUV4Y2hhbmdlVVJMKHByaW1hcnlVUkwpO1xuICAgIH1cbiAgICAvLyBUT0RPOiBQcm92aWRlIGFzeW5jIHZlcnNpb24gb2YgdGhpcy5cbiAgICBjcmVhdGVCdW5kbGUoKSB7XG4gICAgICAgIGlmICghdGhpcy5pbmRleC5oYXModGhpcy5wcmltYXJ5VVJMKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeGNoYW5nZSBmb3IgcHJpbWFyeSBVUkwgKCR7dGhpcy5wcmltYXJ5VVJMfSkgZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFkZFNlY3Rpb24oJ2luZGV4JywgdGhpcy5maXh1cEluZGV4KCkpO1xuICAgICAgICB0aGlzLmFkZFNlY3Rpb24oJ3Jlc3BvbnNlcycsIHRoaXMucmVzcG9uc2VzKTtcbiAgICAgICAgY29uc3QgZXN0aW1hdGVkQnVuZGxlU2l6ZSA9IHRoaXMuc2VjdGlvbkxlbmd0aHMucmVkdWNlKChzaXplLCBzKSA9PiBzaXplICsgcy5sZW5ndGgsIDE2Mzg0IC8vIEZvciBoZWFkZXJzIChpbmNsdWRpbmcgcHJpbWFyeSBVUkwpXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHdibiA9IGVuY29kZUNhbm9uaWNhbCh0aGlzLmNyZWF0ZVRvcExldmVsKCksIGVzdGltYXRlZEJ1bmRsZVNpemUpO1xuICAgICAgICAvLyBGaWxsIGluIHRoZSBsZW5ndGggZmllbGQuXG4gICAgICAgIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcod2JuLmJ1ZmZlciwgd2JuLmJ5dGVPZmZzZXQgKyB3Ym4ubGVuZ3RoIC0gOCk7XG4gICAgICAgIHZpZXcuc2V0VWludDMyKDAsIE1hdGguZmxvb3Iod2JuLmxlbmd0aCAvIDB4MTAwMDAwMDAwKSk7XG4gICAgICAgIHZpZXcuc2V0VWludDMyKDQsIHdibi5sZW5ndGggJiAweGZmZmZmZmZmKTtcbiAgICAgICAgcmV0dXJuIHdibjtcbiAgICB9XG4gICAgYWRkRXhjaGFuZ2UodXJsLCBzdGF0dXMsIGhlYWRlcnMsIHBheWxvYWQpIHtcbiAgICAgICAgdmFsaWRhdGVFeGNoYW5nZVVSTCh1cmwpO1xuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBwYXlsb2FkID0gYnl0ZVN0cmluZyhwYXlsb2FkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFkZEluZGV4RW50cnkodXJsLCB0aGlzLmFkZFJlc3BvbnNlKG5ldyBIZWFkZXJNYXAoc3RhdHVzLCBoZWFkZXJzKSwgcGF5bG9hZCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgYWRkRmlsZSh1cmwsIGZpbGUpIHtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiBtaW1lLmdldFR5cGUoZmlsZSkgfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbScsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkRXhjaGFuZ2UodXJsLCAyMDAsIGhlYWRlcnMsIGZzLnJlYWRGaWxlU3luYyhmaWxlKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBhZGRGaWxlc1JlY3Vyc2l2ZWx5KGJhc2VVUkwsIGRpcikge1xuICAgICAgICBpZiAoIWJhc2VVUkwuZW5kc1dpdGgoJy8nKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYmFzZVVSTCBtdXN0IGVuZCB3aXRoICcvJy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIpO1xuICAgICAgICBmaWxlcy5zb3J0KCk7IC8vIFNvcnQgZW50cmllcyBmb3IgcmVwcm9kdWNpYmlsaXR5LlxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGRpciwgZmlsZSk7XG4gICAgICAgICAgICBpZiAoZnMuc3RhdFN5bmMoZmlsZVBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEZpbGVzUmVjdXJzaXZlbHkoYmFzZVVSTCArIGZpbGUgKyAnLycsIGZpbGVQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGZpbGUgPT09ICdpbmRleC5odG1sJykge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBmaWxlIG5hbWUgaXMgJ2luZGV4Lmh0bWwnLCBjcmVhdGUgYW4gZW50cnkgZm9yIGJhc2VVUkwgaXRzZWxmXG4gICAgICAgICAgICAgICAgLy8gYW5kIGFub3RoZXIgZW50cnkgZm9yIGJhc2VVUkwvaW5kZXguaHRtbCB3aGljaCByZWRpcmVjdHMgdG8gYmFzZVVSTC5cbiAgICAgICAgICAgICAgICAvLyBUaGlzIG1hdGNoZXMgdGhlIGJlaGF2aW9yIG9mIGdlbi1idW5kbGUuXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRGaWxlKGJhc2VVUkwsIGZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEV4Y2hhbmdlKGJhc2VVUkwgKyBmaWxlLCAzMDEsIHsgTG9jYXRpb246ICcuLycgfSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRGaWxlKGJhc2VVUkwgKyBmaWxlLCBmaWxlUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHNldE1hbmlmZXN0VVJMKHVybCkge1xuICAgICAgICB2YWxpZGF0ZUV4Y2hhbmdlVVJMKHVybCk7XG4gICAgICAgIHRoaXMuYWRkU2VjdGlvbignbWFuaWZlc3QnLCB1cmwpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgYWRkU2VjdGlvbihuYW1lLCBjb250ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnNlY3Rpb25MZW5ndGhzLnNvbWUocyA9PiBzLm5hbWUgPT09IG5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0R1cGxpY2F0ZWQgc2VjdGlvbjogJyArIG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsZW5ndGg7XG4gICAgICAgIGlmIChuYW1lID09PSAncmVzcG9uc2VzJykge1xuICAgICAgICAgICAgLy8gVGhlIHJlc3BvbnNlcyBzZWN0aW9uIGNhbiBiZSBsYXJnZSwgc28gYXZvaWQgdXNpbmcgZW5jb2RlZExlbmd0aCgpXG4gICAgICAgICAgICAvLyB3aXRoIHRoZSBlbnRpcmUgc2VjdGlvbidzIGNvbnRlbnQuXG4gICAgICAgICAgICAvLyBIZXJlLCB0aGlzLmN1cnJlbnRSZXNwb25zZXNPZmZzZXQgaG9sZHMgdGhlIHN1bSBvZiBhbGwgcmVzcG9uc2VcbiAgICAgICAgICAgIC8vIGxlbmd0aHMuIEFkZGluZyBlbmNvZGVkTGVuZ3RoKHRoaXMucmVzcG9uc2VzLmxlbmd0aCkgdG8gdGhpcyBnaXZlc1xuICAgICAgICAgICAgLy8gdGhlIHNhbWUgcmVzdWx0IGFzIGVuY29kZWRMZW5ndGgoY29udGVudCkuXG4gICAgICAgICAgICBsZW5ndGggPVxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJlc3BvbnNlc09mZnNldCArIGVuY29kZWRMZW5ndGgodGhpcy5yZXNwb25zZXMubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IGVuY29kZWRMZW5ndGgoY29udGVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZWN0aW9uTGVuZ3Rocy5wdXNoKHsgbmFtZSwgbGVuZ3RoIH0pO1xuICAgICAgICB0aGlzLnNlY3Rpb25zLnB1c2goY29udGVudCk7XG4gICAgfVxuICAgIC8vIEFkZHMgYSByZXNwb25zZSB0byBgdGhpcy5yZXNwb25zZWAsIGFuZCByZXR1cm5zIGl0cyBsZW5ndGggaW4gdGhlXG4gICAgLy8gcmVzcG9uc2VzIHNlY3Rpb24uXG4gICAgYWRkUmVzcG9uc2UoaGVhZGVyTWFwLCBwYXlsb2FkKSB7XG4gICAgICAgIGlmIChwYXlsb2FkLmxlbmd0aCA+IDAgJiYgIWhlYWRlck1hcC5oYXMoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vbi1lbXB0eSBleGNoYW5nZSBtdXN0IGhhdmUgQ29udGVudC1UeXBlIGhlYWRlcicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gW25ldyBVaW50OEFycmF5KGVuY29kZUNhbm9uaWNhbChoZWFkZXJNYXApKSwgcGF5bG9hZF07XG4gICAgICAgIHRoaXMucmVzcG9uc2VzLnB1c2gocmVzcG9uc2UpO1xuICAgICAgICAvLyBUaGlzIHNob3VsZCBiZSB0aGUgc2FtZSBhcyBlbmNvZGVkTGVuZ3RoKHJlc3BvbnNlKS5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnJlZHVjZSgobGVuLCBidWYpID0+IGxlbiArIGVuY29kZWRMZW5ndGgoYnVmLmxlbmd0aCkgKyBidWYubGVuZ3RoLCAxKTtcbiAgICB9XG4gICAgYWRkSW5kZXhFbnRyeSh1cmwsIHJlc3BvbnNlTGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuaW5kZXguc2V0KHVybCwgW1xuICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoMCksXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRSZXNwb25zZXNPZmZzZXQsXG4gICAgICAgICAgICByZXNwb25zZUxlbmd0aCxcbiAgICAgICAgXSk7XG4gICAgICAgIHRoaXMuY3VycmVudFJlc3BvbnNlc09mZnNldCArPSByZXNwb25zZUxlbmd0aDtcbiAgICB9XG4gICAgZml4dXBJbmRleCgpIHtcbiAgICAgICAgLy8gQWRqdXN0IHRoZSBvZmZzZXRzIGJ5IHRoZSBsZW5ndGggb2YgdGhlIHJlc3BvbnNlIHNlY3Rpb24ncyBDQk9SIGhlYWRlci5cbiAgICAgICAgY29uc3QgcmVzcG9uc2VzSGVhZGVyU2l6ZSA9IGVuY29kZWRMZW5ndGgodGhpcy5yZXNwb25zZXMubGVuZ3RoKTtcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiB0aGlzLmluZGV4LnZhbHVlcygpKSB7XG4gICAgICAgICAgICB2YWx1ZVsxXSArPSByZXNwb25zZXNIZWFkZXJTaXplO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmluZGV4O1xuICAgIH1cbiAgICBjcmVhdGVUb3BMZXZlbCgpIHtcbiAgICAgICAgY29uc3Qgc2VjdGlvbkxlbmd0aHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzIG9mIHRoaXMuc2VjdGlvbkxlbmd0aHMpIHtcbiAgICAgICAgICAgIHNlY3Rpb25MZW5ndGhzLnB1c2gocy5uYW1lLCBzLmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGJ5dGVTdHJpbmcoJ/CfjJDwn5OmJyksXG4gICAgICAgICAgICBieXRlU3RyaW5nKCdiMVxcMFxcMCcpLFxuICAgICAgICAgICAgdGhpcy5wcmltYXJ5VVJMLFxuICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoZW5jb2RlQ2Fub25pY2FsKHNlY3Rpb25MZW5ndGhzKSksXG4gICAgICAgICAgICB0aGlzLnNlY3Rpb25zLFxuICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoOCksXG4gICAgICAgIF07XG4gICAgfVxufVxuZXhwb3J0cy5CdW5kbGVCdWlsZGVyID0gQnVuZGxlQnVpbGRlcjtcbmNsYXNzIEhlYWRlck1hcCBleHRlbmRzIE1hcCB7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBoZWFkZXJzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmIChzdGF0dXMgPCAxMDAgfHwgc3RhdHVzID4gOTk5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCgnOnN0YXR1cycsIHN0YXR1cy50b1N0cmluZygpKTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoaGVhZGVycykpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KGtleS50b0xvd2VyQ2FzZSgpLCBoZWFkZXJzW2tleV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFRoaXMgdGVsbHMgdGhlIENCT1IgbGlicmFyeSBob3cgdG8gc2VyaWFsaXplIHRoaXMgb2JqZWN0LlxuICAgIGVuY29kZUNCT1IoZW5jb2Rlcikge1xuICAgICAgICAvLyBDb252ZXJ0IGtleXMgYW5kIHZhbHVlcyB0byBVaW50OEFycmF5LCBhcyB0aGUgQ0JPUiByZXByZXNlbnRhdGlvbiBvZlxuICAgICAgICAvLyBoZWFkZXIgbWFwIGlzIHtieXRlc3RyaW5nID0+IGJ5dGVzdHJpbmd9LlxuICAgICAgICBjb25zdCBtID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgbS5zZXQoYnl0ZVN0cmluZyhrZXkpLCBieXRlU3RyaW5nKHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVuY29kZXIucHVzaEFueShtKTtcbiAgICB9XG59XG4vLyBUaHJvd3MgYW4gZXJyb3IgaWYgYHVybFN0cmluZ2AgaXMgbm90IGEgdmFsaWQgZXhjaGFuZ2UgVVJMLCBpLmUuIGl0IG11c3Q6XG4vLyAtIGJlIGFic29sdXRlLCBhbmRcbi8vIC0gaGF2ZSBubyBjcmVkZW50aWFscyAodXNlcjpwYXNzd29yZEApIG9yIGhhc2ggKCNmcmFnbWVudCkuXG5mdW5jdGlvbiB2YWxpZGF0ZUV4Y2hhbmdlVVJMKHVybFN0cmluZykge1xuICAgIGNvbnN0IHVybCA9IG5ldyB1cmxfMS5VUkwodXJsU3RyaW5nKTsgLy8gVGhpcyB0aHJvd3MgaWYgdXJsU3RyaW5nIGlzIG5vdCBhbiBhYnNvbHV0ZSBVUkwuXG4gICAgaWYgKHVybC51c2VybmFtZSAhPT0gJycgfHwgdXJsLnBhc3N3b3JkICE9PSAnJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4Y2hhbmdlIFVSTCBtdXN0IG5vdCBoYXZlIGNyZWRlbnRpYWxzOiAnICsgdXJsU3RyaW5nKTtcbiAgICB9XG4gICAgaWYgKHVybC5oYXNoICE9PSAnJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4Y2hhbmdlIFVSTCBtdXN0IG5vdCBoYXZlIGEgaGFzaDogJyArIHVybFN0cmluZyk7XG4gICAgfVxufVxuLy8gRW5jb2RlcyBgdmFsdWVgIGluIGNhbm9uaWNhbCBDQk9SLiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIHJlc3VsdCBpcyBsYXJnZXJcbi8vIHRoYW4gYGJ1ZmZlclNpemVgLCBiZWNhdXNlIHRoZSBDQk9SIGVuY29kZXIgc2lsZW50bHkgaWdub3JlcyB3cml0ZSBlcnJvcnNcbi8vIHRvIGl0cyBpbnRlcm5hbCBzdHJlYW0gYW5kIHJldHVybnMgYnJva2VuIGRhdGEuXG5mdW5jdGlvbiBlbmNvZGVDYW5vbmljYWwodmFsdWUsIGJ1ZmZlclNpemUgPSAxMDI0ICogMTAyNCkge1xuICAgIGNvbnN0IGJ1ZiA9IENCT1IuZW5jb2RlT25lKHZhbHVlLCB7XG4gICAgICAgIGNhbm9uaWNhbDogdHJ1ZSxcbiAgICAgICAgaGlnaFdhdGVyTWFyazogYnVmZmVyU2l6ZSxcbiAgICB9KTtcbiAgICBpZiAoYnVmLmxlbmd0aCA+PSBidWZmZXJTaXplKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ0JPUiBlbmNvZGUgZXJyb3I6IGluc3VmZmljaWVudCBidWZmZXIgc2l6ZScpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmO1xufVxuLy8gUmV0dXJucyB0aGUgbGVuZ3RoIG9mIGB2YWx1ZWAgd2hlbiBDQk9SLWVuY29kZWQuXG5mdW5jdGlvbiBlbmNvZGVkTGVuZ3RoKHZhbHVlLCBidWZmZXJTaXplID0gMTAyNCAqIDEwMjQpIHtcbiAgICAvLyBXZSBkb24ndCBuZWVkIHRvIHVzZSBjYW5vbmljYWwgZW5jb2RpbmcgaGVyZS5cbiAgICBjb25zdCBsZW4gPSBDQk9SLmVuY29kZU9uZSh2YWx1ZSwgeyBoaWdoV2F0ZXJNYXJrOiBidWZmZXJTaXplIH0pLmJ5dGVMZW5ndGg7XG4gICAgaWYgKGxlbiA+PSBidWZmZXJTaXplKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ0JPUiBlbmNvZGUgZXJyb3I6IGluc3VmZmljaWVudCBidWZmZXIgc2l6ZScpO1xuICAgIH1cbiAgICByZXR1cm4gbGVuO1xufVxuZnVuY3Rpb24gYnl0ZVN0cmluZyhzKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHMsICd1dGYtOCcpO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgZGVjb2Rlcl8xID0gcmVxdWlyZShcIi4vZGVjb2RlclwiKTtcbmV4cG9ydHMuQnVuZGxlID0gZGVjb2Rlcl8xLkJ1bmRsZTtcbmV4cG9ydHMuUmVzcG9uc2UgPSBkZWNvZGVyXzEuUmVzcG9uc2U7XG52YXIgZW5jb2Rlcl8xID0gcmVxdWlyZShcIi4vZW5jb2RlclwiKTtcbmV4cG9ydHMuQnVuZGxlQnVpbGRlciA9IGVuY29kZXJfMS5CdW5kbGVCdWlsZGVyO1xuIiwiY29uc3Qgd2JuID0gcmVxdWlyZSgnd2JuJyk7XG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xuXG52YXIgQ0FDSEVfVkVSU0lPTiA9IDE7XG52YXIgQ0FDSEVfTkFNRSA9ICdidW5kbGUtcHJvdG90eXBlLWNhY2hlLXYnICsgQ0FDSEVfVkVSU0lPTjtcblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdpbnN0YWxsJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQud2FpdFVudGlsKHNlbGYuc2tpcFdhaXRpbmcoKSk7XG5cbiAgICBjb25zb2xlLmxvZygnSW5zdGFsbCBldmVudDogJywgZXZlbnQpO1xufSk7XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignYWN0aXZhdGUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygnQWN0aXZhdGUgZXZlbnQ6ICcsIGV2ZW50KTtcblxuICAgIGV2ZW50LndhaXRVbnRpbChzZWxmLnNraXBXYWl0aW5nKCkpO1xuXG4gICAgLy8gZGVsZXRlIG9sZCBjYWNoZXNcbiAgICBldmVudC53YWl0VW50aWwoXG4gICAgICAgIGNhY2hlcy5rZXlzKCkudGhlbihmdW5jdGlvbiAoY2FjaGVOYW1lcykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgICAgICAgICAgIGNhY2hlTmFtZXMubWFwKGZ1bmN0aW9uIChjYWNoZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlTmFtZSAhPT0gQ0FDSEVfTkFNRSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0RlbGV0aW5nIG91dCBvZiBkYXRlIGNhY2hlOicsIGNhY2hlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FjaGVzLmRlbGV0ZShjYWNoZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNsaWVudHMuY2xhaW0oKTtcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2VydmljZSB3b3JrZXIgYWN0aXZhdGVkLCBjbGllbnRzIGNsYWltZWQnKTtcblxuICAgICAgICAgICAgLy8gbm90aWZ5IHRoZSBjbGllbnRzXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5jbGllbnRzLm1hdGNoQWxsKCkudGhlbigoY2xpZW50cykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChjbGllbnRzLm1hcCgoY2xpZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbGllbnQucG9zdE1lc3NhZ2UoeyB0eXBlOiBcImFjdGl2YXRlZFwiIH0pO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICk7XG59KTtcblxuLy8gcmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBhcnJheSBjb250YWluaW5nIHRoZSByZXNvdXJjZXMgbm90IGFscmVhZHkgaW4gdGhlIGNhY2hlXG5hc3luYyBmdW5jdGlvbiBjb21wdXRlUmVzb3VyY2VzVG9QcmVsb2FkKHJlc291cmNlcywgY2FjaGUpIHtcbiAgICBjb25zb2xlLmxvZygnY29tcHV0aW5nIHRoZSBsaXN0IG9mIHJlc291cmNlcyB0byBwcmVsb2FkJyk7XG4gICAgaWYgKHJlc291cmNlcykge1xuICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcmVzb3VyY2Ugb2YgcmVzb3VyY2VzKSB7XG4gICAgICAgICAgICBsZXQgcmVzb3VyY2VQcm9taXNlID0gY2FjaGUubWF0Y2gocmVzb3VyY2UpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvdXJjZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb21pc2VzLnB1c2gocmVzb3VyY2VQcm9taXNlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKHZhbHVlcykgPT4gdmFsdWVzLmZpbHRlcihCb29sZWFuKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn1cblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ01lc3NhZ2UgZXZlbnQnLCBldmVudC5kYXRhKTtcblxuICAgIHN3aXRjaCAoZXZlbnQuZGF0YS5jb21tYW5kKSB7XG4gICAgICAgIGNhc2UgJ2J1bmRsZXByZWxvYWQnOlxuICAgICAgICAgICAgZXZlbnQud2FpdFVudGlsKFxuICAgICAgICAgICAgICAgIGNhY2hlcy5vcGVuKENBQ0hFX05BTUUpLnRoZW4oYXN5bmMgKGNhY2hlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB3YXNOb3RFbXB0eSA9IChldmVudC5kYXRhLnJlc291cmNlcyAmJiBldmVudC5kYXRhLnJlc291cmNlcy5sZW5ndGggPiAwKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc291cmNlcyA9IGF3YWl0IGNvbXB1dGVSZXNvdXJjZXNUb1ByZWxvYWQoZXZlbnQuZGF0YS5yZXNvdXJjZXMsIGNhY2hlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYHJlc291cmNlcyB0byBwcmVsb2FkOiAke3dhc05vdEVtcHR5ID8gcmVzb3VyY2VzIDogJ2FsbCd9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGhlYWRlcnMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdhc05vdEVtcHR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzb3VyY2VzICYmIHJlc291cmNlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snYnVuZGxlLXByZWxvYWQnXSA9IHJlc291cmNlcy5qb2luKCcgJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhbGwgdGhlIHJlc291cmNlcyB3ZXJlIGFscmVhZHkgaW4gY2FjaGUsIHdlIGFyZSBkb25lJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGVsc2Ugd2Ugd2lsbCBmZXRjaCB0aGUgd2hvbGUgYnVuZGxlXG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChldmVudC5kYXRhLnNvdXJjZSwgeyBoZWFkZXJzOiBuZXcgSGVhZGVycyhoZWFkZXJzKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChyZXF1ZXN0KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByb2Nlc3MgdGhlIGJ1bmRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ1ZiA9IGF3YWl0IHJlc3BvbnNlLmFycmF5QnVmZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gQnVmZmVyLmZyb20oYnVmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1bmRsZSA9IG5ldyB3Ym4uQnVuZGxlKGJ1ZmZlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdidW5kbGUgcmVjZWl2ZWQnLCBidW5kbGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcmVzb3VyY2Ugb2YgYnVuZGxlLnVybHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2FjaGUgYnVuZGxlZCByZXNvdXJjZTogJyArIHJlc291cmNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnVuZGxlZFJlc3BvbnNlID0gYnVuZGxlLmdldFJlc3BvbnNlKHJlc291cmNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVzcG9uc2VUb0NhY2hlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFJlc3BvbnNlKGJ1bmRsZWRSZXNwb25zZS5ib2R5LCB7IGhlYWRlcnM6IGJ1bmRsZWRSZXNwb25zZS5oZWFkZXJzIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2goY2FjaGUucHV0KHJlc291cmNlLCByZXNwb25zZVRvQ2FjaGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2xpZW50cy5tYXRjaEFsbCgpLnRoZW4oKGNsaWVudHMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50cy5mb3JFYWNoKChjbGllbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudC5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJidW5kbGVwcmVsb2FkLWZpbmlzaGVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBldmVudC5kYXRhLnNvdXJjZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmZXRjaCBmYWlsZWQnLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc29sZS5sb2coJ21lc3NhZ2U6IHVua25vd24gY29tbWFuZCcpO1xuICAgIH1cbn0pO1xuXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ2ZldGNoJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coYGZldGNoOiAke2V2ZW50LnJlcXVlc3QudXJsfWApO1xuICAgIGV2ZW50LnJlc3BvbmRXaXRoKFxuICAgICAgICBjYWNoZXMubWF0Y2goZXZlbnQucmVxdWVzdClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIC8vIENhY2hlIGhpdCAtIHJldHVybiByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgaW4gY2FjaGU6ICR7ZXZlbnQucmVxdWVzdC51cmx9YCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPIGlmIHRoZSByZXNvdXJjZSBpcyBiZWluZyBmZXRjaGVkIGFzIHBhcnQgb2YgYSBidW5kbGUsIHdhaXQgdW50aWwgaXQgYXJyaXZlc1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZldGNoKGV2ZW50LnJlcXVlc3QpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgd2UgZ290IGFuIGludmFsaWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UgfHwgcmVzcG9uc2Uuc3RhdHVzICE9PSAyMDAgfHwgcmVzcG9uc2UudHlwZSAhPT0gJ2Jhc2ljJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBlcnJvciBmZXRjaGluZzogJHtldmVudC5yZXF1ZXN0LnVybH1gLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgcmVzcG9uc2UgaXMgYSBzdHJlYW0sIHdlIG5lZWQgdG8gY2xvbmUgaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvIGJvdGggdGhlIGNhY2hlIGFuZCB0aGUgYnJvd3NlciBjYW4gY29uc3VtZSBpdC5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXNwb25zZVRvQ2FjaGUgPSByZXNwb25zZS5jbG9uZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC53YWl0VW50aWwoY2FjaGVzLm9wZW4oQ0FDSEVfTkFNRSkudGhlbihmdW5jdGlvbiAoY2FjaGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgZmV0Y2hlZCBhbmQgY2FjaGVkOiAke2V2ZW50LnJlcXVlc3QudXJsfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLnB1dChldmVudC5yZXF1ZXN0LCByZXNwb25zZVRvQ2FjaGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLmNhdGNoKChlcnJvcikgPT4gY29uc29sZS5sb2coZXJyb3IpKTtcbiAgICAgICAgICAgIH0pXG4gICAgKTtcbn0pO1xuXG4iXX0=
