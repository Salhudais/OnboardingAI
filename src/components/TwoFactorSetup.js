import React, { useRef, useState } from 'react';
import { Button } from './ui/button';

export const QRCodeStep = ({ qrCode }) => (
  <div className="border-b pb-8">
    <h3 className="font-medium text-lg mb-3">Step 1: Scan QR Code</h3>
    <p className="mb-4 text-gray-600">Scan this QR code with your authentication app:</p>
    <div className="flex justify-center">
      <img 
        src={qrCode} 
        alt="QR Code for Two-Factor Authentication" 
        className="border-2 p-4 rounded-lg w-64 h-64 object-contain bg-white shadow-sm"
      />
    </div>
  </div>
);

export const VerificationStep = ({ onSubmit, twoFactorCode, handleInputChange, handleInputBackspace, inputRefs }) => (
  <div className="pt-6">
    <h3 className="font-medium text-lg mb-3">Step 2: Verify Setup</h3>
    <p className="text-sm text-gray-600 mb-6">Enter the 6-digit code from your authenticator app to complete setup:</p>
    <form onSubmit={onSubmit} className="flex flex-col items-center space-y-6">
      <div className="flex space-x-3">
        {twoFactorCode.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleInputBackspace(e, index)}
            ref={(el) => (inputRefs.current[index] = el)}
            className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        ))}
      </div>
      <Button type="submit" className="w-full max-w-xs">
        Verify Code
      </Button>
    </form>
  </div>
);

export const TwoFactorSetup = ({ qrCode, user, onSuccess, onError }) => {
  const [twoFactorCode, setTwoFactorCode] = useState(Array(6).fill(''));
  const inputRefs = useRef([]);

  const handleInputChange = (e, index) => {
    let value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...twoFactorCode];
    newCode[index] = value;
    setTwoFactorCode(newCode);

    if (value && index < twoFactorCode.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleInputBackspace = (e, index) => {
    if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const code = twoFactorCode.join('');

    try {
      // First verify the code
      console.log('Verifying code...');
      const verifyResponse = await fetch('https://api.onboardingai.org/auth/otp/verify-code', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: user,
          code 
        }),
      });

      const verifyData = await verifyResponse.json();
      console.log('Verify response:', verifyData);

      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error(verifyData.message || 'Invalid verification code');
      }

      // If code is valid, then enable 2FA
      console.log('Code verified, toggling 2FA...');
      const enableResponse = await fetch('https://api.onboardingai.org/auth/toggle-two-factor', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const enableData = await enableResponse.json();
      console.log('Toggle 2FA response:', enableData);

      if (!enableResponse.ok || !enableData.success) {
        throw new Error('Failed to enable 2FA');
      }

      onSuccess();
    } catch (err) {
      console.error('Error verifying 2FA code:', err);
      onError(err.message);
      // Clear the code inputs on error
      setTwoFactorCode(Array(6).fill(''));
      // Focus the first input
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="mt-4 space-y-6">
      <QRCodeStep qrCode={qrCode} />
      <VerificationStep 
        onSubmit={handleVerifyCode}
        twoFactorCode={twoFactorCode}
        handleInputChange={handleInputChange}
        handleInputBackspace={handleInputBackspace}
        inputRefs={inputRefs}
      />
    </div>
  );
}; 