#!/usr/bin/env bash

cp .devcontainer/.env ~/.env
cat .devcontainer/.bashrc >> ~/.bashrc
pre-commit install