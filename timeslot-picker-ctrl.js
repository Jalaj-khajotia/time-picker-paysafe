'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('paysafe-assignment', ['ngStorage']);

app.controller('timeslot-pickerCtrl', function($scope, $http, $localStorage) {

    var index = 0;
    $scope.amSlotSelected = true;

    if ($localStorage.jsonData) {
        $scope.slotsData = $localStorage.jsonData;
        reset();
    } else {
        $http.get('testdata.json').then(function(res) {
            console.info(res);
            $scope.slotsData = res.data;
            $localStorage.jsonData = res.data;
            reset();
        }, function(error) {
            console.error(error);
        });
    }


    $scope.toggleTime = function(slotType) {
        if (slotType == 'am') {
            $scope.amSlotSelected = true;
        } else {
            $scope.amSlotSelected = false;
        }
        reset();
    }

    function reset() {
        var slotType, i = 0,
            end = 0;
        if ($scope.amSlotSelected) {
            slotType = 'am';
            i = 0;
            end = 12;
        } else {
            slotType = 'pm';
            i = 12;
            end = 24;
        }
        $scope.date = $scope.slotsData[index].date;

        $scope.timeselection = [];
        for (var j = 1; i < end; i++, j++) {
            var obj = $scope.slotsData[index].slots[i];
            $scope.timeselection.push(obj);
        }
        console.info($scope.timeselection);
    }
    $scope.count = 1;
    var selectedIndex = -1,
        leftIndex = -1,
        rightIndex = -1;
    $scope.bookSlot = function(index) {
        var element = $scope.timeselection[index];
        if (element.status === 'available') {
            if (selectedIndex == -1) {
                selectedIndex = index;
                leftIndex = index;
                rightIndex = index;
                element.status = 'selected';
            } else {
                if ((rightIndex + 1) == index) {
                    rightIndex = index;
                    element.status = 'selected';
                } else if ((leftIndex - 1) == index) {
                    leftIndex = index;
                    element.status = 'selected';
                } else {
                    $scope.timeselection.forEach(function(element) {
                        if (element.status == 'selected') {
                            element.status = 'available';
                        }
                    }, this);
                    element.status = 'selected';
                    selectedIndex = index;
                    leftIndex = index;
                    rightIndex = index;
                }
            }

        } else if (element.status === 'selected') {
            if (leftIndex == index) {
                leftIndex = (leftIndex + 1) % 12;
                element.status = 'available';
            } else if (rightIndex == index) {
                rightIndex = (rightIndex - 1) % 12;
                element.status = 'available';
            } else {
                $scope.timeselection.forEach(function(element) {
                    if (element.status == 'selected') {
                        element.status = 'available';
                    }
                }, this);
                selectedIndex = index;
                leftIndex = index;
                rightIndex = index;
                element.status = 'selected';
            }

        }
    }
    $scope.confirmSlot = function() {
        $scope.timeselection.forEach(function(element) {
            if (element.status == 'selected') {
                element.status = 'reserved';
            }
        }, this);

        if ($scope.amSlotSelected) {
            // $scope.slotsData[index].slots.splice(0, 12);
            var j = 0;
            $scope.timeselection.forEach(function(element) {
                $scope.slotsData[index].slots[j] = $scope.timeselection[j];
                j++;
            }, this);
            //   $scope.slotsData[index].slots.unshift($scope.timeselection);
        } else {
            var j = 12,
                i = 0;
            $scope.timeselection.forEach(function(element) {
                $scope.slotsData[index].slots[j] = $scope.timeselection[i];
                i++;
                j++
            }, this);
        }
        $localStorage.jsonData = $scope.slotsData;
        alert('Your slot has been confimed for date=' + $scope.date + ' & time from ' + (leftIndex) + ($scope.amSlotSelected ? ' am' : ' pm') + ' to ' +
            getTimestatus((rightIndex + 1)));
        selectedIndex = -1,
            leftIndex = -1,
            rightIndex = -1;
    }

    function getTimestatus(time) {
        if ($scope.amSlotSelected) {
            return time == 12 ? (time + ' pm') : (time + ' am');
        } else {
            return time == 12 ? (time + ' am') : (time + ' pm');
        }
    }


    $scope.shiftDateLeft = function() {
        if (index > 0) {
            index--;
            reset();
        }
    }
    $scope.shiftDateRight = function() {
        if (index < $scope.slotsData.length - 1) {
            index++;
            reset();
        }
    }
});