var request = require('request');
var async = require('async');
var fs = require('fs');
var _ = require('lodash');

var TIME_BETWEEN_REQUEST = 500; //ms
var MAX_RETRY_ERROR = 10;

function crawTagRecentMedia(tag, count, max_tag_id, min_tag_id) {
    var errorCount = 0;
    fs.readFile('server\\access_token.txt', 'utf8', function(err, access_token) {
        var dataAll = [];
        var url = 'https://api.instagram.com/v1/tags/' + tag + '/media/recent?count=100&access_token=' + access_token;
        if (typeof max_tag_id !== 'undefined') {
            url += '&max_tag_id=' + max_tag_id;
        }
        var next_url = encodeURI(url);
        var next_max_tag_id = max_tag_id;
        async.doWhilst(
            function(callback) {
                var options = {
                    url: next_url,
                    method: 'get'
                };
                console.log('craw: ' + options.url);
                request(options, function(error, response, json) {
                    var data = null;
                    if(error) {
                        console.log(error);
                        callback(null, 'error');
                        return;
                    }
                    if(json) {
                        try{
                            data = JSON.parse(json);
                            console.log('request success: ' + data.data.length);
                        }catch(error){
                            console.log('error in json data');
                            callback(null, 'error');
                            return;
                        }
                    } else {
                        console.log('error in json data');
                        callback(null, 'error');
                        return;
                    }
                    next_url = data.pagination.next_url;
                    next_max_tag_id = next_url.match(/max_tag_id=(\d+)/)[1];
                    var dataPrune = _.map(data.data, function(obj) {
                        return {
                            id: obj.id,
                            location: obj.location,
                            likes: obj.likes.count,
                            comments: obj.comments.count,
                            username: obj.user.username,
                            image: obj.images.low_resolution.url,
                            time: obj.created_time
                        }
                    });
                    dataPrune = _.filter(dataPrune, function(obj) {
                        return obj.location && obj.location.latitude && obj.location.longitude;
                    });
                    dataAll = dataAll.concat(dataPrune);
                    setTimeout(callback, TIME_BETWEEN_REQUEST);
                });
            },
            function() {
                if(errorCount >= MAX_RETRY_ERROR){
                    fs.writeFile('web\\data\\' + tag + '.json', JSON.stringify(dataAll), function(err) {});
                    return false;
                }
                console.log('current data count: ' + dataAll.length);
                if(typeof count !== 'undefined'){
                    if(dataAll.length < count) {
                        return true;
                    } else {
                        fs.writeFile('web\\data\\' + tag + '.json', JSON.stringify(dataAll), function(err) {});
                        return false;
                    }
                }
                if(typeof min_tag_id !== 'undefined'){
                    if(next_max_tag_id >= min_tag_id) {
                        return true;
                    } else {
                        fs.writeFile('web\\data\\' + tag + '.json', JSON.stringify(dataAll), function(err) {});
                        return false;
                    }
                }
            },
            function(err, data) {
                if(err || data === 'error') {
                    console.log(err);
                    errorCount++;
                    console.log('Error count: '+errorCount);
                }
            }
        );
    });
}

// crawTagRecentMedia('hny', undefined, 1152295000000000000, 1152250000000000000);
crawTagRecentMedia('happynewyear', undefined, 1152295000000000000, 1152250000000000000);
