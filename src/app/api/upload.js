// pages/api/upload.js
import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import path from 'path';

const bucket = new Storage({
  keyFilename: path.resolve('./secrets/moto-store-llc-53f711054951.json'), // Ruta de tu archivo de credenciales
}).bucket(process.env.AWS_BUCKET_NAME); // Nombre de tu bucket de Google Cloud

// Configura Multer para manejar la carga de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API Route para manejar la carga de archivos
export const config = {
  api: {
    bodyParser: false,  // Deshabilitar el parser de Next.js para que Multer maneje el archivo
  },
};

export default function handler(req, res) {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cargar el archivo' });
    }

    // Aquí gestionamos la subida del archivo al bucket de Google Cloud
    const blob = bucket.file(req.file.originalname);  // Usa el nombre del archivo original
    const blobStream = blob.createWriteStream({
      resumable: false,
      gzip: true,  // Comprimir el archivo para ahorrar espacio
    });

    blobStream.on('finish', () => {
      res.status(200).json({ message: 'Archivo subido correctamente' });
    });

    blobStream.on('error', (error) => {
      res.status(500).json({ error: 'Error al subir el archivo' });
    });

    blobStream.end(req.file.buffer);
  });
}
