<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'idempotency' => \App\Http\Middleware\IdempotencyMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle AuthenticationException for API routes to prevent "Route [login] not defined"
        $exceptions->render(function (
            \Illuminate\Auth\AuthenticationException $e,
            \Illuminate\Http\Request $request
        ) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'You are not logged in. Please sign in to continue.',
                ], 401);
            }
        });

        // Handle all API exceptions with clean JSON responses
        $exceptions->render(function (Throwable $e, \Illuminate\Http\Request $request) {
            if (!($request->is('api/*') || $request->wantsJson())) {
                return null; // Let Laravel handle non-API requests
            }

            // 403 — logged in but not allowed
            if ($e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'You do not have permission to perform this action.',
                ], 403);
            }

            // 422 — validation failed
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                $messages = collect($e->errors())
                    ->flatten()
                    ->implode(' ');

                return response()->json([
                    'status'  => 'error',
                    'message' => $messages,
                    'errors'  => $e->errors(),
                ], 422);
            }

            // 404 — specific record not found
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $model = class_basename($e->getModel());
                return response()->json([
                    'status'  => 'error',
                    'message' => "{$model} not found.",
                ], 404);
            }

            // 404 — route does not exist
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'The requested endpoint does not exist.',
                ], 404);
            }

            // 405 — wrong HTTP method
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'This request method is not supported.',
                ], 405);
            }

            // 429 — too many requests
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException) {
                $retryAfter = $e->getHeaders()['Retry-After'] ?? 60;
                return response()->json([
                    'status'  => 'error',
                    'message' => "Too many attempts. Please wait {$retryAfter} seconds before trying again.",
                ], 429);
            }

            // Database errors
            if ($e instanceof \Illuminate\Database\QueryException) {
                if (config('app.debug')) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => $e->getMessage(),
                    ], 500);
                }
                return response()->json([
                    'status'  => 'error',
                    'message' => 'A database error occurred. Please try again.',
                ], 500);
            }

            // Everything else — 500
            $message = config('app.debug')
                ? $e->getMessage()
                : 'Something went wrong on our end. Please try again.';

            return response()->json([
                'status'  => 'error',
                'message' => $message,
            ], 500);
        });
    })->create();
