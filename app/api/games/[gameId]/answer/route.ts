import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PRIZE_AMOUNTS = [
  100, 200, 300, 500, 1000, 2000, 4000, 8000, 
  16000, 32000, 64000, 125000, 250000, 500000, 1000000
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { 
      questionNumber, 
      question, 
      options, 
      correctAnswer, 
      selectedAnswer, 
      timeSpent, 
      difficulty, 
      category,
      lifelineUsed 
    } = body;

    // Get the game
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { questions: true }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Game is not in progress' },
        { status: 400 }
      );
    }

    // Check if answer is correct
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Create game question record
    const gameQuestion = await prisma.gameQuestion.create({
      data: {
        gameId,
        questionNumber,
        question,
        options,
        correctAnswer,
        selectedAnswer,
        isCorrect,
        timeSpent,
        difficulty,
        category,
        lifelineUsed,
        answeredAt: new Date(),
      }
    });

    // Update lifelines used
    const currentLifelines = game.lifelinesUsed ? JSON.parse(game.lifelinesUsed) : [];
    const lifelinesUsed = lifelineUsed 
      ? [...currentLifelines, lifelineUsed]
      : currentLifelines;

    // Update game state
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        questionsAnswered: game.questionsAnswered + 1,
        correctAnswers: isCorrect ? game.correctAnswers + 1 : game.correctAnswers,
        finalScore: isCorrect && questionNumber > 0 ? PRIZE_AMOUNTS[questionNumber - 1] : game.finalScore,
        prizeLevel: isCorrect && questionNumber > 0 ? `$${PRIZE_AMOUNTS[questionNumber - 1].toLocaleString()}` : game.prizeLevel,
        lifelinesUsed: JSON.stringify(lifelinesUsed),
        status: !isCorrect ? 'COMPLETED' : (questionNumber === 15 && isCorrect ? 'WON' : 'IN_PROGRESS'),
        endedAt: !isCorrect || (questionNumber === 15 && isCorrect) ? new Date() : null,
      }
    });

    // Update lead score based on performance
    if (!isCorrect || questionNumber === 15) {
      let leadScore = 'cool';
      if (game.correctAnswers >= 10) leadScore = 'hot';
      else if (game.correctAnswers >= 5) leadScore = 'warm';
      
      await prisma.player.update({
        where: { id: game.playerId },
        data: { leadScore }
      });
    }

    return NextResponse.json({ 
      gameQuestion,
      game: updatedGame,
      isCorrect,
      gameOver: !isCorrect || (questionNumber === 15 && isCorrect),
      won: questionNumber === 15 && isCorrect
    });

  } catch (error) {
    console.error('Answer submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}