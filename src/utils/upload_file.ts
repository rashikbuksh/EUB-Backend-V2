// import { Buffer } from 'node:buffer';
// import * as fs from 'node:fs';
// import path from 'node:path';
// import { fileURLToPath } from 'node:url';

// import nanoid from '@/lib/nanoid';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export async function insertFile(file: any, folderName: string) {
//   const buffer = await file.arrayBuffer(); // Ensure this is awaited

//   // Use provided year or current year
//   const targetYear = new Date().getFullYear();

//   const upload_path = `/uploads/${targetYear}/${folderName}/${nanoid()}.${file.name.split('.').pop()}`;
//   const fullUploadPath = path.join(__dirname, '../', upload_path);

//   // Ensure the directory exists
//   fs.mkdirSync(path.dirname(fullUploadPath), { recursive: true });

//   fs.writeFileSync(fullUploadPath, Buffer.from(buffer));

//   return upload_path;
// }

// export async function deleteFile(filePath: string) {
//   // delete the file
//   const fullFilePath = path.join(__dirname, '../', filePath);
//   fs.unlinkSync(fullFilePath);
// }

// export async function updateFile(file: any, oldFilePath: string, folderName: string) {
//   // delete the old file
//   deleteFile(oldFilePath);

//   // upload the new file
//   return insertFile(file, folderName);
// }

import {
  deleteFile as originalDeleteFile,
  insertFile as originalInsertFile,
  updateFile as originalUpdateFile,
} from 'local-file-upload';

import env from '../env';

const isDev = env.NODE_ENV === 'development';
const isVps = env.NODE_ENV === 'vps';

const uploadDirectory = isDev ? './src/' : isVps ? './dist/src/' : './';

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await originalDeleteFile(filePath, uploadDirectory);
  }
  catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function insertFile(file: any, folderName: string): Promise<string> {
  try {
    return await originalInsertFile(file, folderName, uploadDirectory);
  }
  catch (error) {
    console.error('Error inserting file:', error);
    throw error;
  }
}

export async function updateFile(file: any, oldFilePath: string, folderName: string): Promise<string> {
  try {
    return await originalUpdateFile(file, oldFilePath, folderName, uploadDirectory);
  }
  catch (error) {
    console.error('Error updating file:', error);
    throw error;
  }
}
