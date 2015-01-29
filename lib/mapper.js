var snake = require('to-snake-case');

/**
 * Map identify.
 *
 * @param {Identify} msg
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.identify = function(msg, settings){
  var traits = msg.proxy('traits');
  delete traits.id;
  var mapped = {};
  mapped.external_id = msg.userId();
  Object.keys(traits).forEach(function(key){
    mapped[snake(key)] = traits[key];
  });
  return {
    app_group_id: settings.appGroupId,
    attributes: [mapped]
  }
};

/**
 * Map track
 *
 * @param {Track} track
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.track = function(msg, settings){
  return {
    app_group_id: settings.appGroupId,
    events: [{
      external_id: msg.userId(),
      time: msg.timestamp(),
      name: msg.event(),
      properties: msg.properties()
    }]
  };
};

/**
 * Map page
 *
 * @param {Page} page
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.page = function(msg, settings){
  var properties = msg.properties();
  delete properties.name;
  return {
    app_group_id: settings.appGroupId,
    events: [{
      external_id: msg.userId(),
      time: msg.timestamp(),
      name: msg.name(),
      properties: properties
    }]
  };
};

/**
 * Map group
 *
 * @param {Group} group
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.group = function(msg, settings){
  var groupIdKey = "ab_segment_group_" + msg.groupId();
  var attributes = {
    external_id: msg.userId()
  };
  attributes[groupIdKey] = true;
  return {
    app_group_id: settings.appGroupId,
    attributes: [attributes]
  }
};
