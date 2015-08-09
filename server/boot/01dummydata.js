var async = require('async');


module.exports = function(app) {

  var Person = app.models.Person,
    Topic = app.models.Topic,
    Post = app.models.Post;

  if (app.dataSources.db.name !== 'Memory') {
    // Check if we already imported dataSources
  } else {
    createDefaultData();
  }

  function createDefaultData() {
    var whiplash = {
      email: "whiplash@mail.com",
      password: "kitten",
      fullname: "Whiplash"
    };

    var drevan = {
      email: "drevan@mail.com",
      password: "squids",
      fullname: "Drevan"
    };

    var topic = {
      title: "Hello World",
    };

    async.series([
        function(callback) {
          Person.create(whiplash, function(err, res) {
            if (err) {
              callback(err);
            } else {
              whiplash = res;
              callback(null, res);
            }
          });
        },
        function(callback) {
          Person.create(drevan, function(err, res) {
            if (err) {
              callback(err);
            } else {
              drevan = res;
              callback(null, res);
            }
          });
        }
      ],
      // optional callback
      function(err, res) {
        // results is now equal to ['one', 'two']
        console.log(res);
        whiplash.topics.create(topic, function(err, response) {
          topic = response;

          async.series([
              function(callback) {
                createPost(topic, whiplash, "Lorem ipsum dolor sit amet,gna aliqua.", callback);
              },
              function(callback) {
                createPost(topic, drevan, "NO", callback);

              },
              function(callback) {
                createPost(topic, whiplash, "YES", callback);
              },
              function(callback) {
                createPost(topic, whiplash, "ITS TRUE", callback);
              },
              function(callback) {
                createPost(topic, drevan, "NO", callback);
              }
            ],
            function(e, r) {
              if (e)
                console.log(e);
            });
        });
      });
  }

  function createPost(topic, user, content, callback) {
    var post = {
      content: content,
      personId: user.id
    };

    topic.posts.create(post, function(err, response) {
      if (err)
        callback(err);
      else
        callback(null, response);
    });
  }
};
