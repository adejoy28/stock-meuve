<?php

namespace App\Http\Middleware;

use App\Models\IdempotencyKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdempotencyMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Only apply to state-changing requests
        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
            return $next($request);
        }

        $key = $request->header('X-Idempotency-Key');

        // If no key sent, proceed normally (backwards compatible)
        if (!$key) {
            return $next($request);
        }

        // Check if we have already processed this key
        $existing = IdempotencyKey::valid()->where('key', $key)->first();

        if ($existing) {
            // Return the stored response — do NOT process again
            return response($existing->response_body, $existing->status_code)
                ->header('Content-Type', 'application/json')
                ->header('X-Idempotent-Replayed', 'true');
        }

        // Process the request
        $response = $next($request);

        // Store the result — expires in 24 hours
        // Only store successful responses (2xx) to avoid caching errors
        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
            IdempotencyKey::create([
                'key'           => $key,
                'route'         => $request->method() . ' ' . $request->path(),
                'status_code'   => $response->getStatusCode(),
                'response_body' => $response->getContent(),
                'expires_at'    => now()->addHours(24),
            ]);
        }

        return $response;
    }
}
