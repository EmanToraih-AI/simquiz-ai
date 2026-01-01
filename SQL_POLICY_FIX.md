# SQL Policy Fix

## Issue Fixed

PostgreSQL doesn't support `IF NOT EXISTS` for `CREATE POLICY` statements. This caused a syntax error.

## Solution

Changed all policy creation statements from:
```sql
CREATE POLICY IF NOT EXISTS "policy_name" ...
```

To:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ...
```

## Fixed Policies

1. `qa_select_own_or_instructor` (question_attempts)
2. `qa_insert_own` (question_attempts)
3. `qa_update_own` (question_attempts)
4. `qa_delete_own` (question_attempts)
5. `learning_objectives_select_public` (learning_objectives)
6. `learning_objectives_manage_instructor` (learning_objectives)
7. `question_objectives_select_public` (question_objectives)
8. `question_objectives_manage_instructor` (question_objectives)

## Status

✅ All policy creation statements have been fixed. The SQL file should now run without syntax errors.

