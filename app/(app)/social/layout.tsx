import { SocialHeading } from "./_components/social-heading";
import { SocialTabs } from "./_components/social-tabs";

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <SocialHeading />

      <SocialTabs />

      {children}
    </div>
  );
}
