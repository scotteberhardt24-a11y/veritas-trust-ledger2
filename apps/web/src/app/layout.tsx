import './globals.css';
import Providers from "./providers";
import { AuthProvider } from "@/context/AuthContext";


export const metadata = {
  title: 'Veritas Trust Ledger',
  description: 'Decentralized trust infrastructure',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
  <Providers>
    <AuthProvider>{children}</AuthProvider>
  </Providers>
</body>
    </html>
  );
}
