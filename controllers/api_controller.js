var request = require('request');
var fs = require('fs');
var os = require('os');
var api_key = "K1RQLGXWBMUAYZOAI";

// params {
//   query,
//   results: default = 10
// }
// returns artist, title, trid
var search_url = 'http://labs.echonest.com/Uploader/search';

// params {
//   trid at end + .json
// }
// returns artist, title, trid, mp3 url
var track_url  = "http://static.echonest.com/infinite_jukebox_data/";

// params {
//   api_key
//   format
//   trid as id
// }
/* GET home page. */
var track_info = "http://developer.echonest.com/api/v4/track/profile"

module.exports = {
  index: function(req, res) {
    res({'ok': 'cool this is an api'});
  },
  search: function(req, res) {
    // Build URL
    var pars = '?q=' + req.query.q + '&results=10000';
    var url = search_url + pars;

    // Get list from echonest and return
    request.get({url: url, json:true}, function(e,r,body) {
      res(body);
    });
  },
  get: function(req, res) {
    var trid = req.params.trid;
    request.get({url: track_url + trid + ".json", json:true}, function(e,r,body) {
      res(body.response.track.info.url);
    });
  },
  get_info: function(req, res) {
    var pars = '?id=' + req.params.trid + '&format=json&api_key=' + api_key + '&bucket=audio_summary';
    request.get({url: track_info + pars, json:true}, function(e,r,body) {
      res(body.response.track);
    });
  },
  get_image: function(req, res) {
    var pars = '?id=' + req.params.trid + '&format=json&api_key=' + api_key + '&bucket=audio_summary';
    var url = 'https://itunes.apple.com/search?entity=musicTrack&term=' + req.params.trid;
    request.get({url: url, json: true}, function(e, r, body) {
      if (body.resultCount === 0) {
        res.redirect('/images/artwork.png');
      } else {
        var original = os.tmpdir() + '/' + req.params.trid;
        res.redirect(body.results[0].artworkUrl100);            
      }
    });
  },
  get_full_image: function(req, res) {
    var pars = '?id=' + req.params.trid + '&format=json&api_key=' + api_key + '&bucket=audio_summary';
    var url = 'https://itunes.apple.com/search?entity=musicTrack&term=' + req.params.trid;
    request.get({url: url, json: true}, function(e, r, body) {
      if (body.resultCount === 0) {
        res.redirect('/images/artwork.png');
      } else {
        var original = os.tmpdir() + '/' + req.params.trid;
        res.redirect(body.results[0].artworkUrl100.replace(/100x100/g, '500x500'));            
      }
    });
  }
}