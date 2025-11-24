--inserted into the database
DROP FUNCTION IF EXISTS generate_15_digit_uuid ();

CREATE OR REPLACE FUNCTION generate_15_digit_uuid()
RETURNS VARCHAR AS $$
DECLARE
    result VARCHAR;
BEGIN
    SELECT substring(md5(random()::text), 1, 21) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;