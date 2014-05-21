'use strict';


angular.module('trng.trainer.training.classes').controller('trainerSingleClassEditController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$log',
    '$window',
    '$dialogs',
    'ClassModel',
    'ClassesService',
    'CourseModel',
    'DateUtil',
    'currentClass',
    'courses',
    function ($scope, $rootScope, $state, $stateParams, $log, $window, $dialogs, ClassModel, ClassesService,
              CourseModel, DateUtil, currentClass, courses) {

        $scope.init = function () {
            $scope.apps = [];

            $scope.initClass();
            $scope.initDates();
            $scope.initStudentsDataGrid();
        };

        $scope.initClass = function() {
            $scope.currentClass = currentClass;
            $scope.matchCourses();

            $scope.isRavelloCredentials =
                (!$scope.currentClass.ravelloCredentials ||
                (!$scope.currentClass.ravelloCredentials.username && !$scope.currentClass.ravelloCredentials.password));
        };

        $scope.matchCourses = function() {
            $scope.courses = courses;

            // The course reference inside the class should be a reference to the actual list of courses,
            // otherwise there might be problems rendering the view correctly.
            // Since the class is a copy of the originally loaded class, we know the reference is in fact
            // NOT a reference to the actual list of courses, so here the controller fixes that.
            $scope.currentClass.course = _.find($scope.courses, {id: $scope.currentClass.courseId});
        };

        $scope.initDates = function() {
            $scope.dateFormat = DateUtil.angular.dateFormat;
            $scope.timeFormat = DateUtil.angular.timeFormat;
            $scope.dateTimeFormat = DateUtil.angular.dateTimeFormat;
        };

        $scope.initStudentsColumns = function () {
            $scope.studentsColumns = [
                {
                    field: 'user.fullName',
                    displayName: 'Full name'
                },
                {
                    field: 'user.username',
                    displayName: 'Username'
                },
                {
                    displayName: 'Actions',
                    cellTemplate:
                        '<a href="" class="btn btn-small btn-link" ng-click="editStudent(row)">' +
                            '<i class="fa fa-pencil" /> Edit' +
                        '</a>' +
                        '<a href="" class="btn btn-small btn-link" ng-click="deleteStudent(row)">' +
                            '<i class="fa fa-trash-o" /> Delete' +
                        '</a>'
                }
            ];
        };

        $scope.initStudentsDataGrid = function () {
            $scope.selectedStudents = [];

            $scope.initStudentsColumns();
            $scope.studentsDataGrid = {
                data: 'currentClass.students',
                columnDefs: $scope.studentsColumns,
                selectedItems: $scope.selectedStudents,
                showSelectionCheckbox: false,
                selectWithCheckboxOnly: true
            };
        };

        $scope.addStudent = function() {
            $state.go('^.single-student', {classId: $scope.currentClass.id});
        };

        $scope.editStudent = function(studentToEdit) {
            var studentId = studentToEdit.getProperty('id');
            $state.go('^.single-student', {classId: $scope.currentClass.id, studentId: studentId});
        };

        $scope.deleteStudent = function(studentToDelete) {
            var dialog = $dialogs.confirm("Delete student", "Are you sure you want to delete the student?");
            dialog.result.then(function(result) {
                var studentId = studentToDelete.getProperty('id');
                ClassModel.deleteStudent($scope.currentClass, studentId);
            });
        };

        $scope.saveClass = function() {
            return ClassModel.save($scope.currentClass).then(
                function(result) {
                    $state.go("trainer.training.classes");
                }
            );
        };

        $scope.back = function() {
            $window.history.back();
        };

        $scope.addToEdit = function() {
            $state.go('^.edit-class');
        };

        $scope.init();
    }
]);
