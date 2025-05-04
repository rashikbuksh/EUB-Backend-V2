SELECT
    pr.uuid,
    pr.is_received,
    pr.received_date,
    pr.created_by,
    pri.item_uuid,
    pri.provided_quantity,
    pi.name AS item_name
FROM
    procure.requisition pr
LEFT JOIN
    (
        SELECT
            pri.requisition_uuid,
            pri.item_uuid,
            pri.provided_quantity,
            pri.created_by
        FROM
            procure.item_requisition pri
        GROUP BY
            pri.item_uuid
    ) pri ON
        pr.uuid = pri.requisition_uuid AND
        pr.created_by = pri.created_by
LEFT JOIN
    procure.item pi ON
        pri.item_uuid = pi.uuid

WHERE 
    pr.is_received = true
   
    
