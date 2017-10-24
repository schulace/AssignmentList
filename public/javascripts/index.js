/**
 * Created by schulace on 9/18/17.
 */
const pageModule = angular.module('postsPage', []);
/**
 * this service uses a custom watcher thing I set up
 * everything that wants data from the service calls
 * addObserver with the string of the field they want
 * and a callback taking 1 argument. in order to set
 * a value in the service, call set with the variable's
 * name and the value. This will then run all callbacks
 * bound to the variable's name, and the callbacks
 * handle updating values in the fields they run from.
*/
pageModule.service('pgdata', ['$http', function($http) {
    let $scope = this;
    $scope.assignments = [];
    $scope.classes = [];
    $scope.loggedIn = false;
    $scope.populate = function() {
        $http({
            url:'/api/assignments',
            method:'GET',
            responseType:'json'
        }).then(function(res) {
            $scope.assignments = res.data;
            $scope.loggedIn = true;
        }, function(err) {
            $scope.loggedIn = false;
            alert('not logged in');
        });
    }; 
}]);
pageModule.controller('loginController', function($scope, $http, pgdata) {
    $scope.login = function () {
        $http({
            url:'/login',
            method:'POST',
            responseType:'json',
            data: $scope.formdata
        }).then(
            function(data){
                pgdata.populate();
            },
            function(err){
                alert('login failed');
            });
    }; 
    $scope.formdata = {
        email:'',
        password:''
    };
    $scope.$watch(() =>pgdata.loggedIn, function(newval, oldval) {
        $scope.loggedIn = newval;
    });
    pgdata.populate();
});
pageModule.controller('assignmentsController', function($scope, $http, pgdata) {
    $scope.assignments = pgdata.assignments;
    $scope.$watch(() => pgdata.assignments, function(newval) {
        console.log('watch for assignments, ' + JSON.stringify(newval));
        $scope.assignments = newval;
    }, true);
});
pageModule.controller('assignmentController', function($scope, $http, pgdata){
    $scope.item = pgdata.assignments[$scope.$index];
    $scope.update = function() {
        console.log('completed is ', $scope.item.completed);
        $http({
            url:'/api/assignments/' + $scope.item.assignment_id,
            method:'PUT',
            responseType:'json',
            data:{
                tick:$scope.item.completed
            }
        }).then(function (res) {
            console.log('updated');
        }, function(err) {
            $scope.item.completed = !$scope.item.completed;
            alert('unable to connect to server');
        });
    };
});
pageModule.controller('profileController', function($scope, pgdata) {
    //TODO create a thing to add / drop classes
});
