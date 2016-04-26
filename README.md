# Epic Spindle Template for Really Awesome Django Apps (ESTRADA)

Template to provide defaults for new Django 1.8+ projects with docker + postgres included.

## Requirements

Install pip
(If you have PIP installed skip this part)

Official guide: https://pip.pypa.io/en/latest/installing.html

Example for Ubuntu
```
sudo apt-get install python-pip

# Upgrade pip
pip install -U pip
```

A working django version >= 1.5 for generating the project from a template. The
created project will use django 1.8+ but we need a django version to create
the project from this template.
```
sudo pip install django
```

Docker and docker-compose

Depending on your machine the installation process might be different check:
https://docs.docker.com/installation/
https://docs.docker.com/compose/install/

Example for Ubuntu
```
# Docker
wget -qO- https://get.docker.com/ | sh

# docker-compose
sudo pip install docker-compose
```

## Usage

To create a new django project with this template:
```
# Replace project_name with the name of your project
django-admin startproject --template=https://github.com/wearespindle/estrada/archive/master.zip --extension=py,yml,sh,sql --name=Dockerfile,spindle.html project_name
```

Build the Docker environment
```
cd /project_name # Where the docker-compose.yml lives.
docker-compose build
docker-compose build db
# Run this twice if first time fails (slow DB initialization first time)
docker-compose run web python manage.py migrate
docker-compose up
```

Visit the site at localhost:8005 or your dockerhost_ip:8005
