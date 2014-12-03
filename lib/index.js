
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `sendwithus`
 *
 * https://www.sendwithus.com/docs/segment
 */

var Sendwithus = module.exports = integration('Sendwithus')
  .channels(['server'])
  .endpoint('https://segment.sendwithus.com/event')
  .ensure('settings.apiKey')
  .ensure('settings.integrationId')
  .mapper(mapper)
  .retries(10);

/**
 * Identify.
 *
 * https://www.sendwithus.com/docs/segment
 *
 * @param {Object} payload
 * @param {Function} fn
 * @api public
 */

Sendwithus.prototype.identify = function(payload, fn){
  var url = '/' + this.settings.integrationId;

  return this
    .post(url)
    .send(payload)
    .auth(this.settings.apiKey, '')
    .end(this.handle(fn));
};

/**
 * Track.
 *
 * https://www.sendwithus.com/docs/segment
 *
 * @param {Object} payload
 * @param {Function} fn
 * @api public
 */

Sendwithus.prototype.track = function(payload, fn){
  var url = '/' + this.settings.integrationId;

  return this
    .post(url)
    .send(payload)
    .auth(this.settings.apiKey, '')
    .end(this.handle(fn));
};
