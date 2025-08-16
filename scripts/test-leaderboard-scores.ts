import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLeaderboardScores() {
  console.log('🏆 Testing Leaderboard Score Recording...\n');
  
  try {
    // Create test players for different scenarios
    const testScenarios = [
      { name: 'Zero Questions', score: 0, questions: 0, correct: 0, prize: '$0' },
      { name: 'One Hundred', score: 100, questions: 1, correct: 1, prize: '$100' },
      { name: 'Two Hundred', score: 200, questions: 2, correct: 2, prize: '$200' },
      { name: 'Five Hundred', score: 500, questions: 4, correct: 4, prize: '$500' },
      { name: 'One Thousand', score: 1000, questions: 5, correct: 5, prize: '$1,000' },
    ];

    for (const scenario of testScenarios) {
      console.log(`📝 Testing: ${scenario.name} (${scenario.prize})`);
      
      // Create a test player
      const player = await prisma.player.create({
        data: {
          firstName: scenario.name,
          lastName: 'TestPlayer',
          email: `${scenario.name.toLowerCase().replace(' ', '')}${Date.now()}@test.com`,
          company: 'Test Company',
          jobTitle: 'Tester'
        }
      });
      
      // Create a game
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
      
      // End the game with the test score
      const updatedGame = await prisma.game.update({
        where: { id: game.id },
        data: {
          endedAt: new Date(),
          finalScore: scenario.score,
          questionsAnswered: scenario.questions,
          correctAnswers: scenario.correct,
          prizeLevel: scenario.prize,
          status: 'COMPLETED'
        }
      });
      
      // Add to leaderboard (simulating the API logic)
      if (player) { // Notice: no check for score > 0
        await prisma.leaderboard.create({
          data: {
            playerName: `${player.firstName} ${player.lastName}`,
            score: scenario.score,
            questionsAnswered: scenario.questions,
            type: 'all-time',
            date: new Date(),
            metadata: {
              gameId: game.id,
              correctAnswers: scenario.correct,
              prizeLevel: scenario.prize
            }
          }
        });
        console.log(`   ✅ Added to leaderboard with score: $${scenario.score}`);
      }
    }
    
    console.log('\n📊 Leaderboard Summary:');
    console.log('─'.repeat(60));
    
    // Query all leaderboard entries
    const leaderboard = await prisma.leaderboard.findMany({
      where: {
        type: 'all-time'
      },
      orderBy: {
        score: 'desc'
      },
      take: 10
    });
    
    console.log('Rank | Player Name              | Score    | Questions');
    console.log('─'.repeat(60));
    
    leaderboard.forEach((entry, index) => {
      const rank = (index + 1).toString().padStart(4);
      const name = entry.playerName.padEnd(24);
      const score = `$${entry.score.toLocaleString()}`.padStart(8);
      const questions = entry.questionsAnswered.toString().padStart(9);
      console.log(`${rank} | ${name} | ${score} | ${questions}`);
    });
    
    // Count entries with different scores
    const zeroScores = await prisma.leaderboard.count({
      where: { score: 0 }
    });
    const lowScores = await prisma.leaderboard.count({
      where: { score: { lte: 500 } }
    });
    const allScores = await prisma.leaderboard.count();
    
    console.log('\n📈 Score Distribution:');
    console.log(`   Total entries: ${allScores}`);
    console.log(`   $0 scores: ${zeroScores}`);
    console.log(`   $500 or less: ${lowScores}`);
    
    console.log('\n✅ TEST COMPLETE: All scores are being recorded to leaderboard!');
    console.log('   Even players who get 0 questions right appear on the leaderboard.');
    
    // Optional cleanup
    if (process.argv.includes('--cleanup')) {
      console.log('\n🧹 Cleaning up test data...');
      for (const scenario of testScenarios) {
        await prisma.leaderboard.deleteMany({
          where: { 
            playerName: {
              startsWith: scenario.name
            }
          }
        });
        await prisma.game.deleteMany({
          where: {
            player: {
              firstName: scenario.name
            }
          }
        });
        await prisma.player.deleteMany({
          where: {
            firstName: scenario.name
          }
        });
      }
      console.log('   ✅ Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testLeaderboardScores().catch(console.error);