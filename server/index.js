// บังคับ DNS ให้มองหา IPv4 ก่อน เพื่อความเสถียรบน Render
const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
  console.log("🛠️ [DEBUG] บังคับใช้ IPv4 สำหรับ Render เรียบร้อย");
}

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const cron = require("node-cron");
const { Resend } = require("resend");

console.log("🛠️ [DEBUG] โหลด Modules เรียบร้อยแล้ว");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
console.log("🛠️ [DEBUG] ตั้งค่า Middleware (CORS, JSON) เรียบร้อย");

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ [ERROR] ไม่พบข้อมูลการเชื่อมต่อ Supabase ในไฟล์ .env");
}
const supabase = createClient(supabaseUrl, supabaseKey);
console.log("🛠️ [DEBUG] เชื่อมต่อกับ Supabase เรียบร้อย");

// Resend Setup (ส่งผ่าน API ไม่โดนบล็อกพอร์ต)
if (!process.env.RESEND_API_KEY) {
  console.error("❌ [ERROR] ไม่พบ RESEND_API_KEY ในไฟล์ .env");
}
const resend = new Resend(process.env.RESEND_API_KEY);
console.log("🛠️ [DEBUG] ตั้งค่า Resend Client เรียบร้อย");

// Test API Route
app.get("/", (req, res) => {
  console.log("🌐 [DEBUG] มีการเข้าถึง API Route: GET /");
  res.send("Yudong Server is Running and Ready to send emails via Resend API!");
});

// ฟังก์ชันแปลงวันที่เป็นไทย พ.ศ. (DD/MM/YYYY)
const toThaiDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const yearBE = date.getFullYear() + 543;
  return `${day}/${month}/${yearBE}`;
};

// ฟังก์ชันจัดฟอร์แมตตัวเลขให้มีทศนิยม 2 ตำแหน่ง
const formatNumber = (num) => {
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// ฟังก์ชันหลักในการตรวจเช็คและแจ้งเตือน
const checkAndSendNotifications = async () => {
  console.log("\n=======================================================");
  console.log("🚀 [DEBUG START] เริ่มกระบวนการตรวจสอบบิลแบบแยกบริษัท...");

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  const targetDateString = targetDate.toISOString().split("T")[0];
  
  console.log(`🎯 [DEBUG] วันที่เป้าหมาย (อีก 3 วันข้างหน้า): ${targetDateString}`);

  try {
    // 1. ดึงข้อมูลบิล
    console.log("📡 [DEBUG 1/5] กำลังดึงข้อมูลบิลจากตาราง 'documents'...");
    const { data: docs, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("due_date", targetDateString);

    if (docError) {
      console.error("❌ [DEBUG ERROR] ดึงข้อมูลบิลล้มเหลว:", docError.message);
      return;
    }

    if (!docs || docs.length === 0) {
      console.log("😴 [DEBUG] ไม่พบรายการบิลที่ครบกำหนดในอีก 3 วันนี้ (หยุดการทำงาน)");
      return;
    } 
    console.log(`✅ [DEBUG] ดึงข้อมูลสำเร็จ! พบ ${docs.length} รายการบิล`);

    // 2. ดึงรายชื่อผู้รับ
    console.log("📡 [DEBUG 2/5] กำลังดึงรายชื่ออีเมลจากตาราง 'email_configs'...");
    const { data: config, error: configError } = await supabase
      .from("email_configs")
      .select("recipients")
      .eq("id", 1)
      .maybeSingle();

    if (configError) {
      console.error("❌ [DEBUG ERROR] ดึงรายชื่ออีเมลล้มเหลว:", configError.message);
      return;
    }

    if (!config || !config.recipients || config.recipients.length === 0) {
      console.log("⚠️ [DEBUG] ไม่พบรายชื่ออีเมลผู้รับในระบบ (หยุดการทำงาน)");
      return;
    }
    console.log(`✅ [DEBUG] ดึงรายชื่อสำเร็จ! ผู้รับคือ: ${config.recipients.join(", ")}`);

    // 3. จัดกลุ่มข้อมูลตาม ap_name (Supplier)
    console.log("⚙️ [DEBUG 3/5] กำลังจัดกลุ่มข้อมูลบิลตามรายชื่อ Supplier...");
    const groupedData = docs.reduce((acc, doc) => {
      const supplier = doc.ap_name || "ไม่ระบุชื่อบริษัท";
      if (!acc[supplier]) {
        acc[supplier] = { items: [], totalNetPay: 0 };
      }
      acc[supplier].items.push(doc);
      acc[supplier].totalNetPay += Number(doc.net_pay_amt || 0);
      return acc;
    }, {});
    console.log(`✅ [DEBUG] จัดกลุ่มสำเร็จ! มี Supplier ทั้งหมด ${Object.keys(groupedData).length} รายการ`);

    // 4. เตรียมโครงสร้าง HTML
    console.log("⚙️ [DEBUG 4/5] กำลังสร้างโครงสร้าง HTML สำหรับอีเมล...");
    let emailHtmlContent = "";
    Object.keys(groupedData).forEach((supplierName) => {
      const group = groupedData[supplierName];
      emailHtmlContent += `
        <div style="margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f1f5f9; padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-weight: bold; color: #334155;">🏢 Supplier: ${supplierName} ทั้งหมด ${group.items.length} รายการ</span>
            <span style="float: right; font-weight: bold; color: #334155;">ยอดสุทธิ: ฿${formatNumber(group.totalNetPay)}</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #ffffff; text-align: left; color: #64748b;">
                <th style="padding: 10px; border-bottom: 1px solid #eee;">วันที่วางบิล</th>
                <th style="padding: 10px; border-bottom: 1px solid #eee;">Invoice/Job</th>
                <th style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">ยอดสุทธิ</th>
              </tr>
            </thead>
            <tbody>
              ${group.items.map(item => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #f8fafc;">${toThaiDate(item.date_record)}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #f8fafc;">
                    <div style="font-weight: 500;">${item.inv_no}</div>
                    <div style="font-size: 11px; color: #94a3b8;">${item.job_no}</div>
                  </td>
                  <td style="padding: 10px; border-bottom: 1px solid #f8fafc; text-align: right; font-family: monospace;">
                    ฿${formatNumber(item.net_pay_amt)}
                  </td>
                </tr>
              `).join("")}
            </tbody>
            <tfoot>
              <tr style="background-color: #f8fafc;">
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; color: #475569;">รวมยอดที่ต้องจ่ายให้ ${supplierName}:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; color: #16a34a; font-size: 15px; font-family: monospace;">
                  ฿${formatNumber(group.totalNetPay)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    });
    console.log("✅ [DEBUG] สร้าง HTML โครงสร้างสำเร็จ");

    // 5. ส่งอีเมล
    console.log("📨 [DEBUG 5/5] กำลังส่งอีเมลผ่าน Resend API...");
    const { data, error } = await resend.emails.send({
      from: "YUDONG SUPPLIER System <onboarding@resend.dev>",
      to: config.recipients,
      subject: `⚠️ YUDONG System แจ้งเตือนวันครบรอบกำหนดจ่ายประจำวันที่ ${toThaiDate(targetDateString)} พบ ${docs.length} รายการ`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h2 style="color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">รายการสรุปยอดจ่ายแยกตามบริษัท</h2>
          <p style="color: #64748b; font-size: 14px;">พบรายการบิลที่จะครบกำหนดในอีก 3 วันข้างหน้า จำนวนทั้งหมด <b>${docs.length} รายการ</b> สรุปยอดแยกตาม Supplier ได้ดังนี้:</p>
          ${emailHtmlContent}
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8;">
              นี่คือระบบแจ้งเตือนอัตโนมัติจาก <b>YUDONG Documents System</b><br>
              โปรดตรวจสอบความถูกต้องในระบบอีกครั้งก่อนดำเนินการจ่ายเงิน
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("❌ [DEBUG RESEND ERROR]:", error);
    } else {
      console.log(`✅ [DEBUG SUCCESS] ส่งอีเมลสำเร็จ! ID การจัดส่ง: ${data.id}`);
    }

  } catch (err) {
    console.error("💥 [DEBUG CRITICAL ERROR]:", err.message);
  }
  console.log("🏁 [DEBUG END] จบกระบวนการตรวจสอบและแจ้งเตือน");
  console.log("=======================================================\n");
};

// --- ฟังก์ชันสำหรับ Log เพื่อเช็คว่า Server ยังไม่หลับ (รันทุก 10 นาที) ---
const logSystemStatus = async () => {
  const now = new Date();
  const bangkokTime = now.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  const targetDateString = targetDate.toISOString().split("T")[0];

  try {
    const { data: docs, error } = await supabase
      .from("documents")
      .select("id") // เลือกแค่ id เพื่อไม่โหลดหนักเกินไป
      .eq("due_date", targetDateString);

    if (error) throw error;
    console.log(`[${bangkokTime}] 🟢 SYSTEM ALIVE | ค้นหาบิลวันที่ ${targetDateString} | เจอ: ${docs?.length || 0} บิล`);
  } catch (err) {
    console.error(`[${bangkokTime}] 🔴 SYSTEM ERROR:`, err.message);
  }
};

// ==========================================
// 🕒 การตั้งเวลาทำงาน (Cron Jobs)
// ==========================================

// 1. รัน Log เช็คสถานะระบบทุกๆ 10 นาที (ไม่ส่งเมล)
console.log("⏰ [DEBUG] เปิดระบบตั้งเวลา: ตรวจสอบสถานะเซิร์ฟเวอร์ (ทุกๆ 10 นาที)");
cron.schedule("*/10 * * * *", async () => {
  await logSystemStatus();
});

// 2. ตั้งเวลาส่งอีเมลทุกวันตอน 09:00 น. (เวลาไทย)
console.log("⏰ [DEBUG] เปิดระบบตั้งเวลา: ส่งอีเมลแจ้งเตือน (ทุกวันเวลา 09:00 น.)");
cron.schedule(
  "0 9 * * *",
  async () => {
    console.log("⏰ [DEBUG CRON TRIGGER] ถึงเวลา 09:00 น. เริ่มรันการแจ้งเตือน...");
    await checkAndSendNotifications();
  },
  {
    scheduled: true,
    timezone: "Asia/Bangkok",
  }
);

// เริ่มรัน Server
app.listen(port, () => {
  console.log(`\n🚀 [DEBUG] Server started successfully! Listening on port: ${port}\n`);
});
// ทดสอบรันทันทีหลังจากเปิด Server 3 วินาที
setTimeout(() => {
  console.log("🛠️ [TEST] เริ่มการรันระบบทดสอบแบบ Manual...");
  checkAndSendNotifications();
}, 3000);