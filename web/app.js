var map;
var data;
var onMapReady = $.Deferred();
var onDataReady = $.Deferred();
var MARKER_LIMIT = 20;

$(window).load(function() {
    getData();
    initialize();
    $.when(onMapReady, onDataReady).done(function() {
        createMapData();
    });
});

function initialize() {
    var mapCanvas = document.getElementById('map');
    var mapOptions = {
        center: new google.maps.LatLng(13.736137, 100.533334),
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(mapCanvas, mapOptions);
    google.maps.event.addListenerOnce(map, 'idle', function() {
        onMapReady.resolve();
    });
}

function getData() {
    $.getJSON("data/data.json", function(json) {
        data = json;
        onDataReady.resolve();
    });
}

function createMapData() {
    var DATA_LIMIT = data.length < MARKER_LIMIT ? data.length : MARKER_LIMIT;
    for(var i = 0; i < DATA_LIMIT; i++) {
        var locationInfo = data[i].LOCATION ? data[i].LOCATION.match(/(\d+.\d+),(\d+.\d+)/) : null;
        var imageInfo = data[i].IMAGE ? data[i].IMAGE.match(/Image:\s*(http.*)/) : null;
        if(!locationInfo || !imageInfo) {
            continue;
        }
        var contentString = '<img src="' + imageInfo[1] + '" height="50" width="50" alt="' + data[i].CAPTION + '">';
        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        var marker = new google.maps.Marker({
            position: {
                lat: +locationInfo[1],
                lng: +locationInfo[2]
            },
            map: map,
            title: data[i].CAPTION
        });
        infowindow.open(map, marker);
        google.maps.event.addListener(marker, 'click', (function(marker, infowindow) {
            return function() {
                infowindow.open(map, marker);
            };
        })(marker, infowindow));
    }
}
