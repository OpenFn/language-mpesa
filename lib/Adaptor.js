'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.alterState = exports.sourceValue = exports.fields = exports.field = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.registerListener = registerListener;

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

var _jshashes = require('jshashes');

var _jshashes2 = _interopRequireDefault(_jshashes);

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
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
  };
}
// #############################################################
// TODO: Move this into the credential setup page on OpenFn/core
// #############################################################
function registerListener() {
  return function (state) {
    var _state$configuration = state.configuration,
        spid = _state$configuration.spid,
        password = _state$configuration.password,
        serviceId = _state$configuration.serviceId,
        shortCode = _state$configuration.shortCode,
        listenerUrl = _state$configuration.listenerUrl,
        mpesaUrl = _state$configuration.mpesaUrl;


    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }

    var date = new Date();
    // Ugly way of getting the YYYYMMDDHHmmSS stamp...
    var timeStamp = date.toISOString().replace(/[.,\/#!TZ$%\^&\*;:{}=\-_`~()]/g, '').slice(0, 14);

    console.log('SPID: ' + spid);
    console.log('Password: ' + password);
    console.log('TimeStamp: ' + timeStamp);
    var authString = spid + password + timeStamp;
    console.log('Pre-encryption auth string: ' + authString);

    // new SHA256 instance and base64 string encoding
    var SHA256 = new _jshashes2.default.SHA256();
    var crypted = SHA256.hex(authString);
    // output to console
    console.log('SHA256 crypted auth: ' + crypted);

    var base64crypted = new Buffer(crypted).toString('base64');
    console.log('base64 of the crypted auth: ' + base64crypted);

    // const send = false;
    var send = true;

    var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:req="http://api-v1.gen.mm.vodafone.com/mminterface/request">\n        <soapenv:Header>\n            <tns:RequestSOAPHeader xmlns:tns="http://www.huawei.com/schema/osg/common/v2_1">\n                <tns:spId>' + spid + '</tns:spId>\n                <tns:spPassword>' + base64crypted + '</tns:spPassword>\n                <tns:timeStamp>' + timeStamp + '</tns:timeStamp>\n                <tns:serviceId>' + serviceId + '</tns:serviceId>\n            </tns:RequestSOAPHeader>\n        </soapenv:Header>\n        <soapenv:Body>\n            <req:RequestMsg>\n                <![CDATA[<?xml version="1.0" encoding="UTF-8"?>\n                <request xmlns="http://api-v1.gen.mm.vodafone.com/mminterface/request">\n                <Transaction>\n                <CommandID>RegisterURL</CommandID>\n                <OriginatorConversationID>Reg-266-1126</OriginatorConversationID>\n                every new request\n                <Parameters>\n                <Parameter>\n                <Key>ResponseType</Key>\n                <Value>Completed</Value>\n                </Parameter>\n                </Parameters>\n                <ReferenceData>\n                <ReferenceItem>\n                <Key>ValidationURL</Key>\n                <Value>http://10.66.49.201:8099/mock%3C/Value%3E</Value>\n                </ReferenceItem>\n                <ReferenceItem>\n                <Key>ConfirmationURL</Key>\n                <Value>' + listenerUrl + '</Value>\n                </ReferenceItem>\n                </ReferenceData>\n                </Transaction>\n                <Identity>\n                <Caller>\n                <CallerType>0</CallerType>\n                <ThirdPartyID/>\n                <Password/>\n                <CheckSum/>\n                <ResultURL/>\n                </Caller>\n                <Initiator>\n                <IdentifierType>1</IdentifierType>\n                <Identifier/>\n                <SecurityCredential/>\n                <ShortCode/>\n                </Initiator>\n                <PrimaryParty>\n                <IdentifierType>1</IdentifierType>\n                <Identifier/>\n                <ShortCode>' + shortCode + '</ShortCode>\n                </PrimaryParty>\n                </Identity>\n                <KeyOwner>1</KeyOwner>\n                </request>]]>\n            </req:RequestMsg>\n        </soapenv:Body>\n    </soapenv:Envelope>';

    function assembleError(_ref) {
      var response = _ref.response,
          error = _ref.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    if (send) {
      return new Promise(function (resolve, reject) {
        console.log('Request body:');
        console.log('\n' + JSON.stringify(body, null, 4) + '\n');
        _request2.default.post({
          url: mpesaUrl,
          body: body
        }, function (error, response, body) {
          error = assembleError({ error: error, response: response });
          if (error) {
            reject(error);
            console.log(response);
          } else {
            console.log('Printing response...\n');
            console.log(JSON.stringify(response, null, 4) + '\n');
            console.log('POST succeeded.');
            resolve(body);
          }
        });
      }).then(function (data) {
        var nextState = _extends({}, state, { response: { body: data } });
        return nextState;
      });
    }
  };
}
