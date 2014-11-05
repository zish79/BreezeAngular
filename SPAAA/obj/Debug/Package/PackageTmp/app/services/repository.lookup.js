(function () {
    'use strict';

    var serviceId = 'repository.lookup';
    angular.module('app').factory(serviceId, ['model', 'repository.abstract', 'zStorage', RepositoryLookup]);

    function RepositoryLookup(model, AbstractRepository, zStorage) {
        var entityName = 'lookups';
        var entityNames = model.entityNames;
        var EntityQuery = breeze.EntityQuery;
        var orderBy = 'code';

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            // Exposed data access functions.
            //this.create = create;
            this.getAll = getAll;
            this.setLookups = setLookups;
            //this.getById = getById;
            this.create = create;
        }

        // Allow repo to access to the Abstract Repo.
        AbstractRepository.extend(Ctor);

        return Ctor;

        //
        function create() {
            return this.manager.createEntity(entityName);
        }

        
        function getAll(forceRemote) {
            var self = this;
            return EntityQuery.from('Lookups')
                    .using(self.manager).execute()
                    .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.save();
                self.log('Retrieved [Lookups] ', data, true);
                return true;
            }
        }
        function setLookups() {

            this.lookupCachedData = {
                rooms: this._getAllLocal(entityNames.room, 'name'),
                tracks: this._getAllLocal(entityNames.track, 'name'),
                timeslots: this._getAllLocal(entityNames.timeslot, 'start')
            };
        }
    }
})();