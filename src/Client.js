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

  function assembleError({ response, error }) {
    if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
    if (error) return error;
    return new Error(`Server responded with ${response.statusCode}`)
  }

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
      error = assembleError({error, response})
      if (error) {
        console.error("GET failed.")
        console.log(response)
        reject(error);
      } else {
        console.log("GET succeeded.");
        console.log(response)
        console.log(getResponseBody)
        request.post ({
          url: postUrl,
          json: JSON.parse(getResponseBody)
        }, function(error, response, postResponseBody){
          error = assembleError({error, response})
          if (error) {
            console.error("POST failed.")
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
