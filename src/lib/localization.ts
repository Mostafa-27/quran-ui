export const toArabicNumber = (n: number | string): string => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return n.toString().replace(/\d/g, (d) => arabicDigits[parseInt(d)]);
};

export const getArabicSurahLabel = (id: number, name: string): string => {
  return `${toArabicNumber(id)}. سورة ${name}`;
};

export const uiLabels = {
  surah: "سورة",
  ayah: "آية",
  page: "صفحة",
  reciter: "القاريء",
  clickToRecite: "اضغط للقراءة",
  interactiveQuran: "المصحف التفاعلي",
  readyToRecite: "جاهز للتلاوة",
};
