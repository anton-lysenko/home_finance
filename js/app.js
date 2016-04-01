(function () {
    var app = angular.module('mjournal-app', ['ui.router', 'ngResource', 'mjournal-controllers', 'ngNotificationsBar', 'ngSanitize', 'ui.bootstrap', 'mjournal-services'])
        .config(function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/index');
            var authenticated = ['$q', '$window', '$http', '$window', 'AuthService', 'ErrorHandling', function ($q, $window, $http, $window, AuthService, ErrorHandling) {

                var deferred = $q.defer();
                var userStatus = AuthService.getUser();

                userStatus.then(function (response) {
                    deferred.resolve();
                }, function (response) {
                    deferred.reject('Not logged in');
                });

                return deferred.promise;

            }];
            $stateProvider
                .state('index', {
                    url: '/index',
                    templateUrl: 'views/main.html',
                    controller: 'MainController',
                    controllerAs: 'mainCtrl'
                })
                .state('sign-in', {
                    url: '/sign-in',
                    templateUrl: 'views/sign-in.html',
                    controller: 'SignInController',
                    controllerAs: 'signInCtrl'
                })
                .state('sign-up', {
                    url: '/sign-up',
                    templateUrl: 'views/sign-up.html',
                    controller: 'SignUpController',
                    controllerAs: 'signUpCtrl'
                })
                .state('profile', {
                    url: '/profile',
                    templateUrl: 'views/profile.html',
                    controller: 'ProfileController',
                    controllerAs: 'profileCtrl',
                    resolve: {
                        authenticated: authenticated
                    }
                })
                .state('budget', {
                    url: '/budget',
                    templateUrl: 'views/budget.html',
                    controller: 'BudgetController',
                    controllerAs: 'budgetCtrl',
                    resolve: {
                        authenticated: authenticated
                    }
                })
                .state('reports', {
                    url: '/reports',
                    templateUrl: 'views/reports.html',
                    controller: 'ReportsController',
                    controllerAs: 'reportsCtrl',
                    resolve: {
                        authenticated: authenticated
                    }
                })
                .state('overview', {
                    url: '/overview',
                    templateUrl: 'views/overview.html',
                    controller: 'OverviewController',
                    controllerAs: 'overviewCtrl',
                    resolve: {
                        authenticated: authenticated
                    }
                })
                .state('transactions', {
                    url: '/transactions',
                    templateUrl: 'views/transactions.html',
                    controller: 'TransactionsController',
                    controllerAs: 'transactionsCtrl',
                    resolve: {
                        authenticated: authenticated
                    }
                })
                .state('transactions.add', {
                    url: '/add',
                    templateUrl: 'views/transactions.add.html',
                    controller: 'AddTransactionController',
                    controllerAs: 'addTransactionsCtrl'
                });
        }).run(function ($rootScope, $state, $log, $http, $window, User) {

            $rootScope.$on('$stateChangeError', function () {
                // Redirect user to our login page
                $state.go('sign-in');
            });
        });




})();
