"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Customer data from the provided image
const CUSTOMERS = [
  { code: "ALM", name: "ALM" },
  { code: "APM", name: "APM" },
  { code: "APM2", name: "APM2" },
  { code: "BCN", name: "BCN" },
  { code: "BMT", name: "BMT" },
  { code: "BRZ", name: "BRZ" },
  { code: "DKI", name: "DKI" },
  { code: "DP", name: "DP" },
  { code: "DPL", name: "DPL" },
  { code: "DSC", name: "DSC" },
  { code: "DTPI", name: "DTPI" },
  { code: "EIF", name: "EIF" },
  { code: "GFP", name: "GFP" },
  { code: "GSJ", name: "GSJ" },
  { code: "GSJ2", name: "GSJ2" },
  { code: "HKA", name: "HKA" },
  { code: "HL", name: "HL" },
  { code: "IKA", name: "IKA" },
  { code: "ISI", name: "ISI" },
  { code: "KIF", name: "KIF" },
  { code: "KSH", name: "KSH" },
  { code: "KTB", name: "KTB" },
  { code: "LI1", name: "LI1" },
  { code: "LI2", name: "LI2" },
  { code: "LMP", name: "LMP" },
  { code: "LW KOWIS", name: "LW KOWIS" },
  { code: "MF", name: "MF" },
  { code: "MLC", name: "MLC" },
  { code: "MLK", name: "MLK" },
  { code: "MMM", name: "MMM" },
  { code: "MRI", name: "MRI" },
  { code: "MSRA", name: "MSRA" },
  { code: "NCNI", name: "NCNI" },
  { code: "NIC", name: "NIC" },
  { code: "PAGN", name: "PAGN" },
  { code: "PAR", name: "PAR" },
  { code: "RLP2", name: "RLP2" },
  { code: "SKS", name: "SKS" },
  { code: "SMJ", name: "SMJ" },
  { code: "SMJ2", name: "SMJ2" },
  { code: "SMP", name: "SMP" },
  { code: "SMS", name: "SMS" },
  { code: "SPAA", name: "SPAA" },
  { code: "TKI", name: "TKI" },
  { code: "UIL", name: "UIL" },
]

interface CustomerSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function CustomerSelector({ value, onChange }: CustomerSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select customer..." />
      </SelectTrigger>
      <SelectContent>
        {CUSTOMERS.map((customer) => (
          <SelectItem key={customer.code} value={customer.code}>
            {customer.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
