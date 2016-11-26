angular.module('MyApp')
  .controller('ProfilePageCtrl', function($scope, $location, $window, $auth, $http, $routeParams) {
    
    console.log($routeParams[0].id);
    
    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
    
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
    
    $http.get('/advisor/get')
        .success(function(data) {
             $scope.advisors = data;
             for (i = 0; i < data.length; i++) {
               if ($routeParams.id == data[i].id) {
                 $scope.currentData = data[i]
                 console.log(data[i])
               }
             }
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    
    $scope.logout = function() {
      $auth.logout();
      delete $window.localStorage.user;
      $location.path('/');
    };
  });
