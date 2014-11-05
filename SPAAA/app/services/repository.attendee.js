(function () {
    'use strict';

    var serviceId = 'repository.attendee';
    angular.module('app').factory(serviceId, ['model', 'repository.abstract', 'zStorage', RepositoryAttendee]);

    function RepositoryAttendee(model, AbstractRepository, zStorage) {
        var entityName = model.entityNames.attendee;
        var entityNames = model.entityNames;
        var EntityQuery = breeze.EntityQuery;
        var orderby = 'firstName,lastName';
        //var predicate = breeze.predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            // Exposed data access functions.
            //this.create = create;
            this.getAll = getAll;
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

        
        function getAll(forceRemote) {
            var self = this;
            var attendees;

            if (forceRemote) {
                attendees = self._getAllLocal(entityName, orderby);
                return self.$q.when(attendees);
            }


            return EntityQuery.from('Persons')
                    .select('id, firstName,lastName,imageSource')
                    .orderBy(orderby)
                    .toType(entityName)
                    .using(self.manager).execute()
                    .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                attendees = data.results;
                self.zStorage.save();
                self.log('Retrieved [Attendee Partials] from Remote Datasource', attendees.length, true);
                return attendees;
            }
        }
    }
})();