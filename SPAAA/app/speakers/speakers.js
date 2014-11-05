(function () {
    'use strict';
    var controllerId = 'speakers';
    angular
        .module('app')
        .controller('speakers', speakers);

    speakers.$inject = ['$location', 'common', 'config', 'datacontext'];

    function speakers($location,common, config, datacontext) {
        var keyCodes = config.keyCodes;
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        vm.filteredSpeakers = [];
        vm.speakers = [];
        vm.speakerSearch;
        vm.search = search;
        var log = getLogFn(controllerId);
        vm.title = 'Speakers';
        vm.refresh = refresh;
        vm.gotoSpeaker = gotoSpeaker;
        vm.activate = activate;
        vm.getSpeakers = getSpeakers;
        activate();

        function activate() {
            //TODO: get ouyr Speakers
            common.activateController([getSpeakers()], controllerId)
                .then(function () { log('Activated Speakers View'); });
        }

        function getSpeakers(forceRefresh) {
            var i = 0;
            return datacontext.speaker.getPartials(forceRefresh).then(function (data) {
                vm.speakers = data;
                applyFilter();
                return vm.speakers = data;
            });

        }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.speakerSearch = '';
            }
            applyFilter();
        }

        function applyFilter() {
            vm.filteredSpeakers= vm.speakers.filter(speakerFilter);
        }

        function speakerFilter(speaker) {
            var isMatch = vm.speakerSearch ? 
                common.textContains(speaker.fullName,vm.speakerSearch) : true;
            return isMatch;
        }

        function refresh() {
            getSpeakers(true);
        }

        function gotoSpeaker(speak)
        {
            if (speak && speak.id) {
                $location.path('/speakers/' + speak.id);
            }
        }

    }
})();
