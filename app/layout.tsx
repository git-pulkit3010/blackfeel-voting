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
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className="bg-background-dark text-text-primary min-h-screen">
        {children}
      </body>
    </html>
  );
}