CREATE OR REPLACE FUNCTION portfolio.office_entry_before_office_delete_function() RETURNS TRIGGER AS $$
BEGIN
        DELETE FROM portfolio.office_entry
        WHERE office_uuid = OLD.uuid;

    RETURN OLD;
END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER portfolio_office_entry_before_office_delete_trigger
BEFORE DELETE ON portfolio.office
FOR EACH ROW
EXECUTE FUNCTION portfolio.office_entry_before_office_delete_function();
