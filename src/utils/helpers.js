// แปลงวันที่เป็น พ.ศ. (DD/MM/YYYY)
export const toThaiDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ฟอร์แมตตัวเลข 2 ตำแหน่ง พร้อม comma
export const formatNumber = (num) => {
  return Number(num || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// คำนวณรอบการจ่าย (15 หรือ 30)
export const getPaymentCycle = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const day = d.getDate();
  if (day <= 15) d.setDate(15);
  else d.setDate(30);
  return d.toISOString().split("T")[0];
};