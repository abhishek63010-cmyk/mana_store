import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/authorization";
import { listAddresses } from "@/lib/addresses/service";
import { AddressManager } from "@/components/address-manager";

export const metadata: Metadata = { title: "My addresses" };

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  try {
    return <main className="account-page container"><div className="page-intro"><p className="eyebrow">Your space</p><h1>My addresses</h1><p className="sans">Save delivery details for a quicker, easier checkout.</p></div><AddressManager initialAddresses={await listAddresses(user.id)} /></main>;
  } catch (error) {
    console.error("Address page failed", error);
    return <main className="account-page container"><div className="page-intro"><p className="eyebrow">Something went wrong</p><h1>Addresses unavailable</h1><p className="sans form-error" role="alert">We could not load your saved addresses. Please try again.</p></div></main>;
  }
}