'use strict';

(function (angular) {
    angular.module('trng.error', []);

    angular.module('trng.error').config([
        '$provide',
        '$httpProvider',
        function($provide, $httpProvider) {
            $provide.factory('httpInterceptor', [
                '$q',
                'growl',
                function($q, growl) {
                    return {
                        responseError: function(rejection) {
                            if (rejection.hasOwnProperty('status')) {
                                if (rejection.status >= 400) {

                                    if (rejection.config.url.indexOf('login') == -1 ||
                                        rejection.status >= 500) {

                                        var message = rejection.data;
                                        if (rejection.status >= 500) {
                                            message = "Technical error occurred, cannot proceed";
                                        }

                                        console.log(message);
                                        growl.addErrorMessage(message);
                                    }
                                }
                            }
                            return $q.reject(rejection);
                        }
                    };
                }
            ]);

            $httpProvider.interceptors.push('httpInterceptor');
        }
    ]);
})(angular);