import { ArrowRight, BarChart3, Bell, Building2, Database, FileUp, Gem, Home, KeyRound, Link2, Shield, Users, UserRound, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";

interface AdminDestination {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
}

const platformDestinations: AdminDestination[] = [
  {
    title: "User accounts",
    description: "Manage user access and account details.",
    href: "/admin/users",
    icon: Users,
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Roles & permissions",
    description: "Review role assignments and access rules.",
    href: "/admin/roles",
    icon: Shield,
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    title: "Investor directory",
    description: "Manage investor profiles and KYC status.",
    href: "/admin/investors",
    icon: UserRound,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Portfolio mappings",
    description: "Connect investors to their user accounts.",
    href: "/admin/user-investment-mapping",
    icon: Link2,
    accent: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  {
    title: "Master data",
    description: "Maintain fund, scheme, and stock reference data.",
    href: "/admin/master-data",
    icon: Database,
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Data imports",
    description: "Upload CAS statements and transaction workbooks.",
    href: "/admin/data-upload",
    icon: FileUp,
    accent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Notifications",
    description: "Review system alerts and activity history.",
    href: "/admin/notifications",
    icon: Bell,
    accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
];

const assetDestinations: AdminDestination[] = [
  {
    title: "Real estate",
    description: "Manage property holdings and records.",
    href: "/admin/real-estate",
    icon: Building2,
    accent: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    title: "Gold holdings",
    description: "Manage physical and digital gold assets.",
    href: "/admin/gold",
    icon: Gem,
    accent: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  {
    title: "Flats & units",
    description: "Review residential property holdings.",
    href: "/admin/flats",
    icon: Home,
    accent: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  },
  {
    title: "Rental properties",
    description: "Manage rental records and property details.",
    href: "/admin/rental-properties",
    icon: KeyRound,
    accent: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  },
  {
    title: "Analytics",
    description: "Explore portfolio and platform analytics.",
    href: "/admin/analytics",
    icon: BarChart3,
    accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
];

const DestinationGrid = ({ destinations }: { destinations: AdminDestination[] }) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {destinations.map(({ title, description, href, icon: Icon, accent }) => (
      <Link
        key={href}
        to={href}
        className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Card className="h-full border-border/70 bg-card transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md">
          <CardContent className="flex h-full items-start gap-4 p-4 sm:p-5">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-3">
                <span className="font-semibold text-foreground">{title}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
              </span>
              <span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span>
            </span>
          </CardContent>
        </Card>
      </Link>
    ))}
  </div>
);

const AdminDashboard = () => (
  <div className="animate-in space-y-7">
    <PageHeader
      title="Admin workspace"
      description="A clear starting point for managing BrickWealth users, data, and assets."
    />

    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-6 py-7 text-white shadow-lg sm:px-9 sm:py-9">
      <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 right-1/3 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
          <Shield className="h-3.5 w-3.5" aria-hidden="true" />
          Administration
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Everything in one place.</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/80 sm:text-base">
          Jump straight into the tools you use to keep the platform and investor records organized.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/admin/users"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950"
          >
            Manage users
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to="/admin/data-upload"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950"
          >
            <FileUp className="h-4 w-4" aria-hidden="true" />
            Import data
          </Link>
        </div>
      </div>
    </section>

    <section className="space-y-3" aria-labelledby="platform-heading">
      <div>
        <h2 id="platform-heading" className="text-lg font-semibold tracking-tight text-foreground">Platform management</h2>
        <p className="mt-1 text-sm text-muted-foreground">Accounts, investor records, and reference data.</p>
      </div>
      <DestinationGrid destinations={platformDestinations} />
    </section>

    <section className="space-y-3" aria-labelledby="assets-heading">
      <div>
        <h2 id="assets-heading" className="text-lg font-semibold tracking-tight text-foreground">Assets & insights</h2>
        <p className="mt-1 text-sm text-muted-foreground">Property records, holdings, and portfolio analysis.</p>
      </div>
      <DestinationGrid destinations={assetDestinations} />
    </section>
  </div>
);

export default AdminDashboard;
