$(function() {

    // Store the markers that are set on the map
    var markers = {},

        // Keep track which marker is dragged
        draggingMarkerId,

        // The Google Maps map
        map,

        // The WebSocket connection
        socket;


    onLoad();
    //////

    /**
     * This function will initialize everything.
     */
    function onLoad() {
        createSocket();
        createMap();
    }

    /**
     * This function will create the WebSocket connection.
     */
    function createSocket() {
        // When we're using HTTPS, use WSS too.
        var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
        socket = new ReconnectingWebSocket(ws_scheme + '://' + window.location.host + window.location.pathname, null, {debug: true});
        socket.onmessage = newSocketMessage;
    }

    /**
     * Load the Google Maps map.
     */
    function createMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 52.23, lng: 4.55},
            zoom: 8
        });

        // Add a listener when the user clicks the map.
        map.addListener('click', function(e) {
            sendLocation(e.latLng);
        });
    }

    /**
     * This function will parse the incoming websocket message
     *
     * @param message (websocket message)
     */
    function newSocketMessage(message) {

        // Parse the message
        var notification = JSON.parse(message.data);
        var feature = notification.feature;

        // Are we dragging?
        if (feature.id == draggingMarkerId) {
            return;
        }

        // Get new location
        var latLng = new google.maps.LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);

        // Do we have this marker already?
        if (feature.id in markers) {
            // Update location
            markers[feature.id].setPosition(latLng);
        } else {
            var iconColor = 'red';
            var title = 'new marker';
            switch (feature['properties']['user'] % 3) {
                case 1:
                    iconColor = 'green';
                    title = '+ placed by ' + feature['properties']['user'];
                    break;
                case 2:
                    iconColor = 'blue';
                    title = '+ placed by ' + feature['properties']['user'];
                    break;
            }

            // Create a new marker
            var marker = new google.maps.Marker({
                position: latLng,
                map: map,
                draggable: true,
                title: title,
                id: feature.id,
                icon: 'https://maps.google.com/mapfiles/ms/icons/' + iconColor + '-dot.png',
            });

            // Keep track of new marker
            markers[feature.id] = marker;

            // Add listener to keep track of which marker is being dragged
            marker.addListener('dragstart', function() {
                draggingMarkerId = marker.id;
            });
            // Add listener to end tracking of draggable marker
            marker.addListener('dragend', function() {
                draggingMarkerId = null;
            });

            // Send to the server the new position of the marker
            marker.addListener('drag', function() {
                sendLocation(marker.getPosition(), marker.id);
            });
        }

        updateBounds();
    }

    /**
     * This function will create an object with location info of the marker
     *
     * @param latLng (LatLng object): Location to be sent
     * @param id (optional): The id of the marker
     *
     * @returns {{type: string, coordinates: *[]}} Object with location info
     */
    function fromLatLng(latLng, id) {
        var info =  {
            'type': 'Point',
            'coordinates': [
                latLng.lng(),
                latLng.lat()
            ]
        };

        if (id) {
            info['id'] = id;
        }
        return info;
    }

    /**
     * Sent the new location over the socket.
     *
     * @param latLng (LatLng object): Location to be sent
     * @param markerId (optional): The id of the marker
     */
    function sendLocation(latLng, markerId) {
        socket.send(JSON.stringify(fromLatLng(latLng, markerId)));
    }

    function updateBounds() {
        // Update bounds of map to fit all markers
        var bounds = new google.maps.LatLngBounds();
        for (var i in markers) {
            bounds.extend(markers[i].getPosition());
        }
        map.fitBounds(bounds);
    }
});
