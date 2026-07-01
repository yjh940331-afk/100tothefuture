export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-black text-fairway-900">{title}</h1>
      <p className="mt-2 text-sm text-fairway-500">시행일: {updated}</p>
      <div className="legal mt-8 space-y-4 leading-relaxed text-fairway-700">
        {children}
      </div>
    </div>
  );
}
