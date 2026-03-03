'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, ArrowLeft, CreditCard, Smartphone, Wallet, Copy, Check, QrCode } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
    paypal: any;
  }
}

type PaymentMethod = 'upi' | 'razorpay' | 'paypal' | 'cod';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, getSubtotal, discount, coupon, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { settings } = useSettingsStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    shippingAddr: user?.address || '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'India',
    billingAddr: '',
    notes: '',
  });

  const subtotal = getSubtotal();
  const total = getTotal();

  // Load payment scripts
  useEffect(() => {
    // Load Razorpay script
    if (settings.razorpayEnabled && settings.razorpayKeyId) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    }

    // Load PayPal script
    if (settings.paypalEnabled && settings.paypalClientId) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${settings.paypalClientId}&currency=USD`;
      script.onload = () => {
        setPaypalLoaded(true);
        // Initialize PayPal buttons
        if (window.paypal) {
          window.paypal.Buttons({
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: (total / 80).toFixed(2), // Convert INR to USD approx
                  },
                }],
              });
            },
            onApprove: async (data: any, actions: any) => {
              const details = await actions.order.capture();
              handlePaymentSuccess('paypal', details.id);
            },
          }).render('#paypal-button-container');
        }
      };
      document.body.appendChild(script);
    }
  }, [settings, total]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded || !window.Razorpay) {
      setError('Payment gateway not loaded. Please refresh and try again.');
      return;
    }

    // Create order first
    setLoading(true);
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          couponCode: coupon?.code,
          discount,
          paymentMethod: 'razorpay',
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      const options = {
        key: settings.razorpayKeyId,
        amount: total * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: settings.siteName,
        description: 'Order Payment',
        order_id: orderData.razorpayOrderId,
        handler: (response: any) => {
          handlePaymentSuccess('razorpay', response.razorpay_payment_id, orderData.id);
        },
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone,
        },
        theme: {
          color: settings.primaryColor,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (method: PaymentMethod, transactionId: string, createdOrderId?: string) => {
    setLoading(true);
    try {
      // Update order payment status
      if (createdOrderId) {
        await fetch(`/api/orders/${createdOrderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentStatus: 'PAID',
            paymentMethod: method,
            transactionId,
          }),
        });
      }

      setOrderId(createdOrderId || transactionId);
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError('Payment successful but order update failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
      return;
    }

    if (paymentMethod === 'paypal') {
      // PayPal is handled by its own button
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        ...formData,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        couponCode: coupon?.code,
        discount,
        paymentMethod,
        paymentStatus: paymentMethod === 'upi' ? 'PENDING' : 'PENDING',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setOrderId(data.id);
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Get available payment methods
  const availablePaymentMethods = [];
  if (settings.upiEnabled && settings.upiId) {
    availablePaymentMethods.push({ id: 'upi', name: 'UPI Payment', icon: Smartphone, description: 'Pay using UPI apps like Google Pay, PhonePe, Paytm' });
  }
  if (settings.razorpayEnabled && settings.razorpayKeyId) {
    availablePaymentMethods.push({ id: 'razorpay', name: 'Razorpay', icon: CreditCard, description: 'Pay with cards, UPI, net banking, wallets' });
  }
  if (settings.paypalEnabled && settings.paypalClientId) {
    availablePaymentMethods.push({ id: 'paypal', name: 'PayPal', icon: Wallet, description: 'Pay securely with PayPal (International)' });
  }
  // Always add COD as fallback
  availablePaymentMethods.push({ id: 'cod', name: 'Cash on Delivery', icon: CreditCard, description: 'Pay when your order arrives' });

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No items to checkout</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart first.</p>
          <Link href="/shop">
            <Button style={{ backgroundColor: settings.primaryColor }} className="text-white hover:opacity-90">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We've sent a confirmation email to {formData.customerEmail}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Order ID: <span className="font-mono font-medium">{orderId}</span>
          </p>
          {paymentMethod === 'upi' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-amber-800 font-medium mb-2">UPI Payment Instructions:</p>
              <p className="text-sm text-amber-700">
                Please complete the payment using UPI ID: <strong>{settings.upiId}</strong>
              </p>
              <p className="text-sm text-amber-600 mt-2">
                Your order will be processed after payment confirmation.
              </p>
            </div>
          )}
          <div className="space-y-3">
            <Link href="/shop">
              <Button className="w-full text-white hover:opacity-90" style={{ backgroundColor: settings.primaryColor }}>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white py-12" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})` }}>
        <div className="container mx-auto px-4">
          <Link href="/cart" className="inline-flex items-center opacity-90 hover:opacity-100 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isAuthenticated && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <p className="text-amber-800">
                        Have an account?{' '}
                        <Link href="/auth/login" className="font-medium underline">
                          Login here
                        </Link>
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email *</Label>
                      <Input
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">Phone *</Label>
                      <Input
                        id="customerPhone"
                        name="customerPhone"
                        type="tel"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shippingAddr">Street Address *</Label>
                    <Textarea
                      id="shippingAddr"
                      name="shippingAddr"
                      value={formData.shippingAddr}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="shippingCity">City *</Label>
                      <Input
                        id="shippingCity"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shippingState">State *</Label>
                      <Input
                        id="shippingState"
                        name="shippingState"
                        value={formData.shippingState}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shippingZip">PIN Code *</Label>
                      <Input
                        id="shippingZip"
                        name="shippingZip"
                        value={formData.shippingZip}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Select your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {availablePaymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id as PaymentMethod)}
                          className="mt-1 h-4 w-4"
                          style={{ accentColor: settings.primaryColor }}
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2">
                            <method.icon className="h-5 w-5" style={{ color: settings.primaryColor }} />
                            <span className="font-medium">{method.name}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* UPI Payment Details */}
                  {paymentMethod === 'upi' && settings.upiId && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        UPI Payment Details
                      </h4>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 p-3 bg-white rounded border">
                          <p className="text-sm text-gray-500">UPI ID</p>
                          <p className="font-mono font-medium">{settings.upiId}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={copyUpiId}
                          className="flex items-center gap-2"
                        >
                          {copiedUpi ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copiedUpi ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      <p className="text-sm text-green-700">
                        Pay <strong>{formatPrice(total)}</strong> to the above UPI ID and complete your order.
                        Your order will be processed after payment confirmation.
                      </p>
                    </div>
                  )}

                  {/* PayPal Container */}
                  {paymentMethod === 'paypal' && (
                    <div className="mt-6">
                      <div id="paypal-button-container"></div>
                      {!paypalLoaded && (
                        <p className="text-sm text-gray-500">Loading PayPal...</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="mt-1"
                      rows={3}
                      placeholder="Any special instructions for your order..."
                    />
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  {error}
                </div>
              )}

              {paymentMethod !== 'paypal' && (
                <Button
                  type="submit"
                  className="w-full h-14 text-white text-lg hover:opacity-90"
                  style={{ backgroundColor: settings.primaryColor }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Place Order - ${formatPrice(total)}`
                  )}
                </Button>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 pb-6 border-b">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images?.[0] || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 py-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {coupon && `(${coupon.code})`}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold pt-4 border-t">
                <span>Total</span>
                <span style={{ color: settings.primaryColor }}>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
