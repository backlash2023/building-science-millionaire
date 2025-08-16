import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level = 1 } = body;

    // Determine difficulty based on level - proper progression for building science professionals
    // Levels 1-5 ($100-$1,000): EASY - Basic building science literacy
    // Levels 6-9 ($2,000-$16,000): MEDIUM - Professional knowledge
    // Levels 10-12 ($32,000-$125,000): HARD - Advanced technical concepts
    // Levels 13-15 ($250,000-$1,000,000): EXPERT - Research-level expertise
    let difficulty: string;
    if (level <= 5) {
      difficulty = 'easy';
    } else if (level <= 9) {
      difficulty = 'medium';
    } else if (level <= 12) {
      difficulty = 'hard';
    } else {
      difficulty = 'expert';
    }

    // Try to get a question from SQLite database
    try {
      // Get questions by difficulty from all sources
      const questions = await prisma.question.findMany({
        where: {
          difficulty: difficulty
        },
        orderBy: {
          timesUsed: 'asc' // Get least used questions first to ensure variety
        }
      });

      if (questions.length > 0) {
        // Select a random question from the available pool
        const randomIndex = Math.floor(Math.random() * questions.length);
        const selectedQuestion = questions[randomIndex];
        
        // Update usage count
        await prisma.question.update({
          where: { id: selectedQuestion.id },
          data: { timesUsed: { increment: 1 } }
        });

        // Parse options from JSON
        const options = JSON.parse(selectedQuestion.options);

        return NextResponse.json({
          id: selectedQuestion.id,
          question: selectedQuestion.question,
          options: options,
          correctAnswer: selectedQuestion.correctAnswer,
          difficulty: selectedQuestion.difficulty,
          category: selectedQuestion.category,
          explanation: selectedQuestion.explanation || 'No explanation available.',
          hostIntro: getDefaultHostIntro(level),
          hostCorrectResponse: getDefaultCorrectResponse(level),
          hostWrongResponse: getDefaultWrongResponse(level),
          hostHint: getDefaultHint(selectedQuestion.correctAnswer),
        });
      }
    } catch (dbError) {
      console.error('SQLite database error:', dbError);
    }

    // Ultimate fallback - generate a basic question
    const fallbackQuestion = {
      id: `fallback_${level}`,
      question: 'What is the most important aspect of building science?',
      options: [
        'Understanding heat, air, and moisture movement',
        'Using the most expensive materials',
        'Following building codes exactly',
        'Making buildings look beautiful'
      ],
      correctAnswer: 'Understanding heat, air, and moisture movement',
      difficulty: difficulty,
      category: 'Building Science Fundamentals',
      explanation: 'Building science fundamentally involves understanding how heat, air, and moisture move through building assemblies.',
    };
    
    return NextResponse.json({
      ...fallbackQuestion,
      hostIntro: getDefaultHostIntro(level),
      hostCorrectResponse: getDefaultCorrectResponse(level),
      hostWrongResponse: getDefaultWrongResponse(level),
      hostHint: getDefaultHint(fallbackQuestion.correctAnswer),
    });

  } catch (error) {
    console.error('Static question error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch static question' },
      { status: 500 }
    );
  }
}

function getDefaultHostIntro(level: number): string {
  const prizeAmounts = [
    '$100', '$200', '$300', '$500', '$1,000',
    '$2,000', '$4,000', '$8,000', '$16,000', '$32,000',
    '$64,000', '$125,000', '$250,000', '$500,000', '$1,000,000'
  ];
  
  const amount = prizeAmounts[level - 1] || '$100';
  
  if (level === 1) {
    return `Welcome to Who Wants to be a Buildonaire! Let's start your journey with this ${amount} question!`;
  } else if (level <= 5) {
    return `Alright, for ${amount}, here's your next question...`;
  } else if (level <= 10) {
    return `The stakes are rising! For ${amount}, can you answer this?`;
  } else if (level <= 13) {
    return `We're in serious territory now! This question is worth ${amount}...`;
  } else if (level === 14) {
    return `HALF A MILLION DOLLARS! This is huge! For ${amount}...`;
  } else {
    return `ONE MILLION DOLLARS! This is it! The ultimate question for ${amount}!`;
  }
}

function getDefaultCorrectResponse(level: number): string {
  if (level <= 5) {
    return "That's RIGHT! Great job! You're building a solid foundation!";
  } else if (level <= 10) {
    return "CORRECT! You're really showing your building science expertise!";
  } else if (level <= 13) {
    return "YES! INCREDIBLE! You're demonstrating masterful knowledge!";
  } else if (level === 14) {
    return "OH MY GOODNESS! YES! You're one question away from becoming a BUILDONAIRE!";
  } else {
    return "YOU'VE DONE IT! YOU ARE A BUILDONAIRE! ABSOLUTELY INCREDIBLE!";
  }
}

function getDefaultWrongResponse(level: number): string {
  if (level <= 5) {
    return "Oh, I'm sorry, that's not correct. The right answer was [answer]. But you're learning!";
  } else if (level <= 10) {
    return "Unfortunately, that's not right. The correct answer was [answer]. You played wonderfully!";
  } else {
    return "I'm so sorry, that's not the answer. It was [answer]. You've been an amazing contestant!";
  }
}

function getDefaultHint(correctAnswer: string): string {
  return `Your expert friend thinks it might be related to ${correctAnswer.substring(0, 3)}...`;
}