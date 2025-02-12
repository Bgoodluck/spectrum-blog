import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, Button, Card } from 'flowbite-react';
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import summaryApi from '../../common';

const VIPPaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  
  // Get current user from Redux store
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const sessionId = searchParams.get('sessionId');
      const paymentId = searchParams.get('paymentId');
      const success = searchParams.get('success');
      
      // Check if the success parameter is false
      if (success === 'false') {
        setStatus('error');
        setMessage('Payment was cancelled or declined');
        return;
      }
      
      // Validate required parameters
      if (!sessionId || !paymentId) {
        setStatus('error');
        setMessage('Invalid payment verification data');
        return;
      }

      const response = await fetch(summaryApi.verifyPayment.url, {
        method: summaryApi.verifyPayment.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          sessionId,
          paymentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment verification failed');
      }

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('VIP upgrade successful! You now have access to all VIP features.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Payment verification failed');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Error verifying payment');
      console.error('Payment verification error:', err);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p>Verifying your payment...</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <Alert color="success">
              <span>{message}</span>
            </Alert>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <Alert color="failure">
              <span>{message}</span>
            </Alert>
            <Button 
              onClick={() => navigate('/vip-upgrade')}
              color="blue"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6">
        <h5 className="text-xl font-bold mb-4">Payment Verification</h5>
        <div className="space-y-4">
          {getStatusDisplay()}
          {status !== 'verifying' && (
            <Button 
              onClick={() => navigate('/dashboard?tab=profile')}
              color="blue"
              className="w-full mt-4"
            >
              Return to Dashboard Profile
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VIPPaymentVerification;