var map;
var data;
var onMapReady = $.Deferred();
var onDataReady = $.Deferred();
var MARKER_LIMIT = 500;
var heatmap;
var markerList = [];

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
    createMapMarker();
    createHeatMap();
}

function createMapMarker() {
    var DATA_MARKER_LIMIT = data.length < MARKER_LIMIT ? data.length : MARKER_LIMIT;
    for(var i = 0; i < DATA_MARKER_LIMIT; i++) {
        var locationInfo = data[i].LOCATION ? data[i].LOCATION.match(/(\d+.\d+),(\d+.\d+)/) : null;
        var imageInfo = data[i].IMAGE ? data[i].IMAGE.match(/Image:\s*(http.*)/) : null;
        if(!locationInfo || !imageInfo) {
            continue;
        }
        var contentString = '<img src="' + imageInfo[1] + '" height="350" width="350">' +
            '<div>Location: ' + data[i].LOCATION_NAME + '</div>' +
            '<div style="max-height: 80px; max-width: 350px; overflow: auto;">Caption: ' + data[i].CAPTION + '</div>' +
            '<div>Username: ' + data[i].USERNAME + '</div>' +
            '<div>Like: ' + data[i].LIKE + '</div>';
        var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 350
        });
        var marker = new google.maps.Marker({
            position: {
                lat: +locationInfo[1],
                lng: +locationInfo[2]
            },
            map: map,
            title: data[i].LOCATION_NAME
        });
        // infowindow.open(map, marker);
        google.maps.event.addListener(marker, 'click', (function(marker, infowindow) {
            return function() {
                infowindow.open(map, marker);
            };
        })(marker, infowindow));

        markerList.push(marker);
    }
}

function createHeatMap() {
    var heatMapData = [];
    for(var i = 0; i < data.length; i++) {
        var locationInfo = data[i].LOCATION ? data[i].LOCATION.match(/(\d+.\d+),(\d+.\d+)/) : null;
        if(!locationInfo) {
            continue;
        }
        heatMapData.push({
            location: new google.maps.LatLng(locationInfo[1], locationInfo[2]),
            weight: +data[i].LIKE || 1
        });
    }
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatMapData,
        radius: 40,
        opacity: 1
    });
    heatmap.setMap(map);
}

function toggleHeatmap() {
    if(heatmap) {
        heatmap.setMap(heatmap.getMap() ? null : map);
    }
}

function toggleMarker() {
    for(var i = 0; i < markerList.length; i++) {
        markerList[i].setMap(markerList[i].getMap() ? null : map);
    }
}
