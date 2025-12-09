<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $dates = ['ordered_at'];

    protected $fillable = [
        'shopify_id',
        'name',
        'financial_status',
        'fulfillment_status',
        'total_price',
        'currency',
        'ordered_at',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
