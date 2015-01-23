
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `sendwithus`
 *
 * https://documentation.appboy.com
 */

var Appboy = module.exports = integration('Appboy')
  .channels(['server'])
  .endpoint('https://api.appboy.com/users/track')
  .ensure('settings.apiKey')
  .mapper(mapper)
  .retries(10);

/**
 * Identify.
 *
 * https://documentation.appboy.com
 *
 * @param {Object} payload
 * @param {Function} fn
 * @api public
 */

Appboy.prototype.identify = function(payload, fn){

  return this
    .post(url)
    .send(payload)
    .auth(this.settings.apiKey, '')
    .end(this.handle(fn));
};

/**
 * Track.
 *
 * https://documentation.appboy.com
 *
 * @param {Object} payload
 * @param {Function} fn
 * @api public
 */

Appboy.prototype.track = function(payload, fn){

  return this
    .post(url)
    .send(payload)
    .auth(this.settings.apiKey, '')
    .end(this.handle(fn));
};
