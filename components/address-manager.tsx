"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";

type Address = { id: string; name: string; phone: string; addressLine1: string; addressLine2: string | null; city: string; state: string; postalCode: string; country: string; isDefault: boolean };
const emptyAddress = { name: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "India", isDefault: false };

export function AddressManager({ initialAddresses }: { initialAddresses: readonly Address[] }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState([...initialAddresses]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  function beginAdd() { setEditing("new"); setForm(emptyAddress); setError(""); }
  function beginEdit(address: Address) { setEditing(address.id); setForm({ ...address, addressLine2: address.addressLine2 ?? "" }); setError(""); }
  function cancel() { setEditing(null); setError(""); }
  function updateField(field: keyof typeof form, value: string | boolean) { setForm((current) => ({ ...current, [field]: value })); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const method = editing === "new" ? "POST" : "PATCH";
    const endpoint = editing === "new" ? "/api/addresses" : `/api/addresses/${editing}`;
    const response = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setError(result?.error ?? "We could not save this address."); setLoading(false); return; }
    setAddresses((current) => editing === "new" ? [result.address, ...current.map((address: Address) => form.isDefault ? { ...address, isDefault: false } : address)] : current.map((address: Address) => address.id === result.address.id ? result.address : form.isDefault ? { ...address, isDefault: false } : address));
    cancel(); setLoading(false); router.refresh();
  }
  async function remove(addressId: string) {
    if (!window.confirm("Delete this saved address?")) return;
    setLoading(true); setError(""); const response = await fetch(`/api/addresses/${addressId}`, { method: "DELETE" }); const result = await response.json().catch(() => null);
    if (!response.ok) { setError(result?.error ?? "We could not delete this address."); setLoading(false); return; }
    setAddresses((current) => current.filter((address) => address.id !== addressId)); setLoading(false); router.refresh();
  }
  async function makeDefault(addressId: string) {
    setLoading(true); setError(""); const response = await fetch(`/api/addresses/${addressId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "set-default" }) }); const result = await response.json().catch(() => null);
    if (!response.ok) { setError(result?.error ?? "We could not update your default address."); setLoading(false); return; }
    setAddresses((current) => current.map((address) => ({ ...address, isDefault: address.id === result.address.id }))); setLoading(false); router.refresh();
  }

  return <section className="address-manager" aria-labelledby="saved-addresses-heading"><div className="section-heading"><div><p className="eyebrow" id="saved-addresses-heading">Saved delivery details</p><h2>{addresses.length ? `${addresses.length} address${addresses.length === 1 ? "" : "es"}` : "No saved addresses"}</h2></div>{editing === null && <Button onClick={beginAdd}>Add address</Button>}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {!addresses.length && editing === null && <div className="state"><h2>Nothing saved yet</h2><p className="sans muted">Add an address to make checkout faster.</p><Button onClick={beginAdd}>Add your first address</Button></div>}
    <div className="saved-address-grid">{addresses.map((address) => <article className="saved-address" key={address.id}><div><div className="saved-address-title"><h3>{address.name}</h3>{address.isDefault && <span className="default-badge">Default</span>}</div><p className="sans">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}<br />{address.city}, {address.state} {address.postalCode}<br />{address.country}<br />{address.phone}</p></div><div className="saved-address-actions"><Button variant="quiet" onClick={() => beginEdit(address)}>Edit</Button>{!address.isDefault && <Button variant="quiet" onClick={() => makeDefault(address.id)} disabled={loading}>Set default</Button>}<Button variant="quiet" onClick={() => remove(address.id)} disabled={loading}>Delete</Button></div></article>)}</div>
    {editing !== null && <form className="address-editor" onSubmit={save} noValidate><div className="section-heading"><div><p className="eyebrow">{editing === "new" ? "New address" : "Edit address"}</p><h2>{editing === "new" ? "Add address" : "Update address"}</h2></div></div><div className="address-fields"><label>Name<input value={form.name} onChange={(event) => updateField("name", event.target.value)} autoComplete="name" required /></label><label>Phone<input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} autoComplete="tel" required /></label><label>Address line 1<input value={form.addressLine1} onChange={(event) => updateField("addressLine1", event.target.value)} autoComplete="address-line1" required /></label><label>Address line 2 <span className="muted">(optional)</span><input value={form.addressLine2} onChange={(event) => updateField("addressLine2", event.target.value)} autoComplete="address-line2" /></label><label>City<input value={form.city} onChange={(event) => updateField("city", event.target.value)} autoComplete="address-level2" required /></label><label>State<input value={form.state} onChange={(event) => updateField("state", event.target.value)} autoComplete="address-level1" required /></label><label>Postal code<input value={form.postalCode} onChange={(event) => updateField("postalCode", event.target.value)} autoComplete="postal-code" required /></label><label>Country<input value={form.country} onChange={(event) => updateField("country", event.target.value)} autoComplete="country-name" required /></label><label className="checkbox-label"><input type="checkbox" checked={form.isDefault} onChange={(event) => updateField("isDefault", event.target.checked)} /> Make this my default address</label></div><div className="editor-actions"><Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save address"}</Button><Button variant="quiet" onClick={cancel} disabled={loading}>Cancel</Button></div></form>}
  </section>;
}