export default function Footer() {
  return (
    <footer className="py-4 md:py-6 border-t border-border bg-background text-center text-xs sm:text-sm text-muted-foreground px-4">
      <p>&copy; {new Date().getFullYear()} Kampo Mido Jewellers. All rights reserved.</p>
    </footer>
  );
}