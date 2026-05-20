import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, './uploads/perfil');
  },
  filename: (
    req: Request, 
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5MB
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File, 
    cb: FileFilterCallback) => {
    //array com os tipos de mime permitidos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

    const ext = path.extname(file.originalname).toLowerCase();

    //validando tipo
    if (
      !allowedTypes.includes(file.mimetype) ||
      !allowedExtensions.includes(ext)
    ) {
      return cb(new Error('Apenas imagens JPG, PNG e GIF são permitidas'));
    }
    cb(null, true);
  },
});

export default upload;
