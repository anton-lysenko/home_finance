(function () {
    'use strict';
    angular.module('mjournal-services', ['mjournal-const', 'ngNotificationsBar', 'ngSanitize'])
        .factory('ErrorHandling', ErrorHandling)
        .factory('User', User)
        .factory('AuthService', AuthService)
        .factory('MoneyFlow', MoneyFlow)
        .factory('Currency', Currency)
        .factory('Category', Category)
        .factory('Account', Account)
        .factory('Transaction', Transaction);

    ErrorHandling.$inject = ['notifications']


    function ErrorHandling(notifications) {

        var errorHandler = {};
        errorHandler.notify = notify;

        function notify(message, status) {
            notifications.showError({
                message: message,
                hideDelay: 2000,
                hide: true
            });
        }

        return errorHandler;
    }

    User.$inject = ['apiURL', '$resource'];

    function User(apiURL, $resource) {

        var user = {};

        user.service = $resource(apiURL + '/user',{},{
            update: {
                method: 'PUT'
            }
        });

        return user;
    }

    AuthService.$inject = ['User', 'apiURL', '$resource', '$q', '$http', '$rootScope', '$window', 'MoneyFlow'];

    function AuthService(User, apiURL, $resource, $q, $http, $rootScope, $window, MoneyFlow) {
        var auth = {};

        auth.signInUser = signInUser;
        auth.signUpUser = signUpUser;
        auth.getUser = getUser;
        auth.logOut = logOut;

        function signInUser(userData) {
            var deferred = $q.defer();
            $http({
                method: "post",
                url: apiURL + '/login',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: userData
            }).success(function (data) {
                $window.sessionStorage.setItem('token', data.token);
                deferred.resolve();
            }).error(function (data, status) {
                console.log(data, status);
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function signUpUser(userData) {
            var deferred = $q.defer();
            $http.post(apiURL + '/users/', userData).success(function (data) {
                signInUser(userData);
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function logOut() {
            $window.sessionStorage.setItem('token', '');
            $rootScope.$broadcast('userUpdated');
        }

        function getUser() {
            var token = $window.sessionStorage.getItem('token') || false;
            var deferred = $q.defer();
            if (token) {

                $http.defaults.headers.common['Token'] = token;
                var res = User.service.get();
                res.$promise.then(UserSuccess, UserError);

                function UserSuccess(response) {
                    response.status = true;
                    deferred.resolve(response);
                }

                function UserError(response) {
                    $http.defaults.headers.common['Token'] = '';
                    $window.sessionStorage.getItem('token', '');
                    deferred.reject({
                        status: false
                    })
                }
                return deferred.promise;

            } else {
                //$window.sessionStorage.setItem('token','');
                deferred.reject({
                        status: false
                    })
                    //return false;
                return deferred.promise;
            }

        }

        return auth;
    }

    MoneyFlow.$inject = ['User', 'apiURL', '$resource'];

    function MoneyFlow(User, apiURL, $resource) {
        return $resource(apiURL + '/moneyflows/:id', null, {
            get: {
                //isArray: true
            },
            update: {
                method: 'PUT',
            }
        }, {
            stripTrailingSlashes: false
        });
    }

    Currency.$inject = ['apiURL', '$resource', 'User'];

    function Currency(apiURL, $resource, User) {
        return $resource(apiURL + '/currencies/:id', {
            money_flow_id: User.money_flows[0].id
        }, {
            get: {
                isArray: true
            },
            update: {
                method: 'PUT',
                params: {
                    money_flow_id: User.money_flows[0].id
                }
            }
        }, {
            stripTrailingSlashes: false
        });
    }

    Category.$inject = ['apiURL', '$resource', 'User'];

    function Category(apiURL, $resource, User) {
        return $resource(apiURL + '/categories/:id', {
            money_flow_id: User.money_flows[0].id
        }, {}, {
            stripTrailingSlashes: false
        });
    }

    Account.$inject = ['apiURL', '$resource', 'User', 'MoneyFlow'];

    function Account(apiURL, $resource, User, MoneyFlow) {

        return $resource(apiURL + '/accounts/:id', {
            money_flow_id: User.money_flows[0].id
        }, {
            get: {
                isArray: true
            },
            update: {
                method: 'PUT'
            }
        }, {
            stripTrailingSlashes: false
        });

    }

    Transaction.$inject = ['apiURL', '$resource', 'User'];

    function Transaction (apiURL, $resource, User) {
        return $resource(apiURL + '/transactions/:id', {
            money_flow_id: 21
        }, {}, {
            stripTrailingSlashes: false
        });
    }

})();
