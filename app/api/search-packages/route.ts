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
    console.log("Request body:", body);

    const packages = await searchPackages(body);
    return NextResponse.json(packages);
  } catch (error: any) {
    console.error("Error searching packages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search packages" },
      { status: 500 }
    );
  }
} 