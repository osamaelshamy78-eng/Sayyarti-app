import { supabase } from "./supabaseClient";

// Transfer receipts are stored under the uploader's own folder (<user id>/<file>): the database only
// accepts a purchase or listing request whose receipt is the requester's own upload.
export async function uploadReceipt(bucket, file) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) throw new Error("sign in required");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${uid}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type || "image/jpeg" });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// Receipt buckets are private. A stored receipt_url still has the old public-URL shape
// (.../storage/v1/object/public/<bucket>/<file>); admins open it through a link that works for 10 minutes.
function receiptLocation(url) {
  const m = /\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/([^?#]+)/.exec(url || "");
  return m ? { bucket: m[1], path: decodeURIComponent(m[2]) } : null;
}

export async function openReceipt(url) {
  // open the tab first, while the tap still counts, so the browser doesn't block it as a pop-up
  const win = window.open("", "_blank");
  const loc = receiptLocation(url);
  const { data } = loc
    ? await supabase.storage.from(loc.bucket).createSignedUrl(loc.path, 600)
    : { data: null };
  if (data?.signedUrl) {
    if (win) win.location = data.signedUrl;
    else window.location.href = data.signedUrl;
  } else if (win) {
    win.close();
  }
}
