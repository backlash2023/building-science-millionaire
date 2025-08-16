import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'echo', speed = 1.0 } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'TTS service not configured' },
        { status: 500 }
      );
    }

    // Create speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts', // Use the new GPT-4o mini TTS model
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      speed: speed,
    });

    // Get the audio data as an ArrayBuffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Return the audio file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}

// Pre-cache common phrases
export async function GET(_request: NextRequest) {
  const commonPhrases = [
    "Is that your final answer?",
    "Correct!",
    "I'm sorry, that's incorrect.",
    "Let's play Who Wants to be a Buildonaire!",
    "You've won one million dollars!",
    "Would you like to use a lifeline?",
    "The audience has voted.",
    "Your friend is on the line.",
    "Computer, please remove two wrong answers.",
    "Remember, you can walk away at any time.",
  ];

  return NextResponse.json({ 
    phrases: commonPhrases,
    voice: 'echo',
    model: 'tts-1'
  });
}