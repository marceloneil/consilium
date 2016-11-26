angular.module('MyApp')
  .controller('HomeCtrl', function($scope, $location, $window, $auth,$http) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
    
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    }
    
     $http.get('/advisor/get')
        .success(function(data) {
             $scope.advisors = data;
             console.log(data)
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
        
    
    $scope.getNumber = function(num) {
      return new Array(num);   
    }
    
    $scope.logout = function() {
      $auth.logout();
      delete $window.localStorage.user;
      $location.path('/');
    };
  });
