FROM ubuntu:14.04
MAINTAINER spindlechannels

RUN apt-get update

RUN apt-get install -y \
    python2.7-dev \
    python-pip \
    postgresql \
    postgresql-server-dev-9.3

RUN useradd docker
RUN echo "ALL ALL = (ALL) NOPASSWD: ALL" >> /etc/sudoers
WORKDIR /home/docker
ENV HOME /home/docker

ADD requirements.txt $HOME/requirements.txt
ADD requirements-dev.txt $HOME/requirements-dev.txt
RUN pip install -r $HOME/requirements-dev.txt
RUN rm $HOME/requirements.txt $HOME/requirements-dev.txt

# Switch to docker user.
RUN chown -R docker:docker $HOME/
USER docker

ENV DEBUG 1
ENV DATABASE_URL postgres://spindlechannels:@db/spindlechannels

WORKDIR /home/docker/spindlechannels
