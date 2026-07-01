import { useAuth } from "@/context/AuthContext"
import { useProject } from "@/context/ProjectContext"
import { useThemeConfig } from "@/components/ui/active-theme"
import { useTheme } from "@/context/ThemeProvider"
import useDocumentMetadata from "@/hooks/useDocumentMetadata"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  UserIcon,
  GearIcon,
  ChartPieIcon,
  SignOutIcon,
  PaletteIcon,
  EnvelopeIcon,
  IdentificationCardIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react"

export default function Profile() {
  useDocumentMetadata({
    title: "User Profile & Preferences",
    description: "View database account credentials, workspaces statistics, and set system color themes."
  })

  const { user, logout } = useAuth()
  const { projects } = useProject()
  const { theme, setTheme } = useTheme()
  const { activeTheme, setActiveTheme } = useThemeConfig()

  if (!user) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <Card className="border-dashed border-muted-foreground/20 bg-muted/5 py-12">
          <CardContent className="space-y-4">
            <UserIcon className="size-12 mx-auto text-muted-foreground/60" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Not Authenticated</h2>
              <p className="text-sm text-muted-foreground">
                No user information is available. Please sign in to view your profile.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Get initials for Avatar placeholder
  const getInitials = () => {
    if (user.full_name) {
      const parts = user.full_name.trim().split(/\s+/)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
      }
      return parts[0][0].toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  const THEMES = [
    {
      name: "Default System Theme",
      value: "default",
      desc: "Clean layout matching the main environment",
      colorClass: "bg-muted border-border",
    },
    {
      name: "Ocean Breeze (Blue)",
      value: "blue",
      desc: "Cool slate and maritime blue highlight system",
      colorClass: "bg-sky-600 border-sky-500",
    },
    {
      name: "Midnight Navy (Dark Blue)",
      value: "dark-blue",
      desc: "Deep atmospheric blue ideal for dark setups",
      colorClass: "bg-blue-950 border-blue-800",
    },
    {
      name: "Rose Garden",
      value: "rose",
      desc: "Soft pink highlights with a warm, elegant feel",
      colorClass: "bg-rose-500 border-rose-400",
    },
    {
      name: "Sunset Glow",
      value: "sunset",
      desc: "Warm orange tones for vibrant dashboards",
      colorClass: "bg-orange-500 border-orange-400",
    },
    {
      name: "Forest Mist",
      value: "forest",
      desc: "Natural green accents with soft, earthy contrast",
      colorClass: "bg-emerald-600 border-emerald-500",
    },
    {
      name: "Mint Frost",
      value: "mint",
      desc: "Fresh minty greens for a calm workspace",
      colorClass: "bg-teal-500 border-teal-400",
    },
    {
      name: "Slate Calm",
      value: "slate",
      desc: "Subtle slate hues for a modern, muted UI",
      colorClass: "bg-slate-600 border-slate-500",
    },
    {
      name: "Lavender Haze",
      value: "lavender",
      desc: "Soft purple highlights with a serene visual tone",
      colorClass: "bg-violet-500 border-violet-400",
    },
  ] as const

  return (
    <main className="container mx-auto max-w-4xl space-y-8 px-4 py-8 md:px-8 animate-in fade-in-50 duration-300">
      {/* Header Profile Info Banner */}
      <Card className="shadow-lg border-muted/50 overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <CardContent className="pt-8 pb-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Circular Initials Avatar */}
          <div className="size-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-2xl font-black shadow-inner shrink-0">
            {getInitials()}
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                {user.full_name || "Smart PM Developer"}
              </h1>
              <Badge variant="outline" className="w-fit mx-auto sm:mx-0 text-[10px] bg-primary/5 text-primary border-primary/20 font-semibold uppercase">
                Active Member
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
              <EnvelopeIcon className="size-3.5" />
              {user.email}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2 text-xs font-semibold text-destructive border-destructive/20 hover:bg-destructive/10 shrink-0"
          >
            <SignOutIcon className="size-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Tabs Menu Structure */}
      <Tabs defaultValue="account" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/30 border border-muted/50">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <UserIcon className="size-3.5" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <ChartPieIcon className="size-3.5" />
            <span>Workspace Stats</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <GearIcon className="size-3.5" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Account info */}
        <TabsContent value="account" className="space-y-6">
          <Card className="shadow-sm border-muted/50">
            <CardHeader className="border-b border-muted/10">
              <CardTitle className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <IdentificationCardIcon className="size-4 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Details linked directly to your authenticated session.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Full Name</Label>
                  <div className="p-2.5 rounded-sm border bg-muted/10 text-foreground font-medium text-xs">
                    {user.full_name || "Not Specified"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Email Address</Label>
                  <div className="p-2.5 rounded-sm border bg-muted/10 text-foreground font-medium text-xs">
                    {user.email}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Account Role</Label>
                  <div className="p-2.5 rounded-sm border bg-muted/10 text-foreground font-medium text-xs">
                    Software Engineer / Developer
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">User Database ID</Label>
                  <div className="p-2.5 rounded-sm border bg-muted/10 text-foreground font-mono text-xs">
                    USR-{user.id}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Activity stats */}
        <TabsContent value="stats" className="space-y-6">
          {/* Counter cards */}
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3">
            <Card className="shadow-sm border-muted/50">
              <CardContent className="py-6 text-center space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                  Active Projects
                </span>
                <span className="text-2xl font-black text-foreground block">
                  {projects.length}
                </span>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-muted/50">
              <CardContent className="py-6 text-center space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                  Assigned Sprints
                </span>
                <span className="text-2xl font-black text-foreground block">
                  2
                </span>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-muted/50 col-span-2 sm:col-span-1">
              <CardContent className="py-6 text-center space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                  Active Workspace Tasks
                </span>
                <span className="text-2xl font-black text-foreground block">
                  14
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Connected Workspaces list */}
          <Card className="shadow-sm border-muted/50">
            <CardHeader className="border-b border-muted/10">
              <CardTitle className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <ChartPieIcon className="size-4 text-primary" />
                Active Workspace Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {projects.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No active projects found. Go to the Projects tab to add one.
                </p>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-md border border-muted/20 hover:bg-muted/5 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground text-xs">{project.name}</span>
                        {project.description && (
                          <span className="text-[10px] text-muted-foreground block">{project.description}</span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[9px]">
                        ID: {project.id}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Settings and Preferences */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="shadow-sm border-muted/50">
            <CardHeader className="border-b border-muted/10">
              <CardTitle className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <PaletteIcon className="size-4 text-primary" />
                Appearance Settings
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Customize colors and UI layout configurations.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <Label className="font-semibold text-foreground text-xs">Choose UI Color Theme</Label>
                <div className="grid gap-4 sm:grid-cols-3">
                  {THEMES.map((theme) => {
                    const isActive = activeTheme === theme.value
                    return (
                      <button
                        key={theme.value}
                        type="button"
                        onClick={() => setActiveTheme(theme.value)}
                        className={`flex flex-col text-left p-4 rounded-md border transition-all duration-200 bg-card hover:bg-muted/10 ${
                          isActive
                            ? "border-primary ring-1 ring-primary"
                            : "border-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`size-3 rounded-full ${theme.colorClass} border shrink-0`} />
                          <span className="font-bold text-xs text-foreground shrink-0">{theme.name}</span>
                          {isActive && (
                            <CheckCircleIcon className="size-4 text-primary shrink-0 ml-auto" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                          {theme.desc}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-semibold text-foreground text-xs">Adjust theme mode</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "System", value: "system" },
                    { label: "Light", value: "light" },
                    { label: "Dark", value: "dark" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value as "system" | "light" | "dark")}
                      className={`rounded-md border px-4 py-3 text-left text-xs font-semibold transition-all duration-200 ${
                        theme === option.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-muted/50 bg-card text-muted-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Overrides system mode to force light or dark UI across the site.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
