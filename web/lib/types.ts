export type LessonRef = { id: string; title: string };
export type Course = { id: string; topic: string; lessons: LessonRef[] };

export type Card =
  | { id: string; type: "flashcard"; front: string; back: string }
  | { id: string; type: "mcq"; question: string; options: string[]; answer: number }
  | { id: string; type: "cloze"; text: string; blanks: string[] };
