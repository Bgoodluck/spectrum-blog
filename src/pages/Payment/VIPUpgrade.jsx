import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert } from 'flowbite-react';
import { Button } from 'flowbite-react';
import { Card } from 'flowbite-react';
import { Crown, Timer, AlertCircle } from "lucide-react";
import summaryApi from '../../common';
import { useNavigate } from 'react-router-dom';

const VIPUpgrade = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vipStatus, setVipStatus] = useState(null);
  const navigate = useNavigate()

  const packages = [
    {
      name: "Standard VIP",
      duration: 60,
      maxAdverts: 10,
      amount: 49.99,
      description: "60 days of VIP access with up to 10 adverts"
    },
    // {
    //   name: "Premium VIP",
    //   duration: 90,
    //   maxAdverts: 20,
    //   amount: 79.99,
    //   description: "90 days of VIP access with up to 20 adverts"
    // }
  ];

  useEffect(() => {
    checkVipStatus();
  }, []);

  const checkVipStatus = async () => {
    try {
      const response = await fetch(
        `${summaryApi.packageStatus.url}${currentUser.rest._id}`,
        {
          method: summaryApi.packageStatus.method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch VIP status');
      }
      
      const data = await response.json();
      setVipStatus(data);
    } catch (err) {
      setError('Error checking VIP status: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUpgrade = async (packageDetails) => {
    try {
      setLoading(true);
      setError(null);

      // First request: Upgrade package
      const upgradeResponse = await fetch(
        `${summaryApi.packagePayment.url}${currentUser.rest._id}`,
        {
          method: summaryApi.packagePayment.method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.token}`
          },
          body: JSON.stringify({
            duration: packageDetails.duration,
            maxAdverts: packageDetails.maxAdverts
          })
        }
      );

      if (!upgradeResponse.ok) {
        throw new Error('Failed to initiate upgrade');
      }

      const upgradeData = await upgradeResponse.json();

      if (upgradeData.success) {
        // Second request: Initialize payment
        const paymentResponse = await fetch(
          summaryApi.initiatePayment.url,
          {
            method: summaryApi.initiatePayment.method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({
              userId: currentUser.rest._id,
              duration: packageDetails.duration,
              maxAdverts: packageDetails.maxAdverts,
              amount: packageDetails.amount
            })
          }
        );

        if (!paymentResponse.ok) {
          throw new Error('Failed to initiate payment');
        }

        const paymentData = await paymentResponse.json();

        if (paymentData.sessionUrl) {
          window.location.href = paymentData.sessionUrl;
        } else {
          throw new Error('No payment session URL received');
        }
      } else {
        throw new Error(upgradeData.message || 'Upgrade request failed');
      }
    } catch (err) {
      setError(err.message || 'Error initiating upgrade');
    } finally {
      setLoading(false);
    }
  };

  if (vipStatus?.isVip) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="text-yellow-500" size={24} />
            <h5 className="text-xl font-bold">VIP Status Active</h5>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Timer className="text-gray-500" size={20} />
              <p>Expires: {new Date(vipStatus.vipDetails.endDate).toLocaleDateString()}</p>
            </div>
            <p>Remaining Posts: {vipStatus.remainingPosts}</p>
          </div>
        </div>
      </Card>
    );
  }

  const handleBack = ()=>{
    navigate("/")
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert color="failure">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </Alert>
      )}
      <Button
        onClick={handleBack}
        className='m-2'
        color='blue'
        variant="secondary"
      >
         back
      </Button>

      <div className="grid md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.name} className='mx-auto'>
            <div className="p-6">
              <h5 className="text-xl font-bold mb-2">{pkg.name}</h5>
              <p className="text-gray-600 mb-4">{pkg.description}</p>
              <div className="text-2xl font-bold mb-4">£{pkg.amount}</div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {pkg.maxAdverts} Adverts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {pkg.duration} Days Access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Premium Support
                </li>
              </ul>
              <Button
                onClick={() => handleUpgrade(pkg)}
                disabled={loading}
                color="blue"
                className="w-full"
              >
                {loading ? 'Processing...' : 'Upgrade Now'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VIPUpgrade;