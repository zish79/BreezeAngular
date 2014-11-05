(function () { 
    'use strict';
    
    var controllerId = 'sidebar';
    angular.module('app').controller(controllerId,
        ['$route', '$location','bootstrap.dialog','datacontext', 'config', 'routes', sidebar]);

    function sidebar($route, $location, bsDialog,datacontext, config, routes) {
        var vm = this;
        vm.search = search;
        var keyCodes = config.keyCodes;
        vm.isCurrent = isCurrent;
        vm.searchText = '';
        vm.clearStorage = clearStorage;
        activate();

        function activate() { getNavRoutes(); }

        function clearStorage() {
            return bsDialog.deleteDialog('local storage')
            .then(confirmDelete, cancelDelete);

            function confirmDelete() {
                datacontext.zStorage.clear();
            }

            function cancelDelete() {

            }
        }
        
        function getNavRoutes() {
            vm.navRoutes = routes.filter(function(r) {
                return r.config.settings && r.config.settings.nav;
            }).sort(function(r1, r2) {
                return r1.config.settings.nav - r2.config.settings.nav;
            });
        }
        
        function isCurrent(route) {
            if (!route.config.title || !$route.current || !$route.current.title) {
                return '';
            }
            var menuName = route.config.title;
            return $route.current.title.substr(0, menuName.length) === menuName ? 'current' : '';
        }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.searchText = '';
            }

            if ($event.type==="click" || $event.keyCode === keyCodes.enter) {
                var route = '/sessions/search/';
                $location.path(route + vm.searchText);
            }
        }


    };
})();
