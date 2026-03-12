<?php

namespace App\Console\Commands;

use App\Models\IdempotencyKey;
use Illuminate\Console\Command;

class PurgeExpiredIdempotencyKeys extends Command
{
    protected $signature = 'idempotency:purge';
    protected $description = 'Delete expired idempotency keys';

    public function handle(): void
    {
        $deleted = IdempotencyKey::where('expires_at', '<', now())->delete();
        $this->info("Purged {$deleted} expired idempotency keys.");
    }
}
