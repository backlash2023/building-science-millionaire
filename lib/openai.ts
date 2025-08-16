import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
}

const CATEGORIES = [
  'HVAC Systems',
  'Insulation & Air Sealing',
  'Energy Efficiency',
  'Building Codes & Standards',
  'Moisture Control',
  'Ventilation & Indoor Air Quality',
  'Building Materials',
  'Renewable Energy Systems',
];

const DIFFICULTY_PROMPTS = {
  easy: 'Create a basic building science question suitable for beginners. Focus on fundamental terminology and concepts.',
  medium: 'Create an intermediate building science question requiring applied knowledge and understanding of common practices.',
  hard: 'Create a challenging building science question involving technical specifications, calculations, or complex scenarios.',
  expert: 'Create an expert-level building science question covering advanced theory, edge cases, or specialized knowledge.',
};

export async function generateQuestion(
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
  excludeQuestions: string[] = []
): Promise<GeneratedQuestion> {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  
  const excludeText = excludeQuestions.length > 0 
    ? `\n\nDo not create questions similar to these already asked:\n${excludeQuestions.join('\n')}`
    : '';

  const prompt = `You are an expert in building science and energy efficiency. ${DIFFICULTY_PROMPTS[difficulty]}

Category: ${category}

Create a multiple-choice question with exactly 4 options. The question should be relevant to building science professionals, contractors, and energy auditors.

Format your response as JSON with this structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The correct option text (must match one of the options exactly)",
  "explanation": "A brief explanation of why this is the correct answer and educational context",
  "category": "${category}"
}

Make sure the question is:
- Technically accurate
- Relevant to real-world building science applications
- Clear and unambiguous
- Educational and informative${excludeText}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a building science expert creating educational quiz questions. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const questionData = JSON.parse(content) as GeneratedQuestion;
    
    // Validate the response
    if (!questionData.question || 
        !Array.isArray(questionData.options) || 
        questionData.options.length !== 4 ||
        !questionData.correctAnswer ||
        !questionData.options.includes(questionData.correctAnswer)) {
      throw new Error('Invalid question format received from OpenAI');
    }

    return questionData;
  } catch (error) {
    console.error('Error generating question:', error);
    // Fallback to a default question if OpenAI fails
    return getFallbackQuestion(difficulty);
  }
}

function getFallbackQuestion(difficulty: string): GeneratedQuestion {
  // Fallback questions for when OpenAI is unavailable
  const fallbackQuestions: Record<string, GeneratedQuestion> = {
    easy: {
      question: 'What does HVAC stand for?',
      options: [
        'Heating, Ventilation, and Air Conditioning',
        'High Voltage Alternating Current',
        'Home Ventilation and Cooling',
        'Heat, Vapor, and Air Control'
      ],
      correctAnswer: 'Heating, Ventilation, and Air Conditioning',
      explanation: 'HVAC stands for Heating, Ventilation, and Air Conditioning - the technology of indoor environmental comfort.',
      category: 'HVAC Systems',
    },
    medium: {
      question: 'What is the recommended R-value for attic insulation in Climate Zone 5?',
      options: ['R-30', 'R-38', 'R-49', 'R-60'],
      correctAnswer: 'R-49',
      explanation: 'The Department of Energy recommends R-49 insulation for attics in Climate Zone 5 to ensure optimal energy efficiency.',
      category: 'Insulation & Air Sealing',
    },
    hard: {
      question: 'What is the typical air change rate target for a Passive House?',
      options: [
        '0.6 ACH50 or less',
        '3.0 ACH50 or less',
        '5.0 ACH50 or less',
        '7.0 ACH50 or less'
      ],
      correctAnswer: '0.6 ACH50 or less',
      explanation: 'Passive House standards require extremely tight building envelopes with air change rates of 0.6 ACH50 or less.',
      category: 'Building Codes & Standards',
    },
    expert: {
      question: 'In a blower door test, what does a reading of 1,200 CFM50 indicate for a 2,000 sq ft home with 8 ft ceilings?',
      options: [
        '4.5 ACH50 - very tight',
        '4.5 ACH50 - moderately tight',
        '4.5 ACH50 - average',
        '4.5 ACH50 - leaky'
      ],
      correctAnswer: '4.5 ACH50 - moderately tight',
      explanation: 'CFM50 / (Volume × 60) = ACH50. 1,200 / (16,000 × 60) = 4.5 ACH50, which is considered moderately tight for existing homes.',
      category: 'Energy Efficiency',
    },
  };

  return fallbackQuestions[difficulty] || fallbackQuestions.easy;
}