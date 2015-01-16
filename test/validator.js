/*jslint node: true, nomen: true*/
/*global describe, it*/
/**
* Developed By Carlo Bernaschina (GitHub - B3rn475)
* www.bernaschina.com
*
* Distributed under the MIT Licence
*/
"use strict";

var assert = require("assert"),
    validator = require("../").validator,
    field = require("../").field;

describe('validator', function () {
    it('should be a function', function () {
        assert.equal(typeof validator, 'function');
    });
    it('should return a middleware', function () {
        var middleware = validator();
        assert.equal(typeof middleware, 'function');
        assert.equal(middleware.length, 3);
    });
    it('should throw with invalid arguments', function () {
        assert.throws(function () {validator(undefined); });
        assert.throws(function () {validator(null); });
        assert.throws(function () {validator(true); });
        assert.throws(function () {validator(0); });
        assert.throws(function () {validator("string"); });
        assert.throws(function () {validator(/a-z/); });
        assert.throws(function () {validator([]); });
        assert.throws(function () {validator({}); });
        assert.throws(function () {validator(function () {}); });
    });
    it('should not throw with fields as arguments', function () {
        var field1 = field.body("pippo"),
            field2 = field.body("pippo");
        validator(field1);
        validator(field1, field2);
    });
    it('should create the structure', function () {
        var req = {},
            res = {},
            done = false;
        validator()(req, res, function (err) {
            assert.equal(err, undefined);
            assert.equal(typeof req.formwork === 'object', true);
            assert.equal(typeof req.formwork.query === 'object', true);
            assert.equal(typeof req.formwork.body === 'object', true);
            assert.equal(typeof req.formwork.params === 'object', true);
            assert.equal(typeof req.formwork.any === 'object', true);
            done = true;
        });
        assert.equal(done, true);
    });
    it('should preserve structure', function () {
        var query = {}, body = {}, params = {}, any = {},
            formwork = {
                query: query,
                body: body,
                params: params,
                any: any
            },
            req = {formwork: formwork},
            res = {},
            done = false;
        validator()(req, res, function (err) {
            assert.equal(err, undefined);
            assert.equal(req.formwork, formwork);
            assert.equal(req.formwork.query, query);
            assert.equal(req.formwork.body, body);
            assert.equal(req.formwork.params, params);
            assert.equal(req.formwork.any, any);
            done = true;
        });
        assert.equal(done, true);
    });
    it('should forward error', function () {
        var req = {},
            res = {},
            done = false;
        validator(
            field.body('name').validate(function (str, done) { done("internal error"); })
        )(req, res, function (err) {
            assert.equal(err, "internal error");
            done = true;
        });
        assert.equal(done, true);
    });
});