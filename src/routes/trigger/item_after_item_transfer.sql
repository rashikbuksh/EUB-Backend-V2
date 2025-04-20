----------------------------Inserted in to Database ------------------------------

CREATE OR REPLACE FUNCTION procure.item_after_item_transfer_insert_function() RETURNS TRIGGER AS $$
BEGIN
        UPDATE procure.item
        SET
            quantity = quantity - NEW.quantity
        WHERE uuid = NEW.item_uuid;

    RETURN NEW;
END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION procure.item_after_item_transfer_delete_function() RETURNS TRIGGER AS $$
BEGIN
        UPDATE procure.item
        SET
            quantity = quantity + OLD.quantity
        WHERE uuid = OLD.item_uuid;

    RETURN OLD;
END;

$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION procure.item_after_item_transfer_update_function() RETURNS TRIGGER AS $$
BEGIN
        UPDATE procure.item
        SET
            quantity = quantity + OLD.quantity - NEW.quantity
        WHERE uuid = OLD.item_uuid;

    RETURN NEW;
END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER item_after_item_transfer_insert_trigger
AFTER INSERT ON procure.item_transfer
FOR EACH ROW
EXECUTE FUNCTION procure.item_after_item_transfer_insert_function();


CREATE OR REPLACE TRIGGER item_after_item_transfer_delete_trigger
AFTER DELETE ON procure.item_transfer
FOR EACH ROW
EXECUTE FUNCTION procure.item_after_item_transfer_delete_function();


CREATE OR REPLACE TRIGGER item_after_item_transfer_update_trigger
AFTER UPDATE ON procure.item_transfer
FOR EACH ROW
EXECUTE FUNCTION procure.item_after_item_transfer_update_function();
