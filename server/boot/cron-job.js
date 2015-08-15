module.exports = function addCronTasks(app) {
  var Teamspeak = app.models.Teamspeak;

  console.log("starting cron tasks");

  var CronJob = require('cron').CronJob;
  var job = new CronJob({
    cronTime: '10 * * * * 0-6',
    onTick: function() {
      Teamspeak.runTransaction(function(error, res){
        //console.log(res);
      });
    },
    start: false,
    timeZone: 'America/Los_Angeles'
  });
  job.start();

};
