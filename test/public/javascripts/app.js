
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
    .factory('SeoService', function() {
      var title = '';
      var description = '';

      return {
        title: function(val) {
          if ('undefined' !== typeof val) {
            title = val;
          }
          return title;
        },
        description: function(val) {
          if ('undefined' !== typeof val) {
            description = val;
          }
          return description;
        }
      };
    })
    .directive('seoHead', function($timeout, SeoService) {
      return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
          $scope.title = SeoService.title;
          $scope.description = SeoService.description;
        }
      };
    })
    .directive('productsList', function($timeout, SeoService) {
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

            SeoService.title('Awesome Title!');
            SeoService.description('This is the awesomeness known as awesome');
          }, 500);
        }
      };
    });
})();
