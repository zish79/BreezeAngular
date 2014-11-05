(function () {
    'use strict';
    var controllerId = 'sessions';
    angular
        .module('app')
        .controller('sessions', sessions);

    sessions.$inject = ['$routeParams','$location','common','config','datacontext']; 

    function sessions($routeParams, $location,common, config, datacontext) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var keyCodes = config.keyCodes;
        var applyFilter = function () { };
        vm.sessions = [];
        vm.sessionSearch=$routeParams.search || '';
        vm.search = search;
        vm.filteredSessions = [];
        vm.refresh = refresh;
        vm.sessionsFilter = sessionsFilter;
        vm.gotoSession = gotoSession;
        var log = getLogFn(controllerId);
        vm.title = 'Sessions';
        vm.activate = activate;
        vm.getSessions = getSessions;
        activate();

        function activate() {
            //TODO: get ouyr Sessions
            common.activateController([getSessions()], controllerId)
                .then(function () {
                    applyFilter = common.createSearchThrottle(vm, 'sessions');
                    if (vm.sessionSearch) {
                        applyFilter(true);
                    }
                    log('Activated Sessions View');
                });
        }

        function getSessions(forceRefresh) {
            var i = 0;
            return datacontext.session.getPartials(forceRefresh).then(function (data) {
                vm.sessions = vm.filteredSessions=data;
            });

        }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.sessionSearch = '';
                applyFilter(true);
            }
            else
                applyFilter();
        }

        function sessionsFilter(session) {
            var textContains = common.textContains;
            var searchText = vm.sessionSearch;
            var isMatch = searchText ?
                textContains(session.title, searchText)
                || textContains(session.room.name, searchText)
                || textContains(session.track.name, searchText)
                || textContains(session.speaker.fullName, searchText)
                : true;
            return isMatch;
        }

        function refresh() {
            getSessions(true);
        }

        function gotoSession(speak) {
            if (speak && speak.id) {
                $location.path('/sessions/' + speak.id);
            }
        }
    }
})();
