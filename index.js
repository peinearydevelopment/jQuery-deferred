(function() {
    function indexViewModel() {
        var self = this;

        self.deferredObject = ko.observable({});
        self.deferredObjectPromise = ko.observable({});
        self.deferredObjectState = ko.observable({});
        self.deferredObjectStateString = ko.observable('');
        self.handlerMessages = ko.observableArray([]);
        createDeferred();

        self.resolveDeferredObject = resolveDeferredObject;
        self.rejectDeferredObject = rejectDeferredObject;
        self.notifyDeferredObject = notifyDeferredObject;
        self.hidePre = ko.observable(false);
        self.createNewDeferred = createDeferred;
        self.deferredObjectIsResolved = ko.pureComputed(computeObjectIsResolved);
        self.deferredObjectIsRejected = ko.pureComputed(computeObjectIsRejected);
        self.deferredObjectString = ko.pureComputed(function () { return createObjectString(self.deferredObject()); });
        self.deferredObjectPromiseString = ko.pureComputed(function () { return createObjectString(self.deferredObjectPromise()); });
        self.handlerTypes = ko.observableArray(['always', 'done', 'fail', 'progress']);
        self.addHandlers = addHandlers;

        function resolveDeferredObject() {
            handleEvent(self.deferredObject().resolve);
        }

        function rejectDeferredObject() {
            handleEvent(self.deferredObject().reject);
        }

        function notifyDeferredObject() {
            handleEvent(self.deferredObject().notify, ' (after notification)');
        }

        function createDeferred() {
            self.deferredObject(new $.Deferred());
            self.deferredObjectPromise = ko.observable(self.deferredObject().promise());
            handleEvent();
            self.handlerMessages([]);
        }

        function handleEvent(func, additionalMessage) {
            additionalMessage = additionalMessage || '';

            if (func) {
                func();
            }
            
            self.deferredObjectStateString('Deferred object ' + self.deferredObject().state() + additionalMessage);
            self.deferredObjectState(self.deferredObject().state());
        }

        function computeObjectIsResolved() {
            return self.deferredObjectState() === 'resolved';
        }

        function computeObjectIsRejected() {
            return self.deferredObjectState() === 'rejected';
        }

        function addHandlers() {
            var handlerTypes = self.handlerTypes();
            for (var i = 0, l = handlerTypes.length; i < l; i++) {
                var handlerType = handlerTypes[i];
                self.handlerMessages.push('Handler type: ' + handlerType + ' added.');
                self.deferredObject()[handlerType](
                    (function (type) {
                        return function() {
                            self.handlerMessages.push(type + ' invoked.');
                        }
                    })(handlerType)
                );
            }
        }
    }

    indexViewModel.prototype.toJSON = function () {
        var copy = this;

        copy.deferredObjectString = createObjectWithFunctionsForToJsonString(copy.deferredObject);
        copy.deferredObjectPromiseString = createObjectWithFunctionsForToJsonString(copy.deferredObjectPromise);

        return copy;
    }

    function createObjectWithFunctionsForToJsonString(obj) {
        var objString = {};

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && typeof obj[prop] === 'function')
                objString[prop] = obj[prop].toString();
        }

        return objString;
    }

    function createObjectString(obj) {
        var str = '{\n\r';

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && typeof obj[prop] === 'function') {
                str += '   \'' + prop + '\': \'function () { ...}\n\r';
            }
            else {
                str += '   \'' + prop + '\': \'' + obj[prop].toString() + '\n\r';
            }
        }

        str += '}';

        return str;
    }

    ko.applyBindings(new indexViewModel());
}())