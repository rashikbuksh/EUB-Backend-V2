CREATE OR REPLACE FUNCTION portfolio.news_entry_before_news_delete_function() RETURNS TRIGGER AS $$
BEGIN
        DELETE FROM portfolio.news_entry
        WHERE news_uuid = OLD.uuid;

    RETURN OLD;
END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER portfolio_news_entry_before_news_delete_trigger	
BEFORE DELETE ON portfolio.news
FOR EACH ROW
EXECUTE FUNCTION portfolio.news_entry_before_news_delete_function();	