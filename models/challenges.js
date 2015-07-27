var db = require('./index.js');

var iChallengeID = 1;
var iUserID = 1;

//Challenges Method
module.exports = {
  findChallengeById: function(challengeId) {
    db.Challenge.findOne({
      where : {
        id: iChallengeID
        //challenge_id: challengeId
      }
    })
    .then(function(result) {
      console.log('FIND CHALLENGE BY ID: ',result.get({plain: true}));
      return result.get({plain: true});
    }).catch(function() {
      throw new Error('Unknown error at method findChallengeById()');
    });
  },

  findChallengesByUserId: function(userID) {
     db.User.findOne({id: userID}, function() {})
     .then(function(user) {
       //user.getChallenges({ where: 'userId = ' + userID })
       user.getChallenges()
      .then(function(challenges) {
        var resultArr = [];
        console.log('FIND CHALLENGE BY USER ID: ',typeof challenges[0].get({plain: true}));
        for (var i = 0; i < challenges.length; i++) {
          resultArr.push(challenges[i].get({plain: true}));
        }
        console.log(resultArr);
        return resultArr;
      });
      //console.log(user);
     });



    // db.User.getChallenge({ where: 'userId = ' + userID }).then(function(challenges) {
    //   console.log(challenges);
    // });


  },

  createChallenge: function(challengeObject) {

    db.User.findOne({id: iUserID}, function() {})
    .then(function(user) {
      console.log('INSIDE CREATE CHALLENGE: ', user);
      db.Challenge.create({
        title: challengeObject.title,
        message: challengeObject.message,
        wager: challengeObject.wager,
        creator: user.id,
        winner: challengeObject.winner,
        complete: challengeObject.complete,
        date_started: challengeObject.date_started,
        date_completed: challengeObject.date_completed
      }).then(function(challenge) {
        db.User.findOne({
          where: {id: user.id}
        }).then(function(user) {
          console.log('CREATING LINK: ', challenge);
          user.addChallenge(challenge, {accepted: false});
        });
      }).catch(function() {
        throw new Error('Unknown error at method createChallenge()');
      });
    });



    // db.Challenge.create({
    //   title: challengeObject.title,
    //   message: challengeObject.message,
    //   wager: challengeObject.wager,
    //   creator: user.id,
    //   winner: challengeObject.winner,
    //   complete: challengeObject.complete,
    //   date_started: challengeObject.date_started,
    //   date_completed: challengeObject.date_completed
    // })


  }

};
