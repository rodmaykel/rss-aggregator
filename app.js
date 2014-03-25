var sources = require('./lib/config').sources;
var DBconfig = require('./lib/config').db;
var DB = require('./lib/db');
var FeedParser = require('feedparser');
var request = require('request');
var urlify = require('./lib/urlify');


var db = new DB(DBconfig.url);

var count = 0;
for (var i=0; i<sources.length; i++) {
  var source = sources[i];
  processSource(source, function(result) {
    // TODO: handle result!=true
    count++;
    if (count == sources.length) console.log("===Finished===");
  });
}

function processSource(source, cb) {
  var req = new request(source.rss);
  var options = {};
  var feedparser = new FeedParser(options);

  req.on('error', function (error) {
    console.log("===Error: " + source.name + "===");
    cb(false);
  });
  req.on('response', function (res) {
    var stream = this;
    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
    stream.pipe(feedparser);
  });

  feedparser.on('error', function(error) {
    console.log("===Error: " + source.name + "===");
    cb(false);
  });
  feedparser.on('readable', function() {
    // This is where the action is!
    var stream = this
      , meta = this.meta
      , item;
    while (item = stream.read()) {
      var query = {link: item.link};
      source.source_id = urlify(source.name);
      var record = {
        item_id: urlify(item.title),
        link: item.link,
        title: item.title,
        summary: item.summary,
        source: source,
        date: item.date,
        created_at: new Date()
      }
      db.upsert(query, record, function(error, result){
        console.log(result);
      });
    }
  });
  feedparser.on('end', function(){
    console.log("===Done " + source.name + "===");
    cb(true);
  })  
}

setTimeout(function(){
  console.log("===Terminating Script===");
  process.exit();
}, 1*60*1000)
