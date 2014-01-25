
suite('.wait()', function() {
  test('yields self', co(function*() {
    var called = false;

    function *blk() {
      yield wait(10);
      called = true;
    }

    var fut = Future(blk);
    var fut2 = yield fut.wait();
    fut.should.deep.equal(fut2);
    called.should.be.true;
  }));
});

suite('.err', function() {
  test('returns false if no error', co(function*() {
    var called = false;

    function *blk() {
      yield wait(10);
      called = true;
      return true;
    }

    var fut = yield Future(blk).wait();
    fut.err.should.be.false;
    called.should.be.true;
  }));

  test('returns error if error', co(function*() {
    var called = false;

    function *blk() {
      yield wait(10);
      called = true;
      throw Error('bad block');
    }

    var fut = yield Future(blk).wait();
    fut.err.should.be.instanceof(Error)
      .with.property('message', 'bad block');
    called.should.be.true;
  }));
});

suite('.res', function() {
  test('return res on success', co(function*() {
    var called = false;

    function *blk() {
      yield wait(10);
      called = true;
      return 'hello universe';
    }

    var fut = yield Future(blk).wait();
    fut.res.should.equal('hello universe');
    called.should.be.true;
  }));

  test('returns undefined if not ready', co(function*() {
    var called = false;

    function *blk() {
      yield wait(10);
      called = true;
      return 'hello universe';
    }

    var fut = Future(blk);
    assert.equal(fut.res, undefined);
    yield fut.wait();
    called.should.be.true;
  }));
});

suite('.unwrap()', function() {
  test('returns result on success', co(function*() {
    var called = false;

    function *blk() {
      yield wait(10);
      called = true;
      return 'hello universe';
    }

    var fut = yield Future(blk).wait();
    fut.unwrap().should.equal('hello universe');
    called.should.be.true;
  }));

  test('throws error if error', co(function*() {
    var called = false;

    function *blk() {
      yield wait(10);
      called = true;
      throw Error('bad block');
    }

    var fut = yield Future(blk).wait();
    (function() { fut.unwrap(); }).should.throw(Error, 'bad block');
    called.should.be.true;
  }));
});

suite('factory', function() {
  test('wraps already running generator', co(function*() {
    var called = false;

    function *blk(hello) {
      yield wait(10);
      called = true;
      hello.should.equal('universe');
    }

    var fut = yield Future(blk('universe')).wait();
    called.should.be.true;
  }));
});
