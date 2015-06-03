angular.module('<%= angularAppName %>.home', [<% if (wakandaModule) { %>'wakanda'<% } %><% if (ionicModule) { %>, 'ionic' <% } %>])

    .config(function ($stateProvider) {

        $stateProvider

            .state('home', {
                url: "/",
                templateUrl: "views/main.html",
                controller: "MainCtrl"
            })

    })

    .controller('MainCtrl', function($scope<% if (wakandaModule) { %>, $wakanda<% } %>) {

        $scope.components = [
            { text: "Wakanda", checked: <%= wakandaModule %>, image : "images/wakanda.png" },
            { text: "Angular", checked: <%= wakandaModule %>, image : "images/angular-wakanda.png"  },
            { text: "Ionic", checked: <%= ionicModule %>, image : "images/ionic.png"  },
            { text: "Cordova", checked: true, image : "images/cordova.png" }
        ];

        $scope.plugins = [
            { text: "Angular-Wakanda", checked: <%= wakandaModule %> },
            { text: "Ionic JS", checked: <%= ionicModule %> },
            { text: "Ionic CSS", checked: <%= ionicModule %> },
            { text: "jQuery", checked: <%= jqueryModule %> },
            { text: "ngCordova", checked: <%= ngCordovaModule %> }
        ];

        $scope.documentation = [
            { text: "AngularJS", url: "https://angularjs.org/" },
            { text: "Angular-Wakanda", url: "http://www.wakanda.org/angular-wakanda/" },
            { text: "Ionic", url: "http://ionicframework.com/docs/" },
            { text: "Cordova", url: "https://cordova.apache.org/" }
        ];
        $scope.serverStatus = { text : { online : false }, status : false };
        <% if (wakandaModule) { %>
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange=function(){
          if (xmlhttp.readyState==4 && xmlhttp.status==200){
            $scope.serverStatus = { text : { online : true }, status : true };
          }
        }
        xmlhttp.open("GET","/rest/$directory/currentUser",true);
        xmlhttp.send();
        <% } %>

        $scope.dataModel = { status : false, model : {} };
        <% if (wakandaModule && dummydata) { %>
        $wakanda.init().then(function (ds) {
            $scope.contacts = ds.Contact.$find({
                pageSize : 5
            });
            $scope.dataModel.status = true; 
            $scope.dataModel.model = $scope.contacts;

        }).catch(function(err){
            console.error(err)
        });
        <% } %>
      
    });

