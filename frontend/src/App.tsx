import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/context/AppContext";
import NavBar from "@/components/navbar";

import Home from "@/app/page";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import ForgotPage from "@/app/(auth)/forgot/page";
import ResetPage from "@/app/(auth)/reset/[token]/page";
import JobsPage from "@/app/jobs/page";
import JobPage from "@/app/jobs/[id]/page";
import AccountPage from "@/app/account/page";
import UserAccount from "@/app/account/[id]/page";
import DashboardPage from "@/app/dashboard/page";
import CompanyPage from "@/app/company/[id]/page";
import TrackerPage from "@/app/tracker/page";
import InsightsPage from "@/app/insights/page";
import CompanyInsightPage from "@/app/insights/[company]/page";
import QuestionsPage from "@/app/questions/page";
import About from "@/app/about/page";
import SavedPage from "@/app/saved/page";
import SkillGapPage from "@/app/skill-gap/page";
import CoverLetterPage from "@/app/cover-letter/page";
import InterviewFeedbackPage from "@/app/interview-feedback/page";
import SalaryPredictorPage from "@/app/salary-predictor/page";
import ResumeScorePage from "@/app/resume-score/page";
import SubscribePage from "@/app/subscribe/page";
import ExperiencesPage from "@/app/experiences/page";
import PostExperiencePage from "@/app/experiences/post/page";

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot" element={<ForgotPage />} />
            <Route path="/reset/:token" element={<ResetPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/:id" element={<UserAccount />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/company/:id" element={<CompanyPage />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/insights/:company" element={<CompanyInsightPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route path="/cover-letter" element={<CoverLetterPage />} />
            <Route path="/interview-feedback" element={<InterviewFeedbackPage />} />
            <Route path="/salary-predictor" element={<SalaryPredictorPage />} />
            <Route path="/resume-score" element={<ResumeScorePage />} />
            <Route path="/subscribe" element={<SubscribePage />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/experiences/post" element={<PostExperiencePage />} />
          </Routes>
        </ThemeProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
