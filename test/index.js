
var Test = require('segmentio-integration-tester');
var Appboy = require('../');
var mapper = require('../lib/mapper');

describe('Appboy', function(){
  var appboy;
  var settings;
  var test;

  beforeEach(function(){
    settings = {
      apiKey: ''
    };
    appboy = new Appboy(settings);
    test = Test(appboy, __dirname);
    test.mapper(mapper);
  });

  it('should have the correct settings', function(){
    test
      .name('Appboy')
      .channels(['server'])
      .ensure('settings.apiKey')
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
