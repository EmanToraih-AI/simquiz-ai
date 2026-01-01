# Topic Mastery View Fix

## Issue Fixed

The `topic_mastery_analytics` view had an error with the `ANY()` operator usage. The subquery approach was causing a type mismatch.

## Solution Applied

Replaced the subquery in the `LEFT JOIN` with a direct join to the `quizzes` table, allowing `ANY()` to work directly with the `text[]` array.

### Before (Causing Error):
```sql
LEFT JOIN quiz_attempts qa ON qa.user_id = p.id 
  AND ut.topic = ANY((
    SELECT topics FROM quizzes WHERE id = qa.quiz_id
  ))
```

### After (Fixed):
```sql
LEFT JOIN quiz_attempts qa ON qa.user_id = p.id
LEFT JOIN quizzes qu2 ON qu2.id = qa.quiz_id AND ut.topic = ANY(qu2.topics)
```

Also updated the `weak_appearances` calculation:
```sql
COUNT(DISTINCT CASE WHEN ut.topic = ANY(qu2.topics) THEN qa.id END) AS weak_appearances
```

## Status

✅ Fixed! The view now uses direct table joins instead of subqueries for the `ANY()` operator, which is more efficient and correctly handles `text[]` arrays.

