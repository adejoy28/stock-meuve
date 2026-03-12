<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Database\QueryException;

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

        // 1. Force JSON for API routes
        $exceptions->shouldRenderJsonWhen(function (Request $request) {
            return $request->is('api/*') || $request->expectsJson();
        });

        // 2. Custom Rendering Logic (Replaces your old Handler.php)
        $exceptions->render(function (Throwable $e, Request $request) {

            if ($e instanceof ValidationException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'The given data was invalid.',
                    'data' => [
                        'errors' => $e->errors(),
                    ]
                ], 422);
            }

            if ($e instanceof ModelNotFoundException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Resource not found.',
                    'data' => [],
                ], 404);
            }

            if ($e instanceof NotFoundHttpException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'The requested resource was not found.',
                    'data' => [],
                ], 404);
            }

            if ($e instanceof QueryException && $e->getCode() === '23000') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Database constraint violation.',
                    'data' => [],
                ], 409);
            }

            // 3. Global Production Safety Net (Prevents Stack Traces)
            if (!config('app.debug')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Something went wrong, please try again.',
                    'data' => [],
                ], 500);
            }
        });
    })->create();
