import ResumeScoreVsJob from "@/components/resume-score";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Score vs Job | NexaHire",
  description: "Score your resume against any job description using AI",
};

const ResumeScorePage = () => {
  return <ResumeScoreVsJob />;
};

export default ResumeScorePage;
