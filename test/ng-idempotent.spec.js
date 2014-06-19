'use strict';

describe('', function(){
  var sut, $httpBackend, endpoint = 'an/end/point';

  beforeEach(module('ngIdempotent'));

  beforeEach(inject(function ($injector) {
    sut = $injector.get('$idempotent');
    $httpBackend = $injector.get("$httpBackend");
  }));

  it('should create a module', function(){ expect(sut).toBeDefined(); });

  describe('.get', function(){

    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get("$httpBackend");
    }));

    it('can be call', function(){
      expect(typeof sut.get).toBe('function');
    });

    it('should call get only once if the request succeed', function(){
      $httpBackend.
        when('GET', endpoint).
        respond({collection: [{}, {}]}, {});

      sut.get(endpoint);

      $httpBackend.expectGET(endpoint);
      $httpBackend.flush();
    });

    it('should create a UUID for this specific message', function(){
      $httpBackend.
        when('GET', endpoint).
        respond({collection: [{}, {}]}, {});

      spyOn(sut, 'generateUUID');
      sut.get(endpoint);
      expect(sut.generateUUID).toHaveBeenCalled();
      $httpBackend.flush();
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });

});
