"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Toast } from "@/components/ui/Toast";

export function SurveyCreatedToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!searchParams.get("created")) return;
    setShow(true);
    const t = setTimeout(() => {
      setShow(false);
      router.replace(pathname, { scroll: false });
    }, 2500);
    return () => clearTimeout(t);
  }, [searchParams, pathname]);

  return <Toast show={show} message="Undersøkelse opprettet og aktivert!" />;
}
