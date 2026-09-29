/* Modified for 简励 by 17lijunyi, 2026-09-30. See root NOTICE and MODIFICATIONS.md. */
import { ReactNode } from "react";
import { Metadata } from "next";
import "./globals.css";
import "./font.css";
import "@/styles/tiptap.scss";

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  metadataBase: new URL("https://magicv.art"),
  icons: {
    icon: "/icon.png?v=jianli-fullbleed-20260930",
    shortcut: "/icon.png?v=jianli-fullbleed-20260930",
    apple: "/icon.png?v=jianli-fullbleed-20260930"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({ children }: Props) {
  return children;
}
