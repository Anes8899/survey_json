import { useRouter } from 'next/router';
import { useState } from 'react';
import fs from 'fs';
import path from 'path';
import { Question, type Quiz } from '../../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface QuizProps {
  quizData: Quiz;
}

export default function Quiz({ quizData }: QuizProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[]>(new Array(quizData.questions.length).fill('')); // Track user answers
  const [submitted, setSubmitted] = useState(false); // Track if quiz is submitted

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  // Handle option click
  const handleOptionClick = (questionIndex: number, option: string) => {
    if (!submitted) { // Only allow changes before submission
      const newAnswers = [...answers];
      newAnswers[questionIndex] = option;
      setAnswers(newAnswers);
    }
  };

  // Handle quiz submission
  const handleSubmit = () => {
    setSubmitted(true);
    console.log('User Answers:', answers);
    // You could also send them to an API:
    // fetch('/api/submit-quiz', {
    //   method: 'POST',
    //   body: JSON.stringify({ quizId: quizData.id, answers })
    // });
  };

  const renderQuestionInput = (question: Question, qIndex: number) => {
    console.log(question.options);
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={answers[qIndex]}
            onChange={(e) => handleOptionClick(qIndex, e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Type your answer..."
            disabled={submitted}
          />
        );
      case 'multiple':
        return (
        <ul>
            {question.options.map((option, oIndex) => {
              const isSelected = answers[qIndex] === option;
              const isCorrect = option === question.answer;
              const showResult = submitted && isSelected;
              return (
          <li key={oIndex} className="mb-2 flex items-center space-x-2">
          <Checkbox
            id={`option-${qIndex}-${oIndex}`}
            checked={answers[qIndex] === option} // Mark selected option
            onCheckedChange={() => handleOptionClick(qIndex, option)}
            disabled={submitted} // Disable after submitting
          />
          <Label
            htmlFor={`option-${qIndex}-${oIndex}`}
            className={`w-full text-[15px] whitespace-normal break-words my-1 mx-2 p-2 rounded-md cursor-pointer transition-colors font-body ${
              showResult
                ? isCorrect
                  ? "bg-green-300 text-green-900"
                  : "bg-red-300"
                : isSelected
                ? "bg-blue-300"
                : "bg-white"
            }`}
          >
            {option} {showResult && ` - ${isCorrect ? "✅" : "❌"}`}
          </Label>
          </li>
              );
             
            })}
          </ul>
        );
      case 'number':
        return (
          <input
            type="number"
            value={answers[qIndex]}
            onChange={(e) => handleOptionClick(qIndex, e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter a number..."
            disabled={submitted}
          />
        );
      default:
        return null;
    }
  };

  return (
  <div className="flex items-center justify-center min-h-screen mx-3">
  <div className="text-center">
    <h1 className='text-2xl mb-10 mt-5 text-blue-600 font-title'>{quizData.title}</h1>
    <ul>
      {quizData.questions.map((q, qIndex) => (
        <>
        <li key={qIndex} style={{ marginBottom: '20px' }}>
          <p className="font-title">{q.question}</p>
          {renderQuestionInput(q, qIndex)}
        </li>
        </>
      ))}
    </ul>
    {!submitted && (
      <Button
        onClick={handleSubmit}
        disabled={answers.some((ans) => ans === '')}
        className="bg-blue-500 text-white mb-10"
      >
        Submit Quiz
      </Button>
    )}
    {submitted && (
      <p style={{ color: 'green' }}>Quiz submitted! Check your answers above.</p>
    )}
  </div>
</div>
  );
}

export async function getServerSideProps({ params }: { params: { id: string } }) {
  const filePath = path.join(process.cwd(), 'storage', `${params.id}.json`);

  if (!fs.existsSync(filePath)) {
    return { notFound: true };
  }

  const quizData: Quiz = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return { props: { quizData } };
}