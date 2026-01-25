// Simple static server for dist/ using 'serve' package
// Run: npm run start

const serve = require('serve');

serve('dist', {
  port: 5000,
  ignore: ['node_modules'],
});
