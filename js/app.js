
function SearchController( $scope, $http ) {

    // Fix for some funky CORS shennanigans in angular
    delete $http.defaults.headers.common['X-Requested-With'];

    $scope.searchResults = []
    $scope.foodstuff = {}

    $scope.search = function() {
        var term = $scope.searchTerm

        // reset the collection
        $scope.searchResults = []

        $http
            .get( 'http://matapi.se/foodstuff/?query=' + term )
            .success( function( data ) {

                angular.forEach( data, function( value, key ) {

                    $scope.searchResults.push( value )

                })

            })
    }

    $scope.getFoodStuff = function( $event, id ) {

        $event.preventDefault()

        $http
            .get( 'http://matapi.se/foodstuff/' + id  )
            .success( function( data ) {

                $scope.searchResults = []
                $scope.foodstuff = {
                    name: data.name,
                    properties: [
                        { name: 'kolhydrater', value: data.nutrientValues.carbohydrates },
                        { name: 'protein', value: data.nutrientValues.protein },
                        { name: 'energy', value: data.nutrientValues.energyKcal },
                        { name: 'fett', value: data.nutrientValues.fat },
                        { name: 'kolesterol', value: data.nutrientValues.cholesterol }
                    ]
                }

            })

    }

}
