#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/home/ubuntu/projects/importir-pontianak"
IMAGE_NAME="importir-pontianak-web:latest"
SERVICE_NAME="importir-pontianak-web"

echo "Building Docker image ${IMAGE_NAME}..."
docker build -t "${IMAGE_NAME}" "${PROJECT_DIR}"

if docker service inspect "${SERVICE_NAME}" >/dev/null 2>&1; then
  echo "Updating Docker Swarm service ${SERVICE_NAME}..."
  docker service update --force --image "${IMAGE_NAME}" "${SERVICE_NAME}"
else
  echo "Service ${SERVICE_NAME} not found. Please create it first."
  exit 1
fi

echo "Deployment complete."
