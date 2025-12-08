export default function Footer() {
  return (
    <footer className="py-6 border-t border-border bg-background text-center text-sm text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} Kampo Mido Jewellers. All rights reserved.</p>
    </footer>
  );
}