FROM postgres:9.3
MAINTAINER spindlechannels

ENV POSTGIS_MAJOR 2.2
ENV POSTGIS_VERSION 2.2.2+dfsg-1.pgdg80+1

RUN apt-get update \
      && apt-get install -y --no-install-recommends \
           postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR=$POSTGIS_VERSION \
           postgis=$POSTGIS_VERSION \
      && rm -rf /var/lib/apt/lists/*

ADD init_script.sh /docker-entrypoint-initdb.d/
ADD create_db_with_user.sql /docker-entrypoint-initdb.d/
