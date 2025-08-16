import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch all players with their game stats
    const players = await prisma.player.findMany({
      include: {
        games: {
          select: {
            finalScore: true,
            status: true,
            questionsAnswered: true,
            correctAnswers: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format data for CSV
    const csvData = players.map(player => {
      const bestGame = player.games.reduce((best, game) => 
        game.finalScore > (best?.finalScore || 0) ? game : best, 
        player.games[0]
      );
      
      return {
        firstName: player.firstName,
        lastName: player.lastName,
        email: player.email,
        company: player.company || '',
        jobTitle: player.jobTitle || '',
        companySize: player.companySize || '',
        phone: player.phone || '',
        marketingOptIn: player.marketingOptIn ? 'Yes' : 'No',
        partnerOptIn: player.partnerOptIn ? 'Yes' : 'No',
        leadScore: player.leadScore || '',
        gamesPlayed: player.games.length,
        bestScore: bestGame?.finalScore || 0,
        registeredAt: player.createdAt.toISOString(),
      };
    });

    // Convert to CSV string
    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    // Return as downloadable CSV
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Export leads error:', error);
    return NextResponse.json(
      { error: 'Failed to export leads' },
      { status: 500 }
    );
  }
}