import { Logo } from '@/components/shared/logo';
import { Card } from '@/components/ui/card';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-background p-4">
      <Card className="w-full max-w-md shadow-2xl mb-6">
        {children}
      </Card>
      <Logo className="mt-8" iconSize={24} textSize="text-xl" href="/"/>
    </div>
  );
}
