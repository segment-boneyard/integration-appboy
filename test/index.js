
var Test = require('segmentio-integration-tester');
var Appboy = require('../');
var mapper = require('../lib/mapper');
var facade = require('segmentio-facade');

describe('Appboy', function(){
  var appboy;
  var settings;
  var test;

  beforeEach(function(){
    settings = {
      appGroupId: 'b1de6df9-0052-4f7a-87f5-a17273199311',
      trackPages: true,
      updateExistingOnly: false
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
      .retries(2);
  });

  describe('.validate()', function(){
    it('should not be valid without an app group id', function(){
      delete settings.appGroupId;
      test.invalid({
        userId: "user-id"
      }, settings);
    });

    it('should not be valid without a user id', function(){
      test.invalid({}, settings);
    });

    it('should be valid with complete settings', function(){
      test.valid({
        userId: "user-id"
      }, settings);
    });
  });

  describe('mapper', function(){
    describe('identify', function(){
      it('should map basic identify', function(){
        test.maps('identify-basic');
      });

      it('should map birthday to dob in the correct format', function(){
        test.maps('identify-dob');
      });

      it('should not send gender if it is not M or F', function(){
        test.maps('identify-gender');
      });

      it('should preserve case of non-standard Appboy fields', function(){
        test.maps('identify-custom');
      });

      it('should set _update_existing_only to true if it is true in settings', function(){
        settings.updateExistingOnly = true;
        test.maps('identify-update-existing-only');
      });
    });

    describe('track', function(){
      it('should map basic track', function(){
        test.maps('track-basic');
      });

      it('should map complete order tracks with products', function(){
        test.maps('track-products');
      });

      it('should set _update_existing_only to true if it is true in settings', function(){
        settings.updateExistingOnly = true;
        test.maps('track-update-existing-only');
      });
    });

    describe('group', function(){
      it('should map basic group', function(){
        test.maps('group-basic');
      });

      it('should set _update_existing_only to true if it is true in settings', function(){
        settings.updateExistingOnly = true;
        test.maps('group-update-existing-only');
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

    it('should send track products', function(done){
      var json = test.fixture('track-products');
      var output = json.output;
      output.purchases[0].time = new Date(output.purchases[0].time);
      output.purchases[1].time = new Date(output.purchases[1].time);
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
