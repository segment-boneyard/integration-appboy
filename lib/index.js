
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
  .endpoint('https://sondheim.appboy.com/users/track')
  .ensure('settings.appGroupId')
  .ensure('message.userId')
  .mapToTrack(['page'])
  .retries(2);

/**
 * Identify.
 *
 * https://documentation.appboy.com
 *
 * @param {Identify} identify
 * @param {Function} fn
 * @api public
 */

Appboy.prototype.identify = function(identify, fn){
  var payload = mapper.identify(identify, this.settings);

  return this
    .post()
    .send(payload)
    .auth(this.settings.appGroupId)
    .end(this.handle(fn));
};

/**
 * Track.
 *
 * https://documentation.appboy.com
 *
 * @param {Track} track
 * @param {Function} fn
 * @api public
 */

Appboy.prototype.track = function(track, fn){
  var payload = mapper.track(track, this.settings);

  return this
    .post()
    .send(payload)
    .auth(this.settings.appGroupId)
    .end(this.handle(fn));
};

/**
 * Group.
 *
 * https://documentation.appboy.com
 *
 * @param {Group} group
 * @param {Function} fn
 * @api public
 */

Appboy.prototype.group = function(group, fn){
  var payload = mapper.group(group, this.settings);

  return this
      .post()
      .send(payload)
      .auth(this.settings.appGroupId)
      .end(this.handle(fn));
};
