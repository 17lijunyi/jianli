/* Modified for 简励 by 17lijunyi, 2026-09-30. See root NOTICE and MODIFICATIONS.md. */

import { useEffect } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { HeroUIProvider } from "@heroui/react";
import { useLocale } from "@/i18n/compat/client";
import { useResumeDirectorySync } from "@/hooks/useResumeDirectorySync";

export function Providers({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  useResumeDirectorySync();

  return (
    <HeroUIProvider locale={locale}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="magic-resume-theme"
        >
          <SystemAppearance />
          {children}
        </ThemeProvider>
    </HeroUIProvider>
  );
}

function SystemAppearance() {
  const {setTheme} = useTheme();
  useEffect(() => { setTheme("system"); }, [setTheme]);
  return null;
}
