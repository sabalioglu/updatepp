const path = require('path');
const fs = require('fs');

// Import the Expo Router server handler
let serverHandler;

try {
  // Try to load the server bundle
  const serverPath = path.join(process.cwd(), 'dist', 'server');
  
  // Look for the main server file - Expo Router typically outputs to different locations
  const possiblePaths = [
    path.join(serverPath, 'index.js'),
    path.join(serverPath, '_expo', 'server.js'),
    path.join(serverPath, 'entry.js')
  ];
  
  for (const serverFile of possiblePaths) {
    if (fs.existsSync(serverFile)) {
      serverHandler = require(serverFile);
      break;
    }
  }
  
  if (!serverHandler) {
    console.error('Could not find server handler in any of the expected locations:', possiblePaths);
  }
} catch (error) {
  console.error('Error loading server handler:', error);
}

exports.handler = async (event, context) => {
  try {
    if (!serverHandler) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'text/html',
        },
        body: `
          <html>
            <body>
              <h1>Server Error</h1>
              <p>Could not load the server handler. Please check the build output.</p>
            </body>
          </html>
        `,
      };
    }

    // Create a mock request object that mimics Node.js http.IncomingMessage
    const mockRequest = {
      method: event.httpMethod,
      url: event.path + (event.queryStringParameters ? '?' + new URLSearchParams(event.queryStringParameters).toString() : ''),
      headers: event.headers || {},
      body: event.body,
      query: event.queryStringParameters || {},
    };

    // Create a mock response object
    let responseBody = '';
    let statusCode = 200;
    let responseHeaders = {
      'Content-Type': 'text/html',
    };

    const mockResponse = {
      statusCode: 200,
      headers: responseHeaders,
      write: (chunk) => {
        responseBody += chunk;
      },
      end: (chunk) => {
        if (chunk) responseBody += chunk;
      },
      setHeader: (name, value) => {
        responseHeaders[name] = value;
      },
      writeHead: (code, headers) => {
        statusCode = code;
        if (headers) {
          Object.assign(responseHeaders, headers);
        }
      },
      getHeader: (name) => {
        return responseHeaders[name];
      },
    };

    // Handle the request with the Expo Router server
    if (typeof serverHandler === 'function') {
      await serverHandler(mockRequest, mockResponse);
    } else if (serverHandler && typeof serverHandler.default === 'function') {
      await serverHandler.default(mockRequest, mockResponse);
    } else if (serverHandler && typeof serverHandler.handler === 'function') {
      await serverHandler.handler(mockRequest, mockResponse);
    } else {
      throw new Error('Server handler is not a function');
    }

    return {
      statusCode: statusCode,
      headers: responseHeaders,
      body: responseBody,
    };

  } catch (error) {
    console.error('Error in Netlify function:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html',
      },
      body: `
        <html>
          <body>
            <h1>Internal Server Error</h1>
            <p>An error occurred while processing your request.</p>
            <pre>${error.message}</pre>
          </body>
        </html>
      `,
    };
  }
};