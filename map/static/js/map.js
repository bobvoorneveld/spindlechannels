$(function() {

    // Store the markers that are set on the map
    var markers = {},

    // Keep track which marker is dragged
        draggingMarkerId,

    // The Google Maps map
        map,

    // The WebSocket connection
        socket;

    /**
     * Observables
     */

    // Marker updates
    var markerUpdate$ = new Rx.Subject();
    // Socket messages
    var socket$ = new Rx.Subject();
    // Clicks on the map
    var click$ = new Rx.Subject();

    // Start dragging marker
    var dragStart$ = new Rx.Subject();
    // Dragging marker
    var drag$ = new Rx.Subject();
    // End dragging marker
    var dragEnd$ = new Rx.Subject();

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
        // Sent every socket message to our observable
        socket.onmessage = function(message) {
            socket$.onNext(message);
        }
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
            click$.onNext({
                action: 'click',
                position: e.latLng
            });
        });
    }

    function createMarker(feature) {
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
            position: {lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0]},
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
            dragStart$.onNext({
                marker: marker,
                action: 'dragstart'
            });
            draggingMarkerId = marker.id;
        });
        // Add listener to end tracking of draggable marker
        marker.addListener('dragend', function() {
            dragEnd$.onNext({
                marker: marker,
                action: 'dragend'
            });
            draggingMarkerId = null;
        });

        // Send to the server the new position of the marker
        marker.addListener('drag', function() {
            drag$.onNext({
                marker: marker,
                action: 'drag'
            });
        });
    }

    /**
     * Handle observables
     */

    // Update map bounds
    markerUpdate$.debounce(200).subscribe(function() {
        var bounds = new google.maps.LatLngBounds();
        for (var i in markers) {
            bounds.extend(markers[i].getPosition());
        }
        map.fitBounds(bounds);
    });

    // Parse socket JSON
    var parsedSocket$ = socket$.map(function(message) {
        return JSON.parse(message.data);
    }).share();

    /**
     * Marker clearing
     */
    parsedSocket$.filter(function(notification) {
       return notification.type == 'clear';
    }).subscribe(function() {
        for (var i in markers) {
            markers[i].setMap(null);
        }
        markers = {};
        map.setCenter({lat: 52.23, lng: 4.55});
        map.setZoom(8);
    });

    /**
     * Marker updates
     */
    var otherMarker$ = parsedSocket$.filter(function(notification) {
        // No clearing
       return notification.type != 'clear';
    }).map(function(notification) {
        // Get the marker info
        return notification.feature;
    }).filter(function(notification) {
        // Make sure its not the marker we're dragging
        return notification.id != draggingMarkerId;
    });

    // Update existing marker
    otherMarker$.filter(function(feature) {
        return feature.id in markers;
    }).subscribe(function(feature) {
        markers[feature.id].setPosition({lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0]});
        // Tell the other stream we've updated
        markerUpdate$.onNext();
    });

    // Create new marker
    otherMarker$.filter(function(feature) {
        return !(feature.id in markers);
    }).subscribe(function(feature) {
        createMarker(feature);
        // Tell the other stream we've updated
        markerUpdate$.onNext();
    });

    // Throttle drags to not overflow the socket
    // First, buffer every drag
    var throttledDrag$ = drag$.bufferWithTime(100)
        // Map so we always get the last item
        .map(function(x) {
            return x[x.length-1];
        // Filter out the empty values
        }).filter(function(x) {
            if (x) return x;
        });

    // Merge drag streams
    var drags$ = Rx.Observable.merge([dragStart$, throttledDrag$, dragEnd$]).map(function(event) {
        event.position = event.marker.getPosition();
        return event;
    });

    // Sent marker info through the socket
    Rx.Observable.merge([drags$, click$]).subscribe(function(event) {
        var info = {
            'marker': {
                'id': event.marker ? event.marker.id : null,
                'type': 'Point',
                'coordinates': [
                    event.position.lng(),
                    event.position.lat()
                ]
            },
            'event': event.action
        };
        socket.send(JSON.stringify(info));
    });
});
