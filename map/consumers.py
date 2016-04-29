import json
import logging

from channels import Group
from channels.auth import channel_session_user_from_http, channel_session_user
from django.contrib.gis.geos import GEOSGeometry

from map.models import Marker

logger = logging.getLogger(__name__)


@channel_session_user_from_http
def ws_connect(message):
    logger.info('websocket_connect. message = %s', message)
    Group('notifications').add(message.reply_channel)


@channel_session_user
def websocket_keepalive(message):
    logger.info('websocket_keepalive. message = %s', message)
    Group('notifications').add(message.reply_channel)


@channel_session_user
def ws_receive(message):
    try:
        data = json.loads(message['text'])
    except ValueError:
        logger.info("ws message isn't json text=%s", message['text'])
        return

    marker = Marker(location=GEOSGeometry(message['text']))
    marker.save()


@channel_session_user
def ws_disconnect(message):
    logger.info('websocket_disconnect. message = %s', message)
    Group('notifications').discard(message.reply_channel)
