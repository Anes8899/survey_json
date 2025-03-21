// types.ts
export interface Quiz {
  title: string;
  questions: Question[];
}

// export interface Question {
//   question: string;
//   options: string[];
//   answer: string;
// }

export interface QuizPreview {
  id: string;
  title: string;
} 

export interface Question {
  id : string;
  type: 'text' | 'multiple' | 'number';
  question: string;
  options: string[];
  answer: string;
}