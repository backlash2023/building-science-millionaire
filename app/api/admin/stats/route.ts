import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch statistics
    const [
      totalPlayers,
      todayPlayers,
      totalGames,
      todayGames,
      leadsWithOptIn,
      prizesAwarded,
      averageScoreResult
    ] = await Promise.all([
      prisma.player.count(),
      prisma.player.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.game.count(),
      prisma.game.count({
        where: {
          startedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.player.count({
        where: {
          marketingOptIn: true
        }
      }),
      prisma.prize.count({
        where: {
          claimed: true
        }
      }),
      prisma.game.aggregate({
        _avg: {
          finalScore: true
        },
        where: {
          status: {
            in: ['COMPLETED', 'WON']
          }
        }
      })
    ]);

    // Get lead score distribution
    const leadScores = await prisma.player.groupBy({
      by: ['leadScore'],
      _count: true
    });

    // Get recent games for activity monitoring
    const recentGames = await prisma.game.findMany({
      take: 10,
      orderBy: {
        startedAt: 'desc'
      },
      include: {
        player: {
          select: {
            firstName: true,
            lastName: true,
            company: true
          }
        }
      }
    });

    return NextResponse.json({
      totalPlayers,
      todayPlayers,
      totalGames,
      todayGames,
      leadsGenerated: leadsWithOptIn,
      prizesAwarded,
      averageScore: Math.round(averageScoreResult._avg.finalScore || 0),
      leadScores: {
        hot: leadScores.find(ls => ls.leadScore === 'hot')?._count || 0,
        warm: leadScores.find(ls => ls.leadScore === 'warm')?._count || 0,
        cool: leadScores.find(ls => ls.leadScore === 'cool')?._count || 0,
      },
      recentGames: recentGames.map(game => ({
        id: game.id,
        player: `${game.player.firstName} ${game.player.lastName.charAt(0)}.`,
        company: game.player.company,
        score: game.finalScore,
        status: game.status,
        startedAt: game.startedAt
      }))
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}