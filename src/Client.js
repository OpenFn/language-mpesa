import request from 'request'

export function getThenPost({ username, password, query, url, sendImmediately, home }) {
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
    }, function(error, response, body){
      if(error) {
        console.log(error);
      } else {
        request.post ({
          url: home,
          json: JSON.parse(body)
        }, function(error, response, body){
          if(error) {
            console.log(error);
          } else {
            console.log("Fido fetched successfully.")
            console.log("*wags tail*")
          }
        })
      }
    });
  })
}
