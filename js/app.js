
var app = angular
    .module( 'matApp', [] )
    .config( function( $routeProvider, $locationProvider ) {

        $locationProvider.html5Mode( true )

        $routeProvider
            .when( '/', {
                controller: HomeCtrl
            })
            .when( '/search/:term', {
                controller: SearchCtrl,
                templateUrl: '/partials/search.html'

            })
            .when( '/foodstuff/:id', {
                controller: FoodstuffCtrl,
                templateUrl: '/partials/foodstuff.html'

            })
            .otherwise({ redirectTo: '/' })

    })
    .factory( 'matApi', function( $http, $q ) {

        delete $http.defaults.headers.common['X-Requested-With']

        return {
            search: function( term ) {
                //create our deferred object.
                var deferred = $q.defer()

                $http
                    .get( 'http://matapi.se/foodstuff/?query=' + term )
                    .success( function( data ) {
                        deferred.resolve( data )

                    })
                    .error( function() {
                        deferred.reject()

                    })

                return deferred.promise
            },
            getFoodstuff: function( id ) {
                //create our deferred object.
                var deferred = $q.defer()

                $http
                    .get( 'http://matapi.se/foodstuff/' + id )
                    .success( function( data ) {
                        deferred.resolve( data )

                    })
                    .error( function() {
                        deferred.reject()

                    })

                return deferred.promise
            }
        }

    })


function HomeCtrl( $scope, $location, matApi ) {

    $scope.search = function() {
        $location.path( '/search/' + $scope.searchTerm )
    }

}


function SearchCtrl( $scope, $routeParams, $location, matApi ) {
    $scope.results = []

    matApi
        .search( $routeParams.term )
        .then( function ( data ) {
            $scope.results = data
        })

}


function FoodstuffCtrl( $scope, $routeParams, $location, matApi ) {

    $scope.foodstuff = {}

    $scope.getFoodStuff = function( $event, id ) {
        $event.preventDefault()
        $scope.foodstuff = {}

        matApi
            .getFoodstuff( id )
            .then( function ( data ) {

                // Prepare the foodstuff object
                $scope.foodstuff = {
                    name: data.name,
                    properties: [
                        { name: 'kolhydrater',      value: data.nutrientValues.carbohydrates    },
                        { name: 'protein',          value: data.nutrientValues.protein          },
                        { name: 'energy (Kcal)',    value: data.nutrientValues.energyKcal       },
                        { name: 'fett',             value: data.nutrientValues.fat              },
                        { name: 'kolesterol',       value: data.nutrientValues.cholesterol      }
                    ]
                }

            })

    }

}
