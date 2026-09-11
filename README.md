# AI Resume Job Matcher

An AI-powered full-stack web application that compares a resume with a job description using Google Gemini and generates an intelligent job-match analysis.

The application analyzes the resume and job description, calculates a match score, identifies matched and missing skills, and provides AI-generated feedback. The analysis is also stored in PostgreSQL.

## 🚀 Features

- Paste resume text
- Paste a job description
- Analyze resume-job compatibility using Google Gemini
- Generate an AI match score from 0–100
- Identify matched skills
- Identify missing skills
- Generate AI feedback
- Store users in PostgreSQL
- Store resumes in PostgreSQL
- Store job descriptions and AI analysis results in PostgreSQL
- REST API using Next.js App Router
- Frontend validation
- Loading state during AI analysis
- Error handling
- Structured JSON response from Gemini
- Environment-variable based configuration

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js App Router
- Next.js API Routes
- Node.js
- REST API
- `fetch()`

### Database

- PostgreSQL
- SQL
- `pg` Node.js library
- Connection pooling
- Foreign keys
- Parameterized SQL queries

### AI

- Google Gemini API
- `@google/genai`
- Prompt Engineering
- Structured JSON AI responses
- AI-based resume-job matching

### Development Tools

- Git
- GitHub
- VS Code
- npm
- Node.js

## 🏗️ Project Architecture

```text
User
  │
  ▼
Next.js Frontend
  │
  │ Resume + Job Description
  ▼
/api/match
  │
  ├──────────────► Google Gemini API
  │                       │
  │                       ▼
  │                AI Analysis (JSON)
  │                ├── Match Score
  │                ├── Matched Skills
  │                ├── Missing Skills
  │                └── AI Feedback
  │
  ▼
PostgreSQL
  │
  ├── users
  ├── resumes
  └── match_results
  │
  ▼
Response
  │
  ▼
Match Analysis displayed in Frontend
