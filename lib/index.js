
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `Appboy`
 *
 * https://documentation.appboy.com/REST_APIs/User_Data
 */

var Appboy = module.exports = integration('Appboy')
  .channels(['server'])
  .ensure('settings.datacenter')
  .ensure('settings.appGroupId')
  .ensure('message.userId')
  .mapper(mapper)
  .retries(2);

/**
 * Ensure.
 */

Appboy.ensure(function(msg, settings) {
  if ((msg.type() === 'page' || msg.type() === 'screen') && !settings.trackAllPages && !settings.trackNamedPages) {
    return this.reject('If you\'d like to track .page() and .screen() calls in Appboy, please update your Integration Settings.');
  }
  if ((msg.type() === 'page' || msg.type() === 'screen') && settings.trackNamedPages && !msg.name()) {
    return this.reject('Name is required for .page() and .screen() calls when Track Named Pages is enabled.');
  }
});
/**
 * Initialize.
 *
 * @api private
 */

Appboy.prototype.initialize = function(){
  this.endpoint = this.settings.datacenter === 'eu' ? 'https://rest.api.appboy.eu/users/track' : 'https://api.appboy.com/users/track';
};

/**
 * Identify, Track, and Group. All simply use the mapper and forward the data to
 * the same endpoint
 *
 * https://documentation.appboy.com/REST_APIs/User_Data
 *
 * @param {Object} payload
 * @param {Function} fn
 * @api public
 */

Appboy.prototype.identify = Appboy.prototype.track = Appboy.prototype.group =
    Appboy.prototype.page = Appboy.prototype.screen = function(payload, fn) {
      var self = this;

      var req = function() {
        self.post()
            .send(payload)
            .auth(self.settings.appGroupId)
            .end(function(err, res) {
              if (err && err.timeout) {
                return fn(err)
              }

              self.setLimit(res.headers, function() {
                if (err) {
                  return fn(err);
                }
                fn(null, res);
              });
            });
      };

      self.limit(req, fn);
    };

/**
 * Order Completed. Must manually call the mapper for this one
 *
 * https://documentation.appboy.com/REST_APIs/User_Data
 *
 * @param {Track} track
 * @param {Function} fn
 * @api public
 */
Appboy.prototype.orderCompleted = function(track, fn) {
  var payload = mapper.orderCompleted(track, this.settings);
  var self = this;

  var req = function() {
    self.post()
        .send(payload)
        .auth(self.settings.appGroupId)
        .end(function(err, res) {
          if (err && err.timeout) {
            return fn(err)
          }

          self.setLimit(res.headers, function() {
            if (err) {
              return fn(err);
            }

            fn(null, res);
          });
        });
  };
  
  self.limit(req, fn);
};

/**
 * Set the partner request limit.
 *
 * @param {Function} headers
 * @param {Function} completion
 * @api private
 */

Appboy.prototype.setLimit = function(headers, completion) {
  var appId = this.settings.apiKey;
  var key = ['appboy', appId].join(':');
  var redis = this.redis();

  var limit = {
    remaining: headers['x-ratelimit-remaining'],
    reset: headers['x-ratelimit-reset']
  };

  redis.set(key, JSON.stringify(limit), function(err, res) {
    completion();
  });
};

/**
 * Limits the integration to send too many request to the partner.
 *
 * @param {Function} fn
 * @param {Function} req
 * @api private
 */

Appboy.prototype.limit = function(req, fn) {
  var appId = this.settings.apiKey;
  var key = ['appboy', appId].join(':');
  var redis = this.redis();

  redis.get(key, function(err, res) {
    if (!res || err) {
      return req();
    }

    var limit = JSON.parse(res);
    if (limit.remaining > 0) {
      return req();
    }

    // Appboy reset header is in UTC epoch sec.
    // Date.now() returns the time in milliseconds.
    // We divide by 1000 to have the same units.
    var now = Date.now() / 1000;
    if (now >= limit.reset) {
      return req();
    }

    err = new Error('too many requests')
    err.status = 429;
    fn(err);
  });
};
