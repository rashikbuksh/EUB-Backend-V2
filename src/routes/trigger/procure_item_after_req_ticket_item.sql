--------------------------- TRIGGER item_after_req_ticket_item_operations -------------------------
--------------------------- For req_ticket_item DELETE and UPDATE operations -------------------------

-- Function for handling DELETE operations on req_ticket_item
CREATE OR REPLACE FUNCTION procure.item_after_req_ticket_item_delete_function() RETURNS TRIGGER AS $$
BEGIN
    -- Only restore quantities if the req_ticket is resolved (meaning the items were already deducted)
    IF EXISTS (
        SELECT 1 FROM procure.req_ticket 
        WHERE uuid = OLD.req_ticket_uuid AND is_resolved = true
    ) THEN
        -- Return the deleted quantity back to the item
        UPDATE procure.item
        SET quantity = item.quantity + OLD.quantity
        WHERE uuid = OLD.item_uuid
        AND OLD.quantity > 0;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function for handling UPDATE operations on req_ticket_item
CREATE OR REPLACE FUNCTION procure.item_after_req_ticket_item_update_function() RETURNS TRIGGER AS $$
BEGIN
    -- Only adjust quantities if the req_ticket is resolved (meaning the items were already deducted)
    IF EXISTS (
        SELECT 1 FROM procure.req_ticket 
        WHERE uuid = NEW.req_ticket_uuid AND is_resolved = true
    ) THEN
        -- Case 1: Item was changed to a different item
        IF OLD.item_uuid != NEW.item_uuid THEN
            -- Return the old quantity to the old item
            UPDATE procure.item
            SET quantity = item.quantity + OLD.quantity
            WHERE uuid = OLD.item_uuid
            AND OLD.quantity > 0;
            
            -- Deduct the new quantity from the new item
            UPDATE procure.item
            SET quantity = item.quantity - NEW.quantity
            WHERE uuid = NEW.item_uuid
            AND NEW.quantity > 0;
            
        -- Case 2: Same item but quantity changed
        ELSIF OLD.quantity != NEW.quantity THEN
            -- Calculate the difference and adjust accordingly
            -- If quantity increased: deduct more from item stock
            -- If quantity decreased: return some back to item stock
            UPDATE procure.item
            SET quantity = item.quantity + (OLD.quantity - NEW.quantity)
            WHERE uuid = NEW.item_uuid;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create DELETE trigger
CREATE OR REPLACE TRIGGER item_after_req_ticket_item_delete_trigger
AFTER DELETE ON procure.req_ticket_item
FOR EACH ROW
EXECUTE FUNCTION procure.item_after_req_ticket_item_delete_function();

-- Create UPDATE trigger
CREATE OR REPLACE TRIGGER item_after_req_ticket_item_update_trigger
AFTER UPDATE ON procure.req_ticket_item
FOR EACH ROW
EXECUTE FUNCTION procure.item_after_req_ticket_item_update_function();