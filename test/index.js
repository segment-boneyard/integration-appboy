
var Test = require('segmentio-integration-tester');
var Appboy = require('../');
var mapper = require('../lib/mapper');

describe('Appboy', function(){
  var appboy;
  var settings;
  var test;

  beforeEach(function(){
    settings = {
      appGroupId: 'b1de6df9-0052-4f7a-87f5-a17273199311'
    };
    appboy = new Appboy(settings);
    test = Test(appboy, __dirname);
    test.mapper(mapper);
  });

  it('should have the correct settings', function(){
    test
      .name('Appboy')
      .channels(['server', 'client'])
      .ensure('settings.appGroupId')
      .retries(10);
  });

  describe('.validate()', function(){
    it('should not be valid without an app group id', function(){
      delete settings.appGroupId;
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

    describe('page', function(){
      it('should map basic page', function(){
        test.maps('page-basic');
      });
    });

    describe('group', function(){
      it('should map basic group', function(){
        test.maps('group-basic');
      });
    });
  });

  describe('.identify()', function(){
    it('should send basic identify', function(done){
      var json = test.fixture('identify-basic');
      var output = json.output;
      test
        .identify(json.input)
        .sends(json.output)
        .expects(201)
        .end(done);
    });

    it('should not error on invalid key', function(done){
      var json = test.fixture('identify-basic');
      var output = json.output;
      test
        .identify(json.input)
        .sends(json.output)
        .expects(201)
        .end(done);
    });
  });

  describe('.track()', function(){
    it('should send basic track', function(done){
      var json = test.fixture('track-basic');
      var output = json.output;
      output.events[0].time = new Date(output.events[0].time);
      test
        .track(json.input)
        .sends(json.output)
        .expects(201)
        .end(done);
    });
    it('should not error on invalid key', function(done){
      var json = test.fixture('track-basic');
      var output = json.output;
      output.events[0].time = new Date(output.events[0].time);
      test
        .track(json.input)
        .sends(json.output)
        .expects(201)
        .end(done);
    });
  });

  describe('.page()', function(){
    it('should send basic page', function(done){
      var json = test.fixture('page-basic');
      var output = json.output;
      output.events[0].time = new Date(output.events[0].time);
      test
          .page(json.input)
          .sends(json.output)
          .expects(201)
          .end(done);
    });

    it('should not error on invalid key', function(done){
      var json = test.fixture('page-basic');
      var output = json.output;
      output.events[0].time = new Date(output.events[0].time);
      test
          .page(json.input)
          .sends(json.output)
          .expects(201)
          .end(done);
    });
  });

  describe('.group()', function(){
    it('should send basic group', function(done){
      var json = test.fixture('group-basic');
      var output = json.output;
      test
          .group(json.input)
          .sends(json.output)
          .expects(201)
          .end(done);
    });

    it('should not error on invalid key', function(done){
      var json = test.fixture('group-basic');
      var output = json.output;
      test
          .group(json.input)
          .sends(json.output)
          .expects(201)
          .end(done);
    });
  });
});
