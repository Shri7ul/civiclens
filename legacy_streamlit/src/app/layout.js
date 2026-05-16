import "./globals.css";

export const metadata = {
  title: "CivicLens",
  description: "DBMS Project MVP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}