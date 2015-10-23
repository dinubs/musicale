var React = require('react');
var ReactDOM = require('react-dom');
require('./fetch');

var Router = require('react-router').Router
var Route = require('react-router').Route
var Link = require('react-router').Link

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
        <Link className='ext-link' to={'/track/' + this.props.track.trid}><div className='out'></div></Link>
        <div className={'play ' + playClass} onClick={this.props.togglePlay}>
        </div>
      </div>
    )
  }
});

var Loader = React.createClass({
  render: function() {
    return (
      <div className='bars'>
        <div className='bar' />
        <div className='bar'/>
        <div className='bar'/>
        <div className='bar'/>
        <div className='bar'/>
        <div className='bar'/>
        <div className='bar'/>
        <div className='bar'/>
        <div className='bar'/>
        <div className='bar'/>
        <span>LOADING</span>
      </div>
    )
  }
})

var ShowTrack = React.createClass({
  getInitialState: function() {
    return {
      track: {},
      loaded: false
    }
  },
  componentDidMount: function() {
    var url = 'http://musicale.herokuapp.com/api/get/' + this.props.params.trid + '/info';
    var self = this;
    fetch(url)
      .then(function(response) {
        return response.json();
      }).then(function(data) {
        self.setState({'track': data, 'loaded': true});
      });
  },
  play: function() {
    var tempTrack = this.state.track;
    tempTrack.trid = tempTrack.id;
    this.props.playTrack(tempTrack);
  },
  render: function() {
    if (!this.state.loaded) {
      return (
        <Loader />
      );
    }
    return (
      <div className='show'>
        <h1>{this.state.track.title}</h1>      
        <h2>{this.state.track.artist}</h2>
        <img className='track-artwork' onClick={this.play} src={'/api/get/' + this.state.track.title + ' ' + this.state.track.artist + '/image/full'} />
        <button className='playButton' onClick={this.play}>Play</button>
      </div>
    );
  }
});

var Home = React.createClass({
  updateTracks: function(q) {
    this.props.onSubmit(q);
  },
  playTrack: function(trid) {
    this.props.playTrack(trid);
  },
  render: function() {
    return (
      <div>
        <h1>Musicale</h1>
        <p>Search any track or artist and listen to it, thats pretty much it.</p>
        <Search onSubmit={this.updateTracks} />
        <TrackList tracks={this.props.tracks} playTrack={this.playTrack} />
      </div>
    );
  }
})

window.player = new Audio();

var App = React.createClass({
  trackFinished: function() {
    this.next();
  },
  trackProgress: function() {
    var progress = window.player.currentTime / window.player.duration * 100;
    this.setState({progress: progress});
  },
  trackCanPlay: function() {
    this.setState({playing: true});
  },
  playTrackFromShowpage(track) {
    var arr = [track];
    this.setState({nowPlayingTracks: arr, currentTrackIndex: 0});
    this.setState({currentTrack: track});
    this.setState({playing: false});
    this.setState({musicStarted: true});

    this.playFromTrid(track.id);
  },
  playTrack: function(trid) {
    var i = this.state.tracks.findByIndex('trid', trid);
    this.setState({currentTrackIndex: i});
    this.setState({nowPlayingTracks: this.state.tracks});
    this.setState({currentTrack: this.state.tracks[i]});
    this.setState({musicStarted: true});

    // Play Track
    this.playFromTrid(trid);
  },
  playFromTrid(trid) {
    window.player.pause();
    var url = 'http://musicale.herokuapp.com/api/get/' + trid;
    window.player.src = '';
    fetch(url)
      .then(function(response) {
        return response.text();
      }).then(function(url) {
        window.player.src = url;
        window.player.play();
      });
  },
  toggle: function() {
    if (window.player.paused) {
      window.player.play();
    } else {
      window.player.pause();
    }
    this.setState({playing: !window.player.paused});
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
    window.player.addEventListener('ended', this.trackFinished);
    window.player.addEventListener('timeupdate', this.trackProgress);
    window.player.addEventListener('canplay', this.trackCanPlay);
    window.addEventListener('keyup', this.keypress);

    console.log('mounted');
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
    fetch('http://musicale.herokuapp.com/api/search?q=' + q)
      .then(function(response) {
        return response.json();
      }).then(function(json) {
        self.setState({tracks: json});
      });
  },
  renderChildren: function () {
    if (!this.props.children) return;
    return React.Children.map(this.props.children, function (child) {
      return React.cloneElement(child, {
        playTrack: this.playTrackFromShowpage
      });
    }.bind(this));
  },
  render: function() {
    var nowPlayingBar = '';
    if (this.state.musicStarted) {
      nowPlayingBar = <NowPlayingBar track={this.state.currentTrack} progress={this.state.progress} playing={this.state.playing} togglePlay={this.toggle} />
    }
    return (
      <div>
        {this.renderChildren() || <Home onSubmit={this.updateTracks} tracks={this.state.tracks} playTrack={this.playTrack} />}
        {nowPlayingBar}
      </div>
    );
  }
});

ReactDOM.render((
  <Router>
    <Route path="/" component={App}>
      <Route path="track/:trid" component={ShowTrack}/>
    </Route>
  </Router>
), document.querySelector('.content'))
