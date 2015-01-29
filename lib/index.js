
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
 * @param {Object} payload
 * @param {Function} fn
 * @api public
 */

Appboy.prototype.track = function(payload, fn){

  return this
    .post()
    .send(payload)
    .auth(this.settings.appGroupId)
    .end(this.handle(fn));
};

/**
 * Page.
 *
 * https://documentation.appboy.com
 *
 * @param {Object} payload
 * @param {Function} fn
 * @api public
 */

Appboy.prototype.page = function(payload, fn){

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
 * @param {Object} payload
 * @param {Function} fn
 * @api public
 */

Appboy.prototype.group = function(payload, fn){

  return this
      .post()
      .send(payload)
      .auth(this.settings.appGroupId)
      .end(this.handle(fn));
};
