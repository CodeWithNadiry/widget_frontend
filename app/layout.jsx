import "./globals.css";
import Providers from "@/components/Providers";
export const metadata = {
  title: "Hostmind",
  icons: {
    icon: "/logo-mark.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
