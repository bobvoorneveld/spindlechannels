$(function() {
    // When we're using HTTPS, use WSS too.
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    var mapsock = new ReconnectingWebSocket(ws_scheme + '://' + window.location.host + window.location.pathname, null, {debug: true});

    mapsock.onmessage = function(message) {
        var notification = JSON.parse(message.data);
        console.log(notification);
        map.data.addGeoJson(notification.feature);
    };

    function fromLatLng(latLng) {
        return {
            "type": "Point",
            "coordinates": [
                latLng.lng(),
                latLng.lat()
            ]
        }
    }
    function sendLocation(latLng) {
        mapsock.send(JSON.stringify(fromLatLng(latLng)));
    }

    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 52.23, lng: 4.55},
        zoom: 8
    });

    map.addListener('click', function(e) {
        sendLocation(e.latLng);
    });

    map.data.addListener('click', function(e) {
        console.log(e.feature);
        alert(e.feature.getProperty('pk') + ": " + e.feature.getProperty('name'))
    });
});
