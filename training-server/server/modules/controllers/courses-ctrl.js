'use strict';

var _ = require('lodash');
var q = require('q');

var coursesDal = require('../dal/courses-dal');
var classesDal = require('../dal/classes-dal');

var blueprintsService = require('../services/blueprints-service');

var blueprintsTrans = require('../trans/blueprints-trans');

var assignBlueprintsToCourse = function(course, bpDtos) {
    return _.map(course.blueprints, function(currentBp) {
        var matchingBp = _.find(bpDtos, function(bpResult) {
            return (bpResult.body.id == currentBp.id);
        });

        if (!matchingBp) {
            return currentBp;
        }

        var convertedBp = blueprintsTrans.dtoToEntity(matchingBp.body);
        return _.assign(currentBp, convertedBp);
    });
};

exports.getCourses = function(request, response) {
    var user = request.user;

    var ravelloUsername = user.ravelloCredentials.username;
    var ravelloPassword = user.ravelloCredentials.password;

    coursesDal.getCourses().then(function(courses) {

        q.all(_.map(courses, function(course) {
            return q.all(_.map(course.blueprints, function(bp) {
                return blueprintsService.getBlueprintById(bp.id, ravelloUsername, ravelloPassword);
            })).then(function(bpResults) {
                course.blueprints = assignBlueprintsToCourse(course, bpResults);
            }).fail(function(error) {
                var message = "Could not get one of the course's blueprints, error: " + error;
                console.log(message);
                response.send(404, message);
            });
        })).then(function(coursesResults) {
            response.json(courses);
        });
    }).fail(function(error) {
        console.log("Could not load courses, error: " + error);
    });
};

exports.getCourse = function(request, response) {
    var courseId = request.params.courseId;

    var user = request.user;
    var userId = user.id;

    // Notice that we expect the user here to be a student, i.e. we try to get its class so that we can
    // have its real Ravello credentials.
    classesDal.getClassOfUser(userId).then(function(classEntity) {

        var studentData = classEntity.findStudentByUserId(userId);

        var ravelloUsername = studentData.ravelloCredentials.username;
        var ravelloPassword = studentData.ravelloCredentials.password;

        coursesDal.getCourse(courseId).then(function(course) {
            q.all(_.map(course.blueprints, function(bp) {
                return blueprintsService.getBlueprintById(bp.id, ravelloUsername, ravelloPassword);
            })).then(function(bpResults) {
                course.blueprints = assignBlueprintsToCourse(course, bpResults);
                response.json(course);
            }).fail(function(error) {
                var message = "Could not get one of the course's blueprints, error: " + error;
                console.log(message);
                response.send(404, message);
            });
        }).fail(function(error) {
            console.log("Could not load course: " + courseId + ", error: " + error);
        });
    }).fail(function(error) {
        var message = "Could not load app " + appId + ", error: " + error;
        console.log(message);
        response.send(404, message);
    });
};

exports.createCourse = function(request, response) {
    coursesDal.createCourse(request.body).then(function(result) {
        response.json(result);
    }).fail(function(error) {
        var message = "Could not save course, error: " + error;
        console.log(message);
        response.send(400, message);
    });
};

exports.updateCourse = function(request, response) {
    var courseId = request.params.courseId;
    var courseData = request.body;

    coursesDal.updateCourse(courseId, courseData).then(function(result) {
        response.send(200);
    }).fail(function(error) {
        var message = "Could not update course, error: " + error;
        console.log(message);
        response.send(404, message);
    });
};

exports.deleteCourse = function(request, response) {
    var courseId = request.params.courseId;

    coursesDal.deleteCourse(courseId).then(function(result) {
        response.send(200);
    }).fail(function(error) {
        var message = "Could not delete course, error: " + error;
        console.log(message);
        resopnse.send(404, message);
    });
};