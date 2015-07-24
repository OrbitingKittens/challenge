angular.module('challengeApp', [
  'challengeApp.challenge',
  'challengeApp.createChallenge',
  'challengeApp.completedChallenges',
  'challengeApp.userChallenge',
  'challengeApp.services',
  'ui.router'
])

.config(function($stateProvider, $urlRouterProvider) {
    
  $urlRouterProvider.otherwise('/signin');
    
  $stateProvider
      // HOME STATES AND NESTED VIEWS ========================================
    .state('signin', {
      url: '/signin',
      templateUrl: 'angular/client/challengerApp/auth/signin.html',
    })

    .state('signout', {
      url: '/signout',
      controller: function($scope, $state) {
        $scope.logout();
        $state.go('signin');
      }
    })

    .state('completed', {
        url: '/completed',
        templateUrl: 'angular/client/challengerApp/completed.html',
        controller: 'completedChallengesController'
    })

    .state('create', {
        url: '/create',
        templateUrl: 'angular/client/challengerApp/create/create.html',
        controller: 'CreateChallengeController'
    })
    // Challenge PAGE AND MULTIPLE NAMED VIEWS =================================
    .state('challenge', {
        url: '/challenge/:challengeId',
        templateUrl: 'angular/client/challengerApp/challenge/public.html',
        controller: 'ChallengeController'
        // views: {
        //     // the main template will be placed here (relatively named)
        //     'creator': { 
        //       templateUrl: 'challenge/creator.html',
        //       controller: 'ChallengeController'
        //     },

        //     // the child views will be defined here (absolutely named)
        //     'challenger': { 
        //       templateUrl: 'challenge/challenger.html', 
        //       controller: "ChallengeController"
        //     },

        //     'public': { 
        //       templateUrl: 'challenge/public.html',
        //       controller: "ChallengeController" 
        //   }
        // }
    })

    .state('user', {
      url: '/user',
      templateUrl: 'angular/client/challengerApp/user/index.html',
      controller: 'UserChallengesController'
    });

}).controller('ChallengeAppController', function($scope, $state, Auth) {
  $scope.user = null;

  $scope.setCurrentUser = function() {
    Auth.getUserInfo().then(function(user) {
      $scope.user = user;
    }, function() {
      $state.go('signin');
    });
  };

  $scope.logout = function() {
    Auth.logout().then(function() {
      $scope.user = null;
    });
  };

  $scope.setCurrentUser();
});
