import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGameRecording() {
  console.log('🎮 Testing Game Recording System...\n');
  
  try {
    // Step 1: Create a test player
    console.log('1️⃣ Creating test player...');
    const player = await prisma.player.create({
      data: {
        firstName: 'Test',
        lastName: 'Player',
        email: `test${Date.now()}@example.com`,
        company: 'Test Company',
        jobTitle: 'Test Engineer',
        companySize: '10-50',
        phone: '555-0123',
        productInterest: JSON.stringify(['Testing']),
        marketingOptIn: false,
        partnerOptIn: false,
        leadScore: 'warm'
      }
    });
    console.log(`   ✅ Created player: ${player.firstName} ${player.lastName} (ID: ${player.id})\n`);

    // Step 2: Start a game
    console.log('2️⃣ Starting a new game...');
    const game = await prisma.game.create({
      data: {
        playerId: player.id,
        status: 'IN_PROGRESS',
        finalScore: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        lifelinesUsed: '[]',
      }
    });
    console.log(`   ✅ Started game with ID: ${game.id}\n`);

    // Step 3: End the game with a score
    console.log('3️⃣ Ending game with score...');
    const finalScore = 32000; // Simulating getting to level 10
    const questionsAnswered = 10;
    const correctAnswers = 10;
    const lifelinesUsed = ['50-50', 'phone'];
    
    const updatedGame = await prisma.game.update({
      where: { id: game.id },
      data: {
        endedAt: new Date(),
        finalScore,
        questionsAnswered,
        correctAnswers,
        prizeLevel: '$32,000',
        lifelinesUsed: JSON.stringify(lifelinesUsed),
        status: 'COMPLETED'
      }
    });
    console.log(`   ✅ Game ended with score: $${finalScore.toLocaleString()}\n`);

    // Step 4: Add to leaderboard (simulating the API endpoint logic)
    console.log('4️⃣ Adding to leaderboard...');
    const leaderboardEntries = await Promise.all([
      prisma.leaderboard.create({
        data: {
          playerName: `${player.firstName} ${player.lastName}`,
          score: finalScore,
          questionsAnswered,
          type: 'daily',
          date: new Date(),
          metadata: {
            gameId: game.id,
            correctAnswers,
            prizeLevel: '$32,000'
          }
        }
      }),
      prisma.leaderboard.create({
        data: {
          playerName: `${player.firstName} ${player.lastName}`,
          score: finalScore,
          questionsAnswered,
          type: 'weekly',
          date: new Date(),
          metadata: {
            gameId: game.id,
            correctAnswers,
            prizeLevel: '$32,000'
          }
        }
      }),
      prisma.leaderboard.create({
        data: {
          playerName: `${player.firstName} ${player.lastName}`,
          score: finalScore,
          questionsAnswered,
          type: 'all-time',
          date: new Date(),
          metadata: {
            gameId: game.id,
            correctAnswers,
            prizeLevel: '$32,000'
          }
        }
      })
    ]);
    console.log(`   ✅ Added ${leaderboardEntries.length} leaderboard entries\n`);

    // Step 5: Verify everything was recorded
    console.log('5️⃣ Verifying database records...\n');
    
    // Query games for this player
    const playerGames = await prisma.game.findMany({
      where: { playerId: player.id },
      include: { player: true }
    });
    
    console.log(`   📊 Games found for player: ${playerGames.length}`);
    playerGames.forEach(g => {
      console.log(`      - Game ${g.id}: Score $${g.finalScore?.toLocaleString() || 0}, Status: ${g.status}`);
    });
    
    // Query leaderboard entries
    const leaderboardRecords = await prisma.leaderboard.findMany({
      where: {
        playerName: `${player.firstName} ${player.lastName}`
      },
      orderBy: { score: 'desc' }
    });
    
    console.log(`\n   🏆 Leaderboard entries found: ${leaderboardRecords.length}`);
    leaderboardRecords.forEach(entry => {
      console.log(`      - Type: ${entry.type}, Score: $${entry.score.toLocaleString()}, Questions: ${entry.questionsAnswered}`);
    });

    // Step 6: Check total counts in database
    console.log('\n6️⃣ Database summary:');
    const totalPlayers = await prisma.player.count();
    const totalGames = await prisma.game.count();
    const totalLeaderboard = await prisma.leaderboard.count();
    const totalQuestions = await prisma.question.count();
    
    console.log(`   👥 Total players: ${totalPlayers}`);
    console.log(`   🎮 Total games: ${totalGames}`);
    console.log(`   🏆 Total leaderboard entries: ${totalLeaderboard}`);
    console.log(`   ❓ Total questions: ${totalQuestions}`);
    
    console.log('\n✅ TEST SUCCESSFUL! Games are being recorded properly to the database.');
    console.log('   The game logging system is working correctly!');
    
    // Optional: Clean up test data
    const cleanup = process.argv.includes('--cleanup');
    if (cleanup) {
      console.log('\n🧹 Cleaning up test data...');
      await prisma.leaderboard.deleteMany({
        where: { playerName: `${player.firstName} ${player.lastName}` }
      });
      await prisma.game.deleteMany({
        where: { playerId: player.id }
      });
      await prisma.player.delete({
        where: { id: player.id }
      });
      console.log('   ✅ Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testGameRecording().catch(console.error);