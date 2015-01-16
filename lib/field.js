/*jslint node: true, nomen: true */
/**
* Developed By Carlo Bernaschina (GitHub - B3rn475)
* www.bernaschina.com
*
* Distributed under the MIT Licence
*/
"use strict";

var validator = require('validator'),
    util = require('util');

function Field(name, location) {
    if (!(this instanceof Field)) {
        return new Field(name, location);
    }
    if (typeof name !== 'string') {
        throw new Error('Name must be a string');
    }
    if (typeof location !== 'string' && (!util.isArray(location) || location.length === 0)) {
        throw new Error('Location must be a string or an array');
    }
    [].concat(location).forEach(function (location) {
        if (!validator.isIn(location, ['body', 'query', 'params'])) {
            throw new Error('Invalid location ' + location);
        }
    });
    var registeredSteps = [];

    this.validate = function (validator) {
        if (typeof validator !== 'function') {
            throw new Error('validator must be a function');
        }
        if (validator.length < 2) {
            throw new Error('validator must have at least 2 arguments');
        }
        registeredSteps.push({
            type: 'validator',
            validator: validator
        });
        return this;
    };

    this.sanitize = function (sanitizer) {
        if (typeof sanitizer !== 'function') {
            throw new Error('sanitizer must be a function');
        }
        if (sanitizer.length < 2) {
            throw new Error('sanitizer must have at lest 2 arguments');
        }
        registeredSteps.push({
            type: 'sanitizer',
            sanitizer: sanitizer
        });
        return this;
    };

    this.required = function (error) {
        if (error === undefined) {
            error = error || 'Missing required field';
        }
        if (typeof error !== 'string') {
            throw new Error('error must be a string');
        }
        registeredSteps.push({
            type: 'required',
            error: error
        });
        return this;
    };

    this.optional = function () {
        registeredSteps.push({
            type: 'optional'
        });
        return this;
    };

    this.toMiddleware = function () {
        var steps = [],
            initialize,
            get;
        if (typeof location === 'string') {
            initialize = function (req) {
                req.formwork[location][name] = {
                    value: (req[location] && req[location][name]) || ''
                };
            };

            get = function (req) {
                return req.formwork[location][name];
            };
        } else {
            if (location.length === 1) {
                (function () {
                    var rlocation = location[0];
                    initialize = function (req) {
                        req.formwork.any[name] = {
                            value: (req[rlocation] && req[rlocation][name]) || ''
                        };
                    };
                }());
            } else {
                initialize = function (req) {
                    req.formwork.any[name] = {
                        value: undefined
                    };
                    location.forEach(function (location) {
                        if (this.value === undefined) {
                            this.value = req[location] && req[location][name];
                        }
                    }, req.formwork.any[name]);
                    req.formwork.any[name].value = req.formwork.any[name].value || '';
                };
            }

            get = function (req) {
                return req.formwork.any[name];
            };
        }

        registeredSteps.forEach(function (step) {
            switch (step.type) {
            case 'optional':
                steps.push(function (req, res, next, end) {
                    if (get(req).value === '') {
                        return end();
                    }
                    next();
                });
                break;
            case 'required':
                steps.push(function (req, res, next, end) {
                    if (get(req).value === '') {
                        req.formwork.isValid = false;
                        get(req).error = step.error;
                        return end();
                    }
                    next();
                });
                break;
            case 'validator':
                steps.push(function (req, res, next, end) {
                    step.validator(get(req).value, function (err, error) {
                        if (err) {
                            return end(err);
                        }
                        if (error) {
                            req.formwork.isValid = false;
                            get(req).error = error;
                            return end();
                        }
                        next();
                    }, req.formwork, req, res);
                });
                break;
            case 'sanitizer':
                steps.push(function (req, res, next, end) {
                    step.sanitizer(get(req).value, function (err, value) {
                        if (err) {
                            return end(err);
                        }
                        get(req).value = value;
                        next();
                    }, req.formwork, req, res);
                });
                break;
            }
        });
        return function (req, res, next) {
            initialize(req);
            var i = 0;

            function doStep() {
                if (steps.length === i) {
                    return next();
                }
                var step = steps[i];
                i = i + 1;
                step(req, res, doStep, next);
            }
            doStep();
        };
    };
}

// istanbul ignore next
[
    'equals',
    'contains',
    'matches',
    'isEmail',
    'isURL',
    'isFQDN',
    'isIP',
    'isAlpha',
    'isNumeric',
    'isAlphanumeric',
    'isBase64',
    'isHexadecimal',
    'isHexColor',
    'isLowercase',
    'isUppercase',
    'isInt',
    'isFloat',
    'isDivisibleBy',
    'isNull',
    'isLength',
    'isByteLength',
    'isUUID',
    'isDate',
    'isAfter',
    'isBefore',
    'isIn',
    'isCreditCard',
    'isISBN',
    'isJSON',
    'isMultibyte',
    'isAscii',
    'isFullWidth',
    'isHalfWidth',
    'isVariableWidth',
    'isSurrogatePair',
    'isMongoId'
].forEach(function (name) {
    Field.prototype[name] = function () {
        if (arguments.length === 0) {
            throw new Error('Missing error param');
        }
        var args = Array.prototype.slice.apply(arguments),
            error = args.pop(),
            method = validator[name];
        return this.validate(function (str, next) {
            if (!method.apply(validator, [str].concat(args))) {
                return next(undefined, error);
            }
            next();
        });
    };
});

// istanbul ignore next 
[
    'toString',
    'toDate',
    'toFloat',
    'toInt',
    'toBoolean',
    'trim',
    'ltrim',
    'rtrim',
    'escape',
    'stripLow',
    'whitelist',
    'blacklist',
    'normalizeEmail'
].forEach(function (name) {
    Field.prototype[name] = function () {
        var args = Array.prototype.slice.apply(arguments),
            method = validator[name];
        return this.sanitize(function (value, next) {
            next(undefined, method.apply(validator, [value].concat(arguments)));
        });
    };
});

Field.body = function (name) {
    return new Field(name, ['body']);
};

Field.query = function (name) {
    return new Field(name, ['query']);
};

Field.params = function (name) {
    return new Field(name, ['params']);
};

Field.any = function (name) {
    return new Field(name, ['body', 'query', 'params']);
};

exports.field = Field;
