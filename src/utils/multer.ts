import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';

const dirSelect = [
  { name: 'routine', path: 'uploads/routine' },
];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = dirSelect.find(dir => dir.name === file.fieldname)?.path;
    const dir = uploadDir ? path.join(__dirname, '../', uploadDir) : path.join(__dirname, '../uploads');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const customFileName = `${file.originalname}_${Date.now()}${path.extname(file.originalname)}`;
    cb(
      null,
      customFileName,
    );
  },
});

export const upload = multer({ storage });
