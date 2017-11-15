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
pageModule.controller('allController', function($scope, $http) {
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
});
pageModule.controller('loginController', function($scope, $http) {
    $scope.login = function () {
        $http({
            url:'/login',
            method:'POST',
            responseType:'json',
            data: $scope.formdata
        }).then(function() {
            $scope.populate();
            $scope.model.email = $scope.formdata.email;
            $scope.populateClasses();
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
            $scope.model.loggedIn = false;
        }, function(err) {
            console.log(err);
        });
    };
});
pageModule.controller('assignmentsController', function($scope, $http) {
    $scope.showCompleted=true;
});
pageModule.controller('addAssignmentController', function($scope, $http) {
    $scope.addClass = function() {
        $http({
            url:'/api/assignments',
            method:'POST',
            responseType:'json',
            data: $scope.formdata
        }).then(function(success){
            $scope.model.assignments.push({
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
    };
    $('#dueDate').datepicker();
});
//look out for this one. may not behave as expected / wont update the main model
pageModule.controller('assignmentController', function($scope, $http){
    $scope.update = function(index) {
        $http({
            url:'/api/assignments/' + $scope.item.assignment_id,
            method:'PUT',
            responseType:'json',
            data:{
                tick:$scope.item.completed
            }
        }).then(function () {
        }, function() {
            //on error
            $scope.item.completed = !$scope.item.completed;
            alert('unable to connect to server');
        });
    };
    $scope.prettyDate = function(dateIn) {
        return prettyDate(dateIn);
    };
});
pageModule.controller('profileController', function($scope, $http) {
    $scope.set_selected_class = function(id) {
        $scope.model.selectedClass = id == $scope.model.selectedClass ? 0 : id;
    };
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
            $scope.model.classes.push(success.data);
            console.log('classes is ', $scope.model.classes);
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
            $scope.model.classes= $scope.model.classes.filter(item => item.class_id != res.data.id);
            $scope.populate(); //cascading on database makes it easier to do this
        }, function(err) {
            console.log('failed on class delete: ', err.status);
        });
    };
});


//END ANGULAR
function prettyDate(dateIn) {
    if(!dateIn) return 'no due date'; //don't show due in if we don't know the duedate
    const dateDiff = new Date(dateIn) - new Date();
    const daysLeft = Math.ceil(dateDiff / (60*60*24*1000));
    const start = daysLeft <0 ? 'due ' : 'due in ';
    const ending = daysLeft <0 ? ' days ago': ' days';
    return start + Math.abs(daysLeft) + ending;
}
