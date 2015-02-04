
/**
 * Map identify.
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.identify = function(identify, settings){
  var traits = formatTraits(identify, settings);
  return {
    app_group_id: settings.appGroupId,
    attributes: [traits],
    src: "segment"
  };
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
  var result = {
    app_group_id: settings.appGroupId,
    src: "segment"
  };

  var event = track.event();
  // if the event is "Completed Order" from ECommerce API, then track as purchases instead of event
  if (event && event.match(/completed ?order/i)) {
    var purchases = [];
    var products = track.products();

    // add purchase for each product
    products.forEach(function(product){
      purchases.push({
        external_id: track.userId(),
        product_id: product.id,
        currency: track.proxy('properties.currency') || "USD",
        price: product.price,
        quantity: product.quantity || 1,
        time: track.timestamp(),
        _update_existing_only: settings.updateExistingOnly
      });
    });
    result.purchases = purchases;

  // otherwise, track the event
  } else {
    result.events = [
      {
        external_id: track.userId(),
        time: track.timestamp(),
        name: track.event(),
        properties: track.properties(),
        _update_existing_only: settings.updateExistingOnly
      }
    ];
  }

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
  // set basic attributes
  var attributes = {
    external_id: group.userId(),
    _update_existing_only: settings.updateExistingOnly
  };

  // add group id as custom attribute key
  var groupIdKey = "ab_segment_group_" + group.groupId();
  attributes[groupIdKey] = true;

  return {
    app_group_id: settings.appGroupId,
    attributes: [attributes],
    src: "segment"
  };
};

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
  if (traits.gender && traits.gender != 'M' && traits.gender != 'F') {
    delete traits.gender;
  }

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