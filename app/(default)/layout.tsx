export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The v2 homepage renders its own header and footer (part of the approved
  // design), so this layout no longer adds the old site footer.
  return <>{children}</>;
}
