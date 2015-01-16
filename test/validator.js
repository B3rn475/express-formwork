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
});