var mongoq = require('mongoq');

var COLLECTION = 'items';

function DB(db_url) {
  this.db = mongoq(db_url);
}

DB.prototype.upsert = function(query, record, cb) {
  var options = {
    safe: true,
    upsert: true
  };
  this.db.collection(COLLECTION)
    .update(query, record, options)
    .done(function(result){
      cb(null,result)
    })
    .fail(function(err){
      cb(err);
    });
}

module.exports = DB;