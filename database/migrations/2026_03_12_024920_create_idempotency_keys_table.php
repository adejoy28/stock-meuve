<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('idempotency_keys', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();          // The UUID sent from frontend
            $table->string('route');                   // e.g. POST /api/movements/distribution
            $table->integer('status_code');            // HTTP status of original response
            $table->longText('response_body');         // JSON response stored as string
            $table->timestamp('expires_at');           // Auto-expire after 24 hours
            $table->timestamps();

            $table->index('key');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('idempotency_keys');
    }
};
