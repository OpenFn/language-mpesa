import { execute as commonExecute, expandReferences } from 'language-common';
import { getThenPost } from './Client';
import { resolve as resolveUrl } from 'url';

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for h2tp.
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

/**
 * Make a GET request
 * @example
 * execute(
 *   fetch(params)
 * )(state)
 * @constructor
 * @param {object} params - data to make the fetch
 * @returns {Operation}
 */
export function fetch(params) {

  return state => {

    const { endpoint, query, returnUrl } = expandReferences(params)(state);

    const { username, password, baseUrl, authType } = state.configuration;

    var sendImmediately = authType == 'digest' ? false : true;

    const url = resolveUrl(baseUrl + '/', endpoint)

    // TODO: @Stuartc, what's the best way to set the inbox of the user?

    console.log("Fetching data from URL: " + url);
    console.log("Applying query: " + JSON.stringify(query))

    return getThenPost({ username, password, query, url, sendImmediately, returnUrl })
    .then((result) => {
      console.log("Success:", result);
      return { ...state, references: [ result, ...state.references ] }
    })

  }
}

export {
  field, fields, sourceValue,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
