angular.module('<%= angularAppName %>', ['wakanda', '<%= angularAppName %>.home'<% if (ionicModule) { %>, 'ionic' <% } %><% if (ngCordovaModule) { %>, 'ngCordova'<% } %>])
    
    .run(function (<% if (ionicModule) { %>$ionicPlatform, <% } %>$rootScope) {
        <% if (ionicModule) { %>
        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
        <% } %>
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
    });