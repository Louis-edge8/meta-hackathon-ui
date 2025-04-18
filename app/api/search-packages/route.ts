import { searchPackages } from "@/lib/services/search-packages";
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
    console.log("Search packages request:", {
      body,
      token: token.substring(0, 10) + '...' // Log only the start of the token for security
    });

    const packages = await searchPackages(body);

    // Log the response
    console.log("Search packages response:", {
      packagesCount: packages.length,
      firstPackage: packages[0] ? { 
        id: packages[0].id,
        title: packages[0].title
      } : null
    });

    // Return packages in the expected format
    return NextResponse.json({ packages });
  } catch (error: any) {
    console.error("Error searching packages:", {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: error.message || "Failed to search packages" },
      { status: 500 }
    );
  }
} 