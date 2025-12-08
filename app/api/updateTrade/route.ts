import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST() {
  revalidateTag('trade', 'max');
  return NextResponse.json({ revalidated: true });
}
