export function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const initials =
    parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : parts[0]?.slice(0, 2);
  return (initials || "?").toUpperCase();
}
