(function () {
    'use strict';

    var serviceId = 'repository.abstract';
    angular.module('app').factory(serviceId, ['common', 'config', 'zStorage', AbstractRepository]);

    function AbstractRepository(common, config, zStorage) {
        var EntityQuery = breeze.EntityQuery;
        var logError = common.logger.getLogFn(this.serviceId, 'error');
        var $q = common.$q;
        function Ctor(mgr) {
            this.isLoaded = false;
        }

        Ctor.extend = function (repoCtor) {
            repoCtor.prototype = new Ctor();
            repoCtor.prototype.constructor = repoCtor;
        }

        //Shared  by repository classes
        //Ctor.prototype._areItemsLoaded = _areItemsLoaded;
        Ctor.prototype._getAllLocal = _getAllLocal;
        Ctor.prototype._getById = _getById;
        Ctor.prototype._getInlineCount = _getInlineCount;
        Ctor.prototype._getLocalEntityCount = _getLocalEntityCount;
        Ctor.prototype._queryFailed = _queryFailed;
        Ctor.prototype._setIsPartialTrue = _setIsPartialTrue;
        // Convenience functions for the Repos.
        Ctor.prototype.log = common.logger.getLogFn(this.serviceId);
        Ctor.prototype.$q = common.$q;

        return Ctor;

        //
        //function _areItemsLoaded(value) {
        //    if (value === undefined) {
        //        return this.isLoaded;
        //    }
        //    return this.isLoaded = value;
        //}

        function _getById(entityName,id,forceRemote) {
            var self = this;
            var manager = self.manager;
            if (!forceRemote) {
                var entity = manager.getEntityByKey(entityName, id);
                
                if (entity && !entity.isPartial) {
                    self.log('Retrieved[' + entityName + ']' + entity.id + 'force Remote');
                    if (entity.entityAspect.entityState.isDeleted()) {
                        entity = null;
                    }
                    return $q.when(entity);
                }
            }

            return manager.fetchEntityByKey(entityName, id)
            .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                entity = data.entity;
                if (!entity) {
                    self.log('Could not find'+entityName+' id: '+id,true);
                }
                entity.isPartial=false;
                self.log('Retrieved[' + entityName + ']' + entity.id + 'from Remote DataSource ');
                self.zStorage.save();
                return entity;
            }

        }

        function _getAllLocal(resource, ordering, predicate) {
            return EntityQuery.from(resource)
                .orderBy(ordering)
                .where(predicate)
                .toType(resource)
                .using(this.manager)
                .executeLocally();
        }

        function _getInlineCount(data) {
            return data.inlineCount;
        }

        function _getLocalEntityCount(resource) {
            var entities = EntityQuery.from(resource)
                .using(this.manager)
                .executeLocally();
            return entities.length;
        }

        function _queryFailed(error) {
            var msg = config.appErrorPrefix + 'Error retreiving data.' + error.message;
            logError(msg, error);
            throw error
        }

        function _setIsPartialTrue(entities) {
            for (var i = entities.length; i--;) {
                entities[i].isPartial = true;
            }
            return entities;
        }
    }
})();