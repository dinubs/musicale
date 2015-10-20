var React = require('react');
var ReactDOM = require('react-dom');
require('./fetch');

var _ = require('underscore');

var player = new Audio();
var currentTrack = {};

Array.prototype.findByIndex = function(key, value) {
  for (var i = 0; i < this.length; i++) {
 
    if (this[i][key] === value) {
     return i;
    }
  }
  return null;
}


var Track = React.createClass({
  getInitialState: function() {
    return {
      playing: false
    }
  },
  playTrack: function() {
    this.props.playSelf(this.props.track.trid);
  },
  componentDidMount: function() {
    this.setState({playing: (currentTrack.trid === this.props.track.trid)});
  },
  render: function() {
    var playClass = (currentTrack.trid === this.props.track.trid || this.state.playing)? 'active': '';
    return (
      <div className='track' onClick={this.playTrack}>
        <img src={'/api/get/' + this.props.track.title + ' ' + this.props.track.artist + '/image'} />
        <div className='info'>
          <div>{this.props.track.title}</div>
          <div>{this.props.track.artist}</div>
        </div>
        <div className={'play ' + playClass}></div>
      </div>
    );
  }
});

var TrackList = React.createClass({
  render: function() {
    var trackRender = [];
    for (var i = 0; i < this.props.tracks.length; i++) {
      trackRender.push(<Track key={this.props.tracks[i].trid} track={this.props.tracks[i]} playSelf={this.props.playTrack} />);
    }
    return (
      <div className='tracks'>
        {trackRender}
      </div>
    );
  }
})

var Search = React.createClass({
  search: function() {
    if (this.refs.searchInput.value.length < 3 || this.refs.searchInput.value.length % 2 === 1) return ;
    this.props.onSubmit(this.refs.searchInput.value);
  },
  render: function() {
    return (
      <div>
        <input type='text' onChange={this.search} ref='searchInput' placeholder='Search for a track' />
      </div>
    );
  }
});

var ProgressBar = React.createClass({
  render: function() {
    var playClass = (this.props.playing)? 'active': '';
    return (
      <div className='topBar'>
        <div className='progress' style={{width: this.props.progress + 'vw'}}>
        </div>
      </div>
    )
  }
});

var NowPlayingBar = React.createClass({
  render: function() {
    var playClass = (this.props.playing)? 'active': '';

    return (
      <div className='nowPlaying'>
        <ProgressBar progress={this.props.progress} />
        <img src={'/api/get/' + this.props.track.title + ' ' + this.props.track.artist + '/image'} />
        <div className='info'>
          <p>{this.props.track.title}</p>
          <p>{this.props.track.artist}</p>
        </div>
        <div className={'play ' + playClass} onClick={this.props.togglePlay}>
        </div>
      </div>
    )
  }
})

var player = new Audio();

var Content = React.createClass({
  trackFinished: function() {
    this.next();
  },
  trackProgress: function() {
    var progress = player.currentTime / player.duration * 100;
    this.setState({progress: progress});
  },
  trackCanPlay: function() {
    this.setState({playing: true});
  },
  playTrack: function(trid) {
    var i = this.state.tracks.findByIndex('trid', trid);
    this.setState({playing: false});
    this.setState({currentTrackIndex: i});
    this.setState({nowPlayingTracks: this.state.tracks});
    this.setState({currentTrack: this.state.tracks[i]});
    this.setState({musicStarted: true});

    // Play Track
    this.playFromTrid(trid);
  },
  playFromTrid(trid) {
    player.pause();
    var url = 'http://localhost:3000/api/get/' + trid;
    fetch(url)
      .then(function(response) {
        return response.text();
      }).then(function(url) {
        player.src = url;
        player.play();
      });
  },
  toggle: function() {
    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }
    this.setState({playing: !player.paused});
  },
  prev: function() {
    console.log('prev');
    if (this.state.currentTrackIndex === 0) {
      this.setState({currentTrackIndex: this.state.nowPlayingTracks.length});
    }
    var i = this.state.currentTrackIndex - 1;
    this.setState({currentTrackIndex: i});
    var trid = this.state.nowPlayingTracks[i].trid;

    this.setState({playing: false});
    this.setState({currentTrack: this.state.nowPlayingTracks[i]});

    // Play Track
    this.playFromTrid(trid);
  },
  next: function() {
    if (this.state.currentTrackIndex === this.state.nowPlayingTracks.length - 1) {
      this.setState({currentTrackIndex: this.state.nowPlayingTracks.length});
    }
    var i = this.state.currentTrackIndex + 1
    this.setState({currentTrackIndex: i});
    var trid = this.state.nowPlayingTracks[i].trid;

    this.setState({playing: false});
    this.setState({currentTrack: this.state.nowPlayingTracks[i]});
    
    // Play Track
    this.playFromTrid(trid);
  },
  keypress: function(e) {
    var inputs = document.querySelectorAll("textarea:focus, input:focus");
    console.log(e.keyCode);
    if (inputs.length != 0) return;
    switch(e.keyCode) {
      case 32:
        // spacebar pressed
        e.preventDefault();
        this.toggle()
        break;
      case 37:
        // left key pressed
        this.prev()
        break;
      case 39:
        // right key pressed
        console.log('next');
        this.next()
        break;
    } 
  },
  componentDidMount: function() {
    player.addEventListener('ended', this.trackFinished);
    player.addEventListener('timeupdate', this.trackProgress);
    player.addEventListener('canplay', this.trackCanPlay);
    window.addEventListener('keyup', this.keypress);
  },
  getInitialState: function() {
    return {
      tracks: [],
      nowPlayingTracks: [],
      currentTrackIndex: 0,
      musicStarted: false,
      progress: 0,
      playing: false
    }
  },
  updateTracks: function(q) {
    var self = this; 
    fetch('http://localhost:3000/api/search?q=' + q)
      .then(function(response) {
        return response.json();
      }).then(function(json) {
        self.setState({tracks: json});
      });
  },
  render: function() {
    var nowPlayingBar = '';
    if (this.state.musicStarted) {
      nowPlayingBar = <NowPlayingBar track={this.state.currentTrack} progress={this.state.progress} playing={this.state.playing} togglePlay={this.toggle} />
    }
    return (
      <div>
        <Search onSubmit={this.updateTracks} />
        <TrackList tracks={this.state.tracks} playTrack={this.playTrack} />
        {nowPlayingBar}
      </div>
    );
  }
})

ReactDOM.render(<Content />, document.querySelector('.content'));