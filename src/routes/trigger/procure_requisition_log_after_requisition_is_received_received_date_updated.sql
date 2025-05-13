-- Create the trigger function
CREATE OR REPLACE FUNCTION procure.requisition_log_after_requisition_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new record into the requisition_log table
  INSERT INTO procure.requisition_log (
    requisition_uuid,
    is_received,
    received_date,
    created_by,
    created_at
  )
  VALUES (
    NEW.uuid,              -- The UUID of the updated requisition
    NEW.is_received,       -- The updated is_received value
    NEW.received_date,     -- The updated received_date value
    NEW.created_by,        -- The user who updated the record
    NOW()                  -- The current timestamp
  );

  -- Return the updated row
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER requisition_log_after_requisition_update_trigger
AFTER UPDATE OF is_received, received_date
ON procure.requisition
FOR EACH ROW
WHEN (OLD.is_received IS DISTINCT FROM NEW.is_received OR OLD.received_date IS DISTINCT FROM NEW.received_date)
EXECUTE FUNCTION procure.requisition_log_after_requisition_update();