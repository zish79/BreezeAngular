(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId, ['$rootScope','common', 'entityManagerFactory', 'model', 'repositories', 'config','zStorage', datacontext]);

    function datacontext($rootScope,common, emFactory, model, repositories, config, zStorage) {
        var $q = common.$q;
        var events = config.events;
        var EntityQuery = breeze.EntityQuery;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');
        var manager = emFactory.newManager();
        var primepromise;
        var repoNames = ['attendee', 'lookup', 'session', 'speaker'];
        var entityNames = model.entityNames;

        var storeMeta = {
            isLoaded: {
                sessions: false,
                attendees: false
            }
        };


        var service = {
            getPeople: getPeople,
            getMessageCount: getMessageCount,
            markDeleted:markDeleted,
            //getSessionPartials: getSessionPartials,
            //getSpeakerPartials: getSpeakerPartials,
            prime: prime,
            save: save,
            cancel: cancel,
            zStorage: zStorage
            //getAttendees: getAttendees
        };

        init();

        return service;

        function init() {
            zStorage.init(manager);
            repositories.init(manager);
            defineLazyLoadedRepos();
            setupEventForHasChangesChanged(); 
            listenForStorageEvents();
            //setupEventForEntitiesChanged();
            //setupEventForHasChangesChanged();
        }

        // Add ESS5 property to datacontext for each named repo.
        function defineLazyLoadedRepos() {
            repoNames.forEach(function (name) {
                Object.defineProperty(service, name, {
                    configurable: true, //will redefine this property once
                    get: function () {
                        // The 1st time repo is request via property,
                        // We ask this repositories for it (which will inject it).
                        var repo = repositories.getRepo(name);
                        //Rewrite this property to always return this repo;
                        // no longer redifinable.
                        Object.defineProperty(service, name, {
                            value: repo,
                            configurable: false,
                            enumerable: true
                        });
                        return repo;
                    }
                });
            });
        }

        function listenForStorageEvents() {
            $rootScope.$on(config.events.storage.storeChanged, function (event, data) {
                log('Updated local storage', data, true);
            });
            $rootScope.$on(config.events.storage.wipChanged, function (event, data) {
                log('Updated WIP', data, true);
            });
            $rootScope.$on(config.events.storage.error, function (event, data) {
                log('Error with local storage.', data.activity, true);
            });
        }

        function getMessageCount() { return $q.when(37); }

        function getPeople() {
            var people = [
                { firstName: 'John', lastName: 'Papa', age: 25, location: 'Florida' },
                { firstName: 'Ward', lastName: 'Bell', age: 31, location: 'California' },
                { firstName: 'Colleen', lastName: 'Jones', age: 21, location: 'New York' },
                { firstName: 'Madelyn', lastName: 'Green', age: 18, location: 'North Dakota' },
                { firstName: 'Ella', lastName: 'Jobs', age: 18, location: 'South Dakota' },
                { firstName: 'Landon', lastName: 'Gates', age: 11, location: 'South Carolina' },
                { firstName: 'Haley', lastName: 'Guthrie', age: 35, location: 'Wyoming' }
            ];
            return $q.when(people);
        }

        function prime() {
            if (primepromise) return primepromise;

            var storageEnabledAndHasData = zStorage.load(manager);

            primepromise = storageEnabledAndHasData ? 
                $q.when(log('Loading Entities and MetaData from Local Storage')) :
                $q.all(service.lookup.getAll(), service.speaker.getPartials(true))
                .then(extendMetadata);

            return primepromise.then(querySucceeded);

            function querySucceeded() {
                service.lookup.setLookups();
                zStorage.save();
                log('primed the data');
                return true;
            }

            function extendMetadata() {
                var metadataStore = manager.metadataStore;
                var types = metadataStore.getEntityTypes();
                types.forEach(function (type) {
                    if (type instanceof breeze.EntityType) {
                        set(type.shortName,type);
                    }
                });

                var personEntityName = entityNames.person;
                ['Speakers', 'Speaker', 'Attendees', 'Attendee'].forEach(function (r) {
                    set(r,personEntityName);
                });

                function set(resourceName, entityName) {
                    metadataStore.setEntityTypeForResourceName(resourceName,entityName);
                }
            }

            function setLookups() {
               
                service.lookupCachedData = {
                    rooms: getAllLocal(entityNames.room, 'name'),
                    tracks: getAllLocal(entityNames.track, 'name'),
                    timeslots: getAllLocal(entityNames.timeslot, 'start')
                    };
            }

        }

        function markDeleted(entity) {
            return entity.entityAspect.setDeleted();
        }

        function save() {
            return manager.saveChanges().then(saveSucceed, saveFailed);

            function saveSucceed(result) {
                zStorage.save();
                logSuccess('saved Result', result, true);
            }

            function saveFailed(error) {
                var msg = config.appErrorPrefix + 'Save Failed:' + breeze.saveErrorMessageService.getErrorMessage(error);
                error.message = msg;
                logError(msg, error);
                throw error;
            }
        }

        function cancel() {
            if (manager.hasChanges()) {
                manager.rejectChanges();
                logSuccess('Canceled Changes', null, true);
            }
        }

        function setupEventForHasChangesChanged() {
            manager.hasChangesChanged.subscribe(function (eventArgs) {
                var data = {hasChanges:eventArgs.hasChanges};
                common.$broadcast(events.hasChangesChanged,data);
            });
        }


    }
})();