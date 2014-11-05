(function () {
    'use strict';

    var serviceId = 'repository.session';
    angular.module('app').factory(serviceId, ['model', 'repository.abstract', 'zStorage', RepositorySession]);

    function RepositorySession(model, AbstractRepository, zStorage) {
        var entityName = model.entityNames.session;
        var entityNames = model.entityNames;
        var EntityQuery = breeze.EntityQuery;
        var orderby = 'timeSlotId,level,speaker.firstName';
        var predicate = breeze.predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            // Exposed data access functions.
            this.create = create;
            this.getPartials = getPartials;
            this.getById = getById;
            //this.getFilteredCount = getFilteredCount;
            //this.setLookups = setLookups;
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

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        
        function getPartials(forceRemote) {
            var self = this;
            var sessions;

            if (self.zStorage.areItemsLoaded('sessions') && !forceRemote) {
                sessions = self._getAllLocal(entityName, orderby);
                return self.$q.when(sessions);
            }


            return EntityQuery.from('Sessions')
                    .select('id, title, code, speakerId, trackId, timeSlotId, roomId, level, tags')
                    .orderBy(orderby)
                    .toType(entityName)
                    .using(self.manager).execute()
                    .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                //sessions = data.results;
                sessions = self._setIsPartialTrue(data.results);
                self.zStorage.save();
                self.zStorage.areItemsLoaded('sessions',true);
                self.log('Retrieved [Session Partials] from Remote Datasource', sessions.length, true);
                return sessions;
            }
        }
    }
})();