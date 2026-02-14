export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth pages don't need the site header
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}
