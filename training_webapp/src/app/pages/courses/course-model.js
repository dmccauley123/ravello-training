'use strict';

(function (angular) {
    angular.module('trng.courses.courses').factory('trng.courses.courses.CourseModel', [
        '$q', '$log', 'trng.services.CoursesService',
        function ($q, $log, coursesService) {

            var coursesLoaded = false;

            var courses = [];

            var getCourseById = function(courseId) {
                return _.find(courses, function(currentCourse) {
                    return currentCourse && currentCourse.hasOwnProperty('id') && currentCourse['id'] === courseId;
                });
            };

            var service = {

                courses: courses,

                getCourseById: function(courseId) {
                    if (coursesLoaded) {
                        var deferred = $q.defer();
                        var promise = deferred.promise;
                        deferred.resolve(getCourseById(courseId));
                        return promise;
                    }

                    return service.getAllCourses().then(function(result) {
                        return getCourseById(courseId);
                    });
                },

                getAllCourses: function () {
                    if (coursesLoaded) {
                        var deferred = $q.defer();
                        var promise = deferred.promise;
                        deferred.resolve(courses);
                        return promise;
                    }

                    return coursesService.getAllCourses().then(function(result) {
                        for (var i = 0; i < result.length; i++) {
                            courses.push(result[i]);
                        }

                        coursesLoaded = true;

                        return courses;
                    });
                }
            };

            return service;
        }]);
})(angular);