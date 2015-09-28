var httpRequest = require('request-promise');

  var options = {
    url: 'http://localhost:3000/',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.parse('{"one" : "two"}')
  };  

  console.log(httpRequest.post(options));