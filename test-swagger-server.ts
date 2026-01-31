process.env.NODE_ENV = 'test';

const app = require('./index').default;

const port = 3001;
const server = app.listen(port, () => {
  console.log(`Test server listening on http://localhost:${port}`);
});

// Keep the test server running for 30 seconds to allow verification
setTimeout(() => {
  server.close(() => console.log('Test server stopped'));
}, 30000);
