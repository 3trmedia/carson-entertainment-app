import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carson Portfolio — Monthly Focus Board",
  description: "Monthly focus, company reference notes, and the shared idea board for the Carson portfolio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
