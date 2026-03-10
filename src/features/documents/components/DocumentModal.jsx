/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { X, Calculator, Save } from "lucide-react";

const DocumentModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date_record: new Date().toISOString().split("T")[0],
    ap_name: "",
    customer_name: "",
    inv_no: "",
    job_no: "",
    due_date: "",
    credit_term: 15,
    advance_amt: 0,
    transport_amt: 0,
  });

  const advance = parseFloat(formData.advance_amt) || 0;
  const transport = parseFloat(formData.transport_amt) || 0;

  // ข้อ 4: คำนวณและคุมทศนิยม 2 ตำแหน่งด้วย toFixed แล้วแปลงกลับเป็น Number
  const wht_1_amt = Number((transport * 0.01).toFixed(2));
  const total_amt = Number((advance + transport).toFixed(2));
  const net_pay_amt = Number((total_amt - wht_1_amt).toFixed(2));

  // ฟังก์ชันช่วยคำนวณรอบการจ่าย
  const getCompanyPaymentCycle = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = d.getDate();

    if (day <= 15) {
      d.setDate(15);
    } else {
      // กรณีวันที่มากกว่า 15 ให้เซตเป็นวันที่ 30
      d.setDate(30);
    }
    return d.toISOString().split("T")[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let newData = { ...prev, [name]: value };

      // ถ้าแก้ "วันที่วางบิล" หรือ "เครดิตเทอม" ให้คำนวณ Due Date และ รอบจ่าย ใหม่
      if (name === "date_record" || name === "credit_term") {
        const start = new Date(newData.date_record);
        start.setDate(start.getDate() + parseInt(newData.credit_term));

        const calculatedDueDate = start.toISOString().split("T")[0];
        newData.due_date = calculatedDueDate;

        // คำนวณรอบวันที่จ่าย (Payment Cycle) ตามเงื่อนไขใหม่
        newData.payment_date = getCompanyPaymentCycle(calculatedDueDate);
      }

      return newData;
    });
  };

  const calculateDueDate = (startDate, days) => {
    if (!startDate) return "";
    const date = new Date(startDate);
    date.setDate(date.getDate() + parseInt(days || 0));
    return date.toISOString().split("T")[0]; // แปลงเป็นรูปแบบ YYYY-MM-DD สำหรับ Input Date
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      advance_amt: Number(advance.toFixed(2)),
      transport_amt: Number(transport.toFixed(2)),
      total_amt,
      wht_1_amt,
      net_pay_amt,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator size={24} className="text-blue-400" />
            บันทึกเอกสารใหม่
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1 rounded-full hover:bg-red-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* 1. วันที่วางบิล */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  วันที่วางบิล
                </label>
                <input
                  type="date"
                  name="date_record"
                  value={formData.date_record}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                {/* ข้อ 1: ใช้คำว่า Supplier */}
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  name="ap_name"
                  value={formData.ap_name}
                  onChange={handleChange}
                  placeholder="ระบุชื่อ Supplier"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              {/* ... ฟิลด์อื่นๆ คงเดิม ... */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  ชื่อลูกค้า (Customer Name)
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="ระบุชื่อลูกค้า"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  เลข Invoice (Inv No.)
                </label>
                <input
                  type="text"
                  name="inv_no"
                  value={formData.inv_no}
                  onChange={handleChange}
                  placeholder="INV-XXXX"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  เลขที่งาน (Job No.)
                </label>
                <input
                  type="text"
                  name="job_no"
                  value={formData.job_no}
                  onChange={handleChange}
                  placeholder="JOB-XXXX"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  รอบเครดิต (วัน)
                </label>
                <select
                  name="credit_term"
                  value={formData.credit_term}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value={15}>15 วัน</option>
                  <option value={30}>30 วัน</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* 2. เครดิตเทอม (15/30 วัน) */}

              {/* 3. วันครบรอบกำหนดจ่าย (Auto) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  วันครบรอบกำหนดจ่าย
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full border border-blue-200 bg-blue-50/50 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-blue-700 font-medium"
                />
                <p className="text-[10px] text-blue-500 mt-1">
                  * คำนวณจาก (วันที่วางบิล + รอบเครดิต)
                </p>
              </div>
              {/* 3. รอบวันที่จ่ายของบริษัท (Payment Cycle) */}
              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-1">
                  รอบวันที่จ่าย
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  className="w-full border border-emerald-200 bg-emerald-50/50 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-700 font-bold"
                />
                <p className="text-[10px] text-emerald-600 mt-1">
                  * ตัดรอบทุกวันที่ 15 และ 30
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Advance (บาท)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="advance_amt"
                      value={formData.advance_amt}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg p-2 text-right font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Transport (บาท)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="transport_amt"
                      value={formData.transport_amt}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg p-2 text-right font-mono"
                    />
                  </div>
                </div>

                {/* แสดงผลคำนวณ */}
                <div className="border-t border-slate-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">รวม (Adv + Trans):</span>
                    {/* ข้อ 4: แสดงทศนิยม 2 ตำแหน่ง */}
                    <span className="font-semibold text-slate-700">
                      {total_amt.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      หัก ณ ที่จ่าย (1% Trans):
                    </span>
                    <span className="font-semibold text-red-500">
                      -
                      {wht_1_amt.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                    <span className="text-blue-800 font-bold text-sm uppercase">
                      Net Pay (จ่ายสุทธิ)
                    </span>
                    <span className="text-blue-700 font-bold text-xl">
                      {net_pay_amt.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="cursor-pointer px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 font-medium transition-all active:scale-95"
            >
              <Save size={16} className="inline-block mr-2" /> บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentModal;
