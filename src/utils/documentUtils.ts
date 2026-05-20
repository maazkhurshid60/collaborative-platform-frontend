export const summarize = (doc: any) => {
  if (doc.isForm) {
    const rows = doc.shares ?? [];
    const signed = rows.filter((r: any) => r.status === "SUBMITTED").length;
    const sharedOnly = rows.length - signed;
    return { signed, sharedOnly, total: rows.length };
  }
  const rows = doc.sharedWith ?? [];
  const signed = rows.filter((r: any) => Boolean(r.eSignature)).length;
  const sharedOnly = rows.length - signed;
  return { signed, sharedOnly, total: rows.length };
};
