(function(window, angular, undefined){
  'use strict';

  angular.module('ngIdempotent', [])
    .factory('$idempotent', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
      // var $resourceMinErr = angular.$$minErr('$idempotent');
      var tracker = {};

      var ngIdempotent = {
        generateUUID: function () {
          return 'xxxxxxxx-xxxx-yxxx-yxxx-xxxxxxxxxxxx-yyyy-yyyyyy'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
          });
        },

        get: function(){
        }
      };

      return ngIdempotent;
    }]);
}(window, window.angular))
