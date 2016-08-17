
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
  .channels(['server', 'client'])
  .endpoint('https://api.appboy.com/users/track')
  .ensure('settings.appGroupId')
  .ensure('message.userId')
  .mapper(mapper)
  .retries(2);

/**
 * Identify, Track, and Group. All simply use the mapper and forward the data to the same endpoint
 *
 * https://documentation.appboy.com/REST_APIs/User_Data
 *
 * @param {Object} payload
 * @param {Function} fn
 * @api public
 */

Appboy.prototype.identify = Appboy.prototype.track = Appboy.prototype.group = function(payload, fn){
  return this
    .post()
    .send(payload)
    .auth(this.settings.appGroupId)
    .end(this.handle(fn));
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
Appboy.prototype.orderCompleted = function(track, fn){
  var payload = mapper.orderCompleted(track, this.settings);
  return this
    .post()
    .send(payload)
    .auth(this.settings.appGroupId)
    .end(this.handle(fn));
};
