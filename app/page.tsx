"use client";

import { useState } from "react";

export default function Home() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] = useState<{
    message: string;

    aiAnalysis: {
      matchScore: number;
      matchedSkills: string[];
      missingSkills: string[];
      aiFeedback: string;
    };

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
      ai_feedback: string;
    };
  } | null>(null);

  const handleAnalyze = async () => {
    setError("");
    setResult(null);

    // Validate input
    if (!resume.trim() || !jobDescription.trim()) {
      setError("Please enter both your resume and job description.");
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
          resume,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      console.log("API Response:", data);

      setResult(data);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Heading */}
        <h1 className="text-center text-4xl font-bold text-gray-900">
          AI Resume Job Matcher
        </h1>

        <p className="mt-3 text-center text-gray-600">
          Compare your resume with a job description using AI
        </p>

        {/* Input Section */}
        <div className="mt-10 grid gap-8 md:grid-cols-2">

          {/* Resume */}
          <div>
            <label
              htmlFor="resume"
              className="mb-2 block text-lg font-semibold text-gray-800"
            >
              Your Resume
            </label>

            <textarea
              id="resume"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume here..."
              className="h-80 w-full rounded-lg border border-gray-300 bg-white p-4 text-gray-800 outline-none focus:border-blue-500"
            />
          </div>

          {/* Job Description */}
          <div>
            <label
              htmlFor="job"
              className="mb-2 block text-lg font-semibold text-gray-800"
            >
              Job Description
            </label>

            <textarea
              id="job"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="h-80 w-full rounded-lg border border-gray-300 bg-white p-4 text-gray-800 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Button + Error */}
        <div className="mt-8 text-center">

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Match"}
          </button>

          {/* Error Message */}
          {error && (
            <p className="mt-4 text-center text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Result Section */}
        {result && (
          <div className="mx-auto mt-8 max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">

            {/* Result Heading */}
            <h2 className="text-2xl font-bold text-gray-900">
              AI Resume Analysis
            </h2>

            <p className="mt-2 text-gray-600">
              {result.message}
            </p>

            {/* Match Score */}
            <div className="mt-6 rounded-lg bg-gray-100 p-6 text-center">
              <p className="font-semibold text-gray-800">
                Match Score
              </p>

              <p className="mt-2 text-5xl font-bold text-blue-600">
                {result.aiAnalysis.matchScore}%
              </p>
            </div>

            {/* Matched Skills */}
            <div className="mt-6 rounded-lg bg-gray-100 p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Matched Skills
              </h3>

              {result.aiAnalysis.matchedSkills.length > 0 ? (
                <ul className="mt-2 list-disc pl-5 text-gray-700">
                  {result.aiAnalysis.matchedSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-gray-600">
                  No matched skills found.
                </p>
              )}
            </div>

            {/* Missing Skills */}
            <div className="mt-4 rounded-lg bg-gray-100 p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Missing Skills
              </h3>

              {result.aiAnalysis.missingSkills.length > 0 ? (
                <ul className="mt-2 list-disc pl-5 text-gray-700">
                  {result.aiAnalysis.missingSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-gray-600">
                  No missing skills found.
                </p>
              )}
            </div>

            {/* AI Feedback */}
            <div className="mt-4 rounded-lg bg-gray-100 p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                AI Feedback
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-gray-700">
                {result.aiAnalysis.aiFeedback}
              </p>
            </div>

            {/* User Information */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800">
                User
              </h3>

              <div className="mt-2 rounded-lg bg-gray-100 p-4 text-gray-700">
                <p>
                  <strong>ID:</strong> {result.user.id}
                </p>

                <p>
                  <strong>Name:</strong> {result.user.name}
                </p>

                <p>
                  <strong>Email:</strong> {result.user.email}
                </p>
              </div>
            </div>

            {/* Resume Information */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800">
                Resume Saved
              </h3>

              <div className="mt-2 rounded-lg bg-gray-100 p-4 text-gray-700">
                <p>
                  <strong>Resume ID:</strong> {result.resume.id}
                </p>

                <p>
                  <strong>User ID:</strong> {result.resume.user_id}
                </p>

                <p className="mt-2 whitespace-pre-wrap">
                  <strong>Resume:</strong>
                  <br />
                  {result.resume.resume_text}
                </p>
              </div>
            </div>

            {/* Job Description */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800">
                Job Description Saved
              </h3>

              <div className="mt-2 rounded-lg bg-gray-100 p-4 text-gray-700">
                <p>
                  <strong>Match ID:</strong> {result.match.id}
                </p>

                <p>
                  <strong>User ID:</strong> {result.match.user_id}
                </p>

                <p>
                  <strong>Resume ID:</strong> {result.match.resume_id}
                </p>

                <p className="mt-2 whitespace-pre-wrap">
                  <strong>Job Description:</strong>
                  <br />
                  {result.match.job_description}
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}