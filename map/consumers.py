import json
import logging

from channels import Group
from channels.auth import channel_session_user_from_http, channel_session_user
from django.contrib.gis.geos import GEOSGeometry

from map.models import Marker
from map.signals import send_notification

logger = logging.getLogger(__name__)


@channel_session_user_from_http
def ws_connect(message):
    logger.info('websocket_connect. message = %s', message)

    # Sent all existing markers to the client
    for marker in Marker.objects.all():
        message.reply_channel.send({
            'text':
                json.dumps({
                    'type': 'post_save',
                    'created': False,
                    'feature': marker.geojson_feature
                })
        })
    # Load every connection into one group.
    Group('notifications').add(message.reply_channel)


@channel_session_user
def websocket_keepalive(message):
    logger.info('websocket_keepalive. message = %s', message)
    # Load every connection into one group.
    Group('notifications').add(message.reply_channel)


@channel_session_user
def ws_receive(message):
    # Load the data from the incoming WebSocket message
    try:
        data = json.loads(message['text'])
    except ValueError:
        logger.info("ws message isn't json text=%s", message['text'])
        return

    # Check if an existing Marker is updated
    marker = None
    if 'marker' in data and 'id' in data['marker']:
        try:
            marker = Marker.objects.get(pk=data['marker']['id'])
        except Marker.DoesNotExist:
            pass

    # New Marker
    if not marker:
        user = message.user if message.user.is_authenticated() else None
        marker = Marker(user=user)

    # Update the location
    marker.location = GEOSGeometry('POINT(%s %s)' % (data['marker']['coordinates'][0],
                                                     data['marker']['coordinates'][1]))

    if 'event' in data:
        if 'drag' == data['event']:
            send_notification({
                'type': 'update',
                'created': True if marker.id else False,
                'feature': marker.geojson_feature
            })
        else:
            marker.save()


@channel_session_user
def ws_disconnect(message):
    logger.info('websocket_disconnect. message = %s', message)
    # Remove connection from the group
    Group('notifications').discard(message.reply_channel)
