import { suggestTour } from "@/lib/services/suggest-tour";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }

    // Log the request details
    console.log("Tour suggestion request:", {
      body,
      token: token.substring(0, 10) + '...' // Log only the start of the token for security
    });

    const packages = await suggestTour(body);

    // Log the response
    console.log("Tour suggestion response:", {
      packagesCount: packages.length,
      firstPackage: packages[0] ? { 
        id: packages[0].id,
        title: packages[0].title
      } : null
    });

    // Return packages in the expected format
    return NextResponse.json({ packages });
  } catch (error: any) {
    console.error("Error getting tour suggestions:", {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: error.message || "Failed to get tour suggestions" },
      { status: 500 }
    );
  }
} 