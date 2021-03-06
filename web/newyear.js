var onMapReady = $.Deferred();
var onDataReady = $.Deferred();

var map;
var data;
var heatmap;
var markerList = [];
var isShowMarker = false;

$(window).load(function() {
    NProgress.start();
    getData();
    initialize();
    $.when(onMapReady, onDataReady).done(function() {
        NProgress.inc();
        createMapData();
        NProgress.done();
    });
});

function initialize() {
    var mapCanvas = document.getElementById('map');
    var mapOptions = {
        center: new google.maps.LatLng(13.736137, 100.533334),
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.HYBRID
    }
    map = new google.maps.Map(mapCanvas, mapOptions);
    google.maps.event.addListenerOnce(map, 'idle', function() {
        NProgress.inc();
        onMapReady.resolve();
    });
}

function getData() {
    $.getJSON("data/happynewyear.json", function(json) {
        NProgress.inc();
        data = json;
        //add small random number to separate markers on same location
        for(var i = 0; i < data.length; i++) {
            data[i].location.latitude += (Math.random() - 0.5) / 3000;
            data[i].location.longitude += (Math.random() - 0.5) / 3000;
        }
        NProgress.inc();
        onDataReady.resolve();
    });
}

function createMapData() {
    createMapMarker();
    createHeatMap();
}

function createMapMarker() {
    for(var i = 0; i < data.length; i++) {
        var locationInfo = data[i].location;
        var contentString = '<img src="' + data[i].image + '" height="320" width="320">' +
            '<div>Location: ' + data[i].location.name + '</div>' +
            '<div>User: ' + data[i].username + '</div>';
        var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 320
        });
        var marker = new google.maps.Marker({
            position: {
                lat: locationInfo.latitude,
                lng: locationInfo.longitude
            },
            map: null,
            title: locationInfo.name
        });
        google.maps.event.addListener(marker, 'click', (function(marker, infowindow) {
            return function() {
                infowindow.open(map, marker);
            };
        })(marker, infowindow));
        markerList.push(marker);
    }
    renderMarker();
}

function createHeatMap() {
    var heatMapData = [];
    for(var i = 0; i < data.length; i++) {
        var locationInfo = data[i].location;
        heatMapData.push({
            location: new google.maps.LatLng(locationInfo.latitude, locationInfo.longitude),
            weight: 1
        });
    }
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatMapData,
        radius: 40,
        opacity: 0.75
    });
    heatmap.setMap(map);
    var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
    ]
    heatmap.set('gradient', gradient);
}

function toggleHeatmap() {
    if(heatmap) {
        heatmap.setMap(heatmap.getMap() ? null : map);
    }
}

function toggleMarker() {
    isShowMarker = !isShowMarker;
    renderMarker();
}

function renderMarker() {
    for(var i = 0; i < markerList.length; i++) {
        markerList[i].setMap(isShowMarker ? map : null);
    }
}
