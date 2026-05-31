import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VERITAS",
  description: "Trust. Security. Intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="fixed inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 left-0 h-96 w-96 rounded-full 
bg-blue-500 blur-[140px]" />
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full 
bg-yellow-500 blur-[140px]" />
          <div className="absolute bottom-0 left-1/2 h-96 w-96 
rounded-full bg-red-500 blur-[140px]" />
        </div>

        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
