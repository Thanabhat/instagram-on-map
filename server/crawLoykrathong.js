var request = require('request');
var async = require('async');
var fs = require('fs');
var _ = require('lodash');

var TIME_BETWEEN_REQUEST = 500; //ms

function crawTagRecentMedia(tag, count) {
    fs.readFile('server\\access_token.txt', 'utf8', function(err, access_token) {
        var dataAll = [];
        var next_url = encodeURI('https://api.instagram.com/v1/tags/' + tag + '/media/recent?count=100&access_token=' + access_token);
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
                        callback();
                        return;
                    }
                    if(json) {
                        data = JSON.parse(json);
                        console.log('request success');
                    } else {
                        console.log('error in json data');
                        callback();
                        return;
                    }
                    next_url = data.pagination.next_url;
                    var dataPrune = _.map(data.data, function(obj) {
                        return {
                            id: obj.id,
                            location: obj.location
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
                console.log('current data count: ' + dataAll.length);
                if(dataAll.length < count) {
                    return true;
                } else {
                    fs.writeFile('web\\data\\loykrathong.json', JSON.stringify(dataAll), function(err) {});
                    return false;
                }
            },
            function(err) {
                if(err) {
                    console.log(err);
                }
            }
        );
    });
}

crawTagRecentMedia('ลอยกระทง', 1000);
