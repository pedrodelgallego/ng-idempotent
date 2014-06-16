(function(window, angular, undefined){
  'use strict';

  angular.module('ngIdempotent')
    .factory('$idempotent', ['$http', '$q', function($http, $q) {
      var $resourceMinErr = angular.$$minErr('$idempotent');

      return {
        generateUUID: function () {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx-yyyy-yyyyyy'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
          });
        }
      };
    }]);

}(window, window.angular))
