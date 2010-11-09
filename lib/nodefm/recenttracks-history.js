var utils = require('./utils'),
    EventEmitter = require('events').EventEmitter,
    RecentTracksHistoryParser = require('./recenttracks-history-parser').RecentTracksHistoryParser;

RecentTracksHistory = function(session, options) {
    // housekeeping
    EventEmitter.call(this);
    var self = this;
    // save params to obj
    this.session = session;
    // deal with default options
    var defaultParser = new RecentTracksHistoryParser({
        raw: true
    });
    parseOptions(this, options, {
        rate: 5,
        parser: defaultParser,
        retries: 10,
        retryDelay: 10
    });
    
    this.params = {
        method: 'user.getrecenttracks',
        user: self.session.user,
        limit: 200,
        page: 1
    };
    this.parser.addListener('tracks', function(tracks, meta) {
        self.processTracks(tracks, meta);
    });

    this.retryCount = 0;
    this.parser.addListener('error', function(error) {
        if (self.retryCount < self.retries) {
            setTimeout(function() {
                self.start();
                self.retryCount++;
            }, self.retryDelay * 1000);
            self.emit('retry', self.retryCount, self.retries, self.retryDelay);
        } else {
            self.emit('error', error);
        }
    });
};

RecentTracksHistory.prototype = Object.create(EventEmitter.prototype);

RecentTracksHistory.prototype.processTracks = function(tracks, meta) {
    if (!tracks || tracks.length <= 0) { // TODO: Not sure we really still need this?
        this.emit('complete', tracks, meta);
        return;
    }
    if (!_.isArray(tracks)) {
        tracks = [tracks];
    }

    // Set an anchor so the page offset doesn't drift
    var firstTrack = _.first(tracks);
    if (!this.params.to && firstTrack && firstTrack.date && firstTrack.date.uts) {
        this.params.to = parseInt(firstTrack.date.uts) + 1;
    }
    
    this.emit('tracks', tracks, meta);
    
    if (this.params.page >= meta.totalPages) {
        this.emit('complete', tracks, meta);
        return;
    }
    this.params.page++;
    if (this.isFetching) {
        this.timeout = setTimeout(this.fetch.apply(this), this.rate * 1000);
    }
};

RecentTracksHistory.prototype.fetch = function() {
    var self = this;
    this.session.lastfm.readRequest(this.params, false, function(data) {
        self.parser.parse(data);
    });
};

RecentTracksHistory.prototype.start = function() {
    this.isFetching = true;
    this.fetch();
};

RecentTracksHistory.prototype.stop = function() {
    clearTimeout(this.timeout);
    this.isFetching = false;
};

exports.RecentTracksHistory = RecentTracksHistory;
