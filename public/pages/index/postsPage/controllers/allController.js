angular.module('postsPage').component('allController', {
    templateUrl: '../templates/allController.html',
    controller: allController
});
allController.$inject('$scope', '$http');
const allController = function($scope, $http) {
    $scope.model = {
        assignments : [], //{title, duedate, class_name, completed, assignment_id, class_id}
        classes : [], //{class_name, class_id}
        loggedIn : false,
        selectedClass : 0,
        email:''
    };
    $scope.populate = function() {
        let cook = {};
        document.cookie.replace('%40','@').split(';').forEach((ck) => {
            let pair = ck.split('=');
            cook[pair[0]] = pair[1];
        });
        $scope.model.email= cook.email;
        $http({
            url:'/api/assignments',
            method:'GET',
            responseType:'json'
        }).then(function(res) {
            $scope.model.assignments = res.data;
            $scope.model.loggedIn = true;
        }, function() {
            $scope.model.loggedIn = false;
            alert('not logged in');
        });
    };
    $scope.populateClasses = function() {
        $http({
            url:'/api/classes',
            method:'GET',
            responseType:'json'
        }).then(function(res) {
            $scope.model.classes = res.data;
        });
    };
    $scope.populate();
    $scope.populateClasses();
};
