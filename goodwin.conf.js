module.exports = function(config) {
  config.set({
    globals: {
      co: require('co'),
      Future: require('./index')
    },
    tests: [
      'test/*.js'
    ]
  });
}
