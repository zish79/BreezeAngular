(function () {
    'use strict';

    var serviceId = 'repository.speaker';
    angular.module('app').factory(serviceId, ['model', 'repository.abstract', 'zStorage', RepositorySpeaker]);

    function RepositorySpeaker(model, AbstractRepository, zStorage) {
        var entityName = model.entityNames.speaker;
        var entityNames = model.entityNames;
        var EntityQuery = breeze.EntityQuery;
        var orderby = 'firstName,lastName';
        //var predicate = breeze.predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.calcIsSpeaker = calcIsSpeaker;
            this.zStorage = zStorage;
            // Exposed data access functions.
            this.create = create;
            this.getPartials = getPartials;
            this.getAllLocal = getAllLocal;
            this.getById = getById;
            //this.getFilteredCount = getFilteredCount;
            //this.setLookups = setLookups;
            //this.getById = getById;
            this.create = create;
        }

        // Allow repo to access to the Abstract Repo.
        AbstractRepository.extend(Ctor);

        return Ctor;

        function calcIsSpeaker() {
            var self = this;
            var persons = self.manager.getEntities(model.entityNames.person);
            var sessions = self.manager.getEntities(model.entityNames.session);
            persons.foreach(function (s) { s.isSpeaker = false; });
            sessions.foreach(function (s) {
                s.speaker.isSpeaker = (s.speakerId !== 0);
            });
        }

        //
        function create() {
            return this.manager.createEntity(entityName);
        }

        function getById(id,forceRemote) {
            return this._getById(entityName,id, forceRemote);
        }

        function getAllLocal() {
            var self = this;
            var predicate = breeze.Predicate.create('isSpeaker', '==', true);
            return self._getAllLocal(entityName, orderby, predicate);
        }

        
        function getPartials(forceRemote) {
            var self = this;
            var speakers;
            var predicate = breeze.Predicate.create('isSpeaker', '==', true);

            if (!forceRemote) {
                speakers = self._getAllLocal(entityName, orderby, predicate);
                return self.$q.when(speakers);
            }


            return EntityQuery.from('Speakers')
                    .select('id, firstName,lastName,imageSource')
                    .orderBy(orderby)
                    .toType(entityNames.speaker)
                    .using(self.manager).execute()
                    .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                speakers = data.results;
                for (var i = speakers.length; i--;) {
                    speakers[i].isPartial = true;
                    speakers[i].isSpeaker = true;
                }
                self.zStorage.save();
                self.log('Retrieved [Speaker Partials] from Remote Datasource', speakers.length, true);
                return speakers;
            }
        }
    }
})();