-- Drop conflicting view before applying migrations
DROP VIEW IF EXISTS validation_session_stats CASCADE;

-- This view belongs to the fastlight module and will need to be recreated
-- after migrations are complete if needed
