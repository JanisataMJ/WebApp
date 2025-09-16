// testSumButton.tsx
import React from "react";
import { sendWeeklySummary } from "../../../services/https/Notification/notification";

interface TestSummaryButtonProps {
  onSent?: () => void;
}

const TestSummaryButton: React.FC<TestSummaryButtonProps> = ({ onSent }) => {
  const handleClick = async () => {
    try {
      const msg = await sendWeeklySummary();
      alert(msg);

      // เรียก callback เพื่อ refresh notifications
      if (onSent) onSent();
    } catch (error) {
      console.error(error);
      alert("Failed to send summary");
    }
  };

  return <button onClick={handleClick}>Send Weekly Summary</button>;
};

export default TestSummaryButton;
