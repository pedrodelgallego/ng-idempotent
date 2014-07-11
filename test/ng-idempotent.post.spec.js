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

    it('should pass the headers to $http', function(){
      var headers = {"Accept":"application/xml","Content-Type":"application/json;charset=utf-8"};
      $httpBackend.expectPOST(endpoint, {}, headers).respond(200, '');
      sut.post(endpoint, {}, {headers: headers});
      $httpBackend.flush();
    })


    it('should add the uuid to the tracker', function(){
      $httpBackend.when('POST', endpoint).respond(200, '');
      sut.post(endpoint);

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
      $httpBackend.when('POST', endpoint).respond(200,'')
      spyOn(sut, 'generateUUID');
      sut.post(endpoint);
      expect(sut.generateUUID).toHaveBeenCalled();
      $httpBackend.flush();
    });


    describe('promises', function(){
      it('returns a $q promise', function(){
        $httpBackend.when('POST', endpoint).respond(200,'')

        var promise = sut.post(endpoint);
        expect(typeof promise.then).toBe('function');
        $httpBackend.flush();
      });
    });


    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });
});
