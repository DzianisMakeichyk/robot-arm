const { alias } = require('react-app-rewire-alias')

module.exports = function override(config, env) {
  // Wyłącz HMR i WebSocket
  config.devServer = {
    ...config.devServer,
    hot: false,
    webSocketServer: false
  };

  // Istniejące aliasy
  alias({
    '@components': 'src/components',
    '@styles': 'src/styles',
    '@types': 'src/types',
    '@utils': 'src/utils'
  })(config);

  return config;
}