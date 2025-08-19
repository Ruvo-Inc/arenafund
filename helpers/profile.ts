// helpers/profile.ts
export type Accreditation = "yes" | "no" | "unsure";
export interface DocItem {
  path: string;
  contentType: "application/pdf" | "image/png" | "image/jpeg";
  label?: string;
}
export interface Profile {
  name?: string;
  location?: string;
  accreditation?: Accreditation;
  documents?: DocItem[];
}

export function isProfileComplete(p: Profile | null | undefined): boolean {
  if (!p) return false;
  const hasName = !!p.name && p.name.trim().length > 1;
  const hasLocation = !!p.location && p.location.trim().length > 1;
  const isAccredKnown = p.accreditation === "yes" || p.accreditation === "no";
  const hasDoc = Array.isArray(p.documents) && p.documents.length > 0;
  return hasName && hasLocation && isAccredKnown && hasDoc;
}
