'use strict';

angular.module('kalabox.initialize', [
  'ui.router',
  'kalabox.nodewrappers'
])
.config(function($urlRouterProvider, $stateProvider) {
  $stateProvider.state('initialize', {
    url: '/initialize',
    templateUrl: 'modules/initialize/initialize.html.tmpl',
    controller: 'InitializeCtrl'
  });
  $urlRouterProvider.otherwise('/initialize');
})
.controller('InitializeCtrl',
['$scope', '$state', 'kbox', 'globalConfig',
  function($scope, $state, kbox, globalConfig) {

    var gui = require('nw.gui');
    var mb = new gui.Menu({type: 'menubar'});
    if (process.platform === 'darwin') {
      mb.createMacBuiltin('Kalabox', {hideEdit: true, hideWindow: true});
    }
    gui.Window.get().menu = mb;

    var rotateMessage = function() {
      setTimeout(function() {
        $scope.ui.randomMessage = $scope.ui.messageText[
          Math.floor(Math.random() * $scope.ui.messageText.length)
        ];
        $scope.$digest();
        rotateMessage();
      }, 3000);
    };

    // Best practices is to manage our data in a scope object
    $scope.ui = {
      randomMessage: 'Let\'s get this party started',
      messageText: [
        'Kicking the tires/tyres',
        'We assure you, winter IS coming',
        'Applying container grease',
        'Putting the last "P" on PHP',
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
      ]
    };

    // Start message rotating.
    rotateMessage();

    // Decide on next location.
    globalConfig.then(function(globalConfig) {
      if (globalConfig.provisioned) {
        // Bring engine up then navigate to dashboard.
        return kbox.then(function(kbox) {
          return kbox.engine.up()
          .then(function() {
            $state.go('dashboard');
          });
        });
      } else {
        // Navigate to start.
        $state.go('start');
      }
    });

  }]);
