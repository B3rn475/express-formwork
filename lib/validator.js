/*jslint node: true, nomen: true */
/**
* Developed By Carlo Bernaschina (GitHub - B3rn475)
* www.bernaschina.com
*
* Distributed under the MIT Licence
*/
"use strict";

var Field = require('./field.js').field;

function validator() {
    var middlewares = [];
    Array.prototype.slice(arguments).forEach(function (validator) {
        if (!(validator instanceof Field)) {
            throw new Error('every argument must be a field');
        }
        middlewares.push(validator.toMiddleware());
    });
    return function (req, res, next) {
        var i = 0;
        if (req.formwork === undefined) {
            req.formwork = {};
        }
        if (req.formwork.body === undefined) {
            req.formwork.body = {};
        }
        if (req.formwork.query === undefined) {
            req.formwork.query = {};
        }
        if (req.formwork.params === undefined) {
            req.formwork.params = {};
        }
        if (req.formwork.any === undefined) {
            req.formwork.any = {};
        }

        function doStep(err) {
            if (err) {
                return next(err);
            }
            if (middlewares.length === i) {
                return next();
            }
            var middleware = middlewares[i];
            i = i + 1;
            middleware(req, res, doStep);
        }
        doStep();
    };
}

exports.validator = validator;
