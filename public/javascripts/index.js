/**
 * Created by schulace on 9/18/17.
 */
const pageModule = angular.module('postsPage', []);
/**
 * throwing some error. can't find it
 */
pageModule.service('pgdata', function($http) {
    let $scope = this;
    $scope.assignments = {
        data:[],
        observers:[]
    };
    $scope.addObserver = function(field, observer) {
        const variable = $scope[field]
        if(variable) {
            variable.observers.push(observer)
            observer(variable.data);
        }
    };
    $scope.loggedIn = {
        data:false,
        observers:[]
    }
    $scope.populate = function() {
        $http({
            url:'/api/assignments',
            method:'GET',
            responseType:'json'
        }).then(function(res) {
            $scope.set('assignments', res.data);
            console.log(res);
            $scope.set('loggedIn', true);
        }, function(err) {
            $scope.set('loggedIn', false);
            alert('not logged in')
        });
    }
    $scope.set = function(str, val) {
        let v = $scope[str];
        if(v) {
            v.data = val;
            console.log(v);
            v.observers.forEach(cb => cb(v.data));
        }
    }
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
                alert('login failed')
            })
    }
    $scope.formdata = {
        email:'',
        password:''
    };
    $scope.loggedIn = false;
    pgdata.addObserver('loggedIn', function(newval) {
        $scope.loggedIn = newval;
    });
    pgdata.populate();
});
pageModule.controller('assignmentsController', function($scope, pgdata) {
    $scope.assignments = pgdata.assignments;
    pgdata.addObserver('assignments', function(newval) {
        $scope.assignments = newval;
    })
});
