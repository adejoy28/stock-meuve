<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Database\QueryException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        // Handle validation errors
        if ($e instanceof ValidationException) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $e->errors(),
            ], 422);
        }

        // Handle model not found errors
        if ($e instanceof ModelNotFoundException) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 404);
        }

        // Handle not found HTTP errors
        if ($e instanceof NotFoundHttpException) {
            return response()->json([
                'message' => 'The requested resource was not found.',
            ], 404);
        }

        // Handle database constraint violations
        if ($e instanceof QueryException && $e->getCode() === '23000') {
            return response()->json([
                'message' => 'Database constraint violation. The operation could not be completed.',
            ], 409);
        }

        // For API requests, return JSON response for other exceptions
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Something went wrong, please try again.',
                'exception' => class_basename($e),
            ], 500);
        }

        return parent::render($request, $e);
    }
}
