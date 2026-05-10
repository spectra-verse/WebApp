import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import UserAvatar from "@/components/ui/UserAvatar";

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          {/* <UserAvatar */}
          {/*   email={user.email} */}
          {/*   size={80} */}
          {/*   alt={user.name} */}
          {/* /> */}
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Member since
            </label>
            <p className="text-sm">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Last updated
            </label>
            <p className="text-sm">
              {new Date(user.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

