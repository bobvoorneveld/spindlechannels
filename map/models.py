import json

from django.contrib.auth.models import User
from django.contrib.gis.db import models
from geojson import Feature


class Marker(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    location = models.PointField()

    user = models.ForeignKey(User, null=True, blank=True, default=None)

    @property
    def geojson_feature(self):
        return Feature(
            geometry=json.loads(self.location.geojson),
            id=self.pk,
            properties={
                # 'name': '',
                'created': str(self.created),
                'modified': str(self.modified),
                'model': 'Marker',
                'pk': self.pk,
                'user': self.user.pk if self.user else -1,
            }
        )
