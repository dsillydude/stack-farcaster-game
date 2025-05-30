// API route for handling frame interactions
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Handle frame interaction
    // In a real implementation, you might want to validate the request
    // and handle different button actions

    // For now, we'll just redirect to the game
    return new Response(
      JSON.stringify({
        message: "Success",
        // Redirect to the game
        location: `${process.env.NEXT_PUBLIC_URL}/app`,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error handling frame interaction:', error);
    return new Response(
      JSON.stringify({
        message: "Error processing frame interaction",
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
}
