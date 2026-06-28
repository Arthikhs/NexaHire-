import CoverLetterGenerator from "@/components/cover-letter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cover Letter Generator | NexaHire",
  description: "Generate AI-powered personalized cover letters tailored to any job",
};

const CoverLetterPage = () => {
  return <CoverLetterGenerator />;
};

export default CoverLetterPage;
