'use strict';

describe('$idempotent', function(){
  var sut, $httpBackend, $timeout, endpoint = 'an/end/point';

  beforeEach(module('ngIdempotent'));

  beforeEach(inject(function ($injector) {
    sut = $injector.get('$idempotent');
    $httpBackend = $injector.get("$httpBackend");
    $timeout = $injector.get("$timeout");
  }));

  it('should create a module', function(){ expect(sut).toBeDefined(); });

  describe('.get', function(){
    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get("$httpBackend");
    }));

    it('is callable', function(){
      expect(typeof sut.post).toBe('function');
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });
});
