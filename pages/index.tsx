import { useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { QuizPreview } from '../types';
// import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


interface AppProps {
  quizzes: QuizPreview[];
}

export default function App({ quizzes: initialQuizzes }: AppProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedQuizzes, setUploadedQuizzes] = useState<QuizPreview[]>(initialQuizzes);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  useEffect(() => {
    const uploadFile = async () => {
      if (!file) return;

      setIsLoading(true);
      setError(null);

      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            if (!event.target?.result) {
              throw new Error('Failed to read file');
            }

            const jsonData = JSON.parse(event.target.result as string);

            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(jsonData),
            });

            if (!res.ok) {
              throw new Error('Upload failed');
            }

            const newQuiz: QuizPreview = await res.json();
            setUploadedQuizzes(prev => [...prev, newQuiz]);
            setFile(null); // Reset file input after successful upload

          } catch (err) {
            setError(err instanceof Error ? err.message : 'Error processing file');
          } finally {
            setIsLoading(false);
          }
        };

        reader.onerror = () => {
          setError('Error reading file');
          setIsLoading(false);
        };

        reader.readAsText(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error');
        setIsLoading(false);
      }
    };

    uploadFile();
  }, [file]);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex  justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h3 className="text-3xl font-bold text-blue-600 mb-6 text-center">
          Upload JSON Quiz
        </h3>
        <label
          htmlFor="file-upload"
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer transition-colors duration-200"
        >
          Choose File
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        {isLoading && <p className="mt-2 text-blue-500">Uploading...</p>}
        {error && <p className="mt-2 text-red-500">{error}</p>}
        <h2 className="text-2xl font-semibold text-gray-800 my-4">
          Available Quizzes
        </h2>
        {uploadedQuizzes.length == 0 ? <span className='flex justify-center text-lg text-blue-600'>No quize topic</span> :
          <Table>
            <TableCaption className="text-gray-500 mb-2">
              A list of your recent quizzes.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-gray-600 font-title text-lg">No</TableHead>
                <TableHead className="text-left text-gray-600  font-title text-lg">Topic</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploadedQuizzes.length > 0 ? (
                uploadedQuizzes.map((quiz, index) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium font-body">{index + 1}</TableCell>
                    <TableCell>
                      <Link
                        href={`/quizzes/${quiz.id}`}
                        className="text-blue-600 hover:underline font-body"
                      >
                        {quiz.title || 'Untitled Quiz'}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-gray-500 py-4">
                    No quizzes available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>}
      </div>
    </div>
  );
}

export async function getServerSideProps(): Promise<{ props: AppProps }> {
  const storageDir = path.join(process.cwd(), 'storage');
  let quizzes: QuizPreview[] = [];

  if (fs.existsSync(storageDir)) {
    const files = fs.readdirSync(storageDir);
    quizzes = files.map((file) => {
      const filePath = path.join(storageDir, file);
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return { id: file.replace('.json', ''), title: jsonData.title || `Quiz ${file}` };
    });
  }

  return { props: { quizzes } };
}