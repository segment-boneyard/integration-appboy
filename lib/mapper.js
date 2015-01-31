
/**
 * Map identify.
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.identify = function(identify, settings){
  var traits = formatTraits(identify);
  return {
    app_group_id: settings.appGroupId,
    attributes: [traits]
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
    app_group_id: settings.appGroupId
  };

  var event = track.event();
  if (event && event.match(/completed ?order/i)) {
    var purchases = [];
    var products = track.products();
    products.forEach(function(product){
      purchases.push({
        external_id: track.userId(),
        product_id: product.id,
        currency: track.proxy('properties.currency') || "USD",
        price: product.price,
        quantity: product.quantity,
        time: track.timestamp()
      });
    });
    result.purchases = purchases;

  } else {
    result.events = [
      {
        external_id: track.userId(),
        time: track.timestamp(),
        name: track.event(),
        properties: track.properties()
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
  var groupIdKey = "ab_segment_group_" + group.groupId();
  var attributes = {
    external_id: group.userId()
  };
  attributes[groupIdKey] = true;
  return {
    app_group_id: settings.appGroupId,
    attributes: [attributes]
  };
};

/**
 * Aliases of Segment's special traits for Appboy's recognized user profile fields
 *
 */

var traitAliases = {
  firstName: 'first_name',
  lastName: 'last_name',
  birthday: 'dob'
};

/**
 * Format the traits from the identify
 *
 * @param {Identify} identify
 * @return {Object}
 * @api private
 */

function formatTraits(identify){
  var traits = identify.traits(traitAliases) || {};

  // Delete any Segment trait names since they have been mapped to Appboy user profile fields names
  Object.keys(traitAliases).forEach(function(key){
    delete traits[key];
  });

  delete traits.id;
  delete traits.name;

  if (traits.dob) {
    traits.dob = formatDate(traits.dob);
  }
  if (traits.gender && traits.gender != 'M' && traits.gender != 'F') {
    delete traits.gender;
  }

  traits.external_id = identify.userId();

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