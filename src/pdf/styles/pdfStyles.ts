import { StyleSheet, Font } from "@react-pdf/renderer";

/* ------------------------------------------------------------------
 * Font Registration
 * ------------------------------------------------------------------
 * Great Vibes for signature script.
 * Helvetica is used as the body face (built-in, no registration needed),
 * matching the conservative typography expected of HIPAA / legal forms.
 * ------------------------------------------------------------------ */
Font.register({
  family: "Great Vibes",
  src: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/greatvibes/GreatVibes-Regular.ttf",
});

// Prevent ugly hyphenation in legal/medical body copy
Font.registerHyphenationCallback((word) => [word]);

/* ------------------------------------------------------------------
 * Design Tokens
 * ------------------------------------------------------------------
 * Centralizing colors, spacing, and type sizes keeps the document
 * visually consistent and makes future brand updates trivial.
 * ------------------------------------------------------------------ */
const colors = {
  // Brand
  brand: "#0F9282",
  brandDark: "#0B6E62",
  brandSoft: "#E6F4F2",

  // Neutrals (slate ramp)
  ink: "#0F172A", // slate-900 — primary text
  body: "#1E293B", // slate-800 — body copy
  muted: "#475569", // slate-600 — secondary text
  subtle: "#64748B", // slate-500 — labels, captions
  faint: "#94A3B8", // slate-400 — placeholders, footnotes
  hairline: "#CBD5E1", // slate-300 — borders
  divider: "#E2E8F0", // slate-200 — soft dividers
  surface: "#F8FAFC", // slate-50  — field backgrounds
  paper: "#FFFFFF",

  // Semantic
  required: "#B91C1C", // red-700 — required asterisks (deeper than 500 for print)
  noticeBg: "#FFFBEB", // amber-50 — important notices
  noticeBorder: "#F59E0B", // amber-500
  noticeText: "#78350F", // amber-900
  confidentialBg: "#F1F5F9", // slate-100
};

const space = {
  xs: 3,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
};

const type = {
  // Slightly tighter than 1.5 for legal density without sacrificing readability
  bodyLeading: 1.45,
  headingLeading: 1.25,
};

/* ------------------------------------------------------------------
 * Stylesheet
 * ------------------------------------------------------------------ */
export const pdfStyles = StyleSheet.create({
  /* ---------- Page ---------- */
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: type.bodyLeading,
    color: colors.body,
    backgroundColor: colors.paper,
    // Slightly more generous margins — standard for printable legal/medical
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
  },

  /* ---------- Document Header ---------- */
  // A thin colored rule reads more "official document" than a thick bar.
  accentBar: {
    height: 3,
    backgroundColor: colors.brand,
    marginBottom: 10,
  },

  // Optional secondary rule for a layered, formal feel
  accentBarThin: {
    height: 0.75,
    backgroundColor: colors.brandDark,
    marginBottom: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.75,
    borderBottomColor: colors.hairline,
    borderBottomStyle: "solid",
    paddingBottom: 14,
    marginBottom: 10,
  },

  headerDetails: {
    flex: 1,
    paddingRight: 16,
  },

  logo: {
    width: 120,
    objectFit: "contain",
  },

  // Small uppercase eyebrow — "NOTICE OF PRIVACY PRACTICES", "AUTHORIZATION", etc.
  eyebrow: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: colors.brand,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.ink,
    lineHeight: type.headingLeading,
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 8,
  },

  description: {
    fontSize: 10,
    color: colors.muted,
    lineHeight: 1.5,
  },

  // Meta row — effective date, version, document ID
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: colors.divider,
    borderTopStyle: "solid",
  },
  metaItem: {
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: colors.subtle,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 9,
    color: colors.ink,
    fontWeight: "bold",
  },

  // Optional pill — "EFFECTIVE: Jan 1, 2026", "VERSION 2.1"
  badgeContainer: {
    marginTop: 6,
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    // backgroundColor: colors.brandSoft,
    color: colors.brandDark,
    fontSize: 8.5,
    fontWeight: "bold",
    // paddingVertical: 3,
    // paddingHorizontal: 9,
    // borderRadius: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* ---------- Content Layout ---------- */
  contentContainer: {
    flexDirection: "column",
    gap: space.lg,
  },
  section: {
    marginBottom: space.sm,
  },

  /* ---------- Typography ---------- */
  h1: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.brand,
    borderBottomStyle: "solid",
    paddingBottom: 5,
    marginTop: 14,
    marginBottom: 8,
    lineHeight: type.headingLeading,
  },
  h2: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.ink,
    marginTop: 12,
    marginBottom: 6,
    lineHeight: type.headingLeading,
  },
  h3: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: colors.body,
    marginTop: 10,
    marginBottom: 5,
    lineHeight: type.headingLeading,
  },
  h4: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.muted,
    marginTop: 8,
    marginBottom: 4,
    lineHeight: type.headingLeading,
  },
  h5: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.subtle,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginTop: 8,
    marginBottom: 4,
    lineHeight: type.headingLeading,
  },
  h6: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.faint,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
    lineHeight: type.headingLeading,
  },

  paragraph: {
    fontSize: 10,
    color: colors.body,
    lineHeight: type.bodyLeading,
    textAlign: "justify",
    marginBottom: 8,
  },

  // For "Patient initials: ___" style emphasized sentences
  emphasis: {
    fontWeight: "bold",
    color: colors.ink,
  },

  small: {
    fontSize: 8.5,
    color: colors.muted,
    lineHeight: 1.4,
  },

  /* ---------- Lists ---------- */
  listContainer: {
    marginLeft: 10,
    marginBottom: 8,
    flexDirection: "column",
    gap: 5,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  // Bullet uses same fontSize + lineHeight as the text so they baseline-align.
  // Slight negative marginTop pulls the bullet up to optically sit against
  // the x-height of the body copy rather than the descender area.
  listBullet: {
    fontSize: 10,
    color: colors.brand,
    lineHeight: type.bodyLeading,
    width: 8,
    marginTop: -0.5,
  },
  listText: {
    fontSize: 10,
    color: colors.body,
    flex: 1,
    lineHeight: type.bodyLeading,
  },

  /* ---------- Form Fields ---------- */
  // Fields read more like a form when they have label-above + lined box
  fieldGroup: {
    flexDirection: "column",
    gap: 4,
    marginBottom: 4,
  },
  fieldGroupRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  fieldGroupCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: colors.subtle,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  fieldRequired: {
    color: colors.required,
    fontWeight: "bold",
  },
  fieldHint: {
    fontSize: 8,
    color: colors.faint,
    marginTop: 2,
    fontStyle: "italic",
  },
  fieldValueBox: {
    borderBottomWidth: 0.75,
    borderBottomColor: colors.muted,
    borderBottomStyle: "solid",
    backgroundColor: colors.paper,
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 24,
  },
  // Boxed variant — when you want a more "filled-in" look
  fieldValueBoxFilled: {
    borderWidth: 0.75,
    borderColor: colors.hairline,
    borderStyle: "solid",
    borderRadius: 3,
    backgroundColor: colors.surface,
    paddingVertical: 7,
    paddingHorizontal: 10,
    minHeight: 26,
  },
  fieldValueText: {
    fontSize: 10,
    color: colors.ink,
  },
  fieldValuePlaceholder: {
    fontSize: 9.5,
    color: colors.faint,
    fontStyle: "italic",
  },

  /* ---------- Checkbox Groups ---------- */
  checkboxContainer: {
    borderWidth: 0.75,
    borderColor: colors.hairline,
    borderStyle: "solid",
    borderRadius: 4,
    backgroundColor: colors.surface,
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
    columnGap: 12,
  },
  // Alignment note:
  //   To get the box visually centered with the label, we make the label's
  //   line-box approximately equal to the box's height by setting an
  //   explicit lineHeight. With matching cross-axis dimensions, the default
  //   `alignItems: "center"` then produces true optical centering.
  //   Box: 10pt. Label: 9.5pt × 1.15 ≈ 10.9pt line-box. Close enough that
  //   the geometric and visual centers coincide.
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "47%",
    minWidth: 120,
  },
  checkboxBox: {
    width: 10,
    height: 10,
    borderWidth: 0.75,
    borderColor: colors.muted,
    borderStyle: "solid",
    borderRadius: 1.5,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  checkboxCheck: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: colors.paper,
    lineHeight: 1,
  },
  checkboxLabel: {
    fontSize: 9.5,
    color: colors.body,
    lineHeight: 1.15, // matches box height for true center alignment
    flex: 1,
  },

  /* ---------- Radio Buttons (Single-Select) ---------- */
  // Same alignment strategy as checkboxes: match label's lineHeight to the
  // circle's height so `alignItems: "center"` gives true optical centering.
  radioContainer: {
    borderWidth: 0.75,
    borderColor: colors.hairline,
    borderStyle: "solid",
    borderRadius: 4,
    backgroundColor: colors.surface,
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
    columnGap: 12,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "47%",
    minWidth: 120,
  },
  // Outer ring — perfectly circular via large borderRadius
  radioCircle: {
    width: 10,
    height: 10,
    borderWidth: 0.75,
    borderColor: colors.muted,
    borderStyle: "solid",
    borderRadius: 999,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: colors.brand,
  },
  // Inner filled dot — only rendered when selected
  radioDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.brand,
  },
  radioLabel: {
    fontSize: 9.5,
    color: colors.body,
    lineHeight: 1.15, // matches circle height for true center alignment
    flex: 1,
  },

  /* ---------- Boolean / Single Assent ---------- */
  // Used for "I acknowledge…" style single attestations.
  booleanWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    marginBottom: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.brandSoft,
    borderLeftWidth: 2,
    borderLeftColor: colors.brand,
    borderLeftStyle: "solid",
    borderRadius: 2,
  },
  booleanBox: {
    width: 11,
    height: 11,
    borderWidth: 0.75,
    borderColor: colors.brand,
    borderStyle: "solid",
    borderRadius: 1.5,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  booleanBoxChecked: {
    backgroundColor: colors.brand,
  },
  booleanCheck: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.paper,
    lineHeight: 1,
  },
  booleanLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.ink,
    flex: 1,
    lineHeight: 1.2, // ~12pt line-box, near booleanBox + breathing room for wrap
  },
  // Use these two if the assent label is long enough to wrap. The wrapper
  // anchors from the top so the box sits next to the first line, not the
  // visual midpoint of a multi-line block.
  booleanWrapperMultiline: {
    alignItems: "flex-start",
  },
  booleanBoxMultiline: {
    marginTop: 1.5, // small nudge to align with first line's cap height
  },

  /* ---------- HIPAA-Specific Notices ---------- */
  // Important — for things like "This authorization expires on…"
  noticeBox: {
    backgroundColor: colors.noticeBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.noticeBorder,
    borderLeftStyle: "solid",
    borderRadius: 2,
    padding: 10,
    marginVertical: 8,
  },
  noticeTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.noticeText,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 9.5,
    color: colors.noticeText,
    lineHeight: 1.45,
  },

  // Subtle informational block — restating patient rights, etc.
  infoBox: {
    backgroundColor: colors.brandSoft,
    borderRadius: 3,
    padding: 10,
    marginVertical: 8,
  },
  infoTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.brandDark,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 9.5,
    color: colors.body,
    lineHeight: 1.45,
  },

  /* ---------- Tables (PHI disclosures, recipient lists) ---------- */
  table: {
    borderWidth: 0.5,
    borderColor: colors.hairline,
    borderStyle: "solid",
    borderRadius: 2,
    marginVertical: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.ink,
  },
  tableHeaderCell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 8.5,
    fontWeight: "bold",
    color: colors.paper,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: colors.divider,
    borderTopStyle: "solid",
  },
  tableRowAlt: {
    backgroundColor: colors.surface,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 9.5,
    color: colors.body,
  },

  /* ---------- Signature Block ---------- */
  signatureSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 0.75,
    borderTopColor: colors.hairline,
    borderTopStyle: "solid",
  },
  signatureSectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.ink,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  // Row layout: signature on left, date on right (common on consent forms)
  signatureRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  signatureCard: {
    flex: 2,
    flexDirection: "column",
  },
  signatureDateCard: {
    flex: 1,
    flexDirection: "column",
  },
  signatureContainer: {
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
    borderBottomStyle: "solid",
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  signatureWrapper: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  signatureText: {
    fontFamily: "Great Vibes",
    fontSize: 28,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 1.1,
  },
  signatureEmpty: {
    fontSize: 9,
    color: colors.faint,
    fontStyle: "italic",
  },
  signatureImage: {
    maxWidth: 220,
    maxHeight: 48,
    objectFit: "contain",
  },
  // Caption under the signature line — "Signature of Patient or Legal Representative"
  signatureCaption: {
    fontSize: 8,
    color: colors.subtle,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 4,
    textAlign: "center",
  },
  signaturePrintedName: {
    fontSize: 9,
    color: colors.body,
    marginTop: 6,
    textAlign: "center",
  },
  signatureStamp: {
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: colors.divider,
    borderTopStyle: "solid",
    width: "100%",
    alignItems: "center",
  },
  signatureStampText: {
    fontSize: 7,
    fontWeight: "bold",
    color: colors.faint,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  /* ---------- Page Footer ---------- */
  // HIPAA documents typically include a confidentiality notice and
  // pagination on every page. Use <Text fixed /> on these.
  footerContainer: {
    position: "absolute",
    bottom: 28,
    left: 54,
    right: 54,
    flexDirection: "column",
    borderTopWidth: 0.5,
    borderTopColor: colors.hairline,
    borderTopStyle: "solid",
    paddingTop: 6,
  },
  confidentialityNotice: {
    fontSize: 7,
    color: colors.subtle,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 3,
    lineHeight: 1.3,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    fontSize: 7.5,
    color: colors.faint,
  },
  footerCenter: {
    fontSize: 7.5,
    color: colors.faint,
    textAlign: "center",
  },
  footerRight: {
    fontSize: 7.5,
    color: colors.faint,
    textAlign: "right",
  },
  pageNumber: {
    fontSize: 7.5,
    color: colors.subtle,
    textAlign: "center",
  },

  /* ---------- Watermark (DRAFT, COPY) ---------- */
  watermark: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 96,
    color: colors.divider,
    opacity: 0.4,
    fontWeight: "bold",
    letterSpacing: 12,
    transform: "rotate(-30deg)",
  },
});

// Exported tokens — useful if you need them in inline styles elsewhere
export const pdfTokens = { colors, space, type };
