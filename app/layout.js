import './globals.css'

export const metadata = {
  title: 'RIWA POS System',
  description: 'Restaurant Point of Sale & Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}