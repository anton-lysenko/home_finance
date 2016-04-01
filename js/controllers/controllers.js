(function () {
    'use strict';
    angular.module('mjournal-controllers', ['mjournal-const', 'mjournal-services', 'ngNotificationsBar', 'ngSanitize', 'ui.bootstrap'])
        .controller('IndexController', IndexController)
        .controller('MainController', MainController)
        .controller('SignInController', SignInController)
        .controller('SignUpController', SignUpController)
        .controller('ProfileController', ProfileController)
        .controller('BudgetController', BudgetController)
        .controller('ReportsController', ReportsController)
        .controller('OverviewController', OverviewController)
        .controller('TransactionsController', TransactionsController)
        .controller('AddTransactionController', AddTransactionController);

    IndexController.$inject = ['AuthService', 'User', '$rootScope', '$state', '$http', '$window'];

    function IndexController(AuthService, User, $rootScope, $state, $http, $window) {
        var vm = this;
        vm.user = {};
        vm.logOut = logOut;

        vm.navItems = [];

        vm.selectedNavItem = vm.navItems[0];
        vm.setSelectedNavItem = function (item) {
            vm.selectedNavItem = item;
        }
        vm.navItemClass = navItemClass;

        activate();
        /////////
        $rootScope.$on('userUpdated', function () {

            var userStatus = AuthService.getUser();

            userStatus.then(function (response) {
                User.authStatus = response.status;
                User.email = response.email;
                User.first_name = response.first_name;
                User.last_name = response.last_name;
                User.money_flows = response.money_flows;
                vm.user = User;
                vm.navItems = GetNavItems(User.authStatus);
            }, function (response) {
                User.authStatus = response.status;
                vm.user = User;
                vm.navItems = GetNavItems(User.authStatus);
            });
        });

        /////////
        function activate() {
            var userStatus = AuthService.getUser();

            userStatus.then(function (response) {
                User.authStatus = response.status;
                User.email = response.email;
                User.first_name = response.first_name;
                User.last_name = response.last_name;
                User.money_flows = response.money_flows;
                $rootScope.$broadcast('userUpdated');
            }, function (response) {
                User.authStatus = response.status;
                $rootScope.$broadcast('userUpdated');
            });
        }

        function logOut() {
            AuthService.logOut();
            $state.go('sign-in');
        }

        function GetNavItems(userStatus) {
            return [
                {
                    link: 'sign-in',
                    title: 'Sign In',
                    visible: !userStatus,
                    route: 'sign-in'
                        },
                {
                    link: 'sign-up',
                    title: 'Sign Up',
                    visible: !userStatus,
                    route: 'sign-up'
                        },
                {
                    link: 'overview',
                    title: 'Overview',
                    visible: userStatus,
                    route: 'overview'
                        },
                {
                    link: 'transactions',
                    title: 'Transactions',
                    visible: userStatus,
                    route: 'transactions'
                        },
                {
                    link: 'reports',
                    title: 'Reports',
                    visible: userStatus,
                    route: 'reports'
                        },
                {
                    link: 'budget',
                    title: 'Budget',
                    visible: userStatus,
                    route: 'budget'
                        },
                {
                    link: 'profile',
                    title: 'My Profile',
                    visible: userStatus,
                    route: 'profile'
                        }
                    ];
        }

        function navItemClass(item) {
            if ($state.current.name == item.route) {
                return "active";
            } else {
                return "";
            }
        }

    }

    MainController.$inject = [];

    function MainController() {
        var vm = this;
        //vm.availableCurrancies = Currency.query();
    }

    SignInController.$inject = ['AuthService', 'notifications', '$state', '$rootScope'];

    function SignInController(AuthService, notifications, $state, $rootScope) {
        var vm = this;
        vm.signInUserByEmail = signInUserByEmail;

        function signInUserByEmail() {
            AuthService.signInUser(vm.user)
                .then(function (response) {
                    notifications.showSuccess({
                        message: "You've successfully signed in.",
                        hideDelay: 2000,
                        hide: true
                    });
                    $rootScope.$broadcast('userUpdated');
                    $state.go('overview');
                }, function (errorResponse) {
                    notifications.showError({
                        message: errorResponse.message,
                        hideDelay: 2000,
                        hide: true
                    });
                });
        }
    }

    SignUpController.$inject = ['AuthService', 'notifications', '$state'];

    function SignUpController(AuthService, notifications, $state) {
        var vm = this;
        vm.createUser = createUser;

        function createUser() {
            AuthService.signUpUser(vm.user)
                .then(function (response) {
                    notifications.showSuccess({
                        message: "Thank you for registering.",
                        hideDelay: 2000,
                        hide: true
                    });
                    $state.go('overview');
                }, function (errorResponse) {
                    notifications.showError({
                        message: errorResponse.message,
                        hideDelay: 2000,
                        hide: true
                    });
                });
        }
    }

    ProfileController.$inject = ['$scope', 'User', 'Currency', 'MoneyFlow', 'Account', 'Category', '$rootScope'];

    function ProfileController($scope, User, Currency, MoneyFlow, Account, Category, $rootScope) {
        var vm = this;
        vm.user = User;
        vm.moneyFlows = MoneyFlow.query();
        vm.accounts = Account.query();
        vm.categories = Category.query();
        vm.currencies = Currency.query();
        vm.addMoneyFlow = addMoneyFlow;
        vm.addAccount = addAccount;
        vm.addCategory = addCategory;
        vm.addCurrency = addCurrency;
        vm.category = {
            name: "",
            income: false,
            outcome: false
        };
        vm.editData = editData;
        vm.saveUserData = saveUserData;
        vm.saveMoneyFlow = saveMoneyFlow;
        vm.saveCategory = saveCategory;
        vm.saveCurrency = saveCurrency;
        vm.saveAccount = saveAccount;
        ///////
        function addAccount(account) {
            Account.save(account, function (response) {
                vm.accounts.push(response);
                $scope.addAccountForm.$setPristine();
                vm.account = {};
            });
        }

        function addCategory(category) {
            Category.save(category, function (response) {
                vm.categories.push(response);
                $scope.addCategoryForm.$setPristine();
                vm.category = {};
            });
        }

        function addCurrency(currency) {
            Currency.save(currency, function (response) {
                vm.currencies.push(response);
                $scope.addCurrencyForm.$setPristine();
                vm.currency = {};
            });
        }

        function addMoneyFlow(moneyFlow) {
            MoneyFlow.save(moneyFlow, function (res) {
                vm.moneyFlows.push(res);
                $scope.addMoneyFlowForm.$setPristine();
                vm.moneyFlow = {};
            });
        }

        function editData(dataObject) {
            dataObject.editable = true;
        }

        function saveUserData(dataObject) {
            User.service.update({
                id: dataObject.id
            }, dataObject);
            dataObject.editable = false;
        }

        function saveMoneyFlow(dataObject) {
            MoneyFlow.update({
                id: dataObject.id
            }, dataObject);
            dataObject.editable = false;
        }

        function saveCategory(dataObject) {
            dataObject.editable = false;
        }

        function saveCurrency(dataObject) {
            Currency.update({
                id: dataObject.id
            }, dataObject);
            dataObject.editable = false;
        }

        function saveAccount(dataObject) {
            Account.update({
                id: dataObject.id
            }, dataObject);
            dataObject.editable = false;
        }
    }

    BudgetController.$inject = [];

    function BudgetController() {
        var vm = this;
    }

    ReportsController.$inject = [];

    function ReportsController() {
        var vm = this;
    }

    OverviewController.$inject = ['MoneyFlow'];

    function OverviewController(MoneyFlow) {
        var vm = this;
        vm.availableMoneyFlows = MoneyFlow.query();
        console.log(vm.availableMoneyFlows);
    }

    TransactionsController.$inject = ['Transaction', 'Category', 'Account', '$filter'];

    function TransactionsController(Transaction, Category, Account, $filter) {
        var vm = this;
        vm.transactions = Transaction.query(function (data) {
            return data;
        });
        vm.showTransactionForm = false;
        vm.showAddTransactionForm = showAddTransactionForm;
        vm.hideAddTransactionForm = hideAddTransactionForm;


        /////////////////



        function showAddTransactionForm() {
            vm.showTransactionForm = true;
        }

        function hideAddTransactionForm() {
            vm.showTransactionForm = false;
            vm.transaction = {};
        }
    }

    AddTransactionController.$inject = ['Transaction', 'Category', 'Account', '$filter'];

    function AddTransactionController(Transaction, Category, Account, $filter) {
        var vm = this;
        vm.accounts = Account.query();
        vm.categories = Category.query(function (data) {
            return data;
        });
        vm.today = function () {
            vm.dt = new Date();
        };
        vm.today();
        vm.open = function ($event) {
            vm.status.opened = true;
        };
        vm.format = 'yyyy-MM-dd';
        vm.status = {
            opened: false
        };
        vm.addTransaction = addTransaction;
        vm.transactionTabs = getTransactionTabs();
        /////////
        function addTransaction(transaction) {

            var res = Transaction.save(transaction, function (data) {
                vm.transactions.push(data);
                vm.transaction = {};
            });
        }

        function getTransactionTabs() {
            var transactionTabs = [
                {
                    title: 'Income',
                    category: true,
                    incomeAccount: true,
                    outcomeAccount: false,
                    incomeSum: true,
                    outcomeSum: false
            },
                {
                    title: 'Outcome',
                    category: true,
                    incomeAccount: false,
                    outcomeAccount: true,
                    incomeSum: false,
                    outcomeSum: true
            },
                {
                    title: 'Transfer',
                    category: false,
                    incomeAccount: true,
                    outcomeAccount: true,
                    incomeSum: false,
                    outcomeSum: true
            }
        ];
            return transactionTabs;
        }
    };
})();
