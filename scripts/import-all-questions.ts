import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ParsedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
}

function parseQuestions(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const lines = content.split('\n');
  
  let currentQuestion: Partial<ParsedQuestion> | null = null;
  let inOptions = false;
  let options: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and headers
    if (!line || line.startsWith('===') || line.startsWith('BUILDING SCIENCE')) {
      continue;
    }
    
    // New question starts
    if (line.match(/^\d+\.\s+Question:/)) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.question) {
        if (options.length > 0) {
          currentQuestion.options = options;
        }
        questions.push(currentQuestion as ParsedQuestion);
      }
      
      // Start new question
      currentQuestion = {};
      currentQuestion.question = line.replace(/^\d+\.\s+Question:\s*/, '');
      inOptions = true;
      options = [];
    }
    // Option lines
    else if (inOptions && line.match(/^[A-D]\)/)) {
      const optionText = line.replace(/^[A-D]\)\s*/, '');
      options.push(optionText);
    }
    // Answer line
    else if (line.startsWith('Answer:')) {
      inOptions = false;
      if (currentQuestion) {
        const answerMatch = line.match(/Answer:\s*[A-D]\)\s*(.+)/);
        if (answerMatch) {
          currentQuestion.correctAnswer = answerMatch[1];
        }
      }
    }
    // Explanation line
    else if (line.startsWith('Explanation:')) {
      if (currentQuestion) {
        currentQuestion.explanation = line.replace(/^Explanation:\s*/, '');
      }
    }
    // Category line
    else if (line.startsWith('Category:')) {
      if (currentQuestion) {
        currentQuestion.category = line.replace(/^Category:\s*/, '');
      }
    }
    // Difficulty line
    else if (line.startsWith('Difficulty:')) {
      if (currentQuestion) {
        const difficultyText = line.replace(/^Difficulty:\s*/, '').toLowerCase();
        // Map text difficulties to our schema
        if (difficultyText.includes('easy')) {
          currentQuestion.difficulty = 'easy';
        } else if (difficultyText.includes('medium')) {
          currentQuestion.difficulty = 'medium';
        } else if (difficultyText.includes('hard')) {
          currentQuestion.difficulty = 'hard';
        } else if (difficultyText.includes('expert')) {
          currentQuestion.difficulty = 'expert';
        } else {
          // Default based on context
          currentQuestion.difficulty = 'medium';
        }
      }
    }
  }
  
  // Don't forget the last question
  if (currentQuestion && currentQuestion.question) {
    if (options.length > 0) {
      currentQuestion.options = options;
    }
    questions.push(currentQuestion as ParsedQuestion);
  }
  
  return questions;
}

async function importQuestions() {
  try {
    console.log('🗑️  Clearing existing questions...');
    await prisma.question.deleteMany();
    
    console.log('📖 Reading questions file...');
    const filePath = path.join(process.cwd(), 'building_science_questions.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    console.log('🔍 Parsing questions...');
    const questions = parseQuestions(content);
    console.log(`Found ${questions.length} questions to import`);
    
    // Group by difficulty for reporting
    const byDifficulty = questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Distribution by difficulty:', byDifficulty);
    
    console.log('💾 Importing questions to database...');
    
    // Import questions in batches
    const batchSize = 10;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(q => 
          prisma.question.create({
            data: {
              question: q.question,
              options: JSON.stringify(q.options),
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || 'No explanation provided.',
              difficulty: q.difficulty,
              category: q.category || 'General',
              source: 'manual',
              timesUsed: 0,
              correctRate: 0
            }
          })
        )
      );
      
      console.log(`Imported ${Math.min(i + batchSize, questions.length)}/${questions.length} questions...`);
    }
    
    console.log('✅ Successfully imported all questions!');
    
    // Verify import
    const count = await prisma.question.count();
    console.log(`Total questions in database: ${count}`);
    
    const distribution = await prisma.question.groupBy({
      by: ['difficulty'],
      _count: true
    });
    
    console.log('\nFinal distribution:');
    distribution.forEach(d => {
      console.log(`  ${d.difficulty}: ${d._count} questions`);
    });
    
  } catch (error) {
    console.error('❌ Error importing questions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importQuestions();