/**
 * Created by schulace on 9/18/17.
 */
const pageModule = angular.module('postsPage', []);
pageModule.controller('postsListController', ['$scope', function ($scope) {
    $scope.view = {loggedIn:false}
    $scope.populate = function () {
        $.ajax('/api/posts', {
            method: 'GET',
            success: function (data) {
                $scope.$apply(function () {
                    $scope.posts = data;
                    $scope.view.loggedIn = true;
                })
            },
            error: () => {
                alert('log in to see posts');
                $scope.view.loggedIn = false;
            }
        });
    };
    $scope.vote = function (evt) {
        const elem = $(evt.target);
        const direction = elem.text() == 'up' ? 1 : -1;
        const id = elem.parent().parent().data('value');
        $.ajax('/api/posts/' + id, {
            method: 'PUT',
            type: 'json',
            data: {direction: direction},
            //serverside call will send an object with the score
            success: (data) => $scope.apply(function () {
                $scope.posts.foreach(function (post) {
                    if (post.id == id) {
                        post.score += data.score;
                    }
                })
            })
        });
    };
    $scope.login = function (valid) {
        console.log($scope.formdata);
        $.ajax('/login', {
            method: 'POST',
            type: 'json',
            data: $scope.formdata,
            success: function (data) {
                $scope.populate();
            },
            error: function (data) {
                alert('login failed')
            }
        })
    };
    $scope.formdata = {
        email:'',
        password:''
    };
    $scope.populate();
}]);
