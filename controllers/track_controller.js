var request = require('request');
var api_key = 'K1RQLGXWBMUAYZOAI';

// params {
//   api_key
//   format
//   trid as id
// }
/* GET home page. */
var track_info = "http://developer.echonest.com/api/v4/track/profile"

module.exports = {
  show: function(req, res) {
    var pars = '?id=' + req.params.trid + '&format=json&api_key=' + api_key + '&bucket=audio_summary';
    request.get({url: track_info + pars, json:true}, function(e,r,body) {
      console.log(body);
      res.view('track/show', {track: body.response.track});
    });
  }
}