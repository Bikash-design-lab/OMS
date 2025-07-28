import Navbar from "@/components/common/navbar/navbar"; // adjust path if needed
import "./globals.css"; // if using Tailwind or global styles
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My App",
  description: "Next.js Navbar Example",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
