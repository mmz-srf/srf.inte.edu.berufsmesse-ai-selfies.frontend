import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "SRF Selfie AI",
  description: "Generate an AI selfie with a SRF background",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
