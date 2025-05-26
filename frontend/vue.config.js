const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',     // Damit der Server auch über die IP im Netzwerk erreichbar ist
    port: 8080           // Optional – kannst du auch ändern, z. B. auf 3000
  }
})
