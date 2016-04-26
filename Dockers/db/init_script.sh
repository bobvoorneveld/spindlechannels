#!/bin/bash

echo "Grant spindlechannels access from all IPs."
echo "host all spindlechannels 0.0.0.0/0 trust" >> /var/lib/postgresql/data/pg_hba.conf

echo "Done initializing."
