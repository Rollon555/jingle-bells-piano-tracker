-- ============================================
-- JINGLE BELLS PIANO TRACKER - DATABASE SCHEMA
-- ============================================

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    passed BOOLEAN DEFAULT false,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_sort_order ON students(sort_order);
CREATE INDEX IF NOT EXISTS idx_students_class_sort ON students(class_id, sort_order);

-- ============================================
-- SEED INITIAL DATA
-- ============================================

-- Insert Jingle Bells class
INSERT INTO classes (name) VALUES ('Jingle Bells')
ON CONFLICT (name) DO NOTHING;

-- Get the Jingle Bells class ID for seeding students
WITH jingle_class AS (
    SELECT id FROM classes WHERE name = 'Jingle Bells' LIMIT 1
)
INSERT INTO students (class_id, full_name, sort_order)
SELECT 
    jingle_class.id,
    student_names.name,
    student_names.sort_order
FROM jingle_class,
(VALUES
    ('เด็กชายจิราพัชร สัลลกะชาต', 1),
    ('เด็กชายธนพล ไม้หอม', 2),
    ('เด็กชายธนาวุฒิ ล่ามกระโทก', 3),
    ('เด็กชายธีรศักดิ์ ปราศรี', 4),
    ('เด็กชายปุญญฤทธิ์ เพ็ชรลือชัย', 5),
    ('เด็กชายเมธาสิทธิ์ กลัดเกิด', 6),
    ('เด็กชายรนกร พสุนนท์', 7),
    ('เด็กชายจิรัฏฐ์ ธนวัฒน์รชต', 8),
    ('เด็กชายวริทธิ์ธร แสนเศษ', 9),
    ('เด็กชายอภิเดช บรรณารักษ์', 10),
    ('เด็กหญิงกมลชนก คงเพิ่มพูล', 11),
    ('เด็กหญิงจิตตินันทา พึ่งจิตต์ตน', 12),
    ('เด็กหญิงชณัณชิดา นรินทร์', 13),
    ('เด็กหญิงชัญญา ปลื้มเนตร', 14),
    ('เด็กหญิงธนนันท์ ถนอมสัตย์', 15),
    ('เด็กหญิงพลอยชมพู นุสิทธิ์', 16),
    ('เด็กหญิงมารีเนต -', 17),
    ('เด็กหญิงศดานันท์ มหาวงษ์', 18),
    ('เด็กหญิงอักษรศาสตร์ ยวงลำใย', 19),
    ('เด็กชายกันย์พิทักษ์ หิรัญสาย', 20),
    ('เด็กชายชิณภัทร ละออง', 21),
    ('เด็กชายณิชพน หุ่นหล่อ', 22),
    ('เด็กชายธรรมรณกรณ์ เอี่ยมกระสินธุ์', 23),
    ('เด็กชายพนา พันธุ์ไชย', 24),
    ('เด็กชายภาณุวัชยา นิยมทรัพย์', 25),
    ('เด็กชายภูมิพัฒน์ กั๋งเซ่ง', 26),
    ('เด็กชายวีระภัทร อินนุพัฒน์', 27),
    ('เด็กชายศุภวิชญ์ พิสิทธิคุณ', 28),
    ('เด็กหญิงกฤติญา นวลจันทร์', 29),
    ('เด็กหญิงจิรวรรณ สาระวัน', 30),
    ('เด็กหญิงชณิชา กฤตกรกาญจน์', 31),
    ('เด็กหญิงณัจธิร์ยา ยาหอมทอง', 32),
    ('เด็กหญิงณัฐกานต์ สิงหนาท', 33),
    ('เด็กหญิงณิชานันทน์ ธีระนาวีกุล', 34),
    ('เด็กหญิงนภาพร รักษ์ทอง', 35),
    ('เด็กหญิงนันทิกานต์ อินทร์ฉาย', 36),
    ('เด็กหญิงเบญจวรรณ ฝันดี', 37),
    ('เด็กหญิงเพชรชมพู พวงแก้ว', 38),
    ('เด็กหญิงภวรัญชน์ เหลืองพุ่มพิพัฒน์', 39),
    ('เด็กหญิงภัทรียาพร ยุพาพิน', 40),
    ('เด็กหญิงสุรดา ทองนิรันดร์', 41),
    ('เด็กหญิงอินทุอร แก้วประเสริฐ', 42)
) AS student_names(name, sort_order)
ON CONFLICT DO NOTHING;

-- ============================================
-- ENABLE REALTIME
-- ============================================

-- Enable realtime for classes table
ALTER PUBLICATION supabase_realtime ADD TABLE classes;

-- Enable realtime for students table
ALTER PUBLICATION supabase_realtime ADD TABLE students;
