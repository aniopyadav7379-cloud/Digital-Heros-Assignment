export function Footer() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} LeadDesk Mini. All rights reserved.</p>
        <a href="/login" className="hover:text-foreground">
          Admin sign in
        </a>
      </div>
    </footer>
  );
}
