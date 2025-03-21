import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Quiz } from '../../types';

type ResponseData = {
  id: string;
  title: string;
} | {
  error: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method === 'POST') {
    try {
      const jsonData: Quiz = req.body; // Type the incoming JSON
      const id = Date.now().toString(); // Simple unique ID
      const filePath = path.join(process.cwd(), 'storage', `${id}.json`);

      // Ensure the storage directory exists
      if (!fs.existsSync(path.join(process.cwd(), 'storage'))) {
        fs.mkdirSync(path.join(process.cwd(), 'storage'));
      }

      // Write JSON to a file
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

      res.status(200).json({ id, title: jsonData.title || `Quiz ${id}` });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to upload JSON' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};