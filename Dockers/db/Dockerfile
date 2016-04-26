FROM postgres:9.3
MAINTAINER spindlechannels

ADD init_script.sh /docker-entrypoint-initdb.d/
ADD create_db_with_user.sql /docker-entrypoint-initdb.d/
