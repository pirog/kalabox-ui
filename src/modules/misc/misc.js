'use strict';

angular.module('kalabox.misc', [
  'ui.router',
  'kalabox.nodewrappers'
])
.controller('RandomMessageCtrl',
  function($scope) {
  var randomMessages = [
    'I see Windows, I see Mac, I see Kalabox running on any stack',
    'Reticulating splines',
    'Realizing the power of now',
    'Tripping the light fantastic',
    'Dreaming of electric sheep',
    'Being your beast of burden',
    'Taking the load off Fanny',
    'Exercising the right to arm bears',
    'Applying container grease',
    'Putting the last \"P\" on PHP',
    'Making the world safe for democracy',
    'Failing to be afraid of fear itself',
    'Neither snow nor rain nor heat nor gloom of night shall stop us',
    'Trimming the llama',
    'Burning the man',
    'Clearing dust out of the box',
    'Plumbing the series of tubes',
    'Crossing the Rubicon',
    'Rebalancing your portfolio',
    'Slicing, dicing, and making french fries',
    'Improving your child\'s SAT score',
    'Teaching the virtue of patience',
    'Nurturing your web projects',
    'The waiting is the hardest part'
  ];
  var rotateMessage = function() {
    setTimeout(function() {
      $scope.ui.randomMessage = randomMessages[
        Math.floor(Math.random() * randomMessages.length)
      ];
      $scope.$digest();
      rotateMessage();
    }, 3000);
  };

  // Best practices is to manage our data in a scope object
  $scope.ui = {
    randomMessage: 'Let\'s get this party started'
  };

  // Start message rotating.
  rotateMessage();
});
