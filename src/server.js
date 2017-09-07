const http = require('http');
const htmlHandler = require('./htmlResponses.js');
const mediaHandler = require('./mediaResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  console.log(request.url);

  switch (request.url) {
    case '/':
      htmlHandler.getIndex(request, response);
      break;
    case '/party':
      mediaHandler.getParty(request, response, '../client/party.mp4', 'video/mp4');
      break;
    case '/page2':
      mediaHandler.getParty(request, response, '../client/bling.mp3', 'audio/mpeg');
      break;
    default:
      htmlHandler.getIndex(request, response);
      break;
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 129.21.141.194: ${port}`);
