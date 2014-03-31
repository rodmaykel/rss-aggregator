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
  var sort = {};
  this.db.collection(COLLECTION)
    .findAndModify(query, sort, record, options)
    .done(function(result){
      cb(null,result)
    })
    .fail(function(err){
      cb(err);
    });
}

module.exports = DB;
