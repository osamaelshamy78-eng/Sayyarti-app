import { supabase } from "./supabaseClient";

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
