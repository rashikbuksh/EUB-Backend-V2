SELECT * FROM lib.course WHERE shift_type = 'regular_and_evening';

SELECT course.code, COUNT(
        CASE
            WHEN course_section.type = 'regular' THEN 1
        END
    ) as regular, COUNT(
        CASE
            WHEN course_section.type = 'evening' THEN 1
        END
    ) as evening
FROM lib.course_section
    LEFT JOIN lib.course ON lib.course_section.course_uuid = lib.course.uuid
WHERE
    lib.course.shift_type = 'regular_and_evening'
GROUP BY
    course.code;

SELECT COUNT(course.code)
FROM lib.course_section
    LEFT JOIN lib.course ON lib.course_section.course_uuid = lib.course.uuid
WHERE
    lib.course.shift_type = 'regular_and_evening';

SELECT course_section.course_uuid, course.*, course_section.type, course_section.name
FROM lib.course_section
    LEFT JOIN lib.course ON lib.course_section.course_uuid = lib.course.uuid
WHERE
    lib.course.shift_type = 'regular_and_evening'
ORDER by course.code ASC;

-----

UPDATE lib.course_section
SET
    course_code = course.code,
    course_name = course.name
FROM lib.course
WHERE
    lib.course_section.course_uuid = lib.course.uuid;

-------------

SELECT course_section.course_uuid, course.*, course_section.type, course_section.course_code
FROM lib.course_section
    LEFT JOIN lib.course ON lib.course_section.course_uuid = lib.course.uuid
WHERE
    lib.course.shift_type = 'regular_and_evening'
ORDER by course.code ASC;

------
SELECT *
FROM lib.course
WHERE
    lib.course.shift_type = 'regular_and_evening';
-- change to regular_and_evening to regular
UPDATE lib.course
SET
    shift_type = 'regular'
WHERE
    course.shift_type = 'regular_and_evening';

----

-- insert missing regular_and_evening courses as evening
INSERT INTO
    lib.course (
        "uuid",
        "name",
        "code",
        "created_by",
        "created_at",
        "updated_at",
        "shift_type",
        "financial_info_uuid",
        "course_type",
        "credit"
    )
VALUES (
        '2xhowG3WMeoeWD9F2unKh',
        'Chemistry of Engineering Materials',
        'CHM 141',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:32',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '7OIzNgWlfUwtFmLhfQXXl',
        'Power Plant Engineering',
        'EEE-449',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:53',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'lTA6xNm25RAjiOguIdisf',
        'Integral Calculus and Differential Equations',
        'MTH 127',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:33',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'uLKDx3LknQFQWjSF9EmyN',
        'Computer Programming Language Sessional',
        'ME 172',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:35',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'GbJn4Tv1CLemdUCtyiFI3',
        'Optical Fiber Communications',
        'EEE-473',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:35',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'xScfXiyRXL1q0k7BKkVVV',
        'Power System Protection',
        'EEE-453',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:37',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'ChpxbgNQFbYTLPXfIQha4',
        'VLSI Design Lab',
        'EEE-464',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:40',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '9M5TMxofhkcVMGLigtleQ',
        'VLSI Design',
        'EEE-463',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:40',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '9rowdCQHQxjEXuQ1EGiVq',
        'Electrical Engineering Materials',
        'EEE-413',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:40',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'y0qAulLEzqRv0kZwTfnzD',
        'Microprocessor and Interfacing',
        'EEE-307',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:54',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'tqmu2snnWF4E2qS2axF4y',
        'Electrical Measurements and Instrumentation',
        'EEE-315',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:56',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'VxrZ2hyjgDuKKJCrmtUXA',
        'Communication Engineering',
        'EEE-311',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:58',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'iVg4ggYXJGlQvq28y3jFP',
        'Digital Electronics lab',
        'EEE-302',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:59',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'bDM390vouZFPF4n5EbVbo',
        'Mechanical Engineering Fundamentals',
        'ME-201',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 1:04',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'PGqKCjlVtGuv9XF94nJeD',
        'Introduction to Electrical Engineering Sessional',
        'EEE-102',
        'S5yR135nO5azH9w4eRPkh',
        '9/19/25 14:30',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'jFyqM2SbsQjQDA2tAqHwr',
        'Electronics Drives and Instrumentation Sessional',
        'EEE-202',
        'S5yR135nO5azH9w4eRPkh',
        '9/19/25 14:35',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'bgMcswx9JOt17bcWHqREs',
        'Introduction to Mechanical Engineering',
        'ME 101',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:06',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'Xp0IjBav8NTXExEF0eH1O',
        'Fundamentals of Electric Engineering',
        'EEE 159',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:07',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '7l599JRKAMAMatE67uGJV',
        'Inorganic Quantitative Analysis Sessional',
        'CHM 116',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:07',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'kbX7haHJeT9EiS4oAeFB0',
        'Structure of matter, Electricity and Magnetism and Modern Physics',
        'PHY 117',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 9:58',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'JKjLGXXGlAIcXJaegWXlM',
        'Power Electronics Lab',
        'EEE-432',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:38',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '0aOXLK6a44rUItYkobrBK',
        'Power Electronics',
        'EEE-431',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:39',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'gf7qXzvNwxpguOvhIDLvA',
        'Control Systems Lab',
        'EEE-402',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:51',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'EVzFdqj4UfwvzVruWBZOX',
        'Power Systems Engineering',
        'EEE-347',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:53',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '06E35EL1aK87oha6oAt0y',
        'Transmission and Distribution',
        'EEE-345',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:53',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '4Osqewlw5lsR0Xnly66NN',
        'Electrical Machines-III',
        'EEE-329',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:55',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'UyGmJdCZR8JlOmVeIn0W9',
        'Digital Signal Processing Lab',
        'EEE-310',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:56',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '9bkyxNqUFfwUlGbJ81SdK',
        'Digital Signal Processing',
        'EEE-309',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:56',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'NT6f92VamGW0k6dxMj7NU',
        'Communication Engineering Lab',
        'EEE-312',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:58',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'a6qnvsxaBl0j756F6NLYx',
        'Signals and Systems Lab',
        'EEE-304',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:58',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '8BRxvIbYsDDSsNvB1BmCK',
        'Digital Electronics',
        'EEE-301',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 1:00',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'EIQuOOkfk08QZ3NsOa7Le',
        'Foundation English',
        'ENG-101',
        'S5yR135nO5azH9w4eRPkh',
        '9/19/25 14:19',
        '9/19/25 14:20',
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'suS3F2sV3KV6tqMTJPEvU',
        'Mathematics-I (Differential and Integral Calculus)',
        'MTH-101',
        'S5yR135nO5azH9w4eRPkh',
        '9/19/25 14:22',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'F3UzWC2aPFRs132ZJVszs',
        'Digital Logic Design',
        'CSE-213',
        'S5yR135nO5azH9w4eRPkh',
        '9/19/25 14:33',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'MX6qOgM2JnLo2CjLbT2fu',
        'Digital Logic Design Sessional',
        'CSE-214',
        'S5yR135nO5azH9w4eRPkh',
        '9/19/25 14:34',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'lj6weZ4hTo4OzHuONFJPO',
        'Operating Systems',
        'CSE-231',
        'S5yR135nO5azH9w4eRPkh',
        '9/19/25 14:40',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'sx0bNMLhGODg3jNK0aVcU',
        'Chemistry-I',
        'CHM 115',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:05',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'IttrgrNRdo1ixcsoC29kC',
        'Fundamentals of Electrical Engineering Sessional',
        'EEE 160',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:08',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'xIT3HrWbONMq8yjlLvhZE',
        'Physics Sessional',
        'PHY 120',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:11',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '6eboYcuah4hexVq6uNAr4',
        'Computer Programming Language',
        'ME 171',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:34',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '3WUWldeTOOXhQlcnUtYUy',
        'Machine Shop Practice',
        'SHOP 170',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:36',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '0GcH5HAtsV1XaQdFn7Igd',
        'Operating Systems Sessional',
        'CSE-232',
        'S5yR135nO5azH9w4eRPkh',
        '9/19/25 14:40',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'itUROjvlobnGCP6df9jpi',
        'Renewable Energy',
        'EEE-455',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:37',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'telsK7wuO8RFIoQ8kPYrK',
        'Wireless and Mobile Communication',
        'EEE-471',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:39',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'zvIgqgSnVPuFTtFmPvuYj',
        'Control Systems',
        'EEE-401',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:52',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'MRYsVMNRVINVq4bQ8GXrp',
        'Microprocessor and Interfacing Lab',
        'EEE-308',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:54',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'KGfzJ5voslld45pOvrk2k',
        'Electrical Measurements and Instrumentation Lab',
        'EEE-316',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:55',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'LQa7NrSQbMQeZP315DOm8',
        'Electromagnetic Fields and Waves',
        'EEE-305',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:57',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'onk84mrmKBxim0iiJ5P0p',
        'Numerical Methods and Fourier and Laplace Transformation',
        'MTH-301',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:57',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'zVMn0IPx9OkGqvlsoZzFA',
        'Signals and Systems',
        'EEE-303',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:59',
        '9/19/25 0:59',
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'j0boZvsIop9EdPsQTLrMi',
        'Co-ordinate Geometry and Vector Analysis',
        'MTH-205',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 1:00',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '3cK5hJlSFPv4hbjZGsBXh',
        'Numerical Methods',
        'CSE-133',
        'S5yR135nO5azH9w4eRPkh',
        '9/19/25 14:22',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '8lKKYxwptKGQeVcPotlzX',
        'Introduction to Electrical Engineering',
        'EEE-101',
        'S5yR135nO5azH9w4eRPkh',
        '9/19/25 14:30',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        '75AQSPT1CpKNxP2zBsBzy',
        'Electronics Drives and Instrumentation',
        'EEE-201',
        'S5yR135nO5azH9w4eRPkh',
        '9/19/25 14:34',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'fnGvPRIt2OgLx5cpBK6rQ',
        'Differential Calculus, Solid Geometry and Vectors',
        'MTH 125',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:05',
        '9/20/25 11:10',
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'iAQ298xRYP9NdF87aYVDS',
        'Foundry and Welding Shops',
        'SHOP 160',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 10:09',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'T2FhPZ78WEugOcxnc7KkV',
        'Project Planning & Construction Management',
        'CE 401',
        'oEdOAEiJphZTZo4NaMSfC',
        '9/12/25 14:56',
        '9/23/25 17:03',
        'evening',
        '0w9uV3MGYP8Z7noB9teqt',
        'general',
        '0'
    ),
    (
        'i8y5rfB0L4V6hYSQKZSga',
        'Mechanical Engineering Drawing-I',
        'ME 160',
        'aVxePwyktBOX48qKiGU4U',
        '9/20/25 14:21',
        NULL,
        'evening',
        NULL,
        'general',
        '0'
    ),
    (
        'y1Z56PwRaJnHo6X8WYER3',
        'Optoelectronics',
        'EEE-459',
        's3pFM3XYfAoKwL0LMR1xh',
        '9/19/25 0:36',
        '9/23/25 17:50',
        'evening',
        'oKCpKQKzfhD5b1Pvj0Mmb',
        'general',
        '0'
    );

-------

SELECT lib.course.code, course_section.course_code, course.name, course_section.course_name, course.uuid, course_section.course_uuid, course_section.type, course.shift_type
FROM lib.course
    LEFT JOIN lib.course_section ON (
        course.shift_type::text = course_section.type::text
        AND course_section.course_code = course.code
        AND course.name = course_section.course_name
    )
WHERE
    course.uuid != course_section.course_uuid;

UPDATE lib.course_section
SET
    course_uuid = course.uuid
FROM lib.course
WHERE
    course.shift_type::text = course_section.type::text
    AND course_section.course_code = course.code
    AND course.uuid != course_section.course_uuid;