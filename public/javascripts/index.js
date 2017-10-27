/**
 * Created by schulace on 9/18/17.
 */
const pageModule = angular.module('postsPage', []);
/**
 *  a holder for the relevant info. will remain mostly
 *  in sync with the backend postgres db so that on updates,
 *  we don't need to fetch entire lists, we can just update
 *  things in this table
 */
pageModule.service('pgdata', ['$http', function($http) {
    let $scope = this;
    $scope.assignments = []; //{title, duedate, class_name, completed, assignment_id}
    $scope.classes = []; //{class_name, class_id}
    $scope.loggedIn = false;
    $scope.populate = function() {
        let cook = {};
        document.cookie.replace('%40','@').split(';').forEach((ck) => {
            let pair = ck.split('=');
            cook[pair[0]] = pair[1];
        });
        $scope.email= cook.email;
        $http({
            url:'/api/assignments',
            method:'GET',
            responseType:'json'
        }).then(function(res) {
            $scope.assignments = res.data;
            $scope.loggedIn = true;
        }, function() {
            $scope.loggedIn = false;
            alert('not logged in');
        });
    }; 
    $scope.email = '';
    $scope.populateClasses = function() {
        $http({
            url:'/api/classes',
            method:'GET',
            responseType:'json'
        }).then(function(res) {
            $scope.classes = res.data;
        });
    };
}]);
pageModule.controller('allController', function($scope, pgdata) {
    $scope.loggedIn = pgdata.loggedIn;
    $scope.$watch(() => pgdata.loggedIn, function(nval) {
        $scope.loggedIn = nval;
    });
    pgdata.populate();
    pgdata.populateClasses();
});
pageModule.controller('loginController', function($scope, $http, pgdata) {
    $scope.login = function () {
        $http({
            url:'/login',
            method:'POST',
            responseType:'json',
            data: $scope.formdata
        }).then(function() {
            pgdata.populate();
            pgdata.email = $scope.formdata.email;
            pgdata.populateClasses();
        }, function(err) {
            if(err.status === 500) {
                alert('login server down');
            } else {
                alert('login failed');
            }
        });
    }; 
    $scope.formdata = {
        email:'',
        password:'' //temp lol
    };
    $scope.signup = function() {
        $http({
            url:'/newUser',
            method:'POST',
            responseType:'json',
            data:$scope.formdata
        }).then(function(){
            alert('account successfully created');
            $scope.login();
        }, function(){
            alert('error while creating account. try a different email');
        });
    };
    $scope.logout = function() {
        $http({
            url:'/login',
            method:'DELETE',
        }).then(function() {
            pgdata.loggedIn = false;
        }, function(err) {
            console.log(err);
        });
    };
});
pageModule.controller('assignmentsController', function($scope, $http, pgdata) {
    $scope.showCompleted=true;
    $scope.assignments = pgdata.assignments;
    $scope.$watch(() => pgdata.assignments, function(newval) {
        $scope.assignments = newval;
    }, true);
});
pageModule.controller('addAssignmentController', function($scope, $http, pgdata) {
    $scope.classes = pgdata.classes;
    $scope.$watch(()=>pgdata.classes, function(newval) {
        $scope.classes = newval;
        $scope.formdata.selectedClass = $scope.classes[0] ? $scope.classes[0].class_name:null;
    }, true);
    $scope.addClass = function() {
        $http({
            url:'/api/assignments',
            method:'POST',
            responseType:'json',
            data: $scope.formdata
        }).then(function(success){
            pgdata.assignments.push({
                title:  $scope.formdata.assignmentTitle,
                duedate: $scope.formdata.dueDate,
                class_name: $scope.formdata.selectedClass.class_name,
                completed: false,
                assignment_id: success.data.assignment_id
            });
        }, function(err) {
            console.log('error while adding assignment ', err);
        });
    };
    $scope.formdata = {
        assignmentTitle:'',
        dueDate:'',
        selectedClass:null,
        assignmentDescription:''
    }
    $('#dueDate').datepicker();
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
        }).then(function () {
            console.log('updated');
        }, function() {
            $scope.item.completed = !$scope.item.completed;
            alert('unable to connect to server');
        });
    };
});
pageModule.controller('profileController', function($scope, $http, pgdata) {
    $scope.email = pgdata.email;
    $scope.$watch(() => pgdata.email, function(nval) {
        $scope.email = nval;
    });
    $scope.classes = pgdata.classes;
    $scope.$watch(() => pgdata.classes, function(val) {
        $scope.classes = val;
    }, true);
    $scope.modalClass = '';
    $scope.createClass = function() {
        $http({
            url:'/api/classes',
            method:'POST',
            responseType:'JSON',
            data: {
                className:$scope.modalClass
            }
        }).then(function(success) {
            pgdata.classes.push(success.data);
            console.log('classes is ', pgdata.classes);
        }, function(err) {
            alert('unable to create class ', err.status);
        });
        $('#classModal').modal('hide');
    };
    $scope.deleteClass = function(class_id) {
        console.log('class_id: ', class_id);
        $http({
            url:'/api/classes/' + class_id,
            method:'DELETE',
            responseType:'json',
        }).then(function(res) {
            console.log(res.data);
            pgdata.classes= pgdata.classes.filter(item => item.class_id != res.data.id);
            pgdata.populate(); //cascading on database makes it easier to do this
        }, function(err) {
            console.log('failed on class delete: ', err.status);
        });
    };
});
