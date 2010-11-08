var utils = require('../lib/nodefm/utils');
var underscore = require('underscore');

var settings = jsonFromFile(__dirname + '/.settings.cfg') || {
    api_key: 'your key',
    secret: 'your secret'
}

var LastFmNode = require('../lib/nodefm').LastFmNode;
var lastfm = new LastFmNode(settings);

var username = 'mikebannister';

var session = lastfm.session(username);
var history = lastfm.history(session);

var info = lastfm.info('user', {
    user: username
});

var totalTracks = 0;

history.addListener('tracks', function(tracks, meta) {
    var lastTrack = _.last(tracks);
    // Using second track because the first could be currently playing with no date
    var secondTrack = tracks[1];

    totalTracks = totalTracks + tracks.length;
    console.log('Received page ' + meta.page + ' of ' + meta.totalPages + ' (' + tracks.length + '/' + totalTracks + ' tracks) from ' + simpleDate(secondTrack.date.uts) + ' to ' + simpleDate(lastTrack.date.uts));
});

history.addListener('complete', function(trackInfo) {
    console.log('Done, fetched ' + totalTracks + ' total tracks');
});

history.addListener('error', function(err) {
    console.log('Error receiving history');
    console.dir(err);
});

info.addListener('success', function(user) {
    console.log('Fetching history for ' + username + ' (' + user.playcount + ' tracks)');
    history.start();
});
