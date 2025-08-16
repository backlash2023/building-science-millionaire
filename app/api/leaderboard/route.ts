import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'daily';
    const eventId = searchParams.get('eventId');
    const limit = parseInt(searchParams.get('limit') || '10');

    let startDate: Date;
    const now = new Date();
    
    switch (type) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all-time':
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Get leaderboard entries for the period
    const leaderboardEntries = await prisma.leaderboard.findMany({
      where: {
        type: type,
        date: {
          gte: startDate,
        },
        ...(eventId && { eventId }),
      },
      orderBy: [
        { score: 'desc' },
        { questionsAnswered: 'desc' },
        { date: 'asc' },
      ],
      take: limit,
    });

    // Format leaderboard data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leaderboard = leaderboardEntries.map((entry: any, index: number) => ({
      rank: index + 1,
      playerName: entry.playerName,
      company: entry.metadata?.company || 'Independent',
      score: entry.score,
      prizeLevel: entry.metadata?.prizeLevel || `$${entry.score.toLocaleString()}`,
      questionsAnswered: entry.questionsAnswered,
      correctAnswers: entry.metadata?.correctAnswers || entry.questionsAnswered,
      gameTime: entry.gameTime || 0,
      date: entry.date,
      won: entry.metadata?.won || false,
    }));

    return NextResponse.json({ 
      leaderboard,
      type,
      period: {
        start: startDate,
        end: new Date(),
      },
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}