
(function(self) {
  // var deps = [
  //   'ngResource',
  //   'ngRoute'
  // ];


  /*
   * App
   */

  var app = angular.module('App', []);


  // config
  // app
  //   .config(function($route) {
  //     // TODO
  //   });


  // ---
  app
    // .controller('SeosController', function($scope, $timeout) {
    //   $timeout(function() {
    //     $scope.title = 'Awesome Title!';
    //     $scope.description = 'This is the awesomeness known as awesome';
    //   }, 1000);
    // })
    .directive('seoHead', function($timeout) {
      return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
        },
        link: function(scope, element, attrs) {
          $timeout(function() {
            scope.title = 'Awesome Title!';
            scope.description = 'This is the awesomeness known as awesome';
          }, 1000);
        }
      };
    })
    .directive('productsList', function($timeout) {
      return {
        restrict: 'A',
        controller: function($scope, $attrs, $element) {
          $scope.products = [];

          // simulate slow http
          $timeout(function() {
            $scope.products = [
              {name: 'One'},
              {name: 'Three'},
              {name: 'Four'}
            ];
          }, 1000);
        }
      };
    });
})();
