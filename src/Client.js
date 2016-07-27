import request from 'request'

export function clientPost({ username, password, body, url }) {
  return new Promise((resolve, reject) => {
    request.post ({
      url: url,
      json: body
    }, function(error, response, body){
      if(error) {
        reject(error);
      } else {
        console.log("POST succeeded.");
        resolve(body);
      }
    })
  })
}

export function getThenPost({ username, password, query, url, sendImmediately, postUrl }) {
  return new Promise((resolve, reject) => {

    request({
      url: url, //URL to hit
      qs: query, //Query string data
      method: 'GET', //Specify the method
      'auth': {
        'user': username,
        'pass': password,
        'sendImmediately': sendImmediately
      }
    }, function(error, response, getResponseBody){
      if ([200,201,202].indexOf(response.statusCode) == -1 || error) {
        console.log("GET failed.");
        // TODO: construct a useful error message, request returns a blank
        // error when the server responds, and the response object is massive
        // and unserializable.
        reject(error);
      } else {
        console.log("GET succeeded.");
        request.post ({
          url: postUrl,
          json: JSON.parse(getResponseBody)
        }, function(error, response, postResponseBody){
          if(error) {
            reject(error);
          } else {
            console.log("POST succeeded.");
            resolve(getResponseBody);
          }
        })
      }
    });
  })
}
