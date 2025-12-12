#!/usr/bin/env bash

set -e

apt-get update -y
apt-get install -y xauth --no-install-recommends
apt-get -y upgrade --no-install-recommends
apt-get autoremove -y
