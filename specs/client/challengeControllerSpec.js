
describe('ChallengeController', function(){

  beforeEach(module('challengeApp'));


  // describe('test-Test', function () {

  //   it('should prove unicorns exist', function () {
  //     expect(true).to.equal(true);
  //   });

  // });

  describe('create-challenge', function () {

    var CreateChallengeFactory, $httpBackend, createController;

    beforeEach(inject(function (_CreateChallengeFactory_, _$httpBackend_, $rootScope, $controller) {
      scope = $rootScope.$new();
      CreateChallengeFactory = _CreateChallengeFactory_;
      $httpBackend = _$httpBackend_;

      createController = function() {
        return $controller('CreateChallengeController', {
          '$scope': scope
        });
      };
    }));

    afterEach(function() {
       $httpBackend.verifyNoOutstandingExpectation();
       $httpBackend.verifyNoOutstandingRequest();
     });

    it('creates the challenge and responds with challenge ID', function () {
      $httpBackend
      .expectPOST('/api/1/challenge', {
        'title':'testTitle', 
        'message':'testMessage',
        'participants':[2],
        'wager':'testWager'
      })
      .respond(200, {'id':2});

      var challengeID;
      CreateChallengeFactory.postChallenge({
        'title':'testTitle', 
        'message':'testMessage',
        'participants':[{'id':2}],
        'wager':'testWager'
      }).then(function(res){
        challengeID = res.id;
      });
      $httpBackend.flush();
      expect(challengeID).to.equal(2);
    });

    // use sinon.spy to make sure 'CreateChallengeFactory.postChallenge' is called when
    // CreateChallengeController.postChallenge runs
    it('should call factory-postChallenge from controller-postChallenge', function () {
      var controller = createController();
      var spy = sinon.spy(CreateChallengeFactory, 'postChallenge');

      $httpBackend
      .when('GET', '/api/1/allUsers')
      .respond([]);

      $httpBackend
      .when('GET', 'angular/client/challengerApp/auth/signin.html')
      .respond(200, {});

      $httpBackend
      .when('GET', 'angular/client/challengerApp/challenge/challenge.html')
      .respond(200, {});

      $httpBackend
      .expectPOST('/api/1/challenge', {"participants":[]})
      .respond(200, {'id':2});


      var challengeID;
      scope.postChallenge();
      $httpBackend.flush();
      // scope.$digest();
      expect(spy.calledOnce).to.equal(true);
    });


  });


});