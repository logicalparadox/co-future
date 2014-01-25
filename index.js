"use strict";

/*!
 * Module dependencies
 */

var co = require('co');

/*!
 * Primary exports
 */

var exports = module.exports = function(blk) {
  return new Future(blk);
};

/**
 * Future implementation for generator functions. Wraps
 * and invokes generator using `co` on construction.
 * Will not throw error of resolved future until `.unwrap()`
 * so can be used as generator try/catch replacement.
 *
 * @param {Generator} closure
 * @param {Array} argv
 * @param {Mixed} context for closure
 * @api public
 */

var Future = exports.Future = function Future(blk) {
  if (!(this instanceof Future)) return new Future(blk);

  var state = this.state = {
    type: 'future',
    res: null,
    waiting: []
  };

  var self = this;

  co(function*() {
    return yield blk;
  })(function done() {
    state.res = [].slice.call(arguments);
    deliver(self, state.waiting);
  });
}

/*!
 * Prototype
 */

Future.prototype = {

  constructor: Future,

  /**
   * Get error or `false` of resolved future. Unlike
   * `.unwrap()`, will not throw.
   *
   * @return {Mixed} error or `false`
   * @api public
   */

  get err() {
    return Array.isArray(this.state.res)
      ? this.state.res[0] || false
      : undefined;
  },

  /**
   * Get result or `undefined` of resolved future.
   *
   * @return {Boolean} resolved
   * @api public
   */

  get res() {
    return Array.isArray(this.state.res)
      ? this.state.res[1]
      : undefined;
  },

  /**
   * Wait for future to resolve. On resolution will
   * yield the future for further chaining. Use `.unwrap()`
   * to get actual value.
   *
   * @yield {Future} self
   * @api public
   */

  wait: function() {
    var self = this;
    return function wait(done) {
      if (Array.isArray(self.state.res)) deliver(self, [ done ]);
      else self.state.waiting.push(done);
    }
  },

  /**
   * Unwrap the value stored in the future after
   * resolution. If the future is currently storing
   * an error it will be thrown.
   *
   * @throw {Error} failed result
   * @return {Mixed} success result
   * @api public
   */

  unwrap: function() {
    var res = this.state.res;
    if (!res) throw new Error('to early');
    if (this.err) throw this.err;
    return res[1];
  }

}

/**
 * Deliver `self` to all waiting.
 *
 * @param {Future} self
 * @param {Array} waiting queue
 * @api private
 */

function deliver(self, waiting) {
  var fns = waiting.slice();
  while (fns.length) {
    var fn = fns.shift();
    fn(null, self);
  }
}
