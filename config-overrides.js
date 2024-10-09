const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    'crypto': require.resolve('crypto-browserify')
  })
);