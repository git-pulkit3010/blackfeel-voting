import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trend Vote - T-Shirt Design Voting",
  description: "Vote on trending t-shirt designs across popular categories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}