var db = require('./index.js');

module.exports = {
	save: function(userObject) {
		db.User.findOrCreate({
			where: {
				email: userObject.email
			},
			defaults: {
	      first_name: userObject.first_name,
	      last_name: userObject.last_name,
        fb_id: userObject.fb_id
	    }
    })
    .then(function(results) {
    	return results[0].get({plain: true});
    })

    .catch(function() {
      throw new Error('Unknown error at method user save()');
    });
	},

  findUsersByChallengeId: function(challengeId) {
    db.Challenge.findOne({id: challengeId}, function() {})
     .then(function(challenge) {
       challenge.getUsers()
      .then(function(users) {
        var resultArr = [];
        console.log('FIND USER BY CHALLENGE: ',typeof users[0].get({plain: true}));
        for (var i = 0; i < users.length; i++) {
          resultArr.push(users[i].get({plain: true}));
        }
        console.log(resultArr);
        return resultArr;
      });
      // console.log(challenge);
     });
  }
};