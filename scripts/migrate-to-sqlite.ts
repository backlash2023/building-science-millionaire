import { prisma } from '../lib/prisma';

// Static questions from the fallback system
const STATIC_QUESTIONS = [
  {
    question: 'What does HVAC stand for?',
    options: [
      'Heating, Ventilation, and Air Conditioning',
      'High Voltage Alternating Current',
      'Home Ventilation and Cooling',
      'Heat, Vapor, and Air Control'
    ],
    correctAnswer: 'Heating, Ventilation, and Air Conditioning',
    difficulty: 'easy',
    category: 'HVAC Systems',
    explanation: 'HVAC stands for Heating, Ventilation, and Air Conditioning - the technology of indoor environmental comfort.',
  },
  {
    question: 'What is the primary purpose of a vapor barrier?',
    options: [
      'To prevent moisture migration',
      'To increase R-value',
      'To reduce air leakage',
      'To reflect heat'
    ],
    correctAnswer: 'To prevent moisture migration',
    difficulty: 'easy',
    category: 'Moisture Control',
    explanation: 'Vapor barriers are designed to prevent moisture from migrating through building assemblies, which can cause condensation and damage.',
  },
  {
    question: 'What is the R-value of a building material?',
    options: [
      'A measure of thermal resistance',
      'A measure of structural strength',
      'A measure of moisture permeability',
      'A measure of air leakage'
    ],
    correctAnswer: 'A measure of thermal resistance',
    difficulty: 'easy',
    category: 'Insulation',
    explanation: 'R-value measures a material\'s resistance to heat flow. Higher R-values indicate better insulating properties.',
  },
  {
    question: 'Which building envelope component is most critical for air sealing?',
    options: [
      'The air barrier system',
      'Insulation only',
      'Windows and doors',
      'Roof shingles'
    ],
    correctAnswer: 'The air barrier system',
    difficulty: 'medium',
    category: 'Air Sealing',
    explanation: 'A continuous air barrier system is essential for preventing uncontrolled air movement through the building envelope.',
  },
  {
    question: 'What is the recommended minimum ventilation rate for most homes?',
    options: [
      '0.35 air changes per hour',
      '1.0 air changes per hour', 
      '2.0 air changes per hour',
      '0.1 air changes per hour'
    ],
    correctAnswer: '0.35 air changes per hour',
    difficulty: 'medium',
    category: 'Ventilation',
    explanation: 'ASHRAE 62.2 recommends a minimum of 0.35 ACH for residential ventilation to maintain indoor air quality.',
  },
  {
    question: 'What is the dewpoint temperature?',
    options: [
      'The temperature at which water vapor condenses',
      'The lowest outdoor temperature recorded',
      'The temperature inside insulation',
      'The maximum indoor temperature allowed'
    ],
    correctAnswer: 'The temperature at which water vapor condenses',
    difficulty: 'medium',
    category: 'Building Physics',
    explanation: 'Dewpoint is the temperature at which air becomes saturated and water vapor begins to condense into liquid water.',
  },
  {
    question: 'Which type of thermal bridge has the greatest impact on building performance?',
    options: [
      'Structural thermal bridges',
      'Installation thermal bridges',
      'Material thermal bridges',
      'Geometric thermal bridges'
    ],
    correctAnswer: 'Structural thermal bridges',
    difficulty: 'hard',
    category: 'Thermal Performance',
    explanation: 'Structural thermal bridges, like steel studs or concrete balconies, create significant heat transfer paths that dramatically reduce insulation effectiveness.',
  },
  {
    question: 'What is the primary mechanism of heat transfer through windows?',
    options: [
      'A combination of conduction, convection, and radiation',
      'Conduction only',
      'Radiation only', 
      'Convection only'
    ],
    correctAnswer: 'A combination of conduction, convection, and radiation',
    difficulty: 'hard',
    category: 'Windows and Glazing',
    explanation: 'Heat transfer through windows occurs via all three mechanisms: conduction through the frame and glass, convection in air spaces, and radiation through the glazing.',
  },
  {
    question: 'Which blower door test result indicates the tightest building envelope?',
    options: [
      '1.5 ACH50',
      '5.0 ACH50',
      '10.0 ACH50', 
      '15.0 ACH50'
    ],
    correctAnswer: '1.5 ACH50',
    difficulty: 'hard',
    category: 'Air Leakage Testing',
    explanation: 'ACH50 measures air changes per hour at 50 Pascal pressure difference. Lower numbers indicate tighter envelopes, with 1.5 ACH50 being very tight.',
  },
  {
    question: 'In Passive House standard, what is the maximum allowable space heating energy demand?',
    options: [
      '15 kWh/m²/year',
      '30 kWh/m²/year',
      '60 kWh/m²/year',
      '120 kWh/m²/year'
    ],
    correctAnswer: '15 kWh/m²/year',
    difficulty: 'expert',
    category: 'Passive House',
    explanation: 'The Passive House standard requires space heating energy demand not exceed 15 kWh per square meter per year, along with other strict performance criteria.',
  },
  {
    question: 'What is the most effective strategy for preventing interstitial condensation in walls?',
    options: [
      'Control vapor drive and maintain warm-side vapor control',
      'Install more insulation',
      'Use only vapor-permeable materials',
      'Increase indoor humidity levels'
    ],
    correctAnswer: 'Control vapor drive and maintain warm-side vapor control',
    difficulty: 'expert',
    category: 'Advanced Building Physics',
    explanation: 'Preventing interstitial condensation requires understanding vapor drive direction and implementing appropriate vapor control strategies on the warm side of the assembly.',
  },
  {
    question: 'Which factor has the greatest impact on whole-building energy performance?',
    options: [
      'Building envelope thermal performance',
      'HVAC equipment efficiency alone',
      'Window area only',
      'Interior finishes'
    ],
    correctAnswer: 'Building envelope thermal performance',
    difficulty: 'expert',
    category: 'Whole Building Performance',
    explanation: 'While all factors matter, the building envelope\'s thermal performance (insulation, air sealing, thermal bridging) typically has the greatest impact on overall energy consumption.',
  },
  {
    question: 'What is hygrothermal analysis used for in building science?',
    options: [
      'Predicting moisture and temperature conditions in building assemblies',
      'Calculating structural loads only',
      'Determining paint colors',
      'Measuring sound transmission'
    ],
    correctAnswer: 'Predicting moisture and temperature conditions in building assemblies',
    difficulty: 'expert',
    category: 'Building Analysis',
    explanation: 'Hygrothermal analysis models heat and moisture transport through building materials to predict potential condensation, drying, and durability issues.',
  },
  {
    question: 'In the context of airtightness testing, what does "n50" represent?',
    options: [
      'Air change rate at 50 Pascal pressure difference',
      'Air change rate at natural conditions',
      'Number of air leakage paths found',
      'Natural ventilation rate'
    ],
    correctAnswer: 'Air change rate at 50 Pascal pressure difference',
    difficulty: 'expert',
    category: 'Building Testing',
    explanation: 'n50 or ACH50 represents the number of air changes per hour when the building is pressurized or depressurized to 50 Pascals, used as a standard measure of building airtightness.',
  },
  {
    question: 'What is the most critical factor when designing a rainscreen wall system?',
    options: [
      'Providing a continuous drainage plane and ventilation',
      'Using the most expensive materials',
      'Making it completely vapor impermeable',
      'Maximizing insulation thickness only'
    ],
    correctAnswer: 'Providing a continuous drainage plane and ventilation',
    difficulty: 'expert',
    category: 'Water Management',
    explanation: 'Rainscreen systems rely on a continuous drainage plane behind the cladding and adequate ventilation to allow moisture to drain and dry, preventing water damage to the structure.',
  }
];

async function migrateToSQLite() {
  console.log('🗄️  Migrating questions to SQLite database...\n');
  
  try {
    // Clear existing questions from manual source
    console.log('🧹 Clearing existing static questions...');
    await prisma.question.deleteMany({
      where: {
        source: 'manual'
      }
    });
    
    let successCount = 0;
    
    // Insert all static questions
    console.log(`📝 Inserting ${STATIC_QUESTIONS.length} questions...`);
    
    for (const question of STATIC_QUESTIONS) {
      try {
        await prisma.question.create({
          data: {
            question: question.question,
            options: JSON.stringify(question.options),
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            category: question.category,
            source: 'manual'
          }
        });
        successCount++;
      } catch (error) {
        console.error(`❌ Error inserting question: ${question.question.substring(0, 50)}...`, error);
      }
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`   📊 Successfully inserted: ${successCount} questions`);
    console.log(`   ❌ Failed: ${STATIC_QUESTIONS.length - successCount} questions`);
    
    // Verify the data
    const totalQuestions = await prisma.question.count();
    const manualQuestions = await prisma.question.count({
      where: { source: 'manual' }
    });
    
    console.log(`\n🔍 Database verification:`);
    console.log(`   📊 Total questions in database: ${totalQuestions}`);
    console.log(`   📝 Manual/static questions: ${manualQuestions}`);
    
    // Test retrieving a question
    const testQuestion = await prisma.question.findFirst({
      where: { source: 'manual' }
    });
    
    if (testQuestion) {
      console.log(`\n🎯 Test question retrieved successfully:`);
      console.log(`   Question: ${testQuestion.question.substring(0, 50)}...`);
      console.log(`   Difficulty: ${testQuestion.difficulty}`);
      console.log(`   Category: ${testQuestion.category}`);
    }
    
    console.log('\n🎉 SQLite migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateToSQLite().catch(console.error);