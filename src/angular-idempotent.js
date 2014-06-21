(function(window, angular, undefined){
  'use strict';

  angular.module('ngIdempotent', [])
    .factory('$idempotent', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
      // var $resourceMinErr = angular.$$minErr('$idempotent');
      function Message(uuid){
        this.messageType = ngIdempotent.GET_MESSAGE;
        this.status = ngIdempotent.IN_PROGRESS;
        this.UUID = uuid;
      };

      var ngIdempotent = {
        IN_PROGRESS: "in_progress",
        GET_MESSAGE: "get_message",


        tracker: {},

        generateUUID: function () {
          return 'xxxxxxxx-xxxx-yxxx-yxxx-xxxxxxxxxxxx-yyyy-yyyyyy'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
          });
        },

        get: function(endpoint) {
          var deferred = $q.defer(),
              promise = deferred.promise,
              uuid = ngIdempotent.generateUUID();

          ngIdempotent.tracker[uuid] = new Message(uuid);
          promise.message = ngIdempotent.tracker[uuid];

          $http.get(endpoint);


          return promise;
        }
      };

      return ngIdempotent;
    }]);
}(window, window.angular))
