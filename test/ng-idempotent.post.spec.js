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

      it('returns a $q promise with a success method', function(){
        $httpBackend.when('POST', endpoint).respond(200,'')

        var promise = sut.post(endpoint);
        expect(typeof promise.success).toBe('function');
        $httpBackend.flush();
      });

      it('should resolve the promise as succeed if the request succeed', function(){
        $httpBackend.when('POST', endpoint). respond( {userId: 1234}, {});
        var promise = sut.post(endpoint);

        promise.success(function(data, status, headers){
          expect(data.userId).toBe(1234);
          expect(status).toBe(200);
          expect(typeof headers).toBe('function');
        });

        $httpBackend.flush();
      });

      it('returns a promise with a message', function(){
        $httpBackend.when('POST', endpoint).respond(200,'')
        var promise = sut.post(endpoint);
        expect(promise.message.messageType).toBe(sut.POST_MESSAGE);
        $timeout.flush();
        $httpBackend.flush();
      });
    });

    describe('retry', function(){
      it('returns a $q promise with a error method', function(){
        $httpBackend.when('POST', endpoint).respond(200,'')
        var promise = sut.post(endpoint, {attempts: 1});
        expect(typeof promise.error).toBe('function');
        $httpBackend.flush();
        $timeout.flush();
      });

      afterEach(function() {
        $timeout.verifyNoPendingTasks();
      });
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });
});
