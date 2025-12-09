<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('shopify_id')->unique();
            $table->string('title');
            $table->text('body_html')->nullable();
            $table->string('handle')->nullable();
            $table->string('status')->default('active');
            $table->integer('total_inventory')->default(0);
            $table->string('image')->nullable();
            $table->date('expiry_date')->nullable();
            $table->boolean('is_on_sale')->default(false);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
