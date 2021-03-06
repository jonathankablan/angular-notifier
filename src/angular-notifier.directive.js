(function() {
    'use strict';
    angular.module('llNotifier').
    directive('llNotification', function($timeout, llNotificationTemplateUrl, llConstants) {
        return {
            scope: true,
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            templateUrl: llNotificationTemplateUrl,
            transclude: true,
            link: function(scope) {
                var notification = scope.notification;
                notification.isShown = true;

                /**
                 * Remove the notification from the parent scope
                 */
                var removeNotification = function removeNotification() {
                    scope.notification.isShown = false;
                    // Let some time before removing the notification from the collection
                    // because of the animation!
                    $timeout(function() {
                        var notifications = scope.$parent.notifications;
                        for (var i = notifications.length - 1; i >= 0; i--) {
                            if (!notifications[i].isShown) {
                                scope.$parent.notifications.splice(i, 1);
                            }
                        }
                    }, llConstants.FADE_DELAY);
                };

                scope.closeNotification = removeNotification;
                scope.notification.close = removeNotification;
                notification.timeout(removeNotification);
                notification.isCentered = notification.position.indexOf('center') !== -1;
            }
        };
    }).
    directive('llNotificationContent', function($compile) {
        /**
         * Decorator that populate the notification scope from the config object
         * passed in the argument of the service
         * @param {scope} scope the scope of the notification
         */
        function ScopeDecorator(scope) {
            this.scope = scope;
        }
        ScopeDecorator.prototype = {
            /**
             * Populate with the notification attributes
             * @return {scope} the scope of the notification
             */
            populateWith: function(scopeToAdd) {
                // notification.scope === scope defined in the config object
                if (typeof scopeToAdd === 'object') {
                    for (var key in scopeToAdd) {
                        this.scope[key] = scopeToAdd[key];
                    }
                }
                return this.scope;
            }
        };

        /**
         * Decorator that wraps the template with an HTML tag
         * @param {String} template the template to wrap
         */
        function TemplateDecorator(template) {
            this.template = template;
        }
        TemplateDecorator.prototype = {
            /**
             * Wrap the template
             * @return {String} the wrapped tempalte
             */
            toTemplate: function() {
                return '<div>' + this.template + '</div>';
            }
        };

        return {
            scope: true,
            restrict: 'E',
            transclude: true,
            link: function(scope, element) {
                scope = new ScopeDecorator(scope).populateWith(scope.notification.scope);
                element.replaceWith($compile(new TemplateDecorator(scope.notification.template).toTemplate())(scope));
            }
        };
    });
})();
