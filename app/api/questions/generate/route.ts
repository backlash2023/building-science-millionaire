import { NextRequest, NextResponse } from 'next/server';
import { generateQuestion } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      questionNumber = 1, 
      excludeQuestions = [] 
    } = body;

    // Determine difficulty based on question number
    let difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    if (questionNumber <= 5) {
      difficulty = 'easy';
    } else if (questionNumber <= 10) {
      difficulty = 'medium';
    } else if (questionNumber <= 13) {
      difficulty = 'hard';
    } else {
      difficulty = 'expert';
    }

    // Generate question using OpenAI
    const generatedQuestion = await generateQuestion(difficulty, excludeQuestions);

    // Save question to database for analytics
    const savedQuestion = await prisma.question.create({
      data: {
        question: generatedQuestion.question,
        options: JSON.stringify(generatedQuestion.options),
        correctAnswer: generatedQuestion.correctAnswer,
        explanation: generatedQuestion.explanation,
        difficulty,
        category: generatedQuestion.category,
        source: 'openai',
      }
    });

    return NextResponse.json({
      id: savedQuestion.id,
      ...generatedQuestion,
      difficulty,
      questionNumber,
    });

  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    );
  }
}