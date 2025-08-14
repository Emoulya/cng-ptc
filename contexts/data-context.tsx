"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface GasStorageReading {
  id: string
  timestamp: string
  customer: string
  operator: string
  fixedStorageQuantity: number
  storage: string
  psi: number
  temp: number
  psiOut: number
  flowTurbine: number
  remarks: string
}

export interface GasStorageReadingWithFlowMeter extends GasStorageReading {
  flowMeter: number | string
}

interface DataContextType {
  readings: GasStorageReading[]
  addReading: (reading: Omit<GasStorageReading, "id">) => void
  getReadingsByCustomer: (customer: string) => GasStorageReadingWithFlowMeter[]
  getAllReadings: () => GasStorageReadingWithFlowMeter[]
  deleteReading: (id: string) => void
  clearAllData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [readings, setReadings] = useState<GasStorageReading[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("ptc-gas-readings")
    if (savedData) {
      try {
        setReadings(JSON.parse(savedData))
      } catch (error) {
        console.error("Error loading saved data:", error)
      }
    }
  }, [])

  // Save data to localStorage whenever readings change
  useEffect(() => {
    localStorage.setItem("ptc-gas-readings", JSON.stringify(readings))
  }, [readings])

  const calculateFlowMeter = (readingsArray: GasStorageReading[]): GasStorageReadingWithFlowMeter[] => {
    // Sort readings by timestamp to ensure proper order
    const sortedReadings = [...readingsArray].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    return sortedReadings.map((reading, index) => {
      // Find the previous reading for the same storage number
      const previousReading = sortedReadings
        .slice(0, index)
        .reverse()
        .find((r) => r.storage === reading.storage)

      let flowMeter: number | string = "-"

      if (previousReading) {
        try {
          // Calculate difference between current and previous Flow/Turbine values
          const difference = reading.flowTurbine - previousReading.flowTurbine
          flowMeter = difference >= 0 ? difference : "-"
        } catch (error) {
          flowMeter = "-"
        }
      }

      return {
        ...reading,
        flowMeter,
      }
    })
  }

  const addReading = (reading: Omit<GasStorageReading, "id">) => {
    const newReading: GasStorageReading = {
      ...reading,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }
    setReadings((prev) => [newReading, ...prev])
  }

  const getReadingsByCustomer = (customer: string): GasStorageReadingWithFlowMeter[] => {
    const customerReadings = readings.filter((reading) => reading.customer === customer)
    return calculateFlowMeter(customerReadings)
  }

  const getAllReadings = (): GasStorageReadingWithFlowMeter[] => {
    return calculateFlowMeter(readings)
  }

  const deleteReading = (id: string) => {
    setReadings((prev) => prev.filter((reading) => reading.id !== id))
  }

  const clearAllData = () => {
    setReadings([])
    localStorage.removeItem("ptc-gas-readings")
  }

  return (
    <DataContext.Provider
      value={{
        readings,
        addReading,
        getReadingsByCustomer,
        getAllReadings,
        deleteReading,
        clearAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
