'use strict';

describe('$idempotent', function(){
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

    it('can be callable', function(){
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

    it('should add the uuid to the tracker', function(){
      $httpBackend.when('GET', endpoint).respond(200, '');
      sut.get(endpoint);

      var numberOfMessages = 0;
      for (var i in sut.tracker){
        numberOfMessages++;
        expect(i.length).toBe(48);
      }

      expect(numberOfMessages).toBe(1)
      expect(sut.tracker)
      $httpBackend.flush();
    });

    it('should create a UUID for this specific message', function(){
      $httpBackend.when('GET', endpoint).respond(500,'')
      spyOn(sut, 'generateUUID');
      sut.get(endpoint);
      expect(sut.generateUUID).toHaveBeenCalled();
      $httpBackend.flush();
    });

    it('should repeat the retry the get', function() {
      $httpBackend.whenGET(endpoint).respond(500);
      sut.get(endpoint);
      $httpBackend.flush();
    });

    it('returns a $q promise', function(){
      $httpBackend.when('GET', endpoint).respond(500,'')

      var promise = sut.get(endpoint);
      expect(typeof promise.then).toBe('function');
      $httpBackend.flush();
    });


    it('returns a $q promise', function(){
      $httpBackend.when('GET', endpoint).respond(500,'')

      var promise = sut.get(endpoint);
      expect(typeof promise.then).toBe('function');
      $httpBackend.flush();
    })


    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });

});
