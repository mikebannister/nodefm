var EventEmitter = require('events').EventEmitter;

var RecentTracksHistoryParser = exports.RecentTracksHistoryParser = function() {
    EventEmitter.call(this);
    this.buffer = '';
};

RecentTracksHistoryParser.prototype = Object.create(EventEmitter.prototype);

RecentTracksHistoryParser.prototype.parse = function (data) {
    if (!data || data == '') {
        this.emit('error', new Error("Unexpected input"));
        return;
    }
    var json = JSON.parse(data);
    if (!json.recenttracks) {
        this.emit('error', new Error("Unknown object type"));
        return;
    }
    var tracks = json.recenttracks.track;
    var meta = json.recenttracks['@attr'];
    this.emit('tracks', tracks, meta);
};
