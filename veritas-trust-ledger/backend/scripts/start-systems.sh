#!/bin/bash

echo "Starting PostgreSQL"
sudo port load postgresql16-server

echo "Starting Redis"
redis-server &

echo "Starting API"
node api/server.js &