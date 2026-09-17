import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteAddress, setDefaultAddress, updateAddress } from "@/lib/addresses/service";
import { addressWriteSchema } from "@/validations/checkout";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (body?.action === "set-default") {
    try {
      const address = await setDefaultAddress(user.id, id);
      return address ? NextResponse.json({ address }) : NextResponse.json({ error: "Address not found." }, { status: 404 });
    } catch (error) { console.error("Default address update failed", error); return NextResponse.json({ error: "We could not update your default address." }, { status: 500 }); }
  }
  const parsed = addressWriteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid address." }, { status: 400 });
  try {
    const address = await updateAddress(user.id, id, parsed.data);
    return address ? NextResponse.json({ address }) : NextResponse.json({ error: "Address not found." }, { status: 404 });
  } catch (error) { console.error("Address update failed", error); return NextResponse.json({ error: "We could not update your address." }, { status: 500 }); }
}

export async function DELETE(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await context.params;
  try { return await deleteAddress(user.id, id) ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Address not found." }, { status: 404 }); }
  catch (error) { console.error("Address delete failed", error); return NextResponse.json({ error: "We could not delete your address." }, { status: 500 }); }
}