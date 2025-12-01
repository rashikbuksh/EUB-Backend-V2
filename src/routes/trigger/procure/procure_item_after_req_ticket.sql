--------------------------- TRIGGER item_after_req_ticket_resolved -------------------------
----------------------------For req_ticket is_resolved ------------------------------

CREATE OR REPLACE FUNCTION procure.item_after_req_ticket_resolved_function() RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if is_resolved changed from false/null to true
    IF (OLD.is_resolved IS DISTINCT FROM NEW.is_resolved) AND NEW.is_resolved = true THEN
        -- Update item quantities by subtracting quantity from req_ticket_items
        UPDATE procure.item
        SET quantity = item.quantity - rti.quantity
        FROM procure.req_ticket_item rti
        WHERE rti.req_ticket_uuid = NEW.uuid
        AND item.uuid = rti.item_uuid
        AND rti.quantity > 0;
    END IF;

    -- If is_resolved changed from true to false/null, restore quantities
    IF (OLD.is_resolved IS DISTINCT FROM NEW.is_resolved) AND OLD.is_resolved = true AND NEW.is_resolved != true THEN
        -- Restore item quantities by adding back quantity from req_ticket_items
        UPDATE procure.item
        SET quantity = item.quantity + rti.quantity
        FROM procure.req_ticket_item rti
        WHERE rti.req_ticket_uuid = NEW.uuid
        AND item.uuid = rti.item_uuid
        AND rti.quantity > 0;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER item_after_req_ticket_resolved_trigger
AFTER UPDATE ON procure.req_ticket
FOR EACH ROW
EXECUTE FUNCTION procure.item_after_req_ticket_resolved_function();