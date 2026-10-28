import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AxionStudioPage from './pages/AxionStudioPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';

// Company Intelligence & Jobs
import CompanyDirectoryPage from './pages/companies/CompanyDirectoryPage';
import CompanyProfilePage from './pages/companies/CompanyProfilePage';
import JobSearchPage from './pages/jobs/JobSearchPage';
import JobDetailPage from './pages/jobs/JobDetailPage';

// Career Roadmaps & Skills & Opportunities
import RoadmapDashboardPage from './pages/roadmap/RoadmapDashboardPage';
import RoadmapDetailPage from './pages/roadmap/RoadmapDetailPage';
import MySkillsPage from './pages/skills/MySkillsPage';
import SavedOpportunitiesPage from './pages/saved/SavedOpportunitiesPage';
import ApplicationTrackerPage from './pages/tracker/ApplicationTrackerPage';
import LearningHubPage from './pages/learning/LearningHubPage';

// Career Intelligence Workspace Pages
import CareerLayout from './pages/career/CareerLayout';
import CareerOverview from './pages/career/CareerOverview';
import CareerJobs from './pages/career/CareerJobs';
import CareerMatches from './pages/career/CareerMatches';
import CareerResume from './pages/career/CareerResume';
import CareerApplications from './pages/career/CareerApplications';
import CareerInterviewPrep from './pages/career/CareerInterviewPrep';
import CareerTracker from './pages/career/CareerTracker';
import CareerProfile from './pages/career/CareerProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'candidate' | 'recruiter';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafffa] flex items-center justify-center font-twk-lausanne text-[#121613]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-1 bg-[#121613] overflow-hidden relative rounded-full">
            <div className="absolute top-0 left-0 bottom-0 bg-[#2bee4b] w-1/3 animate-[loadingBar_1.5s_infinite_linear]" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.11em] font-medium text-[#516254]">
            Calibrating session...
          </span>
        </div>
        <style>{`
          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'recruiter' ? '/recruiter' : '/candidate'} replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AxionStudioPage />} />
          <Route path="/axion" element={<AxionStudioPage />} />
          <Route path="/trusthire" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Legal Pages (Public & Unauthenticated) */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />

          {/* Company Intelligence (Public & Traceable) */}
          <Route path="/companies" element={<CompanyDirectoryPage />} />
          <Route path="/companies/:companySlug" element={<CompanyProfilePage />} />
          <Route path="/companies/:companySlug/jobs" element={<CompanyProfilePage />} />

          {/* Real Job Discovery & Ingestion */}
          <Route path="/jobs" element={<JobSearchPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />

          {/* Learning Hub & Job Readiness Tracker */}
          <Route path="/learn" element={<LearningHubPage />} />

          {/* Individualised Career Roadmaps */}
          <Route
            path="/career-roadmap"
            element={
              <ProtectedRoute allowedRole="candidate">
                <RoadmapDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/career-roadmap/:roadmapId"
            element={
              <ProtectedRoute allowedRole="candidate">
                <RoadmapDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Skills Matrix */}
          <Route
            path="/my-skills"
            element={
              <ProtectedRoute allowedRole="candidate">
                <MySkillsPage />
              </ProtectedRoute>
            }
          />

          {/* Saved Opportunities */}
          <Route
            path="/saved-jobs"
            element={
              <ProtectedRoute allowedRole="candidate">
                <SavedOpportunitiesPage />
              </ProtectedRoute>
            }
          />

          {/* Application Tracker */}
          <Route
            path="/application-tracker"
            element={
              <ProtectedRoute allowedRole="candidate">
                <ApplicationTrackerPage />
              </ProtectedRoute>
            }
          />

          {/* Legacy Candidate & Recruiter Dashboards */}
          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />

          {/* Career Intelligence Workspace */}
          <Route
            path="/career"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CareerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CareerOverview />} />
            <Route path="jobs" element={<CareerJobs />} />
            <Route path="matches" element={<CareerMatches />} />
            <Route path="resume" element={<CareerResume />} />
            <Route path="applications" element={<CareerApplications />} />
            <Route path="interview-prep" element={<CareerInterviewPrep />} />
            <Route path="tracker" element={<CareerTracker />} />
            <Route path="profile" element={<CareerProfile />} />
          </Route>

          {/* Direct Profile Shortcut */}
          <Route path="/profile" element={<Navigate to="/career/profile" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
