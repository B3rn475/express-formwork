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
    async = require("async"),
    field = require("../").field;

describe('field', function () {
    it('should be a function', function () {
        assert.equal(typeof field, 'function');
    });
    it('should accept 2 arguments', function () {
        assert.equal(field.length, 2);
    });
    it('should return a field if used without new', function () {
        var field1 = field("amico", "body");
        assert.equal(field1 instanceof field, true);
    });
    describe('inputs', function () {
        it('should not accept non string names', function () {
            assert.throws(function () {field(undefined, "body"); });
            assert.throws(function () {field(null, "body"); });
            assert.throws(function () {field(true, "body"); });
            assert.throws(function () {field(0, "body"); });
            assert.throws(function () {field(/a-z/, "body"); });
            assert.throws(function () {field([], "body"); });
            assert.throws(function () {field({}, "body"); });
        });
        it('should not accept non string and non array location', function () {
            assert.throws(function () {field("name", undefined); });
            assert.throws(function () {field("name", null); });
            assert.throws(function () {field("name", true); });
            assert.throws(function () {field("name", 0); });
            assert.throws(function () {field("name", /a-z/); });
            assert.throws(function () {field("name", {}); });
        });
        it('should not accept empty array locations', function () {
            assert.throws(function () {field("name", []); });
        });
        it('should not accept locations different from \'body\', \'query\', \'params\'', function () {
            assert.throws(function () {field("name", 'a'); });
            assert.throws(function () {field("name", ['a']); });
            assert.throws(function () {field("name", ['body', 'a']); });
        });
        it('should accept locations equal to \'body\', \'query\', \'params\'', function () {
            field("name", 'body');
            field("name", 'query');
            field("name", 'params');
            field("name", ['body']);
            field("name", ['query']);
            field("name", ['params']);
            field("name", ['body', 'query']);
            field("name", ['body', 'query', 'params']);
        });
    });
    it('should be converted to a middleware', function () {
        var middleware = field("name", 'body').toMiddleware();
        assert.equal(typeof middleware, 'function');
        assert.equal(middleware.length, 3);
    });
    describe('locations', function () {
        function createRequest() {
            return {
                body : {
                    name: 'bname'
                },
                query : {
                    name: 'qname'
                },
                params : {
                    name: 'pname'
                },
                formwork: {
                    body: {},
                    query: {},
                    params: {},
                    any: {}
                }
            };
        }
        function createResponse() {return {}; }
        it('should put body fields in body', function () {
            var req = createRequest(),
                res = createResponse(),
                done;
            field("name", 'body').optional().toMiddleware()(req, res, function (err) {
                assert.equal(err, undefined);
                assert.notEqual(req.formwork.body.name, undefined);
                assert.equal(req.formwork.query.name, undefined);
                assert.equal(req.formwork.params.name, undefined);
                assert.equal(req.formwork.any.name, undefined);
                assert.equal(req.formwork.body.name.value, req.body.name);
                done = true;
            });
            assert.equal(done, true);
        });
        it('should put query fields in query', function () {
            var req = createRequest(),
                res = createResponse(),
                done;
            field("name", 'query').optional().toMiddleware()(req, res, function (err) {
                assert.equal(err, undefined);
                assert.equal(req.formwork.body.name, undefined);
                assert.notEqual(req.formwork.query.name, undefined);
                assert.equal(req.formwork.params.name, undefined);
                assert.equal(req.formwork.any.name, undefined);
                assert.equal(req.formwork.query.name.value, req.query.name);
                done = true;
            });
            assert.equal(done, true);
        });
        it('should put body fields in body', function () {
            var req = createRequest(),
                res = createResponse(),
                done;
            field("name", 'params').optional().toMiddleware()(req, res, function (err) {
                assert.equal(err, undefined);
                assert.equal(req.formwork.body.name, undefined);
                assert.equal(req.formwork.query.name, undefined);
                assert.notEqual(req.formwork.params.name, undefined);
                assert.equal(req.formwork.any.name, undefined);
                assert.equal(req.formwork.params.name.value, req.params.name);
                done = true;
            });
            assert.equal(done, true);
        });
        it('should respect precedence \'body\'', function () {
            var req = createRequest(),
                res = createResponse(),
                done;
            field("name", ['body', 'query', 'params']).optional().toMiddleware()(req, res, function (err) {
                assert.equal(err, undefined);
                assert.equal(req.formwork.body.name, undefined);
                assert.equal(req.formwork.query.name, undefined);
                assert.equal(req.formwork.params.name, undefined);
                assert.notEqual(req.formwork.any.name, undefined);
                assert.equal(req.formwork.any.name.value, req.body.name);
                done = true;
            });
            assert.equal(done, true);
        });
        it('should respect precedence \'query\'', function () {
            var req = createRequest(),
                res = createResponse(),
                done;
            field("name", ['query', 'body', 'params']).optional().toMiddleware()(req, res, function (err) {
                assert.equal(err, undefined);
                assert.equal(req.formwork.body.name, undefined);
                assert.equal(req.formwork.query.name, undefined);
                assert.equal(req.formwork.params.name, undefined);
                assert.notEqual(req.formwork.any.name, undefined);
                assert.equal(req.formwork.any.name.value, req.query.name);
                done = true;
            });
            assert.equal(done, true);
        });
        it('should respect precedence \'body\'', function () {
            var req = createRequest(),
                res = createResponse(),
                done;
            field("name", ['params', 'body', 'query']).optional().toMiddleware()(req, res, function (err) {
                assert.equal(err, undefined);
                assert.equal(req.formwork.body.name, undefined);
                assert.equal(req.formwork.query.name, undefined);
                assert.equal(req.formwork.params.name, undefined);
                assert.notEqual(req.formwork.any.name, undefined);
                assert.equal(req.formwork.any.name.value, req.params.name);
                done = true;
            });
            assert.equal(done, true);
        });
    });
    describe('methods', function () {
        function createRequest() {
            return {
                body : {
                    name: 'bname'
                },
                query : {},
                params : {},
                formwork: {
                    isValid: true,
                    body: {},
                    query: {},
                    params: {},
                    any: {}
                }
            };
        }
        function createResponse() {return {}; }
        describe('required', function () {
            it('should accept a string or nothing', function () {
                var req = createRequest(),
                    res = createResponse(),
                    done = 0;
                assert.doesNotThrow(function () {field("name", ['body']).required(); });
                assert.doesNotThrow(function () {field("name", ['body']).required(undefined); });
                assert.throws(function () {field("name", ['body']).required(null); });
                assert.throws(function () {field("name", ['body']).required(true); });
                assert.throws(function () {field("name", ['body']).required(0); });
                assert.doesNotThrow(function () {field("name", ['body']).required("string"); });
                assert.throws(function () {field("name", ['body']).required([]); });
                assert.throws(function () {field("name", ['body']).required({}); });
                assert.throws(function () {field("name", ['body']).required(function () {}); });
            });
            it('should give error if not present', function () {
                var req = createRequest(),
                    res = createResponse(),
                    done;
                field("name", ['params']).required('name is required').toMiddleware()(req, res, function (err) {
                    assert.equal(err, undefined);
                    assert.equal(req.formwork.isValid, false);
                    assert.equal(req.formwork.any.name.error, 'name is required');
                    done = true;
                });
                assert.equal(done, true);
            });
            it('should not give error if present', function () {
                var req = createRequest(),
                    res = createResponse(),
                    done;
                field("name", ['body']).required('name is required').toMiddleware()(req, res, function (err) {
                    assert.equal(err, undefined);
                    assert.equal(req.formwork.isValid, true);
                    assert.equal(req.formwork.any.name.error, undefined);
                    done = true;
                });
                assert.equal(done, true);
            });
        });
        it('should respect optional()', function () {
            var req = createRequest(),
                res = createResponse(),
                done = true;
            field("name", ['params']).optional().toMiddleware()(req, res, function (err) {
                assert.equal(err, undefined);
                assert.equal(req.formwork.isValid, true);
                assert.equal(req.formwork.any.name.error, undefined);
                assert.equal(req.formwork.any.name.value, '');
            });
            assert.equal(done, true);
        });
        describe('validate', function () {
            it('should accept only a function with at least 2 parameters', function () {
                var req = createRequest(),
                    res = createResponse(),
                    done = 0;
                assert.throws(function () {field("name", ['body']).validate(); });
                assert.throws(function () {field("name", ['body']).validate(undefined); });
                assert.throws(function () {field("name", ['body']).validate(null); });
                assert.throws(function () {field("name", ['body']).validate(true); });
                assert.throws(function () {field("name", ['body']).validate(0); });
                assert.throws(function () {field("name", ['body']).validate("string"); });
                assert.throws(function () {field("name", ['body']).validate([]); });
                assert.throws(function () {field("name", ['body']).validate({}); });
                assert.throws(function () {field("name", ['body']).validate(function () {}); });
                assert.throws(function () {field("name", ['body']).validate(function (var1) {}); });
                assert.doesNotThrow(function () {field("name", ['body']).validate(function (var1, var2) {}); });
            });
            it('should forward true', function () {
                var req = createRequest(),
                    res = createResponse(),
                    done = 0;
                field("name", ['body']).validate(function (str, next) {
                    done += 1;
                    next();
                }).toMiddleware()(req, res, function (err) {
                    assert.equal(err, undefined);
                    assert.equal(req.formwork.isValid, true);
                    assert.equal(req.formwork.any.name.error, undefined);
                    assert.equal(req.formwork.any.name.value, req.body.name);
                    done += 1;
                });
                assert.equal(done, 2);
            });
            it('should forward error', function () {
                var req = createRequest(),
                    res = createResponse(),
                    done = 0;
                field("name", ['body']).validate(function (str, next) {
                    done += 1;
                    next(undefined, "invalid name");
                }).toMiddleware()(req, res, function (err) {
                    assert.equal(err, undefined);
                    assert.equal(req.formwork.isValid, false);
                    assert.equal(req.formwork.any.name.error, "invalid name");
                    done += 1;
                });
                assert.equal(done, 2);
            });
            it('should forward internal error', function () {
                var req = createRequest(),
                    res = createResponse(),
                    done = 0;
                field("name", ['body']).validate(function (str, next) {
                    done += 1;
                    next("internal error");
                }).toMiddleware()(req, res, function (err) {
                    assert.equal(err, "internal error");
                    done += 1;
                });
                assert.equal(done, 2);
            });
        });
        describe('sanitize', function () {
            it('should accept only a function with at least 2 parameters', function () {
                var req = createRequest(),
                    res = createResponse(),
                    done = 0;
                assert.throws(function () {field("name", ['body']).sanitize(); });
                assert.throws(function () {field("name", ['body']).sanitize(undefined); });
                assert.throws(function () {field("name", ['body']).sanitize(null); });
                assert.throws(function () {field("name", ['body']).sanitize(true); });
                assert.throws(function () {field("name", ['body']).sanitize(0); });
                assert.throws(function () {field("name", ['body']).sanitize("string"); });
                assert.throws(function () {field("name", ['body']).sanitize([]); });
                assert.throws(function () {field("name", ['body']).sanitize({}); });
                assert.throws(function () {field("name", ['body']).sanitize(function () {}); });
                assert.throws(function () {field("name", ['body']).sanitize(function (var1) {}); });
                assert.doesNotThrow(function () {field("name", ['body']).sanitize(function (var1, var2) {}); });
            });
            it('should forward value', function () {
                var req = createRequest(),
                    res = createResponse(),
                    done = 0;
                field("name", 'query').sanitize(function (str, next) {
                    done += 1;
                    next(undefined, "sanitized");
                }).toMiddleware()(req, res, function (err) {
                    assert.equal(err, undefined);
                    assert.equal(req.formwork.isValid, true);
                    assert.equal(req.formwork.query.name.value, "sanitized");
                    done += 1;
                });
                assert.equal(done, 2);
            });
            it('should forward internal error', function () {
                var req = createRequest(),
                    res = createResponse(),
                    done = 0;
                field("name", ['query', 'params']).sanitize(function (value, next) {
                    done += 1;
                    next("internal error");
                }).toMiddleware()(req, res, function (err) {
                    assert.equal(err, "internal error");
                    done += 1;
                });
                assert.equal(done, 2);
            });
        });
    });
    describe('shortcuts', function () {
        it('body', function () {
            assert.equal(field.body("name") instanceof field, true);
        });
        it('query', function () {
            assert.equal(field.query("name") instanceof field, true);
        });
        it('params', function () {
            assert.equal(field.params("name") instanceof field, true);
        });
        it('any', function () {
            assert.equal(field.any("name") instanceof field, true);
        });
    });
});