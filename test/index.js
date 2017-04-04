
var Appboy = require('../');
var Test = require('segmentio-integration-tester');
var assert = require('assert');
var mapper = require('../lib/mapper');

describe('Appboy', function(){
  var appboy;
  var settings;
  var test;

  beforeEach(function(){
    settings = {
      appGroupId: 'd54c3d18-71d5-4ebc-8a41-5cfae902977f',
      apiKey: 'my_api_key',
      trackPages: true,
      updateExistingOnly: false,
      datacenter: 'us'
    };
    appboy = new Appboy(settings);
    test = Test(appboy, __dirname);
    test.mapper(mapper);
  });

  it('should have the correct settings', function(){
    test
      .name('Appboy')
      .channels(['server', 'client'])
      .ensure('settings.datacenter')
      .ensure('settings.appGroupId')
      .ensure('message.userId')
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

    it('should not be valid without a datacenter', function(){
      delete settings.datacenter;
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

      it('should send gender if it is of an accepted format', function(){
        test.maps('identify-gender2');
      });

      it('should omit gender if it is not a string', function(){
        test.maps('identify-gender3');
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

      it('should set _update_existing_only to true if it is true in settings', function(){
        settings.updateExistingOnly = true;
        test.maps('track-update-existing-only');
      });

      it('should leave app_id blank when apiKey is not in settings', function(){
        delete settings.apiKey;
        test.maps('track-basic-no-api-key');
      });
    });

    describe('orderCompleted', function(){
      it('should map complete order tracks with products', function(){
        test.maps('track-products');
      });

      it('should use default currency and quantity for products when they do not exist', function(){
        test.maps('track-products-defaults');
      });

      it('should leave app_id blank when apiKey is not in settings', function(){
        delete settings.apiKey;
        test.maps('track-basic-no-api-key');
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

    it('should send to eu datacenter', function(done){
      var json = test.fixture('identify-basic');
      var output = json.output;
      settings.datacenter = 'eu';

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

    it('should send basic track to eu datacenter', function(done){
      var json = test.fixture('track-basic');
      var output = json.output;
      output.events[0].time = new Date(output.events[0].time);
      settings.datacenter = 'eu';

      test
        .track(json.input)
        .sends(json.output)
        .expects(201)
        .end(done);
    });
  });

  describe('.orderCompleted()', function(){
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

    it('should return minor errors', function(done){
      var json = test.fixture('track-products-minor-error');
      var output = json.output;
      output.purchases[0].time = new Date(output.purchases[0].time);
      output.purchases[1].time = new Date(output.purchases[1].time);
      test
        .track(json.input)
        .sends(json.output)
        .expects(201)
        .end(function(err, response){
          if (err) return done(err);
          // check the the response was successful but has the minor error of invalid price
          assert.strictEqual(response[0].body.message, "success");
          assert((/price/).test(response[0].body.errors[0].type));
          done();
        });
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

    it('should send basic group to eu datacenter', function(done){
      var json = test.fixture('group-basic');
      var output = json.output;
      settings.datacenter = 'eu';

      test
        .group(json.input)
        .sends(json.output)
        .expects(201)
        .end(done);
    });
  });
});
