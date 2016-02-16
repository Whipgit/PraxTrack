/* jshint camelcase: false */

var TeamSpeakClient = require("node-teamspeak"); // Teamspeak ServerQuery
var util = require("util");
var promise = require("bluebird"); // Promise Library
var mongodb = require('mongodb');


var MongoClient = mongodb.MongoClient;
var cl = new TeamSpeakClient("212.83.179.125");
var url = 'mongodb://localhost:27017/praxtrack';
var totalUsersOnline, totalUsersActive = 0;

promise.onPossiblyUnhandledRejection(function(error) {
  throw error;
});

function connectMongo() {
  return new promise(function(resolve, reject) {
    // Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
      if (err) {
        reject(err);
      } else {
        console.log("Connection to Mongo established...");
        resolve(db);
      }
    });
  });
}

function storeTransactionalRecord(db) {
  return new promise(function(resolve, reject) {
    var collection = db.collection('TsTrans');

  });
}


function login() {
  return new promise(function(resolve, reject) {
    cl.send("login", {
        client_login_name: "***",
        client_login_password: "***"
      },
      function(err, response) {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
  });
}

function useIdOne() {
  return new promise(function(resolve, reject) {
    cl.send("use", {
      sid: 1
    }, function(err, response) {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}

function getTeamspeakUsers() {
  return new promise(function(resolve, reject) {
    cl.send("clientlist", ["uid", "groups", "country", "times"], function(err, response) {
      if (err) {
        reject(err);
      } else {
        totalUsersOnline = response.length;
        resolve(response);
      }
    });
  });
}

function loopThroughArray(completearray) {
  return new promise(function(resolve, reject) {
    if (typeof completearray !== "object") {
      reject("No array found!");
    } else {
      for (var i in completearray) {
        var client = completearray[i];
        if (client.client_type === 0 &&
          client.client_channel_group_inherited_channel_id !== 231 &&
          client.client_idle_time < 1800000) {
          console.log(client);
          console.log(msToTime(client.client_idle_time));
          totalUsersActive += 1;
        }
      }
      console.log(totalUsersOnline);
      console.log(totalUsersActive);
    }
  });
}

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

function onError(error) {
  console.log(error);
}

/*
login()
  .then(useIdOne, onError)
  .then(connectMongo, onError)
  .then(getTeamspeakUsers, onError)
  .then(loopThroughArray, onError);
  */
