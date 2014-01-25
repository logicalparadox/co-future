module.exports = function(config) {
  config.set({
    globals: {
      co: require('co'),
      Future: require('./index'),
      wait: function wait(ms) {
        return function(done) {
          setTimeout(done, ms);
        }
      }
    },
    tests: [
      'test/*.js'
    ]
  });
}
