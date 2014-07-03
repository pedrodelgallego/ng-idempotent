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
      $httpBackend.when('GET', endpoint).respond(200, '');
      sut.get(endpoint);

      $httpBackend.expectGET(endpoint);
      $httpBackend.flush();
    })

    it('should pass the headers to $http', function(){
      $httpBackend.expectGET(endpoint, {"Accept":"application/xml"}).respond(200, '');
      sut.get(endpoint, {headers: {"Accept":"application/xml"}});
      $httpBackend.flush();
    })

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
      $httpBackend.when('GET', endpoint).respond(200,'')
      spyOn(sut, 'generateUUID');
      sut.get(endpoint);
      expect(sut.generateUUID).toHaveBeenCalled();
      $httpBackend.flush();
    });

    it('should have a default wait time of 1 second', function(){
      $httpBackend.when('GET', endpoint).respond(200,'')
      expect(promise.message.wait).toBe(1000);
      $httpBackend.flush();
    });

    it('should repeat the retry the get', function() {
      $httpBackend.whenGET(endpoint).respond(200);
      sut.get(endpoint);
      $httpBackend.flush();
    });

    describe('promises', function(){
      it('returns a $q promise', function(){
        $httpBackend.when('GET', endpoint).respond(200,'')

        var promise = sut.get(endpoint);
        expect(typeof promise.then).toBe('function');
        $httpBackend.flush();
      });

      it('returns a $q promise with a success method', function(){
        $httpBackend.when('GET', endpoint).respond(200,'')

        var promise = sut.get(endpoint);
        expect(typeof promise.success).toBe('function');
        $httpBackend.flush();
      });

      it('should resolve the promise as succeed if the request succeed', function(){
        $httpBackend.when('GET', endpoint). respond( {userId: 1234}, {});
        var promise = sut.get(endpoint);

        promise.success(function(data, status, headers){
          expect(data.userId).toBe(1234);
          expect(status).toBe(200);
          expect(typeof headers).toBe('function');
        });

        $httpBackend.flush();
      });

      it('returns a promise with a message', function(){
        $httpBackend.when('GET', endpoint).respond(200,'')

        var promise = sut.get(endpoint);
        expect(promise.message.messageType).toBe(sut.GET_MESSAGE);
        $httpBackend.flush();
      });

      describe('retry', function(){
        it('returns a $q promise with a error method', function(){
          $httpBackend.when('GET', endpoint).respond(500,'')

          var promise = sut.get(endpoint, {attempts: 1});
          expect(typeof promise.error).toBe('function');
          $httpBackend.flush();
        });

        it('reties only n number of times when psss the attemp param', function(){
          $httpBackend.when('GET', endpoint).respond(500,'')
          var promise = sut.get(endpoint, {attempts: 1});
          $httpBackend.flush();
        });

        it('returns a $q promise with a error method', function(){
          $httpBackend.when('GET', endpoint).respond(500,'')

          var promise = sut.get(endpoint, {attempt: 1});
          expect(typeof promise.error).toBe('function');
          $httpBackend.flush();
        });

        it('should resolve the promise as error if the request error', function(){
          var failed;
          $httpBackend.expectGET(endpoint).respond(500, 'bad error');
          $httpBackend.expectGET(endpoint).respond(500, 'bad error');
          $httpBackend.expectGET(endpoint).respond(500, 'bad error');
          $httpBackend.expectGET(endpoint).respond(500, 'bad error');
          $httpBackend.expectGET(endpoint).respond(500, 'bad error');

          var promise = sut.get(endpoint);

          promise.error(function(data, status, headers, config){
            failed = true;
            expect(status).toBe(500);
            expect(promise.message.status).toBe(sut.FAILED);
          });

          $httpBackend.flush();
          expect(failed).toBe(true);
          expect(promise.message.status).toBe(sut.FAILED);
        });

        it('should resolve the promise as error if the request error', function(){
          var failed;
          $httpBackend.expectGET(endpoint).respond(500, 'bad error');
          $httpBackend.expectGET(endpoint).respond(500, 'bad error');
          $httpBackend.expectGET(endpoint).respond(200, 'bad error');

          var promise = sut.get(endpoint);

          promise.success(function(data, status, headers, config){
            expect(promise.message.status).toBe(sut.SUCCEED);
            failed = false;
          });

          $httpBackend.flush();
          expect(failed).toBe(false);
          expect(promise.message.status).toBe(sut.SUCCEED);
        });
      });
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });
});
