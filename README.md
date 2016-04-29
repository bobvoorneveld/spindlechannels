# Django Channels Spindle Maps example app

## Installation

Build the Docker environment
```
cd /project_name # Where the docker-compose.yml lives.
docker-compose build
docker-compose build db
# Run this twice if first time fails (slow DB initialization first time)
docker-compose run web python manage.py migrate
docker-compose up
```

This needs a FIX (should be in the build script of the docker):
To get PostGis to work on the database, connect a postgres user to the database and run:
```
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
CREATE EXTENSION fuzzystrmatch;
CREATE EXTENSION postgis_tiger_geocoder;
```

Copy .env.example to .env and add your Google maps key

Visit the site at localhost:8005 or your dockerhost_ip:8005
