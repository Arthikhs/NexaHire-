import InterviewFeedback from "@/components/interview-feedback";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Feedback | NexaHire",
  description: "Get AI-powered feedback on your interview answers",
};

const InterviewFeedbackPage = () => {
  return <InterviewFeedback />;
};

export default InterviewFeedbackPage;
