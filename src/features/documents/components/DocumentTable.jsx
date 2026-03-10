import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { Download, Upload, Info, Trash2, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { toThaiDate, formatNumber } from '../../../utils/helpers';
import * as XLSX from 'xlsx';

ModuleRegistry.registerModules([AllCommunityModule]);

const DocumentTable = ({ data, onImport, onDelete }) => {
  // --- 1. ฟังก์ชันจัดการไฟล์ ---
  const handleExport = () => {
    const exportData = data.map(item => ({
      "วันที่วางบิล": toThaiDate(item.date_record),
      "Supplier": item.ap_name,
      "Invoice No.": item.inv_no,
      "Net Pay": item.net_pay_amt,
      "กำหนดจ่าย": toThaiDate(item.due_date),
      "ผู้บันทึก": item.recorder_name
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `Yudong_Export_${new Date().getTime()}.xlsx`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // ... (Logic การอ่านไฟล์ Excel เหมือน Step 10) ...
    // ผมแนะนำให้คุณยก Logic handleFileChange จาก Step 10 มาวางตรงนี้ครับ
     const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { range: 2 });

        const formatted = json.map(row => {
          // ล้างชื่อคอลัมน์จากช่องว่าง
          const cleanRow = {};
          Object.keys(row).forEach(k => cleanRow[k.trim()] = row[k]);

          return {
            date_record: smartParseDate(cleanRow["Date"]),
            ap_name: cleanRow["Code"]?.toString() || "",
            inv_no: cleanRow["Inv. No."] || "",
            job_no: cleanRow["Job no."] || "",
            net_pay_amt: Number(cleanRow["Net pay"] || 0),
            due_date: smartParseDate(cleanRow["Due Date"]),
            // ใส่ฟิลด์ที่จำเป็นตาม Schema
          };
        }).filter(item => item.date_record); // กรองแถวว่าง

        onImport(formatted); // ส่งไปบันทึกที่ useDocuments
      } catch (err) {
        Swal.fire("Error", "ไฟล์ Excel รูปแบบไม่ถูกต้อง", "error");
      } finally {
        e.target.value = ""; // รีเซ็ต input
      }
    };
    reader.readAsArrayBuffer(file);
  };
  };
  // --- 1. ฟังก์ชันแสดง Modal รายละเอียด (จากของเดิมที่คุณให้มา) ---
  const handleView = (data) => {
    Swal.fire({
      title: `
        <div class="flex items-center gap-2 justify-center pb-2 border-b border-slate-100">
          <span class="text-blue-600 font-bold text-xl">INV:</span> 
          <span class="text-slate-800 text-xl font-bold">${data.inv_no}</span>
        </div>`,
      html: `
      <div class="text-left font-sans mt-4">
        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 grid grid-cols-1 gap-3 shadow-sm">
          <div class="flex justify-between border-b border-slate-200/60 pb-2">
            <span class="text-slate-500 text-sm">Supplier:</span>
            <span class="font-bold text-slate-800">${data.ap_name}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/60 pb-2">
            <span class="text-slate-500 text-sm">ชื่อลูกค้า:</span>
            <span class="font-semibold text-slate-800">${data.customer_name || "-"}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/60 pb-2">
            <span class="text-slate-500 text-sm">Job No:</span>
            <span class="font-bold text-blue-600 bg-blue-50 px-3 rounded-lg text-xs py-1 border border-blue-100">${data.job_no}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/60 pb-2 text-sm">
            <span class="text-slate-500">วันที่วางบิล:</span>
            <span class="text-slate-700 font-semibold">${toThaiDate(data.date_record)}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/60 pb-2 text-sm">
            <span class="text-slate-500">Credit Term:</span>
            <span class="text-slate-700 font-medium">${data.credit_term || 15} วัน</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/60 pb-2 text-sm">
            <span class="text-slate-500 font-bold text-blue-600">รอบวันที่จ่าย:</span>
            <span class="text-blue-700 font-black underline decoration-blue-200">${toThaiDate(data.payment_date) || "ยังไม่ได้ระบุ"}</span>
          </div>
          <div class="flex justify-between text-sm pt-1">
            <span class="text-slate-500">ผู้บันทึก:</span>
            <span class="text-indigo-600 font-bold flex items-center gap-1">
               ${data.recorder_name || "System"}
            </span>
          </div>
        </div>

        <div class="space-y-4 px-1">
          <div class="flex justify-between items-center">
            <span class="text-slate-500 text-sm font-medium">ยอด Advance (สำรองจ่าย):</span>
            <span class="font-mono text-slate-800 font-bold">฿${formatNumber(data.advance_amt)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 text-sm font-medium">ค่าขนส่ง (Transport):</span>
            <span class="font-mono text-slate-800 font-bold">฿${formatNumber(data.transport_amt)}</span>
          </div>
          <div class="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
            <span class="text-slate-600 text-sm font-bold">รวม (Adv + Trans):</span>
            <span class="font-mono text-slate-900 font-black">฿${formatNumber(data.total_amt)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-red-500 text-sm font-bold">หัก ณ ที่จ่าย (WHT 1%):</span>
            <span class="font-mono text-red-600 font-bold">- ฿${formatNumber(data.wht_1_amt)}</span>
          </div>
          
          <div class="border-t-2 border-dashed border-slate-100 my-4"></div>

          <div class="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 flex justify-between items-center transform transition-hover hover:scale-[1.02]">
            <div>
              <p class="text-[10px] text-blue-100 uppercase font-black tracking-[0.2em] mb-1">Net Pay Amount</p>
              <p class="text-sm text-blue-50 font-medium italic">ครบกำหนด: ${toThaiDate(data.due_date)}</p>
            </div>
            <div class="text-right">
              <span class="text-3xl font-black font-mono tracking-tighter">฿${formatNumber(data.net_pay_amt)}</span>
            </div>
          </div>
        </div>
      </div>
    `,
      showCloseButton: true,
      confirmButtonText: 'รับทราบ',
      confirmButtonColor: "#1e293b", // สี Slate-800 ให้เข้ากับธีมใหม่
      customClass: {
        popup: "rounded-[2rem] border-none shadow-2xl",
        confirmButton: "rounded-2xl px-12 py-4 text-base font-black shadow-lg shadow-slate-200",
      },
    });
  };

  // --- 2. ตั้งค่าคอลัมน์ (ColDefs) จากโปรเจกต์เดิม ---
  const colDefs = useMemo(() => [
 {
      field: "date_record",
      headerName: "วันที่วางบิล",
      width: 115,
      filter: true,
      sortable: true,
      sort: "desc", // ✨ เพิ่มตรงนี้เพื่อให้เรียงจากใหม่ไปเก่าทันทีที่เปิดหน้าเว็บ
      valueFormatter: (p) => toThaiDate(p.value),
    },
    {
      field: "ap_name",
      headerName: "Supplier",
      filter: true,
      flex: 1,
      minWidth: 180,
    },
    {
      field: "customer_name",
      headerName: "ชื่อลูกค้า",
      flex: 1,
      minWidth: 160, // ล็อกความกว้างไว้เลย เพราะปกติชื่อคนไม่ยาวเท่าชื่อบริษัท
      filter: true,
    },
    {
      field: "inv_no",
      headerName: "Invoice No.",
      flex: 1,
      minWidth: 120, // ปรับให้พอดีกับตัวเลข INV
      filter: true,
    },
    {
      field: "job_no",
      headerName: "Job No.",
      flex: 1,
      minWidth: 100,
      filter: true,
    },
    {
      field: "total_amt",
      headerName: "ยอดรวม",
      width: 115,
      valueFormatter: (p) => `฿${formatNumber(p.value)}`,
      cellStyle: { color: "#475569", fontWeight: "bold", textAlign: "right" },
      filter: true,
    },
    {
      field: "net_pay_amt",
      headerName: "Net Pay",
      width: 120,
      valueFormatter: (p) => `฿${formatNumber(p.value)}`,
      cellStyle: { color: "#16a34a", fontWeight: "bold", textAlign: "right" },
      filter: true,
    },
    {
      field: "due_date",
      headerName: "วันครบรอบกำหนดจ่าย", // แก้ตามข้อ 2
      width: 130,
      valueFormatter: (p) => toThaiDate(p.value),
      filter: true,
    },
    {
      field: "payment_date", // เพิ่มคอลัมน์วันที่จ่ายจริง
      headerName: "รอบวันที่จ่าย",
      width: 115,
      filter: true,
      valueFormatter: (p) => toThaiDate(p.value),
      cellStyle: (p) =>
        p.value ? { color: "#0ea5e9", fontWeight: "bold" } : null,
    },
    {
      field: "recorder_name",
      headerName: "ผู้บันทึก",
      width: 110,
      cellRenderer: (p) => (
        <div className="flex items-center gap-2 text-slate-600 h-full">
          <span className="text-xs font-bold">{p.value || "System"}</span>
        </div>
      ),
    },
    {
      headerName: "จัดการ",
      width: 100,
      pinned: "right",
      cellRenderer: (params) => (
        <div className="flex gap-2 h-full items-center justify-center">
          <button onClick={() => handleView(params.data)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Info size={18} /></button>
          <button onClick={() => onDelete(params.data.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ], [onDelete]);

    return (
    <div className="flex flex-col h-full bg-white">
      {/* --- Toolbar: ปุ่ม Import/Export กลับมาแล้ว! --- */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
        <div className="flex items-center gap-2">
           <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <FileText size={20} />
           </div>
           <h3 className="font-black text-slate-800 text-lg tracking-tight">Master Documents</h3>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
          >
            <Download size={18} /> Export Excel
          </button>
          
          <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 cursor-pointer transition-all shadow-lg shadow-slate-200 active:scale-95">
            <Upload size={18} /> Import Excel
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
          </label>
        </div>
      </div>

      {/* --- Table Container --- */}
      <div className="flex-1 ag-theme-quartz custom-grid">
          <AgGridReact
            rowData={data}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={20}
            rowHeight={50}
            headerHeight={50}
            className="h-full w-full"
          />
      </div>
    </div>
  );
};

export default DocumentTable;