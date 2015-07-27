var express = require('express');
var router = express.Router();
var models = require('../models');

/**
 * Check if user is logged in and return an error otherwise
 */
var requires_login = function(req, res, next) {
  // if (!req.isAuthenticated()) {
  //     res.status(401).json({'error': 'ENOTAUTH', 'message':'Endpoint requires login.'});
  //   } else {
  //     next();
  //   }

  // Disabled for now
  next();
};

/**
 * Endpoint to get information about logged in user
 *
 * Requires login
 */
router.get('/user_info', requires_login, function(req, res) {

  models.User.findOne({
    where: {
      id: req.user.id
    }
  })
  .then(function(user) {
    res.json(user.get({plain: true}));
  });
});


/**
 * Endpoint to get a list of all users
 */
router.get('/allUsers', function(req, res) {

  models.User.findAll()
    .then(function(users) {
      var data = [];
      for(var i = 0; i < users.length; i++) {
        data.push({
          id: users[i].get('id'),
          first_name: users[i].get('first_name'),
          last_name: users[i].get('last_name'),
          email: users[i].get('email'),
          fb_id: users[i].get('fb_id'),
          date_created: users[i].get('createdAt'),
          profile_image: users[i].get('profile_image'),
          updatedAt: users[i].get('updatedAt')
        });
      }

      res.json(data);
    })
    .catch(function(err) {
      throw new Error('Failed to GET at /allUsers route: ', err);
    });
});


/**
 * Endpoint to get a list of challenges associated with currently logged in user
 *
 * Requires login
 */
router.get('/challenge/user', requires_login, function(req, res) {
  models.User.findOne({where: {id: req.user.id}})
  .then(function(user) {
    user.getChallenges({
        include: [{
          model: models.User,
          as: 'participants'
        }]
     })
    .then(function(challenges) {
      var data = [];  // Didn't want to use 'response' since that might be confused with http res

      for(var i = 0; i < challenges.length; i++) {

        var participants = [];

        for(var j = 0; j < challenges[i].participants.length; j++) {
          participants.push({
            first_name: challenges[i].participants[j].get('first_name'),
            id: challenges[i].participants[j].get('id'),
            last_name: challenges[i].participants[j].get('last_name'),
            profile_image: challenges[i].participants[j].get('profile_image'),
            accepted: challenges[i].participants[j].usersChallenges.accepted
          });
        }

        data.push({
          complete: challenges[i].get('complete'),
          creator: challenges[i].get('creator'),
          date_completed: challenges[i].get('date_completed'),
          date_created: challenges[i].get('createdAt'),
          date_started: challenges[i].get('date_started'),
          id: challenges[i].get('id'),
          message: challenges[i].get('message'),
          started: challenges[i].get('started'),
          title: challenges[i].get('title'),
          wager: challenges[i].get('wager'),
          winner: challenges[i].get('winner'),
          participants: participants
        });
      }

      res.json(data);
    });
  });
});


/**
 * Endpoint to get a list of public challenges
 */
router.get('/challenge/public', function(req, res) {
  models.Challenge.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']], // must pass an array of tuples
      include: [{
        model: models.User,
        as: 'participants'
      }]
    })
    .then(function(challenges) {

      var data = [];
      for(var i = 0; i < challenges.length; i++) {
        var rawParticipants = challenges[i].get('participants', {plain: true});
        var participants = [];

        for(var j = 0; j < rawParticipants.length; j++) {
          participants.push({
            id: rawParticipants[i].id,
            first_name: rawParticipants[i].first_name,
            last_name: rawParticipants[i].last_name,
            profile_image: rawParticipants[i].profile_image,
            accepted: rawParticipants[i].usersChallenges.accepted
          });
        }

        data.push({
          id: challenges[i].get('id'),
          title: challenges[i].get('title'),
          message: challenges[i].get('message'),
          wager: challenges[i].get('wager'),
          creator: challenges[i].get('creator'),
          winner: challenges[i].get('winner'),
          complete: challenges[i].get('complete'),
          started: challenges[i].get('started'),
          date_created: challenges[i].get('createdAt'),
          date_completed: challenges[i].get('date_completed'),
          date_started: challenges[i].get('date_started'),
          participants: participants
        });
      }

      res.json(data);
    })
    .catch(function(err) {
      throw new Error('Failed to GET at /challenge/public route: ', err);
    });
});


/**
 * Endpoint to get single challenge specified by id
 */
router.get('/challenge/:id', function(req, res) {
  var target_id = parseInt(req.params.id);
  // var data = req.db.Challenge.findById(req.params.id);

  models.Challenge.findOne({
      where: {id: target_id},
      include: [{
        model: models.User,
        as: 'participants'
      }]
    })
    .then(function(challenge) {
      var rawParticipants = challenge.get('participants', {plain: true});
      var participants = [];

      for(var i = 0; i < rawParticipants.length; i++) {
        participants.push({
          id: rawParticipants[i].id,
          first_name: rawParticipants[i].first_name,
          last_name: rawParticipants[i].last_name,
          profile_image: rawParticipants[i].profile_image,
          accepted: rawParticipants[i].usersChallenges.accepted
        });
      }

      res.json({
        id: challenge.get('id'),
        title: challenge.get('title'),
        message: challenge.get('message'),
        wager: challenge.get('wager'),
        creator: challenge.get('creator'),
        winner: challenge.get('winner'),
        complete: challenge.get('complete'),
        started: challenge.get('started'),
        date_created: challenge.get('createdAt'),
        date_started: challenge.get('date_started'),
        date_completed: challenge.get('date_completed'),
        participants: participants
      });
    });
});


/**
 * Check if the submitted form has all required fields
 */
var challenge_form_is_valid = function(form) {
  var valid = true;
  var required_fields = ['title', 'message'];
  var min_text_length = 3;

  required_fields.forEach(function(field) {
    if (form[field] === '' || form[field].length < min_text_length) {
      valid = false;
    }
  });

  return valid;
};


/**
 * Endpoint to post a new challenge
 *
 * Requires login
 */
router.post('/challenge', requires_login, function(req, res) {
  var form = req.body;

  // validate form
  if (!challenge_form_is_valid(form)) {
    res.status(400).json({'error': 'EINVALID', 'message': 'Submitted form is invalid.'});
    return;
  }

  // Create the challenge
  models.Challenge.create({
    title: form.title,
    message: form.message,
    wager: form.wager,
    creator: req.user.id,
    date_started: Date.now()
  })
  .then(function(challenge) {
    challenge.addParticipants(form.participants); // form.participants should be an array
    challenge.addParticipant([req.user.id], {accepted: true}); // links creator of challenge

    res.status(201).json({
      id: challenge.id
    });
  });
});


/**
 * Endpoint to set a challenge to started
 *
 * Requires login
 */
router.put('/challenge/:id/started', requires_login, function(req, res) {
  var target_id = parseInt(req.params.id);
  var user_id = req.user.id;

  models.Challenge.update({
    started: true,
    date_started: Date.now()
  }, {
    where: {
      id: target_id,
      creator: user_id,
      started: false,
      complete: false
    }
  })
  .then(function(numChallenges) { // Returns an array with element '0' being number of
    if(numChallenges[0] > 0) {    // rows affected (should not be greater than 1 in our case)
      models.Challenge.findOne({
        where: {
          id: target_id,
          started: true
        }
      })
      .then(function(/*challenge*/) { // May want to do something with newly started challenge
          res.status(201).json({'success': true});
      });
    } else {
      res.status(400).json({'error': 'error at /challenge/:id/started',
        'message': 'Could not update challenge to "started" or could not find challenge'});
    }
  })
  .catch(function(error) {
    if(error) {
      res.status(400).json({'error': error,
        'message': 'database update failed at /challenge/:id/started'});
    }
  });
});


/**
 * Endpoint to set a winner and complete challenge
 *
 * Requires login
 */
router.put('/challenge/:id/complete', requires_login, function(req, res) {
  var target_id = parseInt(req.params.id);
  var winner;
  if(req.body.winner === undefined) {
    winner = null;
  } else {
    winner = parseInt(req.body.winner);
  }

  models.Challenge.update({
    winner: winner,
    complete: true
  }, {
    where: {
      id: target_id,
      creator: req.user.id,
      started: true,
      complete: false
    }
  })
  .then(function(numChallenges) {
    if(numChallenges[0] > 0) {
      models.Challenge.findOne({
        where: {id: target_id},
        complete: true
      })
      .then(function(/*challenge*/) {  // May want to do something with newly created challenge
          res.status(201).json({'success': true});
      });
    } else {
      res.status(400).json({
        'error': 'error at /challenge/:id/complete',
        'message': 'could not update challenge to complete or could not find challenge'
      });
    }
  })
  .catch(function(error) {
    res.status(400).json({'error': error,
      'message': 'Database update failed at /challenge/:id/complete'
    });
  });
});

router.put('/challenge/:id/accept', requires_login, function(req, res) {
  var target_id = parseInt(req.params.id);
  var user_id = req.user.id;

  models.UserChallenge.update({
    accepted: true
  }, {
    where: {
      challengeId: target_id,
      userId: user_id,
      accepted: false
    }
  }).then(function() {
    models.UserChallenge.findOne({
      where: {
        challengeId: target_id,
        userId: user_id
      }
    })
    .then(function(userChallenge) {
      if (userChallenge.get('accepted')) {
        res.status(201).json({'success': true});
      } else {
        res.status(200).json({'success': false});
      }
    });
  });
});


router.get('/challenge/:id/comments', function(req, res) {
  var target_id = parseInt(req.params.id);

  var query = {
    'where': {
      'challengeId': target_id
    },
    'include': [{
      'model': models.User
    }]
  };

  models.Comment.findAll(query).then(function(comments) {
    var data = [];

    comments.forEach(function(comment) {
      data.push({
        'text': comment.text,
        'date_created': comment.createdAt,
        'user': {
          'id': comment.user.id,
          'first_name': comment.user.first_name,
          'last_name': comment.user.last_name,
          'profile_image': comment.user.profile_image
        }
      });
    });

    res.json(data);
  });
});

router.post('/challenge/:id/comments', requires_login, function(req, res) {
  var target_id = parseInt(req.params.id);

  if (req.body.text === undefined || req.body.text.length < 3) {
    res.status(400).json({'error': 'EINVALID', 'message': 'Submitted form is invalid.'});
    return;
  }

  models.Comment.create({
    'userId': req.user.id,
    'challengeId': target_id,
    'text': req.body.text
  }).then(function() {
    res.json({'success': true});
  });
});

module.exports = {
  'router': router,
  'challenge_form_is_valid': challenge_form_is_valid
};
