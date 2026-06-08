"use client";
import { createContext, useContext } from "react";

interface AdminShellContextValue {
  collapsed: boolean;
  onOpen: () => void;
}

export const AdminShellContext = createContext<AdminShellContextValue>({
  collapsed: false,
  onOpen: () => {},
});

export function useSidebar() {
  return useContext(AdminShellContext);
}
