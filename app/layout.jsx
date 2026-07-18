import "./globals.css";
import Providers from "@/components/Providers";
export const metadata = {
  title: "HotelBot Admin",
  icons: {
    icon: "/chatboticon.png",
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
