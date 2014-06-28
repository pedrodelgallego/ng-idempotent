;(function(window, angular, undefined){
  'use strict';

  /**
   * @ngdoc service
   * @kind function
   * @name $idempotent
   * @requires $http
   * @requires $q
   *
   * @description
   * The `$idempotent` service is an Angular service that facilitates communication with the remote
   * HTTP servers via the browser's [XMLHttpRequest](https://developer.mozilla.org/en/xmlhttprequest)
   * object or via [JSONP](http://en.wikipedia.org/wiki/JSONP).
   *
   * For unit testing applications that use `$idempotent` service, see
   * {@link ngMock.$httpBackend $httpBackend mock}.
   *
   * The $idempotent API is based on the {@link ng.$q deferred/promise APIs} exposed by
   * the $q service.
   *
   * # General usage
   *
   * TODO:
   *
   * Since the returned value of calling the $idempotent function is a `promise`, you can also use
   * the `then` method to register callbacks, and these callbacks will receive a single argument –
   * an object representing the response. See the API signature and type info below for more
   * details.
   *
   * A response status code between 200 and 299 is considered a success status and
   * will result in the success callback being called. Note that if the response is a redirect,
   * XMLHttpRequest will transparently follow it, meaning that the error callback will not be
   * called for such responses.
   *
   * # Writing Unit Tests that use $idempotent
   * When unit testing (using {@link ngMock ngMock}), it is necessary to call
   * {@link ngMock.$httpBackend#flush $httpBackend.flush()} to flush each pending
   * request using trained responses.
   *
   * ```
   * $httpBackend.expectGET(...);
   * $idempotent.get(...);
   * $httpBackend.flush();
   *
   * # Shortcut methods
   *
   * Shortcut methods are also available. All shortcut methods require passing in the URL, and
   * request data must be passed in for POST/PUT requests.
   *
   * ```js
   *   $http.get('/someUrl').success(successCallback);
   *   $http.post('/someUrl', data).success(successCallback);
   * ```
   *
   * Complete list of shortcut methods:
   *
   * - {@link ng.$http#get $http.get}
   * - {@link ng.$http#head $http.head}
   * - {@link ng.$http#post $http.post}
   * - {@link ng.$http#put $http.put}
   * - {@link ng.$http#delete $http.delete}
   * - {@link ng.$http#jsonp $http.jsonp}
   *
   *
   * # Setting HTTP Headers
   *
   * The $idempotent service do not set up the headers it will rely on $httpProvider for that.
   * Headers can be fully configured by accessing the `$httpProvider.defaults.headers` configuration
   * object, which currently contains this default configuration:
   *
   * ```
   * module.run(function($http) {
   *   $http.defaults.headers.common.Authorization = 'Basic YmVlcDpib29w'
   * });
   * ```
   *
   * In addition, you can supply a `headers` property in the config object passed when
   * calling `$http(config)`, which overrides the defaults without changing them globally.
   *
   *
   * # Transforming Requests and Responses
   *
   * Both requests and responses can be transformed using transform functions. By default, Angular
   * applies these transformations:
   *
   * Request transformations:
   *
   * - If the `data` property of the request configuration object contains an object, serialize it
   *   into JSON format.
   *
   * Response transformations:
   *
   *  - If XSRF prefix is detected, strip it (see Security Considerations section below).
   *  - If JSON response is detected, deserialize it using a JSON parser.
   *
   * To globally augment or override the default transforms, modify the
   * `$httpProvider.defaults.transformRequest` and `$httpProvider.defaults.transformResponse`
   * properties. These properties are by default an array of transform functions, which allows you
   * to `push` or `unshift` a new transformation function into the transformation chain. You can
   * also decide to completely override any default transformations by assigning your
   * transformation functions to these properties directly without the array wrapper.  These defaults
   * are again available on the $http factory at run-time, which may be useful if you have run-time
   * services you wish to be involved in your transformations.
   *
   * # Caching
   *
   * See $http
   *
   * @returns {$idempotentPromise} Returns a {@link ng.$q promise} object with the
   *   standard `then` method and two http specific methods: `success` and `error`. The `then`
   *   method takes two arguments a success and an error callback which will be called with a
   *   response object. The `success` and `error` methods take a single argument - a function that
   *   will be called when the request succeeds or fails respectively. The arguments passed into
   *   these functions are destructured representation of the response object passed into the
   *   `then` method. The response object has these properties:
   *
   *   - **data** – `{string|Object}` – The response body transformed with the transform
   *     functions.
   *   - **status** – `{number}` – HTTP status code of the response.
   *   - **headers** – `{function([headerName])}` – Header getter function.
   *   - **config** – `{Object}` – The configuration object that was used to generate the request.
   *   - **statusText** – `{string}` – HTTP status text of the response.
   *
   * @property {Array.<Object>} pendingRequests Array of config objects for currently pending
   *   requests. This is primarily meant to be used for debugging purposes.
   *
   */
  angular.module('ngIdempotent', [])
    .factory('$idempotent', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
      function noop(){}

      // var $resourceMinErr = angular.$$minErr('$idempotent');
      function Message(uuid){
        this.messageType = ngIdempotent.GET_MESSAGE;
        this.status = ngIdempotent.IN_PROGRESS;
        this.UUID = uuid;
      };

      var ngIdempotent = {
        defaults:{
          retries: 5
        },

        IN_PROGRESS: "in_progress",

        GET_MESSAGE: "GET",

        tracker: {},

        generateUUID: function () {
          return 'xxxxxxxx-xxxx-yxxx-yxxx-xxxxxxxxxxxx-yyyy-yyyyyy'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
          });
        },

        get: function(endpoint, config) {
          var attempt = (config && config.attempts) || ngIdempotent.defaults.retries,
              deferred = $q.defer(),
              promise  = deferred.promise,
              uuid = ngIdempotent.generateUUID();

          ngIdempotent.tracker[uuid] = new Message(uuid);
          promise.message = ngIdempotent.tracker[uuid];

          promise.error = function(fn) {
            promise.catch(function(response) {
              fn(response.data, response.status, response.headers, response.config);
            });
            return promise;
          };

          promise.success = function(fn) {
            promise.then(function(resolved) {
              fn(resolved.data, resolved.status, resolved.headers, resolved.config);
            });
            return promise;
          };

          function  get(){
            return $http.get(endpoint, config)
              .success(resolveRequest(deferred))
              .error(rejectRequest(deferred));
          };

          function resolveRequest(deferred){
            return function(data, status, headers, config){
              deferred.resolve({data: data, status: status, headers: headers, config: config});
            }
          }

          function rejectRequest(deferred){
            return function(data, status, headers, config){
              if (attempt > 1){
                attempt--;
                get(endpoint, config, deferred);
              } else {
                deferred.reject({data: data, status: status, headers: headers, config: config});
              }
            }
          }

          get(endpoint, config, deferred);

          return promise;
        }
      };

      return ngIdempotent;
    }]);
}(window, window.angular));
