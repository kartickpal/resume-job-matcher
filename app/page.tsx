"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
  id: number;
  match_score: number;
  matched_skills: string;
  missing_skills: string;
  strengths: string;
  skill_gap_explanation: string;
  recommendations: string;
  ai_feedback: string;
  created_at: string;
  resume_text: string;
};

type Analytics = {
  total_analyses: string;
  average_score: string;
  highest_score: string;
  lowest_score: string;
};

type SkillItem = {
  skill: string;
  frequency: string;
};

type DistributionItem = {
  match_level: string;
  total: string;
};

type AIAnalysis = {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  skillGapExplanation: string;
  recommendations: string[];
  aiFeedback: string;
};

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [missingSkillsLoading, setMissingSkillsLoading] = useState(false);
  const [distributionLoading, setDistributionLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [analyticsError, setAnalyticsError] = useState("");
  const [skillsError, setSkillsError] = useState("");
  const [missingSkillsError, setMissingSkillsError] =
    useState("");
  const [distributionError, setDistributionError] =
    useState("");

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [analytics, setAnalytics] =
    useState<Analytics | null>(null);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [missingSkills, setMissingSkills] =
    useState<SkillItem[]>([]);
  const [distribution, setDistribution] =
    useState<DistributionItem[]>([]);

  const [result, setResult] = useState<{
    message: string;
    aiAnalysis: AIAnalysis;
    user: {
      id: number;
      name: string;
      email: string;
    };
    resume: {
      id: number;
      user_id: number;
      resume_text: string;
    };
    match: {
      id: number;
      user_id: number;
      resume_id: number;
      job_description: string;
      match_score: number;
      matched_skills: string;
      missing_skills: string;
      strengths: string;
      skill_gap_explanation: string;
      recommendations: string;
      ai_feedback: string;
    };
  } | null>(null);

  const getMatchLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Moderate Match";
    return "Low Match";
  };

  const loadHistory = async () => {
    setHistoryError("");

    if (!email.trim()) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);

    try {
      const response = await fetch(
        `/api/history?email=${encodeURIComponent(email.trim())}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load history."
        );
      }

      setHistory(data.history || []);
    } catch (error) {
      console.error("History Error:", error);

      setHistoryError(
        error instanceof Error
          ? error.message
          : "Failed to load history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsError("");
    setAnalyticsLoading(true);

    try {
      const response = await fetch("/api/analytics");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load analytics."
        );
      }

      setAnalytics(data.analytics || null);
    } catch (error) {
      console.error("Analytics Error:", error);

      setAnalyticsError(
        error instanceof Error
          ? error.message
          : "Failed to load analytics."
      );
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadSkills = async () => {
    setSkillsError("");
    setSkillsLoading(true);

    try {
      const response = await fetch("/api/skills");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load skill analytics."
        );
      }

      setSkills(data.skills || []);
    } catch (error) {
      console.error("Skills Analytics Error:", error);

      setSkillsError(
        error instanceof Error
          ? error.message
          : "Failed to load skill analytics."
      );
    } finally {
      setSkillsLoading(false);
    }
  };

  const loadMissingSkills = async () => {
    setMissingSkillsError("");
    setMissingSkillsLoading(true);

    try {
      const response = await fetch("/api/missing-skills");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load missing skill analytics."
        );
      }

      setMissingSkills(data.skills || []);
    } catch (error) {
      console.error(
        "Missing Skills Analytics Error:",
        error
      );

      setMissingSkillsError(
        error instanceof Error
          ? error.message
          : "Failed to load missing skill analytics."
      );
    } finally {
      setMissingSkillsLoading(false);
    }
  };

  const loadDistribution = async () => {
    setDistributionError("");
    setDistributionLoading(true);

    try {
      const response = await fetch("/api/distribution");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load match distribution."
        );
      }

      setDistribution(data.distribution || []);
    } catch (error) {
      console.error(
        "Distribution Analytics Error:",
        error
      );

      setDistributionError(
        error instanceof Error
          ? error.message
          : "Failed to load match distribution."
      );
    } finally {
      setDistributionLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHistory();
      void loadAnalytics();
      void loadSkills();
      void loadMissingSkills();
      void loadDistribution();
    }, 0);

    return () => window.clearTimeout(timer);
    // These loaders are intentionally triggered once after the initial render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyze = async () => {
    setError("");
    setResult(null);

    if (!name.trim() || !email.trim() || !resume.trim() || !jobDescription.trim()) {
      setError(
        "Please enter your name, email, resume, and job description."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (resume.trim().length < 25) {
      setError("Please enter a resume with at least 25 characters.");
      return;
    }

    if (jobDescription.trim().length < 100) {
      setError(
        "Please enter a job description with at least 100 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          resume,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong."
        );
      }

      setResult(data);

      await loadHistory();
      await loadAnalytics();
      await loadSkills();
      await loadMissingSkills();
      await loadDistribution();
    } catch (error) {
      console.error("API Error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const getHistoryPreview = (value: string, maxLength = 90) => {
    if (!value) return "None";
    return value.length > maxLength
      ? `${value.slice(0, maxLength).trim()}...`
      : value;
  };

  const getDistributionBarWidth = (
    total: number
  ) => {
    const maxTotal = Math.max(
      ...distribution.map((item) =>
        Number(item.total)
      ),
      1
    );

    return Math.max(
      5,
      (total / maxTotal) * 100
    );
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            AI Resume Job Matcher
          </h1>

          <p className="mt-3 text-gray-600">
            Compare your resume with a job description using AI
          </p>
        </div>

        {/* Analytics Dashboard */}
        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Analytics Dashboard
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Overview of resume-job matching activity
            </p>
          </div>

          {analyticsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {analyticsError}
            </div>
          )}

          {analyticsLoading && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm">
              Loading analytics...
            </div>
          )}

          {!analyticsLoading && analytics && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Total Analyses
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {analytics.total_analyses}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Average Score
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {analytics.average_score ?? "0"}%
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Highest Score
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {analytics.highest_score ?? "0"}%
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Lowest Score
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {analytics.lowest_score ?? "0"}%
                </p>
              </div>

            </div>
          )}
        </section>

        {/* Skill Analytics */}
        <section className="mt-8 grid gap-8 lg:grid-cols-2">

          {/* Top Matched Skills */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Top Matched Skills
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Most frequently matched skills
                </p>
              </div>

              <button
                onClick={loadSkills}
                disabled={skillsLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                {skillsLoading
                  ? "Loading..."
                  : "Refresh"}
              </button>
            </div>

            {skillsError && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {skillsError}
              </div>
            )}

            {skillsLoading && (
              <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                Loading matched skills...
              </div>
            )}

            {!skillsLoading &&
              !skillsError &&
              skills.length === 0 && (
                <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                  No matched skill data available yet.
                </div>
              )}

            {!skillsLoading && skills.length > 0 && (
              <div className="mt-6 space-y-4">
                {skills.map((item, index) => {
                  const maxFrequency = Number(
                    skills[0]?.frequency || 1
                  );

                  const frequency = Number(
                    item.frequency
                  );

                  const barWidth = Math.max(
                    5,
                    (frequency / maxFrequency) * 100
                  );

                  return (
                    <div
                      key={`${item.skill}-${index}`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-gray-800">
                          {index + 1}. {item.skill}
                        </span>

                        <span className="text-sm font-semibold text-gray-500">
                          {item.frequency}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{
                            width: `${barWidth}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Missing Skills */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Top Missing Skills
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Skills candidates frequently need
                </p>
              </div>

              <button
                onClick={loadMissingSkills}
                disabled={missingSkillsLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                {missingSkillsLoading
                  ? "Loading..."
                  : "Refresh"}
              </button>
            </div>

            {missingSkillsError && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {missingSkillsError}
              </div>
            )}

            {missingSkillsLoading && (
              <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                Loading missing skills...
              </div>
            )}

            {!missingSkillsLoading &&
              !missingSkillsError &&
              missingSkills.length === 0 && (
                <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                  No missing skill data available yet.
                </div>
              )}

            {!missingSkillsLoading &&
              missingSkills.length > 0 && (
                <div className="mt-6 space-y-4">
                  {missingSkills.map((item, index) => {
                    const maxFrequency = Number(
                      missingSkills[0]?.frequency || 1
                    );

                    const frequency = Number(
                      item.frequency
                    );

                    const barWidth = Math.max(
                      5,
                      (frequency / maxFrequency) * 100
                    );

                    return (
                      <div
                        key={`${item.skill}-${index}`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium text-gray-800">
                            {index + 1}. {item.skill}
                          </span>

                          <span className="text-sm font-semibold text-gray-500">
                            {item.frequency}
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-red-500 transition-all duration-500"
                            style={{
                              width: `${barWidth}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </section>

        {/* Match Distribution */}
        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Match Score Distribution
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Number of analyses in each match category
              </p>
            </div>

            <button
              onClick={loadDistribution}
              disabled={distributionLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {distributionLoading
                ? "Loading..."
                : "Refresh"}
            </button>
          </div>

          {distributionError && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {distributionError}
            </div>
          )}

          {distributionLoading && (
            <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-gray-500">
              Loading match distribution...
            </div>
          )}

          {!distributionLoading &&
            !distributionError &&
            distribution.length === 0 && (
              <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                No match distribution data available yet.
              </div>
            )}

          {!distributionLoading &&
            distribution.length > 0 && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {distribution.map((item) => {
                  const total = Number(item.total);

                  return (
                    <div
                      key={item.match_level}
                      className="rounded-xl bg-gray-50 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">
                          {item.match_level}
                        </h3>

                        <span className="text-2xl font-bold text-gray-900">
                          {total}
                        </span>
                      </div>

                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{
                            width: `${getDistributionBarWidth(
                              total
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {total === 1
                          ? "1 analysis"
                          : `${total} analyses`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
        </section>

        {/* User Information */}
        <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Candidate Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter your details so your analyses can be associated with your profile.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-base font-semibold text-gray-800 sm:text-lg"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg border border-gray-300 bg-white p-4 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-base font-semibold text-gray-800 sm:text-lg"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-300 bg-white p-4 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </section>

        {/* Resume and Job Description */}
        <div className="mt-10 grid gap-8 md:grid-cols-2">

          <div>
            <label
              htmlFor="resume"
              className="mb-2 block text-base font-semibold text-gray-800 sm:text-lg"
            >
              Your Resume
            </label>

            <textarea
              id="resume"
              value={resume}
              onChange={(e) =>
                setResume(e.target.value)
              }
              placeholder="Paste your resume here..."
              className="h-64 w-full rounded-lg sm:h-80 border border-gray-300 bg-white p-4 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="job"
              className="mb-2 block text-base font-semibold text-gray-800 sm:text-lg"
            >
              Job Description
            </label>

            <textarea
              id="job"
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value)
              }
              placeholder="Paste the job description here..."
              className="h-64 w-full rounded-lg sm:h-80 border border-gray-300 bg-white p-4 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Analyze */}
        <div className="mt-8 text-center">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading
              ? "Analyzing Resume..."
              : "Analyze Match"}
          </button>

          {loading && (
            <p className="mt-4 text-sm text-gray-500">
              Gemini AI is comparing your resume with the job description.
              Please wait...
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700">
            {error}
          </div>
        )}

        {/* AI Results */}
        {result && (
          <div className="mt-12">

            <div className="mb-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Resume Analysis
              </h2>

              <p className="mt-2 text-green-600">
                {result.message}
              </p>
            </div>

            {/* Match Score */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">
                Match Score
              </h3>

              <div className="mt-4">
                <p className="text-4xl font-bold text-blue-600 sm:text-5xl">
                  {result.aiAnalysis.matchScore}%
                </p>

                <p className="mt-2 text-xl font-semibold text-gray-800">
                  {getMatchLabel(
                    result.aiAnalysis.matchScore
                  )}
                </p>

                <div className="mx-auto mt-5 h-4 max-w-md overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-700"
                    style={{
                      width: `${result.aiAnalysis.matchScore}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Resume & Job Description Match
                </p>
              </div>
            </div>

            {/* Matched and Missing Skills */}
            <div className="mt-8 grid gap-8 md:grid-cols-2">

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800">
                  Matched Skills
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {result.aiAnalysis.matchedSkills.map(
                    (skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800">
                  Missing Skills
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {result.aiAnalysis.missingSkills.map(
                    (skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">
                Candidate Strengths
              </h3>

              <ul className="mt-4 space-y-3">
                {result.aiAnalysis.strengths.map(
                  (strength, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-gray-600"
                    >
                      <span className="font-bold text-green-600">
                        ✓
                      </span>

                      <span>{strength}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Skill Gap */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">
                Skill Gap Explanation
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                {result.aiAnalysis.skillGapExplanation}
              </p>
            </div>

            {/* Recommendations */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">
                AI Recommendations
              </h3>

              <ol className="mt-4 space-y-3">
                {result.aiAnalysis.recommendations.map(
                  (recommendation, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-gray-600"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                        {index + 1}
                      </span>

                      <span>{recommendation}</span>
                    </li>
                  )
                )}
              </ol>
            </div>

            {/* AI Feedback */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">
                AI Feedback
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                {result.aiAnalysis.aiFeedback}
              </p>
            </div>

            {/* Analysis Details */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">
                Analysis Details
              </h3>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">
                    User ID:
                  </span>{" "}
                  {result.user.id}
                </p>

                <p>
                  <span className="font-semibold">
                    Resume ID:
                  </span>{" "}
                  {result.resume.id}
                </p>

                <p>
                  <span className="font-semibold">
                    Match Result ID:
                  </span>{" "}
                  {result.match.id}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Match History */}
        <section className="mt-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Match History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your recent resume-job analyses. Long details are shortened for easier scanning.
              </p>
            </div>

            <button
              onClick={loadHistory}
              disabled={historyLoading}
              className="rounded-lg border border-gray-300 px-5 py-2 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {historyLoading
                ? "Loading..."
                : "Refresh History"}
            </button>
          </div>

          {historyError && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {historyError}
            </div>
          )}

          {!historyLoading &&
            !historyError &&
            history.length === 0 && (
              <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                No match history found.
              </div>
            )}

          {history.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="px-4 py-3 font-semibold">
                      Score
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Match Level
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Matched Skills
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Missing Skills
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Strengths
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Skill Gap
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Recommendations
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100"
                    >
                      <td className="px-4 py-4 font-bold text-blue-600">
                        {item.match_score}%
                      </td>

                      <td className="px-4 py-4 font-medium text-gray-800">
                        {getMatchLabel(
                          Number(item.match_score)
                        )}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {getHistoryPreview(item.matched_skills)}
                      </td>

                      <td className="max-w-xs px-4 py-4 text-gray-600">
                        {getHistoryPreview(item.missing_skills)}
                      </td>

                      <td className="max-w-xs px-4 py-4 text-gray-600">
                        {getHistoryPreview(item.strengths)}
                      </td>

                      <td className="max-w-xs px-4 py-4 text-gray-600">
                        {getHistoryPreview(item.skill_gap_explanation, 120)}
                      </td>

                      <td className="max-w-xs px-4 py-4 text-gray-600">
                        {getHistoryPreview(item.recommendations)}
                      </td>

                      <td className="px-4 py-4 text-gray-500">
                        {new Date(
                          item.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}