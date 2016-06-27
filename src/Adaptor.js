import { execute as commonExecute, expandReferences } from 'language-common';
import { post } from './Client';
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
 *   get(data)
 * )(state)
 * @constructor
 * @param {object} getParams - params for the GET request
 * @returns {Operation}
 */
export function get(getParams) {

  return state => {
    const body = expandReferences(getParams)(state);

    const { username, password, apiUrl } = state.configuration;

    const url = resolveUrl(apiUrl + '/', body.endpoint)

    console.log("Making GET to url:");
    console.log(url)
    console.log("With params:")
    console.log(body.params)

    return post({ username, password, body, url })
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
