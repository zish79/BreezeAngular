(function () {
    'use strict';

    var app = angular.module('app');

    // Configure Toastr
    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-bottom-right';

    var keyCodes = {
        backspace: 8,
        tab:9,
        enter:13,
        esc:27,
        space:32,
        pageup:33,
        pagedown:34,
        end:35,
        home:36,
        left:37,
        up:38,
        right:39,
        down:40,
        insert:45,
        del:46

    };

    // For use with the HotTowel-Angular-Breeze add-on that uses Breeze
    var remoteServiceName = 'breeze/Breeze';

    var imageSettings = {
        imageBasePath: 'content/images/photos/',
        unknownPersonImageSource:'unknown_person.jpg'
    };

    var events = {
        controllerActivateSuccess: 'controller.activateSuccess',
        hasChangesChanged:'datacontext.hasChangesChanged',
        spinnerToggle: 'spinner.toggle',
        storage: {
            error: 'store.error',
            storeChanged: 'store.changed',
            wipChanged: 'wip.changed'
        }
    };

    var config = {
        appErrorPrefix: '[HT Error] ', //Configure the exceptionHandler decorator
        docTitle: 'CRM: ',
        events: events,
        imageSettings: imageSettings,
        keyCodes: keyCodes,
        remoteServiceName: remoteServiceName,
        version: '2.1.0'
    };

    app.value('config', config);

    //#region Configure the zStorage 
    app.config(['zStorageConfigProvider', function (cfg) {
        cfg.config = {
            // These are the properties we need to set storage
            enabled: true,
            key: 'MvcApplication2',
            events: events.storage,
            wipKey: 'MvcApplication2.wip',
            appErrorPrefix: config.appErrorPrefix,
            newGuid: breeze.core.getUuid,
            version: config.version
        };
    }]);
    
    app.config(['$logProvider', function ($logProvider) {
        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }]);
    
    //#region Configure the common services via commonConfig
    app.config(['commonConfigProvider', function (cfg) {
        cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
        cfg.config.spinnerToggleEvent = config.events.spinnerToggle;
    }]);
    //#endregion
})();