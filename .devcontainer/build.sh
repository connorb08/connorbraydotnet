#!/usr/bin/env bash

docker buildx bake base
docker buildx bake final
