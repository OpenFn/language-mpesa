'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getThenPost = getThenPost;

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getThenPost(_ref) {
  var username = _ref.username;
  var password = _ref.password;
  var query = _ref.query;
  var url = _ref.url;
  var sendImmediately = _ref.sendImmediately;
  var postUrl = _ref.postUrl;

  return new Promise(function (resolve, reject) {

    (0, _request2.default)({
      url: url, //URL to hit
      qs: query, //Query string data
      method: 'GET', //Specify the method
      'auth': {
        'user': username,
        'pass': password,
        'sendImmediately': sendImmediately
      }
    }, function (error, response, body) {
      if (error) {
        console.log(error);
      } else {
        _request2.default.post({
          url: postUrl,
          json: JSON.parse(body)
        }, function (error, response, body) {
          if (error) {
            console.log(error);
          } else {
            console.log("Fido fetched successfully.");
            console.log("*wags tail*");
          }
        });
      }
    });
  });
}
