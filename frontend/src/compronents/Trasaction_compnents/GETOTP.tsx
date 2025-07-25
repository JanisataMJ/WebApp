import React, { useState, useEffect } from 'react';

import './GETOTP.css'
const CountdownButton: React.FC = () => {
  const [countdown, setCountdown] = useState<number>(0);
  const [isCounting, setIsCounting] = useState<boolean>(false);

  useEffect(() => {
    let timer: number;
    if (isCounting && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
    return () => clearInterval(timer);
  }, [isCounting, countdown]);

  const startCountdown = () => {
    setCountdown(60); // กำหนดเวลาเริ่มต้นเป็น 60 วินาที
    setIsCounting(true);
  };

  return (
    <div>
      <button onClick={startCountdown} disabled={isCounting} className="countdown-button">
        {isCounting ? `${countdown}s` : 'ขอ OTP'}
      </button>
    </div>
  );
};

export default CountdownButton;
