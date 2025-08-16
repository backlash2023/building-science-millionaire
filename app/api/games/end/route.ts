import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      gameId, 
      finalScore, 
      questionsAnswered, 
      correctAnswers,
      prizeLevel,
      lifelinesUsed = [],
      status = 'COMPLETED'
    } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    // Update game with final results
    const game = await prisma.game.update({
      where: { id: gameId },
      data: {
        endedAt: new Date(),
        finalScore,
        questionsAnswered,
        correctAnswers,
        prizeLevel,
        lifelinesUsed: JSON.stringify(lifelinesUsed),
        status
      },
      include: {
        player: true
      }
    });

    // Add to leaderboard - record all games even with $0 score
    if (game.player) {
      await prisma.leaderboard.create({
        data: {
          playerName: `${game.player.firstName} ${game.player.lastName}`,
          score: finalScore,
          questionsAnswered,
          type: 'daily',
          date: new Date(),
          metadata: {
            gameId: gameId,
            correctAnswers,
            prizeLevel
          }
        }
      });

      // Also add to weekly and all-time
      await prisma.leaderboard.create({
        data: {
          playerName: `${game.player.firstName} ${game.player.lastName}`,
          score: finalScore,
          questionsAnswered,
          type: 'weekly',
          date: new Date(),
          metadata: {
            gameId: gameId,
            correctAnswers,
            prizeLevel
          }
        }
      });

      await prisma.leaderboard.create({
        data: {
          playerName: `${game.player.firstName} ${game.player.lastName}`,
          score: finalScore,
          questionsAnswered,
          type: 'all-time',
          date: new Date(),
          metadata: {
            gameId: gameId,
            correctAnswers,
            prizeLevel
          }
        }
      });
    }

    return NextResponse.json({ 
      game,
      message: 'Game ended successfully' 
    });

  } catch (error) {
    console.error('End game error:', error);
    return NextResponse.json(
      { error: 'Failed to end game' },
      { status: 500 }
    );
  }
}