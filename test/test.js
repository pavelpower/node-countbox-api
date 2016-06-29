var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();

describe('CountBOX API v2', function() {
  var api = require('../');

  console.log(api);

  it('node module', function() {
    should.exist(api);
  });

  it('is a function', function() {
    api.should.be.a('function');
  });

});
