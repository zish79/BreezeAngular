(function () {
    'use strict';
    var controllerId = 'speakerdetail';
    angular
        .module('app')
        .controller('speakerdetail', speakerdetail);

    speakerdetail.$inject = ['$location', '$routeParams', '$window', '$scope', 'common', 'datacontext', 'config'];

    function speakerdetail($location,$routeParams, $window, $scope, common, datacontext, config) {
        var vm = this;
        vm.logError = common.logger.getLogFn(controllerId, 'error');
        vm.speaker = undefined;
        vm.Save = Save;
        vm.Cancel = Cancel;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.hasChanges = false;
        vm.title = 'Speakers';
        vm.speakerIdParameter = $routeParams.id;
        vm.getRequestedSpeaker = getRequestedSpeaker;

        Object.defineProperty(vm, 'canSave', {
            get:canSave
        });

        function canSave() {
            return vm.hasChanges && !vm.isSaving;
        }

        activate();

        function activate() {
            //TODO: get ouyr Speakers
            onDestroy();
            onHasChanges();
            common.activateController([getRequestedSpeaker()], controllerId);
        }

        function getRequestedSpeaker() {
            var val = $routeParams.id;
            if (val === 'new') {
                vm.speaker = datacontext.speaker.create();
                return vm.speaker;
            }
            return datacontext.speaker.getById(val)
                .then(function (data) {
                vm.speaker = data;
            }, function (error) {
                logError('Unable to get Speaker', val);
            });
        }

        function goBack() {
            $window.history.back();
        }

        function Save() {
            vm.isSaving = true;
            return datacontext.save().then(function (saveResult) {
                vm.isSaving = false;
            }, function (error) {
                vm.isSaving = false;
            });
        }

        function Cancel() {
            datacontext.cancel();
            if (vm.speaker.entityAspect.entityState.isDetached()) {
                gotoSpeaker();
            }
        }

        function gotoSpeaker() {
            $location.path('/speakers');
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
