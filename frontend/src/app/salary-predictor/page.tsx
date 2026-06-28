import SalaryPredictor from "@/components/salary-predictor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Salary Predictor | NexaHire",
  description: "Predict your salary based on skills, experience and location using AI",
};

const SalaryPredictorPage = () => {
  return <SalaryPredictor />;
};

export default SalaryPredictorPage;
