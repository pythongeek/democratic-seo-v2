import Link from "next/link";
import { Github, Twitter, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">OpenSEO Democratic</h3>
            <p className="text-sm text-muted-foreground">
              Community-driven SEO tools. Open source, transparent, and democratic.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
              <li><Link href="/mcp" className="hover:text-foreground">MCP Server</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/community" className="hover:text-foreground">Contributions</Link></li>
              <li><Link href="/governance" className="hover:text-foreground">Governance</Link></li>
              <li><Link href="/roadmap" className="hover:text-foreground">Roadmap</Link></li>
              <li><Link href="/templates" className="hover:text-foreground">Templates</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <Link href="https://github.com/pythongeek/democratic-seo-v2" target="_blank">
                <Github className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Link>
              <Link href="https://twitter.com/openseo" target="_blank">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Link>
              <Link href="https://discord.gg/openseo" target="_blank">
                <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} OpenSEO Democratic. MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
