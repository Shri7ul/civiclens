import type { Metadata } from "next";
import "@/styles/index.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "CivicLens",
  description: "Modern GovTech civic management platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
