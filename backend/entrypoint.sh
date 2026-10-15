#!/bin/sh
set -e

# Wait for redis if needed
echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Executing command: $@"
exec "$@"
