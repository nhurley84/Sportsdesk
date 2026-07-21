import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SportsDesk - Your Personalised Sports Hub",
  description:
    "Aggregated live news, podcasts, video highlights, and scores for AFL, NRL, Cricket, Soccer, Basketball, and Motorsports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
