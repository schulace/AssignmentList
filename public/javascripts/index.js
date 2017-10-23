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
pageModule.service('pgdata', function($http) {
    let $scope = this;
    $scope.assignments = {
        data:[],
        observers:[]
    };
    $scope.classes = {
        data:[],
        observers:[]
    };
    $scope.addObserver = function(field, observer) {
        const variable = $scope[field];
        if(variable) {
            variable.observers.push(observer);
            observer(variable.data);
        }
    };
    $scope.loggedIn = {
        data:false,
        observers:[]
    };
    $scope.populate = function() {
        $http({
            url:'/api/assignments',
            method:'GET',
            responseType:'json'
        }).then(function(res) {
            $scope.set('assignments', res.data);
            $scope.set('loggedIn', true);
        }, function(err) {
            $scope.set('loggedIn', false);
            alert('not logged in');
        });
    };
    $scope.set = function(str, val) {
        let v = $scope[str];
        if(v) {
            v.data = val;
            v.observers.forEach(cb => cb(v.data));
        }
    };
});
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
    pgdata.addObserver('loggedIn', function(newval) {
        $scope.loggedIn = newval;
    });
    pgdata.populate();
});
pageModule.controller('assignmentsController', function($scope, pgdata) {
    pgdata.addObserver('assignments', function(newval) {
        $scope.assignments = newval;
    });
});
pageModule.controller('profileController', function($scipe, pgdata) {
    //TODO add create a thing to add / drop classes
});
