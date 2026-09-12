# AI Resume Job Matcher

An AI-powered web application that compares a candidate's resume with a job description and provides an actionable match analysis.

The application uses **Gemini AI** for resume-job analysis and **PostgreSQL** for storing users, resumes, and match results.

## Features

- Resume vs. job description matching
- AI-generated match score from 0–100
- Matched skills identification
- Missing skills identification
- Candidate strengths
- Skill-gap explanation
- AI recommendations
- Detailed AI feedback
- Candidate profile using name and email
- User-specific match history
- Analytics dashboard
- Top matched skills analysis
- Top missing skills analysis
- Match score distribution
- PostgreSQL transaction handling
- Frontend and server-side validation
- Responsive UI for desktop and mobile

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS

**Backend**
- Next.js API Routes
- TypeScript
- Gemini API

**Database**
- PostgreSQL
- `pg` Node.js PostgreSQL client

**AI**
- Google Gemini

## How It Works

```
Candidate Information
        ↓
Resume + Job Description
        ↓
Frontend Validation
        ↓
Next.js API
        ↓
Gemini AI Analysis
        ↓
Structured AI Result
        ↓
PostgreSQL Transaction
        ↓
User + Resume + Match Result
        ↓
Dashboard + Match History
```

## AI Analysis

For every analysis, the application generates:

- Match Score
- Matched Skills
- Missing Skills
- Candidate Strengths
- Skill Gap Explanation
- Recommendations
- AI Feedback

The AI response is validated before it is stored in PostgreSQL.

## PostgreSQL Database Design

The project uses three main tables:

### `users`

Stores candidate information.

| Column | Type |
|---|---|
| id | — |
| name | — |
| email | — |
| created_at | — |

### `resumes`

Stores submitted resume text and connects it to a user.

| Column | Type |
|---|---|
| id | — |
| user_id | — |
| resume_text | — |
| created_at | — |

### `match_results`

Stores the result of each resume-job analysis.

| Column | Type |
|---|---|
| id | — |
| user_id | — |
| resume_id | — |
| job_description | — |
| match_score | — |
| matched_skills | — |
| missing_skills | — |
| strengths | — |
| skill_gap_explanation | — |
| recommendations | — |
| ai_feedback | — |
| created_at | — |

### Relationships

```
users
  │
  ├──< resumes
  │
  └──< match_results
           │
           └──> resumes
```

The application uses SQL `JOIN` operations to connect users, resumes, and match results.

## SQL Analytics

The dashboard uses PostgreSQL queries for analytical insights such as:

**Overall KPIs**
- Total analyses
- Average match score
- Highest match score
- Lowest match score

**Skill Frequency**

Matched and missing skills are split into individual values and counted to identify the most frequent skills.

**Match Distribution**

Scores are categorized using SQL `CASE` logic:

| Range | Category |
|---|---|
| 80–100 | Excellent Match |
| 60–79 | Good Match |
| 40–59 | Moderate Match |
| 0–39 | Low Match |

These queries demonstrate practical SQL skills including:

`SELECT` · `COUNT` · `AVG` · `MAX` · `MIN` · `GROUP BY` · `ORDER BY` · `LIMIT` · `CASE` · `JOIN` · `LATERAL` · `unnest` · `string_to_array`

## Database Transactions

Saving an analysis uses a PostgreSQL transaction:

```
BEGIN
  ↓
Create / update user
  ↓
Save resume
  ↓
Save match result
  ↓
COMMIT
```

If an error occurs:

```
ROLLBACK
```

This prevents partially saved analysis records.

## Validation

The application validates input on both the frontend and backend.

**Candidate information**
- Name is required
- Email is required
- Email format is validated

**Resume**
- Minimum 25 characters

**Job Description**
- Minimum 100 characters

Server-side validation is also implemented so API requests cannot bypass the frontend validation.

## Project Structure

```
resume-job-matcher/
│
├── app/
│   ├── api/
│   │   ├── analytics/
│   │   │   └── route.ts
│   │   ├── distribution/
│   │   │   └── route.ts
│   │   ├── history/
│   │   │   └── route.ts
│   │   ├── match/
│   │   │   └── route.ts
│   │   ├── missing-skills/
│   │   │   └── route.ts
│   │   └── skills/
│   │       └── route.ts
│   │
│   └── page.tsx
│
├── lib/
│   └── db.ts
│
├── public/
│
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kartickpal/resume-job-matcher.git
cd resume-job-matcher
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key

DB_USER=postgres
DB_HOST=localhost
DB_NAME=resume_matcher
DB_PASSWORD=your_postgres_password
DB_PORT=5432
```

> Do not commit `.env.local` to GitHub.

### 4. Configure PostgreSQL

Create a PostgreSQL database named:

```
resume_matcher
```

Create the required tables and columns used by the application.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini API authentication |
| `DB_USER` | PostgreSQL username |
| `DB_HOST` | PostgreSQL host |
| `DB_NAME` | PostgreSQL database name |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_PORT` | PostgreSQL port |

## Error Handling

The backend handles:

- Invalid requests
- Invalid email addresses
- Insufficient resume content
- Insufficient job-description content
- Gemini API failures
- Empty AI responses
- Invalid AI JSON
- Invalid AI analysis structure
- PostgreSQL errors
- Transaction rollback failures

User-facing messages are returned without exposing unnecessary internal database details.

## Why This Project?

This project demonstrates practical skills relevant to Data Analyst and GenAI-focused roles:

- Python/AI-oriented application development
- SQL and PostgreSQL
- Data modeling
- Data aggregation
- Analytical SQL
- REST-style API development
- Generative AI integration
- Structured AI output validation
- Dashboard development
- Error handling
- Database transactions
- Responsive web application development

## Future Improvements

Potential next improvements include:

- User authentication
- Resume file upload and PDF parsing
- More advanced skill normalization
- Historical score trends
- Job recommendation system
- Exportable analysis reports
- Cloud database deployment
- Production deployment
- More detailed analytics

## Author

**Kartik Pal**
B.Tech in Computer Science and Engineering
