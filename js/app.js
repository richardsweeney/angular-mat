
var app = angular
    .module( 'matApp', [] )
    .config( function( $routeProvider, $locationProvider ) {

        $locationProvider.html5Mode( true )

        $routeProvider
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
    .factory( 'matApi', function( $http, $q, $routeParams ) {

        delete $http.defaults.headers.common['X-Requested-With']

        return {
            search: function() {
                //create our deferred object.
                var deferred = $q.defer()

                $http
                    .get( 'http://matapi.se/foodstuff/?query=' + $routeParams.term )
                    .success( function( results ) {
                        deferred.resolve( results )

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


function SearchCtrl( $scope, $routeParams, matApi ) {

    $scope.term = $routeParams.term

    matApi
        .search()
        .then( function ( data ) {
            if ( data.length === 0 )
                alert( 'no results!' )
            else
                $scope.results = data

        })

}


function FoodstuffCtrl( $scope, $routeParams, $location, matApi ) {

    matApi
        .getFoodstuff( $routeParams.id )
        .then( function ( data ) {

            // Prepare the foodstuff object
            $scope.foodstuff = {
                name: data.name,
                properties: [
                    { name: 'Kolhydrater',      value: data.nutrientValues.carbohydrates    },
                    { name: 'Protein',          value: data.nutrientValues.protein          },
                    { name: 'Energy (Kcal)',    value: data.nutrientValues.energyKcal       },
                    { name: 'Fett',             value: data.nutrientValues.fat              },
                    { name: 'Kolesterol',       value: data.nutrientValues.cholesterol      }
                ]
            }

        })

    $scope.save = function() {
        console.log( $scope.foodstuff )
    }

}
