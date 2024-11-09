CREATE DATABASE IF NOT EXISTS "qabot"
  WITH OWNER "postgres"
  ENCODING 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rating_type') THEN
      CREATE TYPE rating_type AS ENUM ('thumbsUp', 'thumbsDown');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS conversation_feedback (
  conversation_feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL UNIQUE,
  rating rating_type NOT NULL,
  conversation JSONB NULL,
  comment TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS message_feedback (
  message_feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  message_id UUID NOT NULL,
  conversation JSONB NOT NULL,
  comment TEXT NULL,
  category_tag VARCHAR(255) NOT NULL,
  category_tag_choices VARCHAR(255)[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS doc_record (
  doc_record_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_hash_uuid CHARACTER VARYING NULL,
  namespace CHARACTER VARYING NOT NULL,
  source_doc CHARACTER VARYING NULL
);

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email CHARACTER VARYING NOT NULL,
  first_name CHARACTER VARYING NOT NULL,
  last_name CHARACTER VARYING NOT NULL
);
