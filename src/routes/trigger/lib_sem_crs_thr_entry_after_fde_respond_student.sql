-- INSERT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION lib.crs_thr_entry_after_fde_respond_student_insert_function() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.evaluation_time = 'mid' THEN
        UPDATE lib.sem_crs_thr_entry
        SET is_mid_evaluation_complete = CASE WHEN 
            (SELECT COUNT(*) FROM fde.respond_student 
                WHERE sem_crs_thr_entry_uuid = NEW.sem_crs_thr_entry_uuid
                  AND evaluation_time = 'mid')
            = lib.sem_crs_thr_entry.class_size THEN TRUE ELSE FALSE END
        WHERE uuid = NEW.sem_crs_thr_entry_uuid;
    ELSIF NEW.evaluation_time = 'final' THEN
        UPDATE lib.sem_crs_thr_entry
        SET is_final_evaluation_complete = CASE WHEN 
            (SELECT COUNT(*) FROM fde.respond_student 
                WHERE sem_crs_thr_entry_uuid = NEW.sem_crs_thr_entry_uuid
                  AND evaluation_time = 'final')
            = lib.sem_crs_thr_entry.class_size THEN TRUE ELSE FALSE END
        WHERE uuid = NEW.sem_crs_thr_entry_uuid;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- DELETE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION lib.crs_thr_entry_after_fde_respond_student_delete_function() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.evaluation_time = 'mid' THEN
        UPDATE lib.sem_crs_thr_entry
        SET is_mid_evaluation_complete = CASE WHEN 
            (SELECT COUNT(*) FROM fde.respond_student 
                WHERE sem_crs_thr_entry_uuid = OLD.sem_crs_thr_entry_uuid
                  AND evaluation_time = 'mid')
            = lib.sem_crs_thr_entry.class_size THEN TRUE ELSE FALSE END
        WHERE uuid = OLD.sem_crs_thr_entry_uuid;
    ELSIF OLD.evaluation_time = 'final' THEN
        UPDATE lib.sem_crs_thr_entry
        SET is_final_evaluation_complete = CASE WHEN 
            (SELECT COUNT(*) FROM fde.respond_student 
                WHERE sem_crs_thr_entry_uuid = OLD.sem_crs_thr_entry_uuid
                  AND evaluation_time = 'final')
            = lib.sem_crs_thr_entry.class_size THEN TRUE ELSE FALSE END
        WHERE uuid = OLD.sem_crs_thr_entry_uuid;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- UPDATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION lib.crs_thr_entry_after_fde_respond_student_update_function() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.evaluation_time IS DISTINCT FROM NEW.evaluation_time THEN
        -- Update for old evaluation_time
        IF OLD.evaluation_time = 'mid' THEN
            UPDATE lib.sem_crs_thr_entry
            SET is_mid_evaluation_complete = CASE WHEN 
                (SELECT COUNT(*) FROM fde.respond_student 
                    WHERE sem_crs_thr_entry_uuid = OLD.sem_crs_thr_entry_uuid
                      AND evaluation_time = 'mid')
                = lib.sem_crs_thr_entry.class_size THEN TRUE ELSE FALSE END
            WHERE uuid = OLD.sem_crs_thr_entry_uuid;
        ELSIF OLD.evaluation_time = 'final' THEN
            UPDATE lib.sem_crs_thr_entry
            SET is_final_evaluation_complete = CASE WHEN 
                (SELECT COUNT(*) FROM fde.respond_student 
                    WHERE sem_crs_thr_entry_uuid = OLD.sem_crs_thr_entry_uuid
                      AND evaluation_time = 'final')
                = lib.sem_crs_thr_entry.class_size THEN TRUE ELSE FALSE END
            WHERE uuid = OLD.sem_crs_thr_entry_uuid;
        END IF;
        -- Update for new evaluation_time
        IF NEW.evaluation_time = 'mid' THEN
            UPDATE lib.sem_crs_thr_entry
            SET is_mid_evaluation_complete = CASE WHEN 
                (SELECT COUNT(*) FROM fde.respond_student 
                    WHERE sem_crs_thr_entry_uuid = NEW.sem_crs_thr_entry_uuid
                      AND evaluation_time = 'mid')
                = lib.sem_crs_thr_entry.class_size THEN TRUE ELSE FALSE END
            WHERE uuid = NEW.sem_crs_thr_entry_uuid;
        ELSIF NEW.evaluation_time = 'final' THEN
            UPDATE lib.sem_crs_thr_entry
            SET is_final_evaluation_complete = CASE WHEN 
                (SELECT COUNT(*) FROM fde.respond_student 
                    WHERE sem_crs_thr_entry_uuid = NEW.sem_crs_thr_entry_uuid
                      AND evaluation_time = 'final')
                = lib.sem_crs_thr_entry.class_size THEN TRUE ELSE FALSE END
            WHERE uuid = NEW.sem_crs_thr_entry_uuid;
        END IF;
    ELSE
        -- If evaluation_time did not change, update only the relevant field
        IF NEW.evaluation_time = 'mid' THEN
            UPDATE lib.sem_crs_thr_entry
            SET is_mid_evaluation_complete = CASE WHEN 
                (SELECT COUNT(*) FROM fde.respond_student 
                    WHERE sem_crs_thr_entry_uuid = NEW.sem_crs_thr_entry_uuid
                      AND evaluation_time = 'mid')
                = lib.sem_crs_thr_entry.class_size THEN TRUE ELSE FALSE END
            WHERE uuid = NEW.sem_crs_thr_entry_uuid;
        ELSIF NEW.evaluation_time = 'final' THEN
            UPDATE lib.sem_crs_thr_entry
            SET is_final_evaluation_complete = CASE WHEN 
                (SELECT COUNT(*) FROM fde.respond_student 
                    WHERE sem_crs_thr_entry_uuid = NEW.sem_crs_thr_entry_uuid
                      AND evaluation_time = 'final')
                = lib.sem_crs_thr_entry.class_size THEN TRUE ELSE FALSE END
            WHERE uuid = NEW.sem_crs_thr_entry_uuid;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE OR REPLACE TRIGGER crs_thr_entry_after_fde_respond_student_insert_trigger
AFTER INSERT ON fde.respond_student
FOR EACH ROW
EXECUTE FUNCTION lib.crs_thr_entry_after_fde_respond_student_insert_function();

CREATE OR REPLACE TRIGGER crs_thr_entry_after_fde_respond_student_delete_trigger
AFTER DELETE ON fde.respond_student
FOR EACH ROW
EXECUTE FUNCTION lib.crs_thr_entry_after_fde_respond_student_delete_function();

CREATE OR REPLACE TRIGGER crs_thr_entry_after_fde_respond_student_update_trigger
AFTER UPDATE ON fde.respond_student
FOR EACH ROW
EXECUTE FUNCTION lib.crs_thr_entry_after_fde_respond_student_update_function();