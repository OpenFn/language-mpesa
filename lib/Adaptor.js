'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.alterState = exports.sourceValue = exports.fields = exports.field = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.fetch = fetch;
exports.fetchWithErrors = fetchWithErrors;
exports.post = post;
exports.postData = postData;
exports.get = get;

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

var _Client = require('./Client');

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _url = require('url');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
  };
}

/**
 * Make a GET request and POST it somewhere else
 * @example
 * execute(
 *   fetch(params)
 * )(state)
 * @constructor
 * @param {object} params - data to make the fetch
 * @returns {Operation}
 */
function fetch(params) {

  return function (state) {
    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state);

    var getEndpoint = _expandReferences.getEndpoint;
    var query = _expandReferences.query;
    var postUrl = _expandReferences.postUrl;
    var _state$configuration = state.configuration;
    var username = _state$configuration.username;
    var password = _state$configuration.password;
    var baseUrl = _state$configuration.baseUrl;
    var authType = _state$configuration.authType;


    var sendImmediately = authType == 'digest' ? false : true;

    var url = (0, _url.resolve)(baseUrl + '/', getEndpoint);

    console.log("Fetching data from URL: " + url);
    console.log("Applying query: " + JSON.stringify(query));

    return (0, _Client.getThenPost)({ username: username, password: password, query: query, url: url, sendImmediately: sendImmediately, postUrl: postUrl }).then(function (response) {
      console.log("Success:", response);
      var result = (typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' ? response : JSON.parse(response);
      return _extends({}, state, { references: [result].concat(_toConsumableArray(state.references)) });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
}

/**
 * Make a GET request and POST the response somewhere else without failing.
 */
function fetchWithErrors(params) {

  return function (state) {
    var _expandReferences2 = (0, _languageCommon.expandReferences)(params)(state);

    var getEndpoint = _expandReferences2.getEndpoint;
    var query = _expandReferences2.query;
    var externalId = _expandReferences2.externalId;
    var postUrl = _expandReferences2.postUrl;
    var _state$configuration2 = state.configuration;
    var username = _state$configuration2.username;
    var password = _state$configuration2.password;
    var baseUrl = _state$configuration2.baseUrl;
    var authType = _state$configuration2.authType;


    var sendImmediately = authType == 'digest' ? false : true;

    var url = (0, _url.resolve)(baseUrl + '/', getEndpoint);

    console.log("Performing an error-less GET on URL: " + url);
    console.log("Applying query: " + JSON.stringify(query));

    function assembleError(_ref) {
      var response = _ref.response;
      var error = _ref.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    return new Promise(function (resolve, reject) {

      (0, _request2.default)({
        url: url, //URL to hit
        qs: query, //Query string data
        method: 'GET', //Specify the method
        auth: {
          'user': username,
          'pass': password,
          'sendImmediately': sendImmediately
        }
      }, function (error, response, body) {
        var taggedResponse = {
          response: response,
          externalId: externalId
        };
        console.log(taggedResponse);
        _request2.default.post({
          url: postUrl,
          json: taggedResponse
        }, function (error, response, postResponseBody) {
          error = assembleError({ error: error, response: response });
          if (error) {
            console.error("POST failed.");
            reject(error);
          } else {
            console.log("POST succeeded.");
            resolve(body);
          }
        });
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      return nextState;
    });
  };
}

/**
 * Make a POST request
 * @example
 * execute(
 *   post(params)
 * )(state)
 * @constructor
 * @param {object} params - data to make the POST
 * @returns {Operation}
 */
function post(url, _ref2) {
  var body = _ref2.body;
  var callback = _ref2.callback;
  var headers = _ref2.headers;


  return function (state) {

    return new Promise(function (resolve, reject) {
      _request2.default.post({
        url: url,
        json: body,
        headers: headers
      }, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          console.log("POST succeeded.");
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
}

/*
* Make a POST request using existing data from another POST
*/

function postData(params) {

  return function (state) {

    function assembleError(_ref3) {
      var response = _ref3.response;
      var error = _ref3.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    var _expandReferences3 = (0, _languageCommon.expandReferences)(params)(state);

    var url = _expandReferences3.url;
    var body = _expandReferences3.body;
    var headers = _expandReferences3.headers;


    return new Promise(function (resolve, reject) {
      console.log("Request body:");
      console.log("\n" + JSON.stringify(body, null, 4) + "\n");
      _request2.default.post({
        url: url,
        json: body,
        headers: headers
      }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          reject(error);
          console.log(response);
        } else {
          console.log("Printing response...\n");
          console.log(JSON.stringify(response, null, 4) + "\n");
          console.log("POST succeeded.");
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      return nextState;
    });
  };
}

/**
 * Make a GET request
 * @example
 * execute(
 *   get("my/endpoint", {
 *     callback: function(data, state) {
 *       return state;
 *     }
 *   })
 * )(state)
 * @constructor
 * @param {string} url - Path to resource
 * @param {object} params - callback and query parameters
 * @returns {Operation}
 */
function get(path, _ref4) {
  var query = _ref4.query;
  var callback = _ref4.callback;

  function assembleError(_ref5) {
    var response = _ref5.response;
    var error = _ref5.error;

    if ([200, 201, 202].indexOf(response.statusCode) > -1) return false;
    if (error) return error;

    return new Error('Server responded with ' + response.statusCode);
  }

  return function (state) {
    var _state$configuration3 = state.configuration;
    var username = _state$configuration3.username;
    var password = _state$configuration3.password;
    var baseUrl = _state$configuration3.baseUrl;
    var authType = _state$configuration3.authType;

    var _expandReferences4 = (0, _languageCommon.expandReferences)({ query: query })(state);

    var qs = _expandReferences4.query;


    var sendImmediately = authType != 'digest';

    var url = (0, _url.resolve)(baseUrl + '/', path);

    return new Promise(function (resolve, reject) {

      (0, _request2.default)({
        url: url, //URL to hit
        qs: qs, //Query string data
        method: 'GET', //Specify the method
        auth: {
          'user': username,
          'pass': password,
          'sendImmediately': sendImmediately
        }
      }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(body));
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
}
