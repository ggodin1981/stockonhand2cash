<?php
/**
 * StockOnHand2Cash – Commerce Back-Office System
 * Author: Software Developer – Gregorio Godin Jr
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'shopify_id',
        'title',
        'body_html',
        'handle',
        'status',
        'total_inventory',
        'image',
        'expiry_date',
        'is_on_sale',
        'discount_percent',
    ];

    protected $casts = [
        'expiry_date'      => 'date',
        'is_on_sale'       => 'boolean',
        'discount_percent' => 'float',
    ];
}
