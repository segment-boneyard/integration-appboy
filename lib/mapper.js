/*
 * Module Depedencies
 */

var Track = require('segmentio-facade').Track;

/**
 * Map identify.
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.identify = function(identify, settings){
  var result = common(settings);

  result.attributes = [formatTraits(identify, settings)];
  return result;
};

/**
 * Map track
 *
 * @param {Track} track
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.track = function(track, settings){
  var result = common(settings);

  result.events = [
    {
      app_id: settings.apiKey || '',
      external_id: track.userId(),
      time: track.timestamp(),
      name: track.event(),
      properties: track.properties(),
      _update_existing_only: settings.updateExistingOnly
    }
  ];
  return result;
};

/**
 * Map page and screen
 *
 * @param {Object} msg
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.page = exports.screen = function(msg, settings) {
  var result = common(settings);
  var newEvent = msg.track(msg.fullName());

  result.events = [
    {
      app_id: settings.apiKey || '',
      external_id: msg.userId(),
      time: msg.timestamp(),
      name: newEvent.event(),
      properties: msg.properties(),
      _update_existing_only: settings.updateExistingOnly
    }
  ];
  return result;
};

/**
* Map 'Order Completed' events from the ECommerce API to track as purchases
*
* @param {Track} track
* @param {Object} settings
* @return {Object}
  * @api private
*/
exports.orderCompleted = function(track, settings){
  var result = common(settings);

  var purchases = [];
  var products = track.products();

  // add purchase for each product
  products.forEach(function(product){
    var item = new Track({ properties: product });
    purchases.push({
      app_id: settings.apiKey || '',
      external_id: track.userId(),
      product_id: item.productId() || item.id(),
      currency: item.currency() || 'USD',
      price: item.price(),
      quantity: item.quantity() || 1,
      time: track.timestamp(),
      _update_existing_only: settings.updateExistingOnly
    });
  });
  result.purchases = purchases;
  return result;
};

/**
 * Map group
 *
 * @param {Group} group
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.group = function(group, settings){
  var result = common(settings);

  // set basic attributes
  var attributes = {
    external_id: group.userId(),
    _update_existing_only: settings.updateExistingOnly
  };

  // add group id as custom attribute key
  var groupIdKey = 'ab_segment_group_' + group.groupId();
  attributes[groupIdKey] = true;

  result.attributes = [attributes];
  return result;
};

/**
 * Common features to all results
 *
 * @param {Object} settings
 * @returns {Object}
 */
function common(settings){
  return {
    app_group_id: settings.appGroupId,
    src: 'segment'
  };
}

/**
 * Aliases of Segment's special traits for Appboy's recognized user profile fields
 *
 */

var traitAliases = {
  firstName: 'first_name',
  lastName: 'last_name',
  birthday: 'dob',
  avatar: 'image_url'
};

/**
 * Formats for the genders that will be correctly parsed by Appboy
 *
 */
var acceptedGenders = ["m", "f", "male", "female", "man", "woman", "other"];

/**
 * Format the traits from the identify
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

function formatTraits(identify, settings){
  var traits = identify.traits(traitAliases) || {};

  // delete any trait names mapped to Appboy user profile fields
  Object.keys(traitAliases).forEach(function(key){
    delete traits[key];
  });

  // extract city and country from address if it exists
  if (traits.address){
    if (traits.address.city){
      traits.home_city = traits.address.city;
    }
    if (traits.address.country){
      traits.country = traits.address.country;
    }
  }

  // remove unnecessary known traits
  delete traits.id;
  delete traits.name;
  delete traits.address;

  // check and/or change format for existing traits
  if (traits.dob) {
    traits.dob = formatDate(traits.dob);
  }
  // only pass on gender if Appboy will recognize it
  traits.gender = getGender(traits.gender);

  // include external_id and _update_existing_only
  traits.external_id = identify.userId();
  traits._update_existing_only = settings.updateExistingOnly;

  return traits;
}

/**
 * Formats a date to YYYY-MM-DD
 *
 * @param {Mixed} date
 * @return {String}
 * @api private
 */
function formatDate(date){
  date = new Date(date);
  if (isNaN(date.getTime())) return;
  return date.toISOString().slice(0,10);
}

/**
 * Gets a gender Appboy can use or returns null
 * @param  {String} gender [description]
 * @return {[type]}        [description]
 */
function getGender(gender){
  if (!gender) return;
  if (typeof gender != 'string') return;
  if (acceptedGenders.indexOf(gender.toLowerCase()) > -1) return gender;
}