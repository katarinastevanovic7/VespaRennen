const { defineConfig } = require('@vue/cli-service')

module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: 'all', // Damit ngrok als Host akzeptiert wird
    client: {
      overlay: false 
    }
  }
}

