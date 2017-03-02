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

var _url = require('url');

var _jshashes = require('jshashes');

var _jshashes2 = _interopRequireDefault(_jshashes);

var _js2xmlparser = require('js2xmlparser');

var _js2xmlparser2 = _interopRequireDefault(_js2xmlparser);

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
    var _state$configuration = state.configuration;
    var spid = _state$configuration.spid;
    var password = _state$configuration.password;
    var serviceId = _state$configuration.serviceId;
    var shortCode = _state$configuration.shortCode;
    var listenerUrl = _state$configuration.listenerUrl;
    var mpesaUrl = _state$configuration.mpesaUrl;


    var timeStamp = Date.now();

    // new SHA1 instance and base64 string encoding
    var SHA256 = new _jshashes2.default.SHA256().b64(spid + password + timeStamp);
    // output to console
    console.log('SHA256: ' + SHA256);

    var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:req="http://api-v1.gen.mm.vodafone.com/mminterface/request">\n        <soapenv:Header>\n            <tns:RequestSOAPHeader xmlns:tns="http://www.huawei.com/schema/osg/common/v2_1">\n                <tns:spId>' + spid + '</tns:spId>\n                <tns:spPassword>' + SHA256 + '</tns:spPassword>\n                <tns:timeStamp>' + timeStamp + '</tns:timeStamp>\n                <tns:serviceId>' + serviceId + '</tns:serviceId>\n            </tns:RequestSOAPHeader>\n        </soapenv:Header>\n        <soapenv:Body>\n            <req:RequestMsg>\n                <![CDATA[<?xml version="1.0" encoding="UTF-8"?>\n                <request xmlns="http://api-v1.gen.mm.vodafone.com/mminterface/request">\n                <Transaction>\n                <CommandID>RegisterURL</CommandID> //Command ID for registering URL\n                <OriginatorConversationID>Reg-266-1126</OriginatorConversationID> //always changes on\n                every new request\n                <Parameters>\n                <Parameter>\n                <Key>ResponseType</Key> //the default response type\n                <Value>Completed</Value> //You can choose between ‘Completed’ and ‘Cancelled’\n                </Parameter>\n                </Parameters>\n                <ReferenceData>\n                <ReferenceItem>\n                <Key>ValidationURL</Key>\n                <Value></Value> //YOUR VALIDATION URL WITH PORT -->\n                </ReferenceItem>\n                <ReferenceItem>\n                <Key>ConfirmationURL</Key>\n                <Value>' + listenerUrl + '</Value> //YOUR CONFIRMATION URL WITH PORT\n                </ReferenceItem>\n                </ReferenceData>\n                </Transaction>\n                <Identity>\n                <Caller>\n                <CallerType>0</CallerType> //Constant variable,remains the same.\n                <ThirdPartyID/>\n                <Password/>\n                <CheckSum/>\n                <ResultURL/>\n                </Caller>\n                <Initiator>\n                <IdentifierType>1</IdentifierType> //Constant variable,remains the same\n                <Identifier/>\n                <SecurityCredential/>\n                <ShortCode/>\n                </Initiator>\n                <PrimaryParty>\n                <IdentifierType>1</IdentifierType> //Constant variable, remains the same\n                <Identifier/>\n                <ShortCode>' + shortCode + '</ShortCode> //your short code\n                </PrimaryParty>\n                </Identity>\n                <KeyOwner>1</KeyOwner> //Constant variable, remains the same.\n                </request>]]>\n            </req:RequestMsg>\n        </soapenv:Body>\n    </soapenv:Envelope>';

    var noBreakBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:req="http://api-v1.gen.mm.vodafone.com/mminterface/request"><soapenv:Header><tns:RequestSOAPHeader xmlns:tns="http://www.huawei.com/schema/osg/common/v2_1"><tns:spId>' + spid + '</tns:spId><tns:spPassword>' + SHA256 + '</tns:spPassword><tns:timeStamp>' + timeStamp + '</tns:timeStamp><tns:serviceId>' + serviceId + '</tns:serviceId></tns:RequestSOAPHeader></soapenv:Header><soapenv:Body><req:RequestMsg><![CDATA[<?xml version="1.0" encoding="UTF-8"?><request xmlns="http://api-v1.gen.mm.vodafone.com/mminterface/request"><Transaction><CommandID>RegisterURL</CommandID><OriginatorConversationID>Reg-266-1126</OriginatorConversationID><Parameters><Parameter><Key>ResponseType</Key><Value>Completed</Value></Parameter></Parameters><ReferenceData><ReferenceItem><Key>ValidationURL</Key><Value></Value></ReferenceItem><ReferenceItem><Key>ConfirmationURL</Key><Value>' + listenerUrl + '</Value></ReferenceItem></ReferenceData></Transaction><Identity><Caller><CallerType>0</CallerType><ThirdPartyID/><Password/><CheckSum/><ResultURL/></Caller><Initiator><IdentifierType>1</IdentifierType><Identifier/><SecurityCredential/><ShortCode/></Initiator><PrimaryParty><IdentifierType>1</IdentifierType><Identifier/><ShortCode>' + shortCode + '</ShortCode></PrimaryParty></Identity><KeyOwner>1</KeyOwner></request>]]></req:RequestMsg></soapenv:Body></soapenv:Envelope>';

    function assembleError(_ref) {
      var response = _ref.response;
      var error = _ref.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    return new Promise(function (resolve, reject) {
      console.log("Request body:");
      console.log("\n" + JSON.stringify(noBreakBody, null, 4) + "\n");
      _request2.default.post({
        url: mpesaUrl,
        body: noBreakBody
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
};
