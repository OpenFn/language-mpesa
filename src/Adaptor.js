import { execute as commonExecute } from 'language-common';
import request from 'request';

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
    data: null,
  };

  return state => {
    return commonExecute(getToken, ...operations)({
      ...initialState,
      ...state,
    });
  };
}

function assembleError({ response, error }) {
  if (response && [200, 201, 202].indexOf(response.statusCode) > -1)
    return false;
  if (error) return error;
  return new Error(`Server responded with ${response.statusCode}`);
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
  const { consumerKey, consumerSecret, hostUrl } = state.configuration;
  const url = `${hostUrl}/oauth/v1/generate`;
  const qs = { grant_type: 'client_credentials' };
  const auth = { user: consumerKey, pass: consumerSecret };

  return new Promise((resolve, reject) => {
    request.get({ url, auth, qs }, (error, response, body) => {
      error = assembleError({ error, response });
      if (error) {
        reject(error);
        console.log(response);
      } else {
        console.log('Authentication succeeded.');
        console.log(JSON.parse(body));
        resolve(JSON.parse(body));
      }
    });
  }).then(data => {
    const nextState = {
      ...state,
      configuration: { ...state.configuration, oAuth: data },
    };
    return nextState;
  });
}

export function requestPayment() {
  console.log('Coming soon...');
  return state => {
    return state;
  };
}

// #############################################################################
// NOTE: This could be done outside platform. Maybe it's CLI only as part of
// project setup, or maybe it's done during credential creation?
// #############################################################################
export function registerUrl(notificationUrl) {
  return state => {
    const { hostUrl, oAuth, shortCode } = state.configuration;

    const url = `${hostUrl}/mpesa/c2b/v1/registerurl`;
    const auth = { bearer: oAuth.access_token };
    const json = {
      ShortCode: shortCode,
      ResponseType: 'Completed',
      ConfirmationURL: notificationUrl,
      ValidationURL: notificationUrl,
    };
    
    return new Promise((resolve, reject) => {
      request.post({ url, auth, json }, (error, response, body) => {
        error = assembleError({ error, response });
        if (error) {
          reject(error);
          console.log(body);
        } else {
          console.log(`Registered \"${notificationUrl}\" as listener URL for organization shortcode ${shortCode}.`);
          console.log(JSON.stringify(response, null, 4) + '\n');
          resolve(body);
        }
      });
    }).then(data => {
      const nextState = { ...state, response: { body: data } };
      return nextState;
    });
  };
}

export {
  field,
  fields,
  sourceValue,
  alterState,
  each,
  merge,
  dataPath,
  dataValue,
  lastReferenceValue,
} from 'language-common';
