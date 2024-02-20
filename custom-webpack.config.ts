const { EnvironmentPlugin } = require('webpack');
// Add additional requirements here

// If you're using dotenv
require('dotenv').config()

// Export a configuration object
// See [Wepack's documentation](https://webpack.js.org/configuration/) for additional ideas of how to 
// customize your build beyond what Angular provides.
module.exports = {
  plugins: [
    new EnvironmentPlugin([
      // Insert the keys to your environment variables here.
      // Eg: GAME_API_BASE_PATH="http://localhost:3000/api/v1"
      'GAME_API_BASE_PATH'
    ])
  ]
}