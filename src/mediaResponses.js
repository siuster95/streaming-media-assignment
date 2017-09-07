const fs = require('fs');
const path = require('path');

const headerAndstream = (request, response, objectin, file, mediain) => {
  // determine how big of a chunk we are sending back to the browser. 
  // we will need to set a few header. 
  // Content-Range tells how much of the 
  // total is going back, accept-range is what type of data, 
  // Content-Length tells browser how big this chunk is, Content-Type tell the encoding type 
  const start = objectin.start;
  const end = objectin.end;
  const total = objectin.total;
  response.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${total}`,
    'Accept-Range': 'bytes',
    'Content-Length': objectin.chunksize,
    'Content-Type': mediain,
  });
  // we are now creating a stream with the start and 
  // end bytes and sending this back to the browser

  const stream = fs.createReadStream(file, { start, end });
  stream.on('open', () => {
    stream.pipe(response);
  });

  stream.on('error', (streamErr) => {
    response.end(streamErr);
  });

  return stream;
};


const getInfofromStats = (request, response, statsin, filein, mediaType) => {
  // get the byte range from the header, which is always sent to ask for frames to add to buffers 
  let range = request.headers.range;
  if (!range) {
    range = 'bytes=0-';
  }
  // convert that range into a beginning and end number from the  string
  const position = range.replace(/bytes=/, '').split('-');

  let start = parseInt(position[0], 10);

  const total = statsin.size;
  // find end at position 1 and parse or set to end of file
  const end = position[1] ? parseInt(position[1], 10) : total - 1;
  // if start range is greater than end, reset start range
  if (start > end) {
    start = end - 1;
  }

  const chunksize = (end - start) + 1;
  const objectout = {
    start,
    end,
    total,
    chunksize,
  };
  return headerAndstream(request, response, objectout, filein, mediaType);
};


const getStream = (request, response, link, mediaType) => {
  const file = path.resolve(__dirname, link);

  // creates a file object based on directory and path from directory to file'
  // using the file object, load in the file asynchronously and call a function with err and stats 
  fs.stat(file, (err, stats) => {
    // err, if it is not null, means that it is an error, stat provides staticstic about the file 
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    return getInfofromStats(request, response, stats, file, mediaType);
  });
};


module.exports.getStream = getStream;

