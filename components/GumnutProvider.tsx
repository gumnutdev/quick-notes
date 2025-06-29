"use client";

import { useEffect } from "react";
import { configureGumnut } from "@gumnutdev/react";

export function GumnutProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    configureGumnut({
      projectId: "sam-test-proj",
      localDevKey: "_DO_NOT_USE_IN_PROD_rwiGk-LGtoz8i6bugZkWnw",
    });
  }, []);

  return <>{children}</>;
}
