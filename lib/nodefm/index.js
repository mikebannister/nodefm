var LastFmNode = exports.LastFmNode = require('lastfm').LastFmNode,
    RecentTracksHistory = require('./recenttracks-history').RecentTracksHistory;

LastFmNode.prototype.history = function(session, options) {
    var history = new RecentTracksHistory(session, options);
    return history;
};
