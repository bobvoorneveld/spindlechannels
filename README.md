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

Copy .env.example to .env and add your Google maps key

Visit the site at localhost:8005 or your dockerhost_ip:8005
