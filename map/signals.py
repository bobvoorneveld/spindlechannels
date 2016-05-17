import json
import logging

from channels import Group
from django.db.models.signals import post_save
from django.dispatch import receiver

from map.models import Marker


logger = logging.getLogger(__name__)


def send_notification(notification):
    logger.info('send_notification. notification = %s', notification)
    Group('notifications').send({'text': json.dumps(notification)})


@receiver(post_save, sender=Marker)
def marker_post_save(sender, instance, created, **kwargs):
    send_notification({
        'type': 'post_save',
        'created': created,
        'feature': instance.geojson_feature
    })
