(function () {
    'use strict';

    var serviceId = 'model';

    angular
        .module('app')
        .factory(serviceId, model);

    //model.$inject = ['$http'];

    function model() {

        var entityNames = {
            attendee: 'Person',
            person: 'Person',
            speaker: 'Person',
            session: 'Session',
            room: 'Room',
            track: 'Track',
            timeslot: 'TimeSlot'

        };


        var service = {
            configureMetadataStore: configureMetadataStore,
            entityNames: entityNames
        };

        

        return service;

        function configureMetadataStore(metadataStore) {
            registerTimeSlot(metadataStore);
            registerPerson(metadataStore);
        }

        function registerSession(metadataStore) {
            metadataStore.registerEntityTypeCtor('Session', Session);

            function Session() {
                this.isPartial = false;
            }

            //Object.defineProperty(Person.prototype, 'fullName', {
            //    get: function () {
            //        var fn = this.firstName;
            //        var ln = this.lastName;
            //        var value = ln ? fn + ' ' + ln : fn;
            //        return value; 
            //    }
            //});
        }

        function registerPerson(metadataStore) {
            metadataStore.registerEntityTypeCtor('Person', Person);

            function Person() {
                this.isSpeaker = false;
                this.isPartial = false;
            }

            Object.defineProperty(Person.prototype, 'fullName', {
                get: function () {
                    var fn = this.firstName;
                    var ln = this.lastName;
                    var value = ln ? fn+' '+ln : fn;
                    return value;
                }
            });
        }

        function registerTimeSlot(metadataStore) {
            metadataStore.registerEntityTypeCtor('TimeSlot', TimeSlot);

            function TimeSlot() { }

            Object.defineProperty(TimeSlot.prototype, 'name', {
                get: function () {
                    var start = this.start;
                    var value = moment.utc(start).format('ddd hh:mm a');
                    return value;
                }
            });
        }
    }
})();