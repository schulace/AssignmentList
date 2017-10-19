/**
 * Created by schulace on 9/18/17.
 */
const pageModule = angular.module('postsPage', []);
/**
 * throwing some error. can't find it
 */
pageModule.service('pgdata', function($http) {
    let $scope = this;
    $scope.assignments = [];
    $scope.loggedIn = false;
    $scope.populate = function() {
        $http({
            url:'/api/assignments',
            method:'GET',
            responseType:'json'
        }).then(function(data) {
            $scope.assignments=data;
            alert('call went through successfully');
            console.log(data);
            $scope.loggedIn=true;
        }, function(err) {
            $scope.loggedIn=false;
            alert('not logged in')
        });
    }
    $scope.getLoggedIn = function() {
        return $scope.loggedIn;
    }
});
pageModule.controller('loginController', function($scope, $http, pgdata){
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
    $scope.loggedIn = pgdata.getLoggedIn;
    pgdata.populate();
});
