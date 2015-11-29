var onMapReady = $.Deferred();
var onDataReady = $.Deferred();

var map;
var data;
var heatmap;
var markerList = [];
var isShowMarker = true;

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
    $.getJSON("data/loykrathong.json", function(json) {
        data = json;
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
        var marker = new google.maps.Marker({
            position: {
                lat: locationInfo.latitude,
                lng: locationInfo.longitude
            },
            map: null,
            title: locationInfo.name
        });
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
    isShowMarker = !isShowMarker;
    renderMarker();
}

function renderMarker() {
    for(var i = 0; i < markerList.length; i++) {
        markerList[i].setMap(isShowMarker ? map : null);
    }
}
