(function () {
    'use strict';
    var controllerId = 'attendees';
    angular
        .module('app')
        .controller('attendees', attendees);

    attendees.$inject = ['common', 'datacontext'];

    function attendees(common, datacontext) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        vm.attendees = [];
        var log = getLogFn(controllerId);
        vm.title = 'Attendees';
        vm.activate = activate;
        vm.refresh = refresh;
        vm.getAttendees = getAttendees;
        activate();

        function activate() {
            //TODO: get ouyr Attendees
            common.activateController([getAttendees()], controllerId)
                .then(function () { log('Activated Attendees View'); });
        }

        function getAttendees(forceRefresh) {
            var i = 0;
            return datacontext.attendee.getAll(forceRefresh).then(function (data) {
                vm.attendees = data;
                return data;
            });

        }

        function refresh() {
            getAttendees(true);
        }
    }
})();
