express-formwork
===

  [![NPM Version][npm-image]][npm-url]
  [![Build Status][travis-image]][travis-url]

__express-formwork__ is a completely asynchronous form validator and sanitizer for [express](https://github.com/strongloop/express) based on [validator](https://github.com/chriso/validator.js)

### Installation

```bash
$ npm install express-formwork
```

Validator
---

The __validator__ is and __express__ middleware responsible for the validation and sanitization of the fields.

```js
    var validator = require('express-formwork').validator;
    //...
    app.use(validator(  field1,
                        field2,
                        field2  ));
    //...
```

Field
---

The __field__ is a configuration for the validation and sanitization of a single value.

```js
    var field = require('express-formwork').field;

    var field1 = field(name, location);

```

 - __name__ (string) the name of the field
 - __location__ (string | array) where to take the value from

### Location

The __location__ is where the value will be taken from.

Possible values:
 - __body__ the value will be searched in the body of the request (the value will be available in __req.formwork.body.name.value__)
 - __query__ the value will be searched in the query of the request (the value will be available in __req.formwork.query.name.value__)
 - __params__ the value will be searched in the parameters of the request (the value will be available in __req.formwork.params.name.value__)
 - __[ ]__ an array of the previous values. The value will be seached in those locations following the provided order (the value will be available in __req.formwork.any.name.value__)
 
__examples__

```js
    var field = require('express-formwork').field;

    var field1 = field(name1, 'body');
    var field2 = field(name2, 'query');
    var field3 = field(name3, 'params');
    var field4 = field(name4, ['body']); // same as field.body(name1)
    var field5 = field(name5, ['query']); // same as field.query(name2)
    var field6 = field(name6, ['params']); // same as field.params(name3)
    var field7 = field(name7, ['body', 'query', 'params']); // same as field.any(name4)
    var field8 = field(name8, ['query', 'body']);
```

Operations
---

On each field you can execution various operations.

```js
    var field1 = field(name1, location1).op1().op2().op3().op4();
```

### optional()

If the current value is __undefined__/__null__/__''__ it will stop the operations chain

### required(error)

If the current value is __undefined__/__null__/__''__ it will add the given __error__ to the field and stop the operations chain

### validate(callback)

The __callback__ will validate the value of the field. If the validation is unsuccessful it will attach the error to the field and stop the operations chain

__prototype__

```js
function (value, callback, formwork, req, res) {
    // everything ok continue with the operation chain
    return callback();
    // validation failed stop the current field and attach an error to it
    return callback(undefined, 'invalid value');
    // forward an error from asynchronous module, stop the entire validator and forword the error to express-formwork
    return callback(err);
}
```

Parameters:

 - __value__ (mandatory) the current value of the field to validate
 - __callback__ (mandatory) the callback that must be invoked to continue with the the next operation (see example)
 - __formwork__ (optional) reference to the current formwork object
 - __req__ (optional) current express request
 - __res__ (optional) current express response
 
The predefined validators are:

 - **equals(comparison, error)** - check if the string matches the comparison.
 - **contains(seed, error)** - check if the string contains the seed.
 - **matches(pattern [, modifiers], error)** - check if string matches the pattern. Either `matches('foo', /foo/i)` or `matches('foo', 'foo', 'i')`.
 - **isEmail(error)** - check if the string is an email.
 - **isURL(str [, options], error)** - check if the string is an URL. `options` is an object which defaults to `{ protocols: ['http','https','ftp'], require_tld: true, require_protocol: false, allow_underscores: false, host_whitelist: false, host_blacklist: false, allow_trailing_dot: false }`.
 - **isFQDN(str [, options], error)** - check if the string is a fully qualified domain name (e.g. domain.com). `options` is an object which defaults to `{ require_tld: true, allow_underscores: false, allow_trailing_dot: false }`.
 - **isIP(str [, version], error)** - check if the string is an IP (version 4 or 6).
 - **isAlpha(error)** - check if the string contains only letters (a-zA-Z).
 - **isNumeric(error)** - check if the string contains only numbers.
 - **isAlphanumeric(error)** - check if the string contains only letters and numbers.
 - **isBase64(error)** - check if a string is base64 encoded.
 - **isHexadecimal(error)** - check if the string is a hexadecimal number.
 - **isHexColor(error)** - check if the string is a hexadecimal color.
 - **isLowercase(error)** - check if the string is lowercase.
 - **isUppercase(error)** - check if the string is uppercase.
 - **isInt(error)** - check if the string is an integer.
 - **isFloat(error)** - check if the string is a float.
 - **isDivisibleBy(number, error)** - check if the string is a number that's divisible by another.
 - **isNull(error)** - check if the string is null.
 - **isLength(min [, max], error)** - check if the string's length falls in a range. Note: this function takes into account surrogate pairs.
 - **isByteLength(min [, max], error)** - check if the string's length (in bytes) falls in a range.
 - **isUUID(str [, version], error)** - check if the string is a UUID (version 3, 4 or 5).
 - **isDate(error)** - check if the string is a date.
 - **isAfter(str [, date], error)** - check if the string is a date that's after the specified date (defaults to now).
 - **isBefore(str [, date], error)** - check if the string is a date that's before the specified date.
 - **isIn(values, error)** - check if the string is in a array of allowed values.
 - **isCreditCard(error)** - check if the string is a credit card.
 - **isISBN(str [, version], error)** - check if the string is an ISBN (version 10 or 13).
 - **isMobilePhone([, locale], error)** - check if the string is a mobile phone number, (locale should be locales, like 'zh-CN', currently only support 'zh-CN').
 - **isJSON(error)** - check if the string is valid JSON (note: uses JSON.parse).
 - **isMultibyte(error)** - check if the string contains one or more multibyte chars.
 - **isAscii(error)** - check if the string contains ASCII chars only.
 - **isFullWidth(error)** - check if the string contains any full-width chars.
 - **isHalfWidth(error)** - check if the string contains any half-width chars.
 - **isVariableWidth(error)** - check if the string contains a mixture of full and half-width chars.
 - **isSurrogatePair(error)** - check if the string contains any surrogate pairs chars.
 - **isMongoId(error)** - check if the string is a valid hex-encoded representation of a [MongoDB ObjectId][mongoid].
 
 For further informations on the predefined validators see [validator](https://github.com/chriso/validator.js)
 
 ### sanitize(callback)
 
 The __callback__ will sanitize the value of the field.
 
 __prototype__

```js
function (value, callback, formwork, req, res) {
    // give the sanitized value back and continue with the operation chain
    return callback(undefined, sanitized_value);
    // forward an error from asynchronous module, stop the entire validator and forword the error to express-formwork
    return callback(err);
}
```

The predefined sanitiers are:
 
 - **toString()** - convert the input to a string.
 - **toDate()** - convert the input to a date, or `null` if the input is not a date.
 - **toFloat()** - convert the input to a float, or `NaN` if the input is not a float.
 - **toInt([radix])** - convert the input to an integer, or `NaN` if the input is not an integer.
 - **toBoolean([strict])** - convert the input to a boolean. Everything except for `'0'`, `'false'` and `''` returns `true`. In strict mode only `'1'` and `'true'` return  `true`.
 - **trim([chars])** - trim characters (whitespace by default) from both sides of the input.
 - **ltrim([chars])** - trim characters from the left-side of the input.
 - **rtrim([chars])** - trim characters from the right-side of the input.
 - **escape()** - replace `<`, `>`, `&`, `'`, `"` and `/` with HTML entities. 
 - **stripLow([keep_new_lines])** - remove characters with a numerical value < 32 and 127, mostly control characters. If `keep_new_lines` is `true`, newline characters are preserved (`\n` and `\r`, hex `0xA` and `0xD`). Unicode-safe in JavaScript.
 - **whitelist(chars)** - remove characters that do not appear in the whitelist. The characters are used in a RegExp and so you will need to escape some chars, e.g. whitelist('\\[\\]').
 - **blacklist(chars)** - remove characters that appear in the blacklist. The characters are used in a RegExp and so you will need to escape some chars, e.g. blacklist('\\[\\]').
 - **normalizeEmail([options])** - canonicalize an email address. `options` is an object which defaults to `{ lowercase: true }`. With `lowercase` set to `true`, the local part of the email address is lowercased for all domains; the hostname is always lowercased and the local part of the email address is always lowercased for hosts that are known to be case-insensitive (currently only GMail). Normalization follows special rules for known providers: currently, GMail addresses have dots removed in the local part and are stripped of tags (e.g. `some.one+tag@gmail.com` becomes `someone@gmail.com`) and all `@googlemail.com` addresses are normalized to `@gmail.com`.

For further informations on the predefined sanitizers see [validator](https://github.com/chriso/validator.js)

[npm-image]: https://img.shields.io/npm/v/express-formwork.svg?style=flat
[npm-url]: https://npmjs.org/package/express-formwork
[travis-image]: https://travis-ci.org/B3rn475/express-formwork.svg
[travis-url]: https://travis-ci.org/B3rn475/express-formwork
