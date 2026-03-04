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
        Schema::create('movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sku_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['opening', 'receipt', 'distribution', 'correction', 'spoil']);
            $table->decimal('qty', 10, 2);        // Positive or negative (corrections are negative)
            $table->foreignId('shop_id')->nullable()->constrained()->nullOnDelete(); // For distributions/corrections
            $table->enum('reason', ['damaged', 'expired', 'returned'])->nullable(); // Spoils only
            $table->enum('status', ['confirmed', 'pending', 'rejected'])->default('confirmed'); // Spoils use pending
            $table->string('note')->nullable();
            $table->timestamp('recorded_at');     // When the movement actually happened
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movements');
    }
};
