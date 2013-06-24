
var app = angular
    .module( 'matApp', ['ngSanitize'] )
    .config( function( $routeProvider, $locationProvider ) {

        $locationProvider.html5Mode( true )

        $routeProvider

            .when( '/', {
                controller: HomeCtrl,
                templateUrl: '/partials/home.html'

            })
            .when( '/search/:term', {
                controller: SearchCtrl,
                templateUrl: '/partials/search.html',
                resolve: {
                    results: function( $q, $http, $route ) {

                        delete $http.defaults.headers.common['X-Requested-With']

                        var term = $route.current.params.term,
                            deferred = $q.defer()

                        $http
                            .get( 'http://matapi.se/foodstuff/?query=' + term )
                            .success( function( results ) {
                                deferred.resolve( results )

                            })
                            .error( function() {
                                deferred.reject( 'Inga resultat' )

                            })

                        return deferred.promise
                    }
                }

            })
            .when( '/foodstuff/:id', {
                controller: FoodstuffCtrl,
                templateUrl: '/partials/foodstuff.html',
                resolve: {
                    foodstuff: function( $q, $http, $route ) {

                        delete $http.defaults.headers.common['X-Requested-With']

                        var deferred = $q.defer(),
                            id = $route.current.params.id

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
    .factory( 'lists', function() {

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
                    exists = false,
                    result = {
                        name: foodstuff.name,
                        list: storage.lists[ index ].name
                    }


                angular.forEach( foodsList, function( food, index ) {
                    if ( food.name === foodstuff.name )
                        exists = true

                })


                if ( exists === true ) {
                    result.success = false
                    return result
                }

                storage.lists[ index ].foods.push( foodstuff )
                localStorage.angularMat = angular.toJson( storage )

                result.success = true
                return result

            },
            removeFoodstuff: function( listIndex, foodstuffIndex ) {
                var storage = angular.fromJson( localStorage.angularMat )

                storage.lists[ listIndex ].foods.splice( foodstuffIndex, 1 )

                localStorage.angularMat = angular.toJson( storage )
                return storage.lists[ listIndex ].foods
            }

        }


    })






/*****************************************************************

    ********************** CONTROLLERS **********************

*****************************************************************/


function HomeCtrl( $scope, $location ) {

    window.addEventListener( 'load', function() {
        window.setTimeout( function() {
            window.scrollTo( 0, 1 )
        }, 0 )
    })

    $scope.searchTerm = ''
    $scope.message = ''

    $scope.search = function() {
        $scope.message = ''

        if ( '' === $scope.searchTerm ) {
            $scope.message = 'Vänligen ange ett sökord'

        } else {
            $location.path( '/search/' + $scope.searchTerm )
            document.activeElement.blur()

        }

    }


}


function SearchCtrl( $scope, $routeParams, results ) {

    $scope.term = $routeParams.term
    $scope.results = results

}


function FoodstuffCtrl( $scope, $routeParams, foodstuff, lists ) {

    function pointToComma( num ) {
        return num.toString().replace( '.', ',' )
    }


    $scope.foodstuff = {
        name: foodstuff.name,
        properties: [
            { name: 'Kolhydrater',  value: pointToComma( foodstuff.nutrientValues.carbohydrates ),   unit: 'g'    },
            { name: 'Protein',      value: pointToComma( foodstuff.nutrientValues.protein ),         unit: 'g'    },
            { name: 'Energy',       value: pointToComma( foodstuff.nutrientValues.energyKcal ),      unit: 'Kcal' },
            { name: 'Energy',       value: pointToComma( foodstuff.nutrientValues.energyKj ),        unit: 'kj'   },
            { name: 'Fett',         value: pointToComma( foodstuff.nutrientValues.fat ),             unit: 'g'    },
            { name: 'Kolesterol',   value: pointToComma( foodstuff.nutrientValues.cholesterol ),     unit: 'mg'   }
        ]
    }


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
                var result = lists.setFoodstuff( index, foodstuff )

                if ( result.success === true )
                    $scope.message = result.name + ' har lagts till i listan ' + result.list
                else
                    $scope. message = result.name + ' finns redan i listan ' + result.list
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


function SingleListCtrl( $scope, $routeParams, $location, lists ) {

    var allLists = lists.get(),
        currentList = allLists[ $routeParams.id ]

    $scope.name = currentList.name
    $scope.foods = currentList.foods

    $scope.removeListItem = function( foodstuffIndex ) {
        $scope.foods = lists.removeFoodstuff( $routeParams.id, foodstuffIndex )
    }

    $scope.removeList = function() {
        $scope.lists = lists.remove( $routeParams.id )
        $location.path( '/list' )

    }

}
