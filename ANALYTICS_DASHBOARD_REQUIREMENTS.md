# Analytics Dashboard Requirements

## Overview

Comprehensive analytics dashboard for instructors to track student performance with both **individual student analysis** and **class-wide comprehensive analysis**.

---

## Dashboard Features

### 1. Individual Student Analysis (Filter by Name)

**Primary View:** Filter by student name/user to see detailed individual performance.

#### 1.1 Student Overview Card
- **Student Name & Email**
- **Total Quizzes Attempted**
- **Overall Average Score**
- **Total Time Spent** (hours/minutes)
- **Performance Trend** (line chart showing improvement over time)
- **Current Status Badge** (Excellent, Good, Needs Improvement, Critical)

#### 1.2 Quiz Performance Table
- **Quiz Title**
- **Attempt Number** (1st, 2nd, 3rd, etc.)
- **Score** (X/Y - percentage)
- **Performance Category** (color-coded badge)
- **Time Spent** (per quiz and per question average)
- **Date Completed**
- **Improvement** (↑/↓ compared to previous attempt)
- **Actions:** View Details, View Feedback

#### 1.3 Topic Mastery Breakdown
- **Topic Name**
- **Average Score** (across all quizzes)
- **Number of Questions Attempted**
- **Weak Topic Indicator** (highlighted if < 70%)
- **Last Practiced Date**
- **Progress Bar** showing mastery level

#### 1.4 Question-Level Performance
- **Question Text** (truncated)
- **Quiz Title**
- **Correct/Incorrect**
- **Time Spent** (seconds)
- **Confidence Level** (if available)
- **Attempts to Get Correct** (shows improvement)
- **Filter:** Show all / Show incorrect only / Show by difficulty

#### 1.5 Learning Objectives Progress
- **Objective Text**
- **Category** (Knowledge, Application, Analysis, etc.)
- **Mastery Percentage**
- **Questions Answered Correctly** (X/Y)
- **Status:** Mastered / In Progress / Needs Focus

#### 1.6 Time Analysis
- **Average Time per Question** (seconds)
- **Fastest Quiz** (might indicate guessing)
- **Slowest Quiz** (might indicate struggling)
- **Time Trend** (faster over time = improved confidence)
- **Warning Flags:**
  - ⚠️ Too fast (< 10 seconds/question) = possible guessing
  - ⚠️ Too slow (> 120 seconds/question) = possible struggling

#### 1.7 Weak Areas & Recommendations
- **List of Weak Topics** (sorted by frequency)
- **Suggested Review Topics**
- **Recommended Next Quizzes** (to practice weak areas)
- **Action Items** for student

---

### 2. Class Comprehensive Analysis (All Students)

**Primary View:** Overall class performance and trends.

#### 2.1 Class Overview Metrics
- **Total Students**
- **Total Quizzes Completed** (all students)
- **Class Average Score**
- **Class Median Score**
- **Average Time per Question**
- **Pass Rate** (% scoring 70+)
- **At-Risk Students** (count scoring < 60%)

#### 2.2 Class Performance Distribution
- **Histogram/Bar Chart:** Score distribution
  - X-axis: Score ranges (0-60, 61-70, 71-80, 81-90, 91-100)
  - Y-axis: Number of students
- **Box Plot:** Score spread (min, Q1, median, Q3, max)
- **Average Trend Line:** Class average over time

#### 2.3 Quiz-Level Analysis
- **Quiz Title**
- **Number of Students Attempted**
- **Class Average Score**
- **Class Median Score**
- **Pass Rate** (% passing)
- **Most Missed Questions** (top 5)
- **Average Time Spent**
- **Difficulty Rating** (based on class performance)

#### 2.4 Question-Level Analysis
- **Question Text** (truncated)
- **Quiz Title**
- **Success Rate** (% correct)
- **Average Time Spent**
- **Difficulty Level**
- **Most Common Wrong Answer**
- **Filter Options:**
  - By quiz
  - By difficulty
  - Success rate (lowest first = most difficult)
  - Show only questions with < 70% success rate

#### 2.5 Topic Mastery Across Class
- **Topic Name**
- **Class Average Score**
- **Number of Students Attempted**
- **Students Struggling** (count scoring < 70%)
- **Students Excelling** (count scoring 90+)
- **Progress Bars:** Show distribution
- **Sort Options:** By average score / By struggling students

#### 2.6 Student Leaderboard
- **Rank**
- **Student Name**
- **Total Quizzes**
- **Average Score**
- **Improvement Rate** (↑/↓ trend)
- **Badge:** Top Performer / Most Improved / Consistent

#### 2.7 At-Risk Students Alert
- **Student Name**
- **Average Score**
- **Failing Quizzes Count**
- **Weak Topics** (top 3)
- **Last Activity Date**
- **Recommended Actions**

#### 2.8 Comparative Analytics
- **Individual vs Class Average** (for each quiz)
- **Percentile Ranking** (where student stands)
- **Performance Gaps** (topics where class is struggling)

---

## Quantitative Data Points

### Per Student:
1. ✅ Total quiz attempts
2. ✅ Average score
3. ✅ Best score
4. ✅ Lowest score
5. ✅ Time spent (total and per question)
6. ✅ Improvement rate (over time)
7. ✅ Attempt numbers (1st, 2nd, 3rd)
8. ✅ Performance category (excellent/good/needs improvement/critical)
9. ✅ Topics attempted
10. ✅ Weak topics frequency
11. ✅ Question-level correctness
12. ✅ Confidence levels (if collected)
13. ✅ Hints used count
14. ✅ Learning objectives mastery

### Per Class:
1. ✅ Class average score
2. ✅ Class median score
3. ✅ Score distribution
4. ✅ Pass rate
5. ✅ At-risk students count
6. ✅ Most difficult questions
7. ✅ Most difficult topics
8. ✅ Common wrong answers
9. ✅ Average time per question
10. ✅ Quiz completion rates
11. ✅ Improvement trends
12. ✅ Topic mastery distribution

---

## Qualitative Data Points

### Per Student:
1. ✅ Performance category labels
2. ✅ Weak topics list
3. ✅ Strong areas list
4. ✅ Student feedback/reflection (if collected)
5. ✅ Instructor feedback/comments
6. ✅ Learning objective status (mastered/in progress/needs focus)
7. ✅ Recommended next actions

### Per Class:
1. ✅ Class performance description
2. ✅ Topic difficulty ratings
3. ✅ Question difficulty analysis
4. ✅ At-risk student alerts
5. ✅ Recommended focus areas
6. ✅ Teaching intervention suggestions

---

## Dashboard Filters & Controls

### Individual Student View:
- **Student Selector:** Dropdown/search to select student
- **Date Range:** Filter by date
- **Quiz Filter:** All quizzes / Specific quiz
- **Topic Filter:** All topics / Specific topic
- **Performance Filter:** All / Excellent / Good / Needs Improvement / Critical

### Class View:
- **Date Range:** Filter by date
- **Quiz Filter:** All quizzes / Specific quiz
- **Topic Filter:** All topics / Specific topic
- **Student Filter:** All students / Specific student (to compare)
- **Sort Options:** By score / By name / By attempts

---

## Charts & Visualizations

1. **Line Charts:**
   - Student score trend over time
   - Class average trend over time
   - Topic mastery progress

2. **Bar Charts:**
   - Score distribution
   - Topic performance comparison
   - Quiz performance comparison

3. **Pie Charts:**
   - Performance category distribution
   - Topic coverage breakdown

4. **Heatmaps:**
   - Topic mastery matrix (students × topics)
   - Question difficulty matrix

5. **Tables:**
   - Detailed performance data
   - Question-level tracking
   - Exportable CSV/Excel

---

## Export & Reporting

- **Export Individual Report:** PDF/CSV for specific student
- **Export Class Report:** PDF/CSV for entire class
- **Export Quiz Analysis:** PDF/CSV for specific quiz
- **Schedule Reports:** Email reports (weekly/monthly)
- **Custom Date Ranges:** Select date range for export

---

## Data Refresh

- **Real-time Updates:** Dashboard refreshes when new data is added
- **Manual Refresh Button:** Force refresh data
- **Auto-refresh:** Optional auto-refresh every X minutes

---

## Implementation Priority

### Phase 1 (MVP):
1. Individual student filter & overview
2. Class overview metrics
3. Quiz performance table
4. Topic mastery breakdown
5. Basic charts (line, bar)

### Phase 2 (Enhanced):
1. Question-level analysis
2. Learning objectives tracking
3. Comparative analytics
4. At-risk student alerts
5. Export functionality

### Phase 3 (Advanced):
1. Heatmaps
2. Advanced filtering
3. Scheduled reports
4. Custom date ranges
5. Predictive analytics

---

## Database Views Available

The enhanced schema provides these ready-to-use views:

1. **`student_performance_analytics`** - Individual student metrics
2. **`question_performance_analytics`** - Question-level statistics
3. **`topic_mastery_analytics`** - Topic mastery by student
4. **`class_comparative_analytics`** - Student vs class comparisons

These views can be queried directly from the dashboard code!

