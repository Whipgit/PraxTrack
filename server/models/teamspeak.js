/* jshint camelcase: false */

var TeamSpeakClient = require("node-teamspeak");
var util            = require("util");
var _               = require("lodash");
var async           = require("async");
var promise         = require("bluebird");

module.exports = function(Teamspeak) {

  Teamspeak.clientlist = function(done) {

    var client = new TeamSpeakClient("212.83.179.125");

    promise.onPossiblyUnhandledRejection(function(error) {
      done(error);
    });

    login(client)
      .then(useIdOne)
      .then(getTeamspeakUsers)
      .then(function(response){

        response = _.filter(response, {'client_type': 0});

        done(null, response);
      });

  };

  Teamspeak.remoteMethod(
      'clientlist',
      {
        http: {path: '/clientlist', verb: 'get'},
        returns: {arg: 'clientlist', type: 'array'}
      }
  );

  Teamspeak.runTransaction = function(done) {

    var Transaction       = Teamspeak.app.models.Transaction;
    var TransactionGroup  = Teamspeak.app.models.TransactionGroup;
    var UniqueUser        = Teamspeak.app.models.UniqueUser;
    var UserHandle        = Teamspeak.app.models.UserHandle;

    Teamspeak.clientlist(function(error, clientlist){
      if (error) return done(error);

      createTransactionGroup(TransactionGroup)
        .then(function(group){

          async.each(clientlist, function(client, callback) {

            UniqueUser.find({where: {uniqueId: client.client_unique_identifier}},
              function(err, res){
                if (res.length < 1) {
                  var unique = {
                    uniqueId: client.client_unique_identifier,
                    lastCountry: client.client_country
                  };

                  UniqueUser.create(unique, handleUniqueUserFound);

                } else {

                  res[0].updateAttribute('lastCountry', client.client_country);

                  handleUniqueUserFound(null, res[0]);

                }

                function handleUniqueUserFound(e, unique){
                  if(e) return callback(e);

                  UserHandle.findOrCreate({
                    nickname: client.client_nickname,
                    uniqueUserId: unique.id
                  });

                  var newTransaction = {
                    channelId: client.client_channel_group_inherited_channel_id,
                    idleTime: client.client_idle_time,
                    country: client.client_country,
                    lastConnected: client.client_lastconnected,
                    transactionGroupId: group.id,
                    uniqueUserId: unique.id
                  };

                  Transaction.create(newTransaction, function(bad, good){
                    if(bad) return callback(bad);

                    callback();
                  });
                }
              });

          }, function(err){
              if(err) return done(err);

              done(null, group);
          });

        });

    });

  };

  Teamspeak.remoteMethod(
      'runTransaction',
      {
        http: {path: '/runTransaction', verb: 'get'},
        returns: {arg: 'group', type: 'object'}
      }
  );

  function createTransactionGroup(TransactionGroup){
    return new promise(function(resolve, reject){
      TransactionGroup.create({}, function(error, result){
        if (error) return reject(error);

        return resolve(result);
      });
    });
  }

  function login(client) {
    return new promise(function(resolve, reject) {
      client.send("login", {
          client_login_name: "praxustracker",
          client_login_password: "vadn38tM"
        },
        function(err, response) {
          if (err) reject(err);

          resolve(client);
        });
    });
  }

  function useIdOne(client) {
    return new promise(function(resolve, reject) {
      client.send("use", {
        sid: 1
      }, function(err, response) {
        if (err) reject(err);

        resolve(client);
      });
    });
  }

  function getTeamspeakUsers(client) {
    return new promise(function(resolve, reject) {
      client.send("clientlist", ["uid", "groups", "country", "times"], function(err, response) {
        if (err) reject(err);

        resolve(response);
      });
    });
  }

};
