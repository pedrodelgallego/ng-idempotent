'use strict';

describe('', function(){
  var sut

  beforeEach(module('ngIdempotent'));

  beforeEach(inject(function ($injector) {
    sut = $injector.get('$idempotent');
  }));

  it('should create a module', function(){ expect(sut).toBeDefined(); });


  describe('.get', function(){
    it('can be call', function(){ expect(typeof sut.get).toBe('function'); });

  });
});
