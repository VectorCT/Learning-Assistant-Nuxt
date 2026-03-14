# Bugfix Requirements Document

## Introduction

The "Past Papers" link on the home page currently redirects users to the subjects page (`/subjects`) instead of taking them to a dedicated section where they can view and download past papers and memorandums. This prevents users from accessing the past papers functionality that is available through the backend API endpoints (`GET /api/PastPapers/{subjectId}` and `GET /api/PastPapers/Download/{fileId}`).

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user clicks the "Past Papers" feature card on the home page THEN the system redirects to `/subjects` instead of a past papers page

1.2 WHEN a user attempts to access past papers functionality THEN the system does not provide a dedicated interface to browse, view, and download past papers and memorandums

### Expected Behavior (Correct)

2.1 WHEN a user clicks the "Past Papers" feature card on the home page THEN the system SHALL navigate to a dedicated past papers page (e.g., `/past-papers`)

2.2 WHEN a user accesses the past papers page THEN the system SHALL display a subject selection interface that allows users to choose a subject

2.3 WHEN a user selects a subject THEN the system SHALL fetch and display past papers for that subject using `GET /api/PastPapers/{subjectId}`

2.4 WHEN past papers are displayed THEN the system SHALL show each paper with its year, filename, and both paper and memorandum download buttons

2.5 WHEN a user clicks a download button for a paper THEN the system SHALL download the file using `GET /api/PastPapers/Download/{pastPaper.id}`

2.6 WHEN a user clicks a download button for a memorandum THEN the system SHALL download the file using `GET /api/PastPapers/Download/{pastPaper.pastMemorandum.id}`

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user clicks other feature cards on the home page (Interactive Quizzes, Study Materials, Community Forums, Video Tutorials, Track Progress) THEN the system SHALL CONTINUE TO navigate to their respective routes

3.2 WHEN a user navigates to `/subjects` directly THEN the system SHALL CONTINUE TO display the subjects page as before

3.3 WHEN the subjects API endpoint is called THEN the system SHALL CONTINUE TO return the list of subjects for subject selection in the past papers page
