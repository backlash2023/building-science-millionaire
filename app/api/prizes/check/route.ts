import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface PrizeTier {
  level: string;
  minScore: number;
  type: string;
  description: string;
  value?: string;
}

const PRIZE_TIERS: PrizeTier[] = [
  {
    level: 'BUILDONAIRE',
    minScore: 1000000,
    type: 'discount',
    description: '25% off Retrotec products',
    value: '25% OFF'
  },
  {
    level: 'TIER_2',
    minScore: 250000,
    type: 'merchandise',
    description: 'Branded apparel and technical guides',
    value: 'MERCH_PACK'
  },
  {
    level: 'TIER_3',
    minScore: 32000,
    type: 'swag',
    description: 'Branded promotional items',
    value: 'SWAG_PACK'
  },
  {
    level: 'PARTICIPATION',
    minScore: 0,
    type: 'entry',
    description: 'Entry into end-of-event raffle',
    value: 'RAFFLE_ENTRY'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, playerId } = body;

    if (!gameId || !playerId) {
      return NextResponse.json(
        { error: 'Game ID and Player ID are required' },
        { status: 400 }
      );
    }

    // Get the game details
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        event: true
      }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Determine prize tier based on score
    const earnedTier = PRIZE_TIERS.find(tier => game.finalScore >= tier.minScore);
    
    if (!earnedTier) {
      return NextResponse.json({ 
        prize: null,
        message: 'No prize earned for this score'
      });
    }

    // Check if player already has this prize for this event
    const existingPrize = await prisma.prize.findFirst({
      where: {
        playerId,
        eventId: game.eventId,
        type: earnedTier.type
      }
    });

    if (existingPrize) {
      return NextResponse.json({
        prize: existingPrize,
        message: 'Prize already awarded',
        isNew: false
      });
    }

    // Generate unique prize code
    const prizeCode = `${earnedTier.level}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

    // Create new prize
    const prize = await prisma.prize.create({
      data: {
        playerId,
        eventId: game.eventId,
        type: earnedTier.type,
        description: earnedTier.description,
        value: earnedTier.value,
        code: prizeCode,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months
      }
    });

    return NextResponse.json({
      prize,
      message: `Congratulations! You've won: ${earnedTier.description}`,
      isNew: true,
      tier: earnedTier.level
    });

  } catch (error) {
    console.error('Prize check error:', error);
    return NextResponse.json(
      { error: 'Failed to check prize eligibility' },
      { status: 500 }
    );
  }
}