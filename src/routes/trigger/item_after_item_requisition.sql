--------------------------- TRIGGER item_after_item_requisition-------------------------
----------------------------Inserted in to Database ------------------------------
CREATE OR REPLACE FUNCTION procure.item_after_item_requisition_insert_function() RETURNS TRIGGER AS $$
BEGIN
        UPDATE procure.item
        SET
            quantity = quantity - NEW.provided_quantity
        WHERE uuid = NEW.item_uuid;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION procure.item_after_item_requisition_delete_function() RETURNS TRIGGER AS $$
BEGIN
        UPDATE procure.item
        SET
            quantity = quantity + OLD.provided_quantity
        WHERE uuid = OLD.item_uuid;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION procure.item_after_item_requisition_update_function() RETURNS TRIGGER AS $$
BEGIN
        UPDATE procure.item
        SET
            quantity = quantity + OLD.provided_quantity - NEW.provided_quantity
        WHERE uuid = OLD.item_uuid;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER item_after_item_requisition_insert_trigger
AFTER INSERT ON procure.item_requisition
FOR EACH ROW
EXECUTE FUNCTION procure.item_after_item_requisition_insert_function();


CREATE OR REPLACE TRIGGER item_after_item_requisition_delete_trigger
AFTER DELETE ON procure.item_requisition
FOR EACH ROW
EXECUTE FUNCTION procure.item_after_item_requisition_delete_function();


CREATE OR REPLACE TRIGGER item_after_item_requisition_update_trigger
AFTER UPDATE ON procure.item_requisition
FOR EACH ROW
EXECUTE FUNCTION procure.item_after_item_requisition_update_function();


       