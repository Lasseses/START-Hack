// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://start-hack-backend-867796808812.europe-west8.run.app';
const SESSION_ID = process.env.SESSION_ID || '10';
const API_KEY = process.env.API_KEY || '8917239871289129389';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    // Step 1: Create the canvas with query parameters
    const createUrl = new URL(`${BASE_URL}/canvas`);
    createUrl.searchParams.append('prompt', query);
    createUrl.searchParams.append('session_id', SESSION_ID);
    
    const createResponse = await fetch(createUrl.toString(), {
      method: 'POST',
      headers: {
        'API-KEY': API_KEY
      }
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create canvas: ${createResponse.status} ${errorText}`);
    }

    // Wait a moment for processing (adjust timing as needed)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Get the canvas result
    const getResponse = await fetch(`${BASE_URL}/canvas/${SESSION_ID}`, {
      method: 'GET',
      headers: {
        'API-KEY': API_KEY
      }
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      throw new Error(`Failed to get canvas data: ${getResponse.status} ${errorText}`);
    }

    const data = await getResponse.json();
    
    // Filter out any PIE charts from the backend data
    // Assuming data has a tiles array that contains the chart tiles
    if (data.tiles && Array.isArray(data.tiles)) {
      data.tiles = data.tiles.filter(tile => tile.type !== "PIE");
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while processing the request' },
      { status: 500 }
    );
  }
}