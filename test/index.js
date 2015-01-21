
var Test = require('segmentio-integration-tester');
var Sendwithus = require('../');
var mapper = require('../lib/mapper');

describe('Sendwithus', function(){
  var sendwithus;
  var settings;
  var test;

  beforeEach(function(){
    //settings = { apiKey: 'key_segment1234abcd', integrationId: 'sio_segment1234abcd' };
    settings = {
      apiKey: 'live_7252c5d59aa9c0ed65239cce083ea7e5f0505f0f',
      //apiKey: 'test_514d7517342c583abf9b73a617a529897014411a',
      integrationId: 'sio_MA2T2LtHDvsNDjDke7aC6Q' };
    sendwithus = new Sendwithus(settings);
    test = Test(sendwithus, __dirname);
    test.mapper(mapper);
  });

  it('should have the correct settings', function(){
    test
      .name('Sendwithus')
      .channels(['server'])
      .ensure('settings.apiKey')
      .ensure('settings.integrationId')
      .retries(10);
  });

  describe('.validate()', function(){
    it('should not be valid without an api key', function(){
      delete settings.apiKey;
      delete settings.invalid;
      test.invalid({}, settings);
    });

    it('should be valid with complete settings', function(){
      test.valid({}, settings);
    });
  });

  describe('mapper', function(){
    describe('identify', function(){
      it('should map basic identify', function(){
        test.maps('identify-basic');
      });
    });

    describe('track', function(){
      it('should map basic track', function(){
        test.maps('track-basic');
      });
    });
  });

  describe('.identify()', function(){
    it('should send basic identify', function(done){
      var json = test.fixture('identify-basic');
      var output = json.output;
      output.timestamp = new Date(output.timestamp);
      test
        .identify(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should not error on invalid key', function(done){
      var json = test.fixture('identify-basic');
      var output = json.output;
      output.timestamp = new Date(output.timestamp);
      test
        .identify(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });
  });

  describe('.track()', function(){
    it('should send basic track', function(done){
      var json = test.fixture('track-basic');
      var output = json.output;
      output.timestamp = new Date(output.timestamp);
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should not error on invalid key', function(done){
      var json = test.fixture('track-basic');
      var output = json.output;
      output.timestamp = new Date(output.timestamp);
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });
  });
});
