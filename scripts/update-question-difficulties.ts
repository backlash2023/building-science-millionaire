import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateQuestionDifficulties() {
  console.log('🔧 Updating question difficulties based on building science expert analysis...\n');
  
  try {
    // STEP 1: Reclassify easy questions that are too technical
    console.log('1️⃣ Reclassifying overly technical "easy" questions to "medium"...');
    
    const easyToMedium = [
      { 
        id: 'cme288akv00013zpt4cqgy1bc',
        reason: 'CFM25 and ACH50 metrics are too advanced for basic level'
      },
      {
        id: 'cme288b3q002h3zptj9wycluk',
        reason: 'RESNET grading standards are professional knowledge'
      },
      {
        id: 'cme288b3q002e3zpt2kwcluoc',
        reason: 'Building envelope performance is an intermediate concept'
      }
    ];

    for (const item of easyToMedium) {
      const result = await prisma.question.updateMany({
        where: { id: item.id },
        data: { difficulty: 'medium' }
      });
      if (result.count > 0) {
        console.log(`   ✅ Updated: ${item.reason}`);
      }
    }

    // STEP 2: Reclassify medium questions that are actually hard
    console.log('\n2️⃣ Reclassifying advanced "medium" questions to "hard"...');
    
    const mediumToHard = [
      {
        id: 'cme288amw000b3zpt5u4qjolb',
        reason: 'Psychrometrics requires deep understanding'
      },
      {
        id: 'cme288amx000f3zptepdsn69k',
        reason: 'Thermal bridging calculations are advanced'
      },
      {
        id: 'cme288amx000g3zptktdm12rw',
        reason: 'Climate-specific moisture strategies require expertise'
      }
    ];

    for (const item of mediumToHard) {
      const result = await prisma.question.updateMany({
        where: { id: item.id },
        data: { difficulty: 'hard' }
      });
      if (result.count > 0) {
        console.log(`   ✅ Updated: ${item.reason}`);
      }
    }

    // STEP 3: Reclassify hard questions that are expert-level
    console.log('\n3️⃣ Reclassifying specialized "hard" questions to "expert"...');
    
    const hardToExpert = [
      {
        id: 'cme288apj000k3zptg1rtkibr',
        reason: 'Advanced psychrometric calculations'
      },
      {
        id: 'cme288apj000m3zptk51jkkkf',
        reason: 'Highly specific RESNET-380 standard knowledge'
      }
    ];

    for (const item of hardToExpert) {
      const result = await prisma.question.updateMany({
        where: { id: item.id },
        data: { difficulty: 'expert' }
      });
      if (result.count > 0) {
        console.log(`   ✅ Updated: ${item.reason}`);
      }
    }

    // STEP 4: Fix technical corrections
    console.log('\n4️⃣ Applying technical corrections...');
    
    await prisma.question.updateMany({
      where: { id: 'cme288akw00053zpta6flwi84' },
      data: { 
        explanation: 'Closed-cell spray foam typically provides R-6 to R-7 per inch, making it one of the highest R-value per inch insulations commonly available.'
      }
    });
    console.log('   ✅ Corrected spray foam R-value explanation');

    await prisma.question.updateMany({
      where: { id: 'cme288atz00153zptwqvkv0f7' },
      data: { 
        explanation: 'Most of Florida is in Climate Zone 2A (hot-humid), though the southernmost areas are in Zone 1A.'
      }
    });
    console.log('   ✅ Clarified Florida climate zone explanation');

    // STEP 5: Add new basic questions
    console.log('\n5️⃣ Adding new basic questions for early game levels...');
    
    const newBasicQuestions = [
      {
        question: 'What does BTU stand for?',
        options: ['British Thermal Unit', 'Building Temperature Unit', 'Basic Thermal Utility', 'Better Temperature Unit'],
        correctAnswer: 'British Thermal Unit',
        explanation: 'BTU is the standard measure of thermal energy in building science.',
        difficulty: 'easy',
        category: 'HVAC Systems'
      },
      {
        question: 'Which direction should vapor barriers typically face in cold climates?',
        options: ['Toward the interior', 'Toward the exterior', "It doesn't matter", 'Never use vapor barriers'],
        correctAnswer: 'Toward the interior',
        explanation: 'In cold climates, vapor barriers should face the warm (interior) side to prevent warm, moist air from reaching the cold exterior and condensing.',
        difficulty: 'easy',
        category: 'Moisture Control'
      },
      {
        question: 'What is the most common cause of high energy bills in homes?',
        options: ['Air leaks', 'Poor insulation', 'Old appliances', 'Oversized HVAC systems'],
        correctAnswer: 'Air leaks',
        explanation: 'Air leaks are typically the #1 cause of energy waste in residential buildings.',
        difficulty: 'easy',
        category: 'Energy Efficiency'
      },
      {
        question: 'What does "conditioned space" mean in building science?',
        options: ['Heated and cooled space', 'Any space with windows', 'Space above ground', 'Space with insulation'],
        correctAnswer: 'Heated and cooled space',
        explanation: 'Conditioned space refers to areas that are intentionally heated and cooled for occupant comfort.',
        difficulty: 'easy',
        category: 'HVAC Systems'
      }
    ];

    for (const q of newBasicQuestions) {
      await prisma.question.create({
        data: {
          question: q.question,
          options: JSON.stringify(q.options), // Convert array to JSON string for SQLite
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          category: q.category,
          source: 'building-science-expert',
          timesUsed: 0,
          correctRate: 0
        }
      });
      console.log(`   ✅ Added: "${q.question}"`);
    }

    // STEP 6: Show final distribution
    console.log('\n📊 Final Question Distribution:');
    
    const distribution = await prisma.question.groupBy({
      by: ['difficulty'],
      _count: true,
      orderBy: {
        difficulty: 'asc'
      }
    });

    const difficultyOrder = ['easy', 'medium', 'hard', 'expert'];
    const sortedDistribution = distribution.sort((a, b) => 
      difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty)
    );

    const total = sortedDistribution.reduce((sum, d) => sum + d._count, 0);
    
    for (const dist of sortedDistribution) {
      const percentage = Math.round((dist._count / total) * 100);
      const bar = '█'.repeat(Math.floor(percentage / 2));
      console.log(`   ${dist.difficulty.padEnd(8)}: ${dist._count.toString().padStart(3)} questions (${percentage}%) ${bar}`);
    }

    console.log('\n✅ Question difficulty updates complete!');
    console.log('   The game now has proper difficulty progression for levels 1-15.');
    
  } catch (error) {
    console.error('❌ Error updating questions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateQuestionDifficulties().catch(console.error);