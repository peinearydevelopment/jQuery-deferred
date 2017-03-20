(function () {
    function whenViewModel() {
        var self = this;

        self.messages = ko.observableArray([]);
        self.addDeferred = addDeferred;
        self.whenDeferreds = ko.observableArray([]);
        self.deferredCount = ko.pureComputed(function () { return self.whenDeferreds().length; }, this);
        self.options = ko.observable({ allowReject: false, allowDelayResolve: false });
        self.callWhen = callWhen;
        self.clear = clear;
        self.resolvedPromises = ko.observable({});
        self.allDeferredsFailedResolved = ko.observable(true);
        self.callResolveRemaining = callResolveRemaining;

        clear();

        function callResolveRemaining() {
            var whenDeferreds = self.whenDeferreds();
            for (var i = 0, l = whenDeferreds.length; i < l; i++) {
                var whenDeferred = whenDeferreds[i];
                if (whenDeferred.state() !== 'resolved' && whenDeferred.state() !== 'rejected') {
                    whenDeferred.resolve(getRandomWaitTime());
                }
            }
        }

        //function allDeferredsFailedResolved() {
        //    var allDefsFailedResolved = true;
        //    var hasOwnProperties = false;
        //    var resolvedPromises = self.resolvedPromises();
        //    for (var prop in resolvedPromises) {
        //        if (resolvedPromises.hasOwnProperty(prop)) {
        //            hasOwnProperties = true;
        //            var a = resolvedPromises[prop];
        //            var b = a();
        //            allDefsFailedResolved = allDefsFailedResolved && b;
        //        }
        //    }

        //    self.allDeferredsFailedResolved(allDefsFailedResolved && hasOwnProperties);
        //}

        function clear() {
            self.messages([]);
            self.whenDeferreds([]);
            addDeferred();
        }

        function callWhen() {
            //http://www.tentonaxe.com/index.cfm/2011/9/22/Using-jQuerywhen-with-a-dynamic-number-of-objects
            //$.when.apply(this, $.map(self.whenDeferreds(), function(def) {
            //    return def;
            //}))
            //var funcs = new Array(self.whenDeferreds());
            //funcs.push(allDeferredsFailedResolved);
            //$.when.apply(this, funcs)
            $.when.apply(this, self.whenDeferreds())
            .then(
                function () {
                    self.messages.push('When then success.');
                },
                function () {
                    self.messages.push('When then fail.');
                },
                [
                    function () {
                        self.messages.push('When then progress.');
                    },
                    function () {
                        self.messages.push('When then progress2.');
                    }
                ]
            ).done(
                function () {
                    self.messages.push('When done success.');
                },
                [
                    function () {
                        self.messages.push('When done fail.');
                    },
                    function () {
                        self.messages.push('When done fail2.');
                    }
                ],
                function () {
                    self.messages.push('When done progress.');
                }
            );

            $.map(self.whenDeferreds(), function (def) {
                return invokeRandomAction(def, self.options());
            });

            self.messages.push('Outside of when finished.');
        }

        function addDeferred() {
            self.whenDeferreds.push(createDeferred(self.deferredCount() + 1));
        }

        function createDeferred(id) {
            var def = new $.Deferred();

            self.resolvedPromises()[id] = ko.pureComputed(function() { return def.state() === 'resolved' || def.state() === 'rejected'; }, this);
            def.done(function (timeoutWait) {
                self.messages.push('Deferred ' + id + ' done after ' + timeoutWait + 'ms.');
            });

            def.fail(function (timeoutWait) {
                self.messages.push('Deferred ' + id + ' rejected after ' + timeoutWait + 'ms.');
            });

            def.progress(function (timeoutWait) {
                self.messages.push('Deferred ' + id + ' progressed after ' + timeoutWait + 'ms.');
            });

            def.always(function (timeoutWait) {
                self.messages.push('Deferred ' + id + ' alwaysed after ' + timeoutWait + 'ms.');
            });

            return def;
        }

        function invokeRandomAction(defObject, opts) {
            var waitTime = getRandomWaitTime();
            var func = defObject.resolve;

            if (opts.allowReject && Math.ceil(waitTime) % 3 === 0) {
                func = defObject.reject;
            } else if (opts.allowDelayResolve && Math.ceil(waitTime) % 3 === 1) {
                func = defObject.notify;
            }

            invokeFuncWithWaitTime(func, waitTime);
        }

        function invokeFuncWithWaitTime(func, waitTime) {
            setTimeout(function () {
                func(waitTime);
            }, waitTime);
        }

        function getRandomWaitTime() {
            return Math.random() * 1000;
        }
    }

    ko.applyBindings(new whenViewModel());
}())