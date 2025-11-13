-- Create the function to reset all sequences
CREATE OR REPLACE FUNCTION public.reset_all_sequences() RETURNS void AS $$
DECLARE
    seq RECORD;
    cmd TEXT;
BEGIN
    FOR seq IN
        SELECT sequence_schema, sequence_name
        FROM information_schema.sequences
        WHERE
            sequence_name IN ('req_ticket_id')
    LOOP
        -- Build the command with proper schema and sequence name quoting
        cmd := 'ALTER SEQUENCE ' || quote_ident(seq.sequence_schema) || '.' || quote_ident(seq.sequence_name) || ' RESTART WITH 1';
        
        -- Execute with error handling
        BEGIN
            EXECUTE cmd;
            RAISE NOTICE 'Reset sequence: %.%', seq.sequence_schema, seq.sequence_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Failed to reset sequence %.%: %', seq.sequence_schema, seq.sequence_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Sequence reset operation completed';
END;
$$ LANGUAGE plpgsql;

-- to reset all sequences
SELECT public.reset_all_sequences ();