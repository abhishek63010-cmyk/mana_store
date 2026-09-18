import Link from "next/link";
import { saveCategory } from "@/lib/admin/actions";

type Category = { id?: string; name?: string; slug?: string; description?: string | null; active?: boolean };
export function AdminCategoryForm({ category = {} }: { category?: Category }) {
  return <form className="admin-form" action={saveCategory}><input type="hidden" name="id" value={category.id ?? ""} /><label>Name<input name="name" defaultValue={category.name} required /></label><label>Slug<input name="slug" defaultValue={category.slug} placeholder="cotton-sarees" required /></label><label>Description<textarea name="description" rows={4} defaultValue={category.description ?? ""} /></label><label className="admin-check"><input name="active" type="checkbox" defaultChecked={category.active ?? true} /> Active in storefront</label><div className="admin-form-actions"><button className="admin-button" type="submit">{category.id ? "Save category" : "Create category"}</button><Link className="admin-button admin-button-quiet" href="/admin/categories">Cancel</Link></div></form>;
}