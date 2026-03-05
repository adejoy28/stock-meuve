#!/bin/bash
# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground (keeps container alive)
nginx -g "daemon off;"
