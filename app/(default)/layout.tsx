import Footer from "@/components/ui/footer";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="relative flex grow flex-col">{children}</main>
      <Footer />
    </>
  );
}
