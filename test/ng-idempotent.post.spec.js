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

  describe('.post', function(){
    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get("$httpBackend");
    }));

    it('is callable', function(){
      expect(typeof sut.post).toBe('function');
    });

    it('should call post only once if the request succeed', function(){
      $httpBackend.when('POST', endpoint).respond(200, '');
      sut.post(endpoint);

      $httpBackend.expectPOST(endpoint);
      $httpBackend.flush();
    })

    it('should pass the data to $http', function(){
      $httpBackend.expectPOST(endpoint, {hola: 'hola'}).respond(200, '');
      sut.post(endpoint, {hola: 'hola'});
      $httpBackend.flush();
    })

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });
});
