(function () {
    'use strict';

    var serviceId = 'routemediator';

    angular
        .module('app')
        .factory('routemediator', routemediator);

    routemediator.$inject = ['$location', '$rootScope', 'config', 'logger'];

    function routemediator($location, $rootScope, config, logger) {
        var handleRouteChangeError = false;
        var service = {

            setRoutingHandlers:setRoutingHandlers
            
        };

    return service;

    function setRoutingHandlers() {
        updateDocTitle();
        handleRoutingErrors();
    }

        function updateDocTitle() {
            $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
                handleRouteChangeError = false;
                var Title = config.docTitle + ' ' + (current.title|| ' ');
                $rootScope.title=Title;
                });
        }

        function handleRoutingErrors() {
            $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
                if (handleRouteChangeError) {
                    return;
                }
                handleRouteChangeError = true;
                var msg = 'Error Routing:' + (current && current.name);
                logger.logWarning(msg, current, serviceId, true);
                $location.path('/');
            });
        }
    }
})();