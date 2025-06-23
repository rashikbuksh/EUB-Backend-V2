-- ? ----------------------- TRIGGER item_after_item_work_order_entry -------------------------
CREATE OR REPLACE FUNCTION procure.item_after_item_work_order_entry_insert_function() RETURNS TRIGGER AS $$
DECLARE 
    delivery_statement_bool BOOLEAN;
BEGIN
    SELECT is_delivery_statement INTO delivery_statement_bool
    FROM procure.item_work_order
    WHERE uuid = NEW.item_work_order_uuid;

    IF delivery_statement_bool IS TRUE THEN
        UPDATE procure.item
        SET
            quantity = quantity + NEW.provided_quantity
        WHERE uuid = NEW.item_uuid;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION procure.item_after_item_work_order_entry_delete_function() RETURNS TRIGGER AS $$
DECLARE 
    delivery_statement_bool BOOLEAN;
BEGIN
    SELECT is_delivery_statement INTO delivery_statement_bool
    FROM procure.item_work_order
    WHERE uuid = OLD.item_work_order_uuid;
    
    IF delivery_statement_bool IS TRUE THEN
        UPDATE procure.item
        SET
            quantity = quantity - OLD.provided_quantity
        WHERE uuid = OLD.item_uuid;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION procure.item_after_item_work_order_entry_update_function() RETURNS TRIGGER AS $$
DECLARE 
    delivery_statement_bool BOOLEAN;
BEGIN
    SELECT is_delivery_statement INTO delivery_statement_bool
    FROM procure.item_work_order
    WHERE uuid = OLD.item_work_order_uuid;

    IF delivery_statement_bool IS TRUE THEN
        UPDATE procure.item
        SET
            quantity = quantity - OLD.provided_quantity
        WHERE uuid = OLD.item_uuid;

        UPDATE procure.item
        SET
            quantity = quantity + NEW.provided_quantity
        WHERE
            uuid = NEW.item_uuid;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER item_after_item_work_order_entry_insert_trigger
AFTER INSERT ON procure.item_work_order_entry
FOR EACH ROW
EXECUTE FUNCTION procure.item_after_item_work_order_entry_insert_function();

CREATE OR REPLACE TRIGGER item_after_item_work_order_entry_delete_trigger
AFTER DELETE ON procure.item_work_order_entry
FOR EACH ROW
EXECUTE FUNCTION procure.item_after_item_work_order_entry_delete_function();

CREATE OR REPLACE TRIGGER item_after_item_work_order_entry_update_trigger
AFTER UPDATE ON procure.item_work_order_entry
FOR EACH ROW
EXECUTE FUNCTION procure.item_after_item_work_order_entry_update_function();