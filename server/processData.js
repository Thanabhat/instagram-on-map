var fs = require('fs');

function process() {
    fs.readFile('web\\data\\data_raw.json', 'utf8', function(err, data) {
        data = JSON.parse(data);
        var newData = [];
        for(var i = 0; i < data.length; i++) {
            var locationInfo = data[i].LOCATION ? data[i].LOCATION.match(/(\d+.\d+),(\d+.\d+)/) : null;
            var imageInfo = data[i].IMAGE ? data[i].IMAGE.match(/Image:\s*(http.*)/) : null;
            if(!locationInfo || !imageInfo) {
                continue;
            }
            newData.push(data[i]);
        }
        newData.sort(function(a, b) {
            if((+a.LIKE) > (+b.LIKE)) {
                return -1;
            } else {
                return 1;
            }
        });
        fs.writeFile('web\\data\\data.json', JSON.stringify(newData), function(err) {});
    });
}

process();
