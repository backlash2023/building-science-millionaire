import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, eventId } = body;

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId }
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Create new game
    const game = await prisma.game.create({
      data: {
        playerId,
        eventId,
        status: 'IN_PROGRESS',
        finalScore: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        lifelinesUsed: JSON.stringify([]),
      },
      include: {
        player: true,
      }
    });

    return NextResponse.json({ game });

  } catch (error) {
    console.error('Start game error:', error);
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
}