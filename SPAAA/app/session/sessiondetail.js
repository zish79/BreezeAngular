(function () {
    'use strict';
    var controllerId = 'sessiondetail';
    angular
        .module('app')
        .controller('sessiondetail', sessiondetail);

    sessiondetail.$inject = ['$location', '$routeParams', '$window', '$scope', 'bootstrap.dialog', 'common', 'datacontext', 'config'];

    function sessiondetail($location,$routeParams, $window, $scope,bsDialog, common, datacontext, config) {
        var vm = this;
        vm.logError = common.logger.getLogFn(controllerId, 'error');
        vm.rooms = [];
        vm.tracks = [];
        vm.deleteSession = deleteSession;
        vm.timeslots = [];
        vm.speakers = [];
        vm.session = undefined;
        vm.Save = Save;
        vm.Cancel = Cancel;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.hasChanges = false;
        vm.title = 'Sessions';
        vm.sessionIdParameter = $routeParams.id;
        vm.getRequestedSession = getRequestedSession;
        var $q = common.$q;

        Object.defineProperty(vm, 'canSave', {
            get:canSave
        });

        function canSave() {
            return vm.hasChanges && !vm.isSaving;
        }

        activate();

        function activate() {
            //TODO: get ouyr Sessions
            initLookups();
            onDestroy();
            onHasChanges();
            common.activateController([getRequestedSession()], controllerId);
        }

        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;
            vm.rooms = lookups.rooms;
            vm.timeslots = lookups.timeslots;
            vm.tracks = lookups.tracks;
            vm.speakers = datacontext.speaker.getAllLocal();
        }

        function getRequestedSession() {
            var val = $routeParams.id;
            if (val === 'new') {
                vm.session = datacontext.session.create();
                return vm.session;
            }
            return datacontext.session.getById(val)
                .then(function (data) {
                vm.session = data;
            }, function (error) {
                logError('Unable to get Session', val);
            });
        }

        function goBack() {
            $window.history.back();
        }

        function deleteSession() {

            return bsDialog.deleteDialog('Session')
            .then(confirmDelete);

            function confirmDelete() {
                datacontext.markDeleted(vm.session);
                vm.Save().then(success, failed);

                function success() {
                    gotoSession();
                }

                function failed(error) {
                    Cancel();
                }
            }
        }

        function Save() {
            if (!canSave()) {
                return $q.when(null);
            }

            vm.isSaving = true;
            return datacontext.save().then(function (saveResult) {
                vm.isSaving = false;
                //datacontext.speaker.calcIsSpeaker();
            }, function (error) {
                vm.isSaving = false;
            });
        }

        function Cancel() {
            datacontext.cancel();
            if (vm.speaker.entityAspect.entityState.isDetached()) {
                gotoSession();
            }
        }

        function gotoSession() {
            $location.path('/sessions');
        }

        function onDestroy() {
            $scope.$on('$destroy', function () {
                datacontext.cancel();
            });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged, function (event,data) {
                vm.hasChanges = data.hasChanges;
            });
        }
    }

})();
