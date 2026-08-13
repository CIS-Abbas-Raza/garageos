"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

interface BranchContextType {
  selectedCompany: string | undefined
  selectedBranch: string | undefined
  setSelectedCompany: (companyId: string | undefined) => void
  setSelectedBranch: (branchId: string | undefined) => void
  // Aliases for compatibility
  selectedOrg: string | undefined
  selectedCenter: string | undefined
  setSelectedOrg: (orgId: string | undefined) => void
  setSelectedCenter: (centerId: string | undefined) => void
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [selectedCompany, setSelectedCompanyState] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("selectedCompany") || undefined
    return undefined
  })
  const [selectedBranch, setSelectedBranchState] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("selectedBranch") || undefined
    return undefined
  })

  const setSelectedCompany = useCallback((companyId: string | undefined) => {
    setSelectedCompanyState((prev) => {
      if (prev !== companyId) {
        setSelectedBranchState(undefined)
        localStorage.removeItem("selectedBranch")
      }
      return companyId
    })
    if (companyId) {
      localStorage.setItem("selectedCompany", companyId)
    } else {
      localStorage.removeItem("selectedCompany")
    }
  }, [])

  const setSelectedBranch = useCallback((branchId: string | undefined) => {
    setSelectedBranchState(branchId)
    if (branchId) {
      localStorage.setItem("selectedBranch", branchId)
    } else {
      localStorage.removeItem("selectedBranch")
    }
  }, [])

  return (
    <BranchContext.Provider
      value={{
        selectedCompany,
        selectedBranch,
        setSelectedCompany,
        setSelectedBranch,
        selectedOrg: selectedCompany,
        selectedCenter: selectedBranch,
        setSelectedOrg: setSelectedCompany,
        setSelectedCenter: setSelectedBranch,
      }}
    >
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const context = useContext(BranchContext)
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider")
  }
  return context
}

export const OrgCenterProvider = BranchProvider
export const useOrgCenter = useBranch
