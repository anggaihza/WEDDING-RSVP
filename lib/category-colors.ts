const categoryTones = [
  {
    row: "border-l-[#4a0b18] bg-[#fff7f8] hover:bg-[#fff1f4]",
    group: "border-l-[#4a0b18] bg-[#f7edf0] text-[#4a0b18]",
    badge: "border-[#eccbd4] bg-[#f7edf0] text-[#4a0b18]",
  },
  {
    row: "border-l-[#9f6b1f] bg-[#fffaf0] hover:bg-[#fff3d8]",
    group: "border-l-[#9f6b1f] bg-[#fff3d8] text-[#6f430c]",
    badge: "border-[#efd7a4] bg-[#fff3d8] text-[#6f430c]",
  },
  {
    row: "border-l-[#527047] bg-[#f6fbf3] hover:bg-[#eef7ea]",
    group: "border-l-[#527047] bg-[#eef7ea] text-[#334f2c]",
    badge: "border-[#cfe1c6] bg-[#eef7ea] text-[#334f2c]",
  },
  {
    row: "border-l-[#246b70] bg-[#f1fbfb] hover:bg-[#e5f6f7]",
    group: "border-l-[#246b70] bg-[#e5f6f7] text-[#16494d]",
    badge: "border-[#b9dde0] bg-[#e5f6f7] text-[#16494d]",
  },
  {
    row: "border-l-[#43536b] bg-[#f6f8fb] hover:bg-[#eef2f7]",
    group: "border-l-[#43536b] bg-[#eef2f7] text-[#2d394d]",
    badge: "border-[#c9d2df] bg-[#eef2f7] text-[#2d394d]",
  },
  {
    row: "border-l-[#8a4f62] bg-[#fff7fa] hover:bg-[#fbeef3]",
    group: "border-l-[#8a4f62] bg-[#fbeef3] text-[#623244]",
    badge: "border-[#e7c4d0] bg-[#fbeef3] text-[#623244]",
  },
  {
    row: "border-l-[#7d6a39] bg-[#fbfaf2] hover:bg-[#f4f0dc]",
    group: "border-l-[#7d6a39] bg-[#f4f0dc] text-[#55471f]",
    badge: "border-[#ddd3a9] bg-[#f4f0dc] text-[#55471f]",
  },
  {
    row: "border-l-[#38615a] bg-[#f4faf8] hover:bg-[#e8f4f0]",
    group: "border-l-[#38615a] bg-[#e8f4f0] text-[#24443f]",
    badge: "border-[#c2ddd5] bg-[#e8f4f0] text-[#24443f]",
  },
  {
    row: "border-l-[#5d4b6f] bg-[#faf7fd] hover:bg-[#f2ecf8]",
    group: "border-l-[#5d4b6f] bg-[#f2ecf8] text-[#3f3050]",
    badge: "border-[#d9c9e5] bg-[#f2ecf8] text-[#3f3050]",
  },
  {
    row: "border-l-[#8a3f2d] bg-[#fff7f3] hover:bg-[#fbeee8]",
    group: "border-l-[#8a3f2d] bg-[#fbeee8] text-[#613022]",
    badge: "border-[#e8c7ba] bg-[#fbeee8] text-[#613022]",
  },
  {
    row: "border-l-[#315f86] bg-[#f4f9fd] hover:bg-[#e8f2fa]",
    group: "border-l-[#315f86] bg-[#e8f2fa] text-[#244563]",
    badge: "border-[#bfd8ec] bg-[#e8f2fa] text-[#244563]",
  },
  {
    row: "border-l-[#6b5c45] bg-[#faf8f4] hover:bg-[#f2ede4]",
    group: "border-l-[#6b5c45] bg-[#f2ede4] text-[#493d2b]",
    badge: "border-[#d9cfbd] bg-[#f2ede4] text-[#493d2b]",
  },
] as const;

export type CategoryTone = (typeof categoryTones)[number];

export function getCategoryTone(category: string) {
  return categoryTones[getCategoryHash(category) % categoryTones.length];
}

export function getCategoryToneMap(categories: string[]) {
  const uniqueCategories = Array.from(new Set(categories)).sort((left, right) =>
    left.localeCompare(right, "id-ID")
  );

  return Object.fromEntries(
    uniqueCategories.map((category, index) => [
      category,
      categoryTones[index % categoryTones.length],
    ])
  ) as Record<string, CategoryTone>;
}

function getCategoryHash(value: string) {
  let hash = 0;

  for (const char of value.toLowerCase().trim()) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}
