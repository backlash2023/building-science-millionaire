import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      firstName, 
      lastName, 
      email, 
      company, 
      jobTitle,
      companySize,
      phone,
      productInterest = [],
      marketingOptIn = false,
      partnerOptIn = false
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Check if player already exists
    const existingPlayer = await prisma.player.findUnique({
      where: { email }
    });

    if (existingPlayer) {
      // Update existing player
      const updatedPlayer = await prisma.player.update({
        where: { email },
        data: {
          firstName,
          lastName,
          company: company || null,
          jobTitle: jobTitle || null,
          companySize: companySize || null,
          phone: phone || null,
          productInterest: Array.isArray(productInterest) 
            ? JSON.stringify(productInterest) 
            : productInterest || null,
          marketingOptIn,
          partnerOptIn,
        }
      });
      
      return NextResponse.json({ 
        id: updatedPlayer.id,
        player: updatedPlayer,
        isNewPlayer: false 
      });
    }

    // Create new player
    const newPlayer = await prisma.player.create({
      data: {
        firstName,
        lastName,
        email,
        company: company || null,
        jobTitle: jobTitle || null,
        companySize: companySize || null,
        phone: phone || null,
        productInterest: Array.isArray(productInterest) 
          ? JSON.stringify(productInterest) 
          : productInterest || null,
        marketingOptIn,
        partnerOptIn,
        leadScore: 'cool', // Default lead score
      }
    });

    return NextResponse.json({ 
      id: newPlayer.id,
      player: newPlayer,
      isNewPlayer: true 
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register player' },
      { status: 500 }
    );
  }
}