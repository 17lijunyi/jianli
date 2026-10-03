
import { DateInput } from "@heroui/date-input";
import { HeroUIProvider } from "@heroui/react";
import { CalendarDate, parseDate } from "@internationalized/date";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface UnifiedDateInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  className?: string;
}

export function UnifiedDateInput({
  value,
  onChange,
  label,
  isRequired,
  className,
}: UnifiedDateInputProps) {
  const parseValue = (input: string): CalendarDate | null => {
    if (!input) return null;
    try {
      let normalized = input.replace(/[./]/g, "-");
      normalized = normalized.replace(/^(\d{4})-(\d{1,2})$/, (_, year, month) => `${year}-${month.padStart(2, "0")}`);
      if (normalized.length === 7) normalized = `${normalized}-01`;
      return parseDate(normalized);
    } catch {
      return null;
    }
  };

  const isPresent = value === "至今" || value === "Present" || value.includes("Present") || value.includes("至今");

  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(() =>
    parseValue(value)
  );
  const [yearOnly, setYearOnly] = useState(() => /^\d{4}$/.test(value));

  useEffect(() => {
    setSelectedDate(parseValue(value));
    if (/^\d{4}$/.test(value)) setYearOnly(true);
  }, [value]);

  const handleDateChange = (date: CalendarDate | null) => {
    setSelectedDate(date);
    if (!date) {
      onChange("");
      return;
    }
    const month = date.month.toString().padStart(2, "0");
    onChange(`${date.year}/${month}`);
  };

  return (
    <div className={className}>
      {yearOnly ? <Input
        value={value}
        aria-label={label || "日期"}
        placeholder="YYYY 或 YYYY/MM"
        disabled={isPresent}
        onChange={(event) => {
          if (/^[\d./-]{0,10}$/.test(event.target.value)) onChange(event.target.value);
        }}
        onBlur={() => {
          const date = parseValue(value);
          if (date) {
            onChange(`${date.year}/${String(date.month).padStart(2, "0")}`);
            setYearOnly(false);
          }
        }}
      /> :
      <HeroUIProvider locale="ja-JP">
        <DateInput
          aria-label={label || "日期"}
          value={isPresent ? null : selectedDate}
          onChange={handleDateChange}
          isRequired={isRequired}
          granularity={"month" as any}
          variant="bordered"
          labelPlacement="outside"
          shouldForceLeadingZeros
          isDisabled={isPresent}
          className={cn(isPresent && "opacity-50")}
          classNames={{
            inputWrapper:
              "shadow-sm hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary bg-background",
          }}
        />
      </HeroUIProvider>
      }
    </div>
  );
}
