/* jshint camelcase: false */

var TeamSpeakClient = require("node-teamspeak"); // Teamspeak ServerQuery
var util            = require("util");
var _               = require("lodash");
var promise         = require("bluebird");

module.exports = function(Teamspeak) {

  Teamspeak.clientlist = function(cb) {

    var client = new TeamSpeakClient("212.83.179.125");

    promise.onPossiblyUnhandledRejection(function(error) {
      cb(error);
    });

    useIdOne(client)
      .then(getTeamspeakUsers)
      .then(function(response){
        cb(null, response);
      });

  };

  Teamspeak.remoteMethod(
      'clientlist',
      {
        http: {path: '/clientlist', verb: 'get'},
        returns: {arg: 'clientlist', type: 'array'}
      }
  );

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
