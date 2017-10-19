/**
 * Created by schulace on 9/18/17.
 */
const pageModule = angular.module('postsPage', []);
/**
 * throwing some error. can't find it
 */
pageModule.factory('pgdata', function($http) {
    this.assignments = [];
    this.loggedIn = false;
    this.populate = function() {
        $http({
            url:'/api/assignments',
            method:'GET',
            responseType:'json'
        }).then(function(data) {
            this.assignments=data;
            this.loggedIn=true;
        }).catch(function(err) {
            this.loggedIn=false;
            alert('not logged in')
        });
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
                pgdata.populate;
            },
            function(err){
                alert('login failed')
            })
    }
    $scope.formdata = {
        email:'',
        password:''
    };
    $scope.show=!pgdata.loggedIn;
    pgdata.populate();
});
