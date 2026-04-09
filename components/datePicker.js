"use client";
import { useState } from "react";
import {
  Calendar,
  X,
  ChevronLeft as ChevronLeftIcon
} from "lucide-react";

/**
 * Premium Date Picker Component
 * Provides a Year/Month/Day selection flow for consistent UI across the app.
 * @param {string} value - Date string in YYYY-MM-DD format
 * @param {function} onChange - Callback with formatted date string
 * @param {string} label - Input label
 * @param {boolean} error - Error state
 * @param {number} yearRange - Number of years to show (default 20)
 * @param {number} startYearOffset - Offset from current year for start of range (default -5)
 */
export default function PremiumDatePicker({ 
  value, 
  onChange, 
  label, 
  error, 
  yearRange = 20, 
  startYearOffset = -5 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("year"); // year, month, day
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null); // 0-based

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: yearRange }, (_, i) => currentYear + startYearOffset + i);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const handleOpen = () => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedYear(d.getFullYear());
        setSelectedMonth(d.getMonth());
      }
    } else {
      setSelectedYear(currentYear);
      setSelectedMonth(new Date().getMonth());
    }
    setView("year");
    setIsOpen(true);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setView("month");
  };

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
    setView("day");
  };

  const handleDaySelect = (day) => {
    const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const formatDisplayDate = (val) => {
    if (!val) return "dd/mm/yyyy";
    const [y, m, d] = val.split("-");
    if (!y || !m || !d) return "dd/mm/yyyy";
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-tight mb-1.5 block">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between px-4 py-2 sm:py-2.5 bg-background border rounded-md text-xs sm:text-sm transition-all hover:border-primary shadow-sm ${
          error ? "border-destructive ring-1 ring-destructive" : "border-input"
        }`}
      >
        <span className={!value ? "text-muted-foreground" : "font-medium"}>
          {formatDisplayDate(value)}
        </span>
        <Calendar size={16} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-[340px] bg-card border border-border rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border bg-primary/5 flex items-center justify-between">
              <h3 className="font-bold text-[10px] sm:text-xs uppercase tracking-wider text-primary">
                {view === "year" ? "Select Year" : view === "month" ? `Select Month (${selectedYear})` : `Select Day (${months[selectedMonth]} ${selectedYear})`}
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 max-h-[350px] overflow-y-auto custom-scrollbar">
              {view === "year" && (
                <div className="grid grid-cols-4 gap-2">
                  {years.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearSelect(year)}
                      className={`py-1.5 sm:py-2 text-[10px] sm:text-xs rounded-md sm:rounded-lg font-bold transition-all ${
                        selectedYear === year ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-primary/10 text-foreground"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}

              {view === "month" && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {months.map((month, idx) => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => handleMonthSelect(idx)}
                      className={`py-3 sm:py-4 text-[10px] sm:text-xs rounded-md sm:rounded-lg border transition-all font-bold uppercase ${
                        selectedMonth === idx ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" : "bg-muted/30 hover:bg-muted border-border text-foreground"
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}

              {view === "day" && (
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDaySelect(day)}
                      className="aspect-square flex items-center justify-center text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg hover:bg-primary/20 text-foreground transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-primary/30"
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {(view === "month" || view === "day") && (
              <div className="p-3 sm:p-4 border-t border-border flex justify-start bg-muted/10">
                <button
                  type="button"
                  onClick={() => setView(view === "day" ? "month" : "year")}
                  className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeftIcon size={14} /> Back to {view === "day" ? "Month" : "Year"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
