#!/usr/bin/env bash
set -e

# Install project dependencies
cd ExpoGallery
npm ci

# Prepare the environment file expected by scripts and tests
cp .env.example .env.local
