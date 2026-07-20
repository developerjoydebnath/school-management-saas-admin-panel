export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="bg-background text-foreground h-screen overflow-y-auto">
			{children}
		</main>
	);
}
