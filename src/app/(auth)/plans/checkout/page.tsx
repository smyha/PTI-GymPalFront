'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Lock, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [processing, setProcessing] = useState(false);

  const planInfo = { name: 'Premium Plan', price: 9.99, period: 'month' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // No hay endpoint de pagos en openapi; simulamos proceso y navegamos
    setTimeout(() => {
      setProcessing(false);
      router.push('/plans');
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/plans')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-white mb-2">Checkout</h1>
        <p className="text-slate-400">Complete your subscription securely</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="md:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-slate-200">
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={paymentData.cardNumber}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, cardNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName" className="text-slate-200">
                    Name on Card
                  </Label>
                  <Input
                    id="cardName"
                    type="text"
                    placeholder="John Doe"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={paymentData.cardName}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, cardName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="text-slate-200">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiryDate"
                      type="text"
                      placeholder="MM/YY"
                      className="bg-slate-900/50 border-slate-700 text-white"
                      value={paymentData.expiryDate}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, expiryDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-slate-200">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      className="bg-slate-900/50 border-slate-700 text-white"
                      value={paymentData.cvv}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, cvv: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 flex items-start gap-3">
                  <Lock className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-slate-200 text-sm">Secure Payment</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Your information is protected with 256-bit SSL encryption
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {processing ? (
                    'Processing...'
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Confirm payment of ${planInfo.price}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="bg-slate-800/50 border-slate-700 sticky top-6">
            <CardHeader>
              <CardTitle className="text-white">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">{planInfo.name}</span>
                  <span className="text-white">${planInfo.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Period</span>
                  <span className="text-slate-300">Monthly</span>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="flex justify-between">
                <span className="text-white">Total</span>
                <span className="text-white text-xl">
                  ${planInfo.price}
                  <span className="text-sm text-slate-400">/{planInfo.period}</span>
                </span>
              </div>

              <Separator className="bg-slate-700" />

              <div className="space-y-2">
                <p className="text-sm text-slate-400">Includes:</p>
                {[
                  'Unlimited routines',
                  'Personalized diets',
                  'AI Chat',
                  'Advanced analytics',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
