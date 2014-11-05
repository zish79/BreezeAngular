(function () {
    'use strict';

    angular
        .module('app')
        .factory('model.validation', modelValidation);

    modelValidation.$inject = ['common'];

    function modelValidation(common) {
        var entityNames;
        var Validator = breeze.Validator;
        var logError = common.logger.getLogFn('model.validation');
        var requireRferenceValidator;
        var service = {
            createandRegister: createandRegister
        };

        return service;

        function createandRegister(eNames) {
            entityNames = eNames;
            requireRferenceValidator = createReferenceValidator();
            Validator.register(requireRferenceValidator);

            log('Validators created and register', null, 'model.validation', false);
        }

        function createReferenceValidator() {
            var name = 'requireReferenceEntity';
            var ctx = {
                messageTemplate: 'Missing %displayName%',
                isRequired: true
            };
            var val = new Validator(name,valFunction,ctx);
            function valFunction(value) {
                return value ? value.id !== 0 : false;
            }
        }
    }
})();