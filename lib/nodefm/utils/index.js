var fs = require('fs');

parseOptions = exports.parseOptions = function(obj, options, defaults) {
    var o = {};
    _.extend(o, defaults, options);
    _.each(_.keys(defaults), function(key) {
        obj[key] = o[key];
    });
};

jsonFromFile = exports.jsonFromFile = function(filePath) {
    var objStr;
    try {
        objStr = fs.readFileSync(filePath, 'utf8');
    } catch(err) {
        return null;
    }
    return JSON.parse(objStr);
};

simpleDate = exports.simpleDate = function(stamp) {
    var d = new Date();
    d.setTime(parseInt(stamp)*1000);
    var date = "" + d;
    var date = date.split(' ')
    return date[1] + ' ' + date[3];
}
