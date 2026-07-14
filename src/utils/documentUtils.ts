export const summarize = (doc: any, providerId?: string) => {
  if (doc.isForm) {
    let rows = doc.shares ?? [];
    if (providerId) {
      rows = rows.filter((r: any) => r.providerId === providerId);
    }
    const signed = rows.filter((r: any) => r.status === "SUBMITTED").length;
    const sharedOnly = rows.length - signed;
    return { signed, sharedOnly, total: rows.length };
  }
  let rows = doc.sharedWith ?? [];
  if (providerId) {
    rows = rows.filter((r: any) => r.providerId === providerId);
  }
  const signed = rows.filter((r: any) => Boolean(r.eSignature)).length;
  const sharedOnly = rows.length - signed;
  return { signed, sharedOnly, total: rows.length };
};
