#!/bin/bash
# Start PHP-FPM in background
php-fpm -D

php artisan migrate --force   # ← to run new migration

# Start Nginx in foreground (keeps container alive)
nginx -g "daemon off;"
