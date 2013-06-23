
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
            .when( '/list', {
                controller: ListCtrl,
                templateUrl: '/partials/list.html'

            })
            .when( '/list/:id', {
                controller: SingleListCtrl,
                templateUrl: '/partials/single-list.html'

            })
            .otherwise({ redirectTo: '/' })

    })
    .factory( 'lists', function( ) {

        if ( localStorage.angularMat === undefined ) {
            localStorage.angularMat = angular.toJson( { lists: [] } )
        }

        return {

            get: function () {
                var storage = angular.fromJson( localStorage.angularMat )
                return storage.lists
            },
            set: function( list ) {
                var storage = angular.fromJson( localStorage.angularMat )
                storage.lists.push( list )
                localStorage.angularMat = angular.toJson( storage )
                return storage.lists
            },
            remove: function( index ) {
                var storage = angular.fromJson( localStorage.angularMat )
                storage.lists.splice( index, 1 )
                localStorage.angularMat = angular.toJson( storage )
                return storage.lists
            },
            setFoodstuff: function( index, foodstuff ) {
                var storage = angular.fromJson( localStorage.angularMat ),
                    foodsList = storage.lists[ index ].foods,
                    exists = false


                angular.forEach( foodsList, function( food, index ) {
                    if ( food.name === foodstuff.name )
                        exists = true

                })

                if ( exists === true )
                    return foodstuff.name + ' finns redan i denna lista'

                storage.lists[ index ].foods.push( foodstuff )
                localStorage.angularMat = angular.toJson( storage )

                return foodstuff.name + ' har lagts till i listan'

            },
            removeFoodstuff: function( listIndex, foodstuffIndex ) {
                var storage = angular.fromJson( localStorage.angularMat )

                storage.lists[ listIndex ].foods.splice( foodstuffIndex, 1 )

                localStorage.angularMat = angular.toJson( storage )
                return storage.lists[ listIndex ].foods
            }

        }


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


function HomeCtrl( $scope, $location, matApi, lists ) {

    $scope.searchTerm = ''

    $scope.search = function() {
        $scope.message = ''

        if ( '' === $scope.searchTerm )
            $scope.message = 'Vänligen ange ett sökord'
        else
            $location.path( '/search/' + $scope.searchTerm )

    }


}


function SearchCtrl( $scope, $routeParams, matApi ) {

    $scope.term = $routeParams.term
    $scope.noResults = ''

    matApi
        .search()
        .then( function ( data ) {
            if ( data.length === 0 )
                $scope.noResults = 'inga resultat hittades'
            else
                $scope.results = data

        })

}


function FoodstuffCtrl( $scope, $routeParams, matApi, lists ) {

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


    $scope.lists = lists.get()

    $scope.save = function() {

        if ( $scope.listObject === undefined )
            return false

        var foodstuff = {
            name: $scope.foodstuff.name,
            number: $routeParams.id
        }

        angular.forEach( $scope.lists, function( list, index ) {
            if ( list.name === $scope.listObject.name ) {
                $scope.message = lists.setFoodstuff( index, foodstuff )
            }

        })
    }

}


function ListCtrl( $scope, lists ) {

    $scope.lists = lists.get()

    $scope.newList = function() {
        $scope.lists = lists.set({
            name: $scope.listTitle,
            foods: []
        })
        $scope.listTitle = ''
    }

    $scope.removeListItem = function( index ) {
        $scope.lists = lists.remove( index )
    }

}


function SingleListCtrl( $scope, $routeParams, lists ) {

    var allLists = lists.get(),
        currentList = allLists[ $routeParams.id ]

    $scope.foods = currentList.foods

    $scope.removeListItem = function( foodstuffIndex ) {
        $scope.foods = lists.removeFoodstuff( $routeParams.id, foodstuffIndex )
    }

}
