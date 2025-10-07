import SettingsAlert from "./SettingsAlert";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="h-full overflow-auto">
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <SettingsAlert />

        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}