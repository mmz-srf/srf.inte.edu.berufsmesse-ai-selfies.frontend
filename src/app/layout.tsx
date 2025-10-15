import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trading-Card AI",
  description: "Generate your own trading cards using AI",
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
