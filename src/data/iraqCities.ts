export interface IraqCity {
  id: string;
  nameEn: string;
  nameAr: string;
  growthScore: number;
  popularAreas: string[];
}

export const iraqCities: IraqCity[] = [
  {
    id: "baghdad",
    nameEn: "Baghdad",
    nameAr: "بغداد",
    growthScore: 88,
    popularAreas: ["Mansour", "Karrada", "Zayouna", "Al Jadriya"],
  },
  {
    id: "erbil",
    nameEn: "Erbil",
    nameAr: "أربيل",
    growthScore: 91,
    popularAreas: ["Empire World", "Ankawa", "Gulan", "Dream City"],
  },
  {
    id: "mosul",
    nameEn: "Mosul",
    nameAr: "الموصل",
    growthScore: 74,
    popularAreas: ["Al Majmoaa Al Thaqafiya", "Al Hadbaa", "Al Arabi", "Al Zuhour"],
  },
  {
    id: "basra",
    nameEn: "Basra",
    nameAr: "البصرة",
    growthScore: 84,
    popularAreas: ["Al Ashar", "Hayy Al Jazaer", "Al Maqal", "Five Miles"],
  },
  {
    id: "najaf",
    nameEn: "Najaf",
    nameAr: "النجف",
    growthScore: 79,
    popularAreas: ["Al Ghadeer", "Al Salam", "Old Najaf", "Kufa Road"],
  },
  {
    id: "karbala",
    nameEn: "Karbala",
    nameAr: "كربلاء",
    growthScore: 77,
    popularAreas: ["Al Hur", "Al Askari", "Al Mouallimeen", "Al Hussainiya"],
  },
  {
    id: "sulaymaniyah",
    nameEn: "Sulaymaniyah",
    nameAr: "السليمانية",
    growthScore: 86,
    popularAreas: ["Goizha", "Raparin", "Bakrajo", "Salim Street"],
  },
  {
    id: "duhok",
    nameEn: "Duhok",
    nameAr: "دهوك",
    growthScore: 81,
    popularAreas: ["Masike", "Malta", "Shindokha", "Gre Base"],
  },
  {
    id: "kirkuk",
    nameEn: "Kirkuk",
    nameAr: "كركوك",
    growthScore: 72,
    popularAreas: ["Arafa", "Shoraw", "Rahimawa", "Tesin"],
  },
  {
    id: "nasiriyah",
    nameEn: "Nasiriyah",
    nameAr: "الناصرية",
    growthScore: 69,
    popularAreas: ["Al Shuhadaa", "Sumer", "Al Islah", "Al Haboubi"],
  },
];
