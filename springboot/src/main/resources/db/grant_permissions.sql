-- Grant schema permissions
GRANT USAGE ON SCHEMA "descripto-ai" TO "DescriptoAI_heartburst";
GRANT CREATE ON SCHEMA "descripto-ai" TO "DescriptoAI_heartburst";

-- Grant table permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "descripto-ai" TO "DescriptoAI_heartburst";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "descripto-ai" TO "DescriptoAI_heartburst";

-- Grant future table permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA "descripto-ai"
GRANT ALL PRIVILEGES ON TABLES TO "DescriptoAI_heartburst";

ALTER DEFAULT PRIVILEGES IN SCHEMA "descripto-ai"
GRANT ALL PRIVILEGES ON SEQUENCES TO "DescriptoAI_heartburst";

-- Make sure the user owns the schema
ALTER SCHEMA "descripto-ai" OWNER TO "DescriptoAI_heartburst";