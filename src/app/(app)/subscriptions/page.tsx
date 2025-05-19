import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, CheckCircle, XCircle, Star } from 'lucide-react';
import Link from 'next/link';

const subscriptionTiers = [
  {
    name: 'Free Tier',
    price: '$0',
    frequency: '/month',
    features: [
      { text: 'Manage 1 Pet Profile', included: true },
      { text: 'Basic Health Tracking', included: true },
      { text: 'Appointment Reminders', included: true },
      { text: 'Vaccination Tracking (Basic)', included: true },
      { text: 'Medication Management (Basic)', included: false },
      { text: 'Advanced Health Charts', included: false },
      { text: 'Medical Record Sharing', included: false },
      { text: 'Priority Support', included: false },
    ],
    isCurrent: false,
    cta: 'Get Started',
  },
  {
    name: 'Pro Plan',
    price: '$9.99',
    frequency: '/month',
    features: [
      { text: 'Manage up to 5 Pet Profiles', included: true },
      { text: 'Full Health Tracking', included: true },
      { text: 'Appointment Scheduling & Reminders', included: true },
      { text: 'Detailed Vaccination Tracking', included: true },
      { text: 'Comprehensive Medication Management', included: true },
      { text: 'Advanced Health Charts', included: true },
      { text: 'Medical Record Sharing (with 1 vet)', included: true },
      { text: 'Standard Support', included: true },
    ],
    isCurrent: true, // Example: User is on Pro Plan
    cta: 'Current Plan',
    highlight: true,
  },
  {
    name: 'Premium Plan',
    price: '$19.99',
    frequency: '/month',
    features: [
      { text: 'Manage Unlimited Pet Profiles', included: true },
      { text: 'Full Health Tracking & Analytics', included: true },
      { text: 'Advanced Appointment Features', included: true },
      { text: 'Automated Vaccination Reminders & Reports', included: true },
      { text: 'Smart Medication Notifications', included: true },
      { text: 'AI-Powered Health Insights (Coming Soon)', included: true },
      { text: 'Medical Record Sharing (unlimited)', included: true },
      { text: 'Priority Support & Vet Concierge', included: true },
    ],
    isCurrent: false,
    cta: 'Upgrade to Premium',
  },
];

export default function SubscriptionsPage() {
  return (
    <>
      <PageHeader
        title="Subscription Plans"
        description="Choose the plan that best fits your pet care needs."
        icon={CreditCard}
      />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {subscriptionTiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col shadow-lg hover:shadow-2xl transition-shadow ${tier.highlight ? 'border-primary border-2 ring-4 ring-primary/20' : ''}`}>
            {tier.highlight && (
              <div className="py-1 px-4 bg-primary text-primary-foreground text-sm font-semibold text-center rounded-t-md -mt-px">
                Most Popular
              </div>
            )}
            <CardHeader className="items-center text-center">
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <div className="text-4xl font-bold text-primary">
                {tier.price}
                <span className="text-lg font-normal text-muted-foreground">{tier.frequency}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3 text-sm">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {feature.included ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground/50" />}
                    <span className={!feature.included ? 'text-muted-foreground/70' : ''}>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full text-lg py-6" disabled={tier.isCurrent}>
                {tier.isCurrent ? <><Star className="mr-2 h-5 w-5 fill-yellow-400 text-yellow-400"/> {tier.cta}</> : tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle>Manage Your Subscription</CardTitle>
          <CardDescription>View your current billing details and make changes to your plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <h4 className="font-semibold">Current Plan: <span className="text-primary">Pro Plan</span></h4>
                <p className="text-sm text-muted-foreground">Renews on: September 1, 2024</p>
            </div>
            <div>
                <h4 className="font-semibold">Payment Method</h4>
                <p className="text-sm text-muted-foreground">Visa ending in **** 1234</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline">Update Payment Method</Button>
                <Button variant="destructive" disabled>Cancel Subscription</Button> {/* Placeholder for cancellation */}
            </div>
            <Link href="#" className="text-sm text-primary hover:underline">View Billing History</Link>
        </CardContent>
      </Card>
    </>
  );
}
