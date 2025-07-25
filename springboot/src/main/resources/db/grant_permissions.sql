-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO "DescriptoAI_heartburst";
GRANT CREATE ON SCHEMA public TO "DescriptoAI_heartburst";

-- Grant table permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "DescriptoAI_heartburst";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "DescriptoAI_heartburst";

-- Grant future table permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO "DescriptoAI_heartburst";

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO "DescriptoAI_heartburst";

-- Make sure the user owns the schema
ALTER SCHEMA public OWNER TO "DescriptoAI_heartburst"; 