<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Illuminate\Database\QueryException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        // Force JSON for API routes
        if ($request->is('api/*') || $request->wantsJson()) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    private function handleApiException($request, Throwable $e)
    {
        // 401 — not logged in
        if ($e instanceof AuthenticationException) {
            return response()->json([
                'status'  => 'error',
                'message' => 'You are not logged in. Please sign in to continue.',
            ], 401);
        }

        // 403 — logged in but not allowed
        if ($e instanceof AuthorizationException) {
            return response()->json([
                'status'  => 'error',
                'message' => 'You do not have permission to perform this action.',
            ], 403);
        }

        // 422 — validation failed
        if ($e instanceof ValidationException) {
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
        if ($e instanceof ModelNotFoundException) {
            $model = class_basename($e->getModel());
            return response()->json([
                'status'  => 'error',
                'message' => "{$model} not found.",
            ], 404);
        }

        // 404 — route does not exist
        if ($e instanceof NotFoundHttpException) {
            return response()->json([
                'status'  => 'error',
                'message' => 'The requested endpoint does not exist.',
            ], 404);
        }

        // 405 — wrong HTTP method
        if ($e instanceof MethodNotAllowedHttpException) {
            return response()->json([
                'status'  => 'error',
                'message' => 'This request method is not supported.',
            ], 405);
        }

        // 429 — too many requests
        if ($e instanceof TooManyRequestsHttpException) {
            $retryAfter = $e->getHeaders()['Retry-After'] ?? 60;
            return response()->json([
                'status'  => 'error',
                'message' => "Too many attempts. Please wait {$retryAfter} seconds before trying again.",
            ], 429);
        }

        // Database errors
        if ($e instanceof QueryException) {
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
    }
}
