import { execute as commonExecute, expandReferences } from 'language-common';
import request from 'request';
import { resolve as resolveUrl } from 'url';
import Hashes from 'jshashes';

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
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state })
  };

}
// #############################################################
// TODO: Move this into the credential setup page on OpenFn/core
// #############################################################
export function registerListener(params) {

  // sample string
  var str = 'This is a sample text!'
  // new SHA1 instance and base64 string encoding
  var SHA256 = new Hashes.SHA256().b64(str)
  // output to console
  console.log('SHA256: ' + SHA256)

};

/*
* Make a POST request using existing data from another POST
*/
export function postData(params) {

  return state => {

    function assembleError({ response, error }) {
      if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    }

    const { url, body, headers } = expandReferences(params)(state);

    return new Promise((resolve, reject) => {
      console.log("Request body:");
      console.log("\n" + JSON.stringify(body, null, 4) + "\n");
      request.post ({
        url: url,
        json: body,
        headers
      }, function(error, response, body){
        error = assembleError({error, response})
        if(error) {
          reject(error);
          console.log(response);
        } else {
          console.log("Printing response...\n");
          console.log(JSON.stringify(response, null, 4) + "\n");
          console.log("POST succeeded.");
          resolve(body);
        }
      })
    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      return nextState;
    })

  }

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
export function get(path, {query, callback}) {
  function assembleError({ response, error }) {
    if ([200,201,202].indexOf(response.statusCode) > -1) return false;
    if (error) return error;

    return new Error(`Server responded with ${response.statusCode}`)
  }

  return state => {

    const { username, password, baseUrl, authType } = state.configuration;
    const { query: qs } = expandReferences({query})(state);

    const sendImmediately = (authType != 'digest');

    const url = resolveUrl(baseUrl + '/', path)

    return new Promise((resolve, reject) => {

      request({
        url,      //URL to hit
        qs,     //Query string data
        method: 'GET', //Specify the method
        auth: {
          'user': username,
          'pass': password,
          'sendImmediately': sendImmediately
        }
      }, function(error, response, body){
        error = assembleError({error, response})
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(body))
        }
      });

    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      if (callback) return callback(nextState);
      return nextState;
    })
  }
}

export {
  field, fields, sourceValue, alterState, each,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
