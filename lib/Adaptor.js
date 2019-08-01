'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.alterState = exports.sourceValue = exports.fields = exports.field = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.requestPayment = requestPayment;
exports.registerUrl = registerUrl;

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'alterState', {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for http.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  return function (state) {
    return _languageCommon.execute.apply(undefined, [getToken].concat(operations))(_extends({}, initialState, state));
  };
}

function assembleError(_ref) {
  var response = _ref.response,
      error = _ref.error;

  if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
  if (error) return error;
  return new Error('Server responded with ' + response.statusCode);
}

/**
 * Gets an Oauth token for a session.
 * @example
 *  getToken(state)
 * @function
 * @param {State} state - Runtime state.
 * @returns {State}
 */
function getToken(state) {
  var _state$configuration = state.configuration,
      consumerKey = _state$configuration.consumerKey,
      consumerSecret = _state$configuration.consumerSecret,
      hostUrl = _state$configuration.hostUrl;

  var url = hostUrl + '/oauth/v1/generate';
  var qs = { grant_type: 'client_credentials' };
  var auth = { user: consumerKey, pass: consumerSecret };

  return new Promise(function (resolve, reject) {
    _request2.default.get({ url: url, auth: auth, qs: qs }, function (error, response, body) {
      error = assembleError({ error: error, response: response });
      if (error) {
        reject(error);
        console.log(response);
      } else {
        console.log('Authentication succeeded.');
        console.log(JSON.parse(body));
        resolve(JSON.parse(body));
      }
    });
  }).then(function (data) {
    var nextState = _extends({}, state, {
      configuration: _extends({}, state.configuration, { oAuth: data })
    });
    return nextState;
  });
}

function requestPayment() {
  console.log('Coming soon...');
  return function (state) {
    return state;
  };
}

// #############################################################################
// NOTE: This could be done outside platform. Maybe it's CLI only as part of
// project setup, or maybe it's done during credential creation?
// #############################################################################
function registerUrl(notificationUrl) {
  return function (state) {
    var _state$configuration2 = state.configuration,
        hostUrl = _state$configuration2.hostUrl,
        oAuth = _state$configuration2.oAuth,
        shortCode = _state$configuration2.shortCode;


    var url = hostUrl + '/mpesa/c2b/v1/registerurl';
    var auth = { bearer: oAuth.access_token };
    var json = {
      ShortCode: shortCode,
      ResponseType: 'Completed',
      ConfirmationURL: notificationUrl,
      ValidationURL: notificationUrl
    };

    return new Promise(function (resolve, reject) {
      _request2.default.post({ url: url, auth: auth, json: json }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          reject(error);
          console.log(body);
        } else {
          console.log('Registered "' + notificationUrl + '" as listener URL for organization shortcode ' + shortCode + '.');
          console.log(JSON.stringify(response, null, 4) + '\n');
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      return nextState;
    });
  };
}
