const path = require('path');
const fs = require('fs');

// Import the Expo Router server handler
let serverHandler;

try {
  // The Expo Router server bundle is in dist/server/_expo/functions
  const serverPath = path.join(process.cwd(), 'dist', 'server', '_expo', 'functions');
  
  // Check if the functions directory exists and load the handler
  if (fs.existsSync(serverPath)) {
    // Load the routes configuration
    const routesPath = path.join(process.cwd(), 'dist', 'server', '_expo', 'routes.json');
    let routes = {};
    
    if (fs.existsSync(routesPath)) {
      routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
    }
    
    // Create a simple handler that serves static files and API routes
    serverHandler = {
      handler: async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = url.pathname;
        
        // Handle API routes
        if (pathname.startsWith('/api/')) {
          const apiPath = pathname.replace('/api/', '');
          const functionPath = path.join(serverPath, 'api', `${apiPath}+api.js`);
          
          if (fs.existsSync(functionPath)) {
            try {
              const apiHandler = require(functionPath);
              const method = req.method.toUpperCase();
              
              if (apiHandler[method]) {
                // Create a proper Request object for the API handler
                const request = new Request(url.toString(), {
                  method: req.method,
                  headers: req.headers,
                  body: req.body ? JSON.stringify(req.body) : undefined,
                });
                
                const response = await apiHandler[method](request);
                const responseText = await response.text();
                
                res.writeHead(response.status, {
                  'Content-Type': response.headers.get('Content-Type') || 'application/json',
                  ...Object.fromEntries(response.headers.entries()),
                });
                res.end(responseText);
                return;
              }
            } catch (error) {
              console.error('Error handling API route:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Internal server error' }));
              return;
            }
          }
        }
        
        // Handle static files and pages
        const clientPath = path.join(process.cwd(), 'dist', 'client');
        const serverStaticPath = path.join(process.cwd(), 'dist', 'server');
        
        // Try to serve from client directory first
        let filePath = path.join(clientPath, pathname === '/' ? 'index.html' : pathname);
        
        // If not found in client, try server directory for HTML pages
        if (!fs.existsSync(filePath)) {
          if (pathname === '/' || pathname === '') {
            filePath = path.join(serverStaticPath, '(tabs)', 'index.html');
          } else if (pathname.startsWith('/(tabs)/')) {
            const pageName = pathname.replace('/(tabs)/', '');
            filePath = path.join(serverStaticPath, '(tabs)', `${pageName}.html`);
          } else {
            // Try direct path in server directory
            filePath = path.join(serverStaticPath, `${pathname.slice(1)}.html`);
          }
        }
        
        // If still not found, serve index.html for SPA routing
        if (!fs.existsSync(filePath)) {
          filePath = path.join(serverStaticPath, '(tabs)', 'index.html');
        }
        
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const ext = path.extname(filePath);
          
          let contentType = 'text/html';
          if (ext === '.js') contentType = 'application/javascript';
          else if (ext === '.css') contentType = 'text/css';
          else if (ext === '.json') contentType = 'application/json';
          
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - Page Not Found</h1>');
        }
      }
    };
  } else {
    console.error('Server functions directory not found:', serverPath);
  }
} catch (error) {
  console.error('Error setting up server handler:', error);
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
              <p>Could not initialize the server handler. Please check the build output.</p>
            </body>
          </html>
        `,
      };
    }

    // Create a mock request object
    const mockRequest = {
      method: event.httpMethod,
      url: event.path + (event.queryStringParameters ? '?' + new URLSearchParams(event.queryStringParameters).toString() : ''),
      headers: event.headers || {},
      body: event.body ? JSON.parse(event.body) : undefined,
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

    // Handle the request
    await serverHandler.handler(mockRequest, mockResponse);

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