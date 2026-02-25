export type IslamicLevel = "parent" | "baligh" | "tamyiz" | "ghairu_tamyiz";

export function calculateAge(birthDateString: string | null): number | null {
    if (!birthDateString) return null;
    
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return null;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

export function getIslamicLevel(age: number | null, role: string): IslamicLevel {
    if (role === "parent") return "parent";
    if (age === null) return "baligh"; // Default if age is unknown
    
    if (age > 12) return "baligh";
    if (age >= 7 && age <= 12) return "tamyiz";
    return "ghairu_tamyiz"; // age < 7
}

export const LEVEL_LABELS: Record<IslamicLevel, string> = {
    parent: "Parent",
    baligh: "Baligh (>12)",
    tamyiz: "Tamyiz (7-12)",
    ghairu_tamyiz: "Ghairu Tamyiz (<7)"
};
