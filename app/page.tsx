'use client';

import { useEffect, useState } from 'react';
import { metricsApi, DashboardSummary } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  ArrowRight, 
  Zap, 
  Users, 
  FlaskConical, 
  TrendingUp, 
  Shield, 
  Rocket,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Target,
  Gauge
} from 'lucide-react';

export default function HomePage() {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await metricsApi.getDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (err: any) {
      // Silently fail for homepage - it's okay if dashboard data doesn't load
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const { summary } = dashboardData || { summary: null };

  const features = [
    {
      icon: Zap,
      title: 'Feature Flags',
      description: 'Toggle features on/off instantly without code deployments. Control rollouts with precision.',
    },
    {
      icon: FlaskConical,
      title: 'A/B Testing',
      description: 'Run experiments and test different variations with confidence. Make data-driven decisions.',
    },
    {
      icon: Users,
      title: 'User Targeting',
      description: 'Enable features for specific users or user segments. Granular control over who sees what.',
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Track usage, measure performance, and make data-driven decisions with real-time insights.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with reliable infrastructure. Your data is safe and always available.',
    },
    {
      icon: Rocket,
      title: 'Fast & Scalable',
      description: 'Built for performance. Handle millions of requests with sub-millisecond response times.',
    },
  ];

  const benefits = [
    'Reduce deployment risk with gradual rollouts',
    'Test new features with real users safely',
    'Instant feature toggles without code changes',
    'Data-driven decision making with analytics',
    'Target specific user segments precisely',
    'Monitor performance in real-time',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative mx-auto px-4 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6" variant="secondary">
              Feature Flags & A/B Testing Platform
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Ship Features with
              <br />
              <span className="text-foreground">
                Confidence
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-2xl mx-auto">
              Professional feature flag management and A/B testing platform. 
              Control feature rollouts, run experiments, and make data-driven decisions—all in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-base px-8">
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link href="/flags">
                  Explore Features
                </Link>
              </Button>
            </div>
            
            {/* Stats Preview */}
            {summary && (
              <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{summary.totalFlags}</div>
                  <div className="text-sm text-muted-foreground mt-1">Feature Flags</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{summary.totalUsers}</div>
                  <div className="text-sm text-muted-foreground mt-1">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{summary.totalExperiments}</div>
                  <div className="text-sm text-muted-foreground mt-1">Experiments</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage features, run experiments, and make data-driven decisions
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative"
              >
                <div className="h-full p-8 border border-foreground/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl bg-background">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 border border-foreground/20 group-hover:border-primary transition-colors">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 border-y">
        <div className="container mx-auto px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <Badge variant="outline" className="mb-4">
                  Benefits
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                  Why Choose Skitt?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Streamline your development workflow and reduce risk with powerful feature management tools.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-base">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      Start Using Skitt
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 border-foreground/10">
                  <BarChart3 className="h-8 w-8 text-primary mb-4" />
                  <div className="text-2xl font-bold">Real-time</div>
                  <div className="text-sm text-muted-foreground mt-1">Analytics & Insights</div>
                </Card>
                <Card className="p-6 border-foreground/10">
                  <Target className="h-8 w-8 text-primary mb-4" />
                  <div className="text-2xl font-bold">Precise</div>
                  <div className="text-sm text-muted-foreground mt-1">User Targeting</div>
                </Card>
                <Card className="p-6 border-foreground/10">
                  <Gauge className="h-8 w-8 text-primary mb-4" />
                  <div className="text-2xl font-bold">Fast</div>
                  <div className="text-sm text-muted-foreground mt-1">Sub-ms Response</div>
                </Card>
                <Card className="p-6 border-foreground/10">
                  <Shield className="h-8 w-8 text-primary mb-4" />
                  <div className="text-2xl font-bold">Secure</div>
                  <div className="text-sm text-muted-foreground mt-1">Enterprise Grade</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join teams using Skitt to ship features faster, safer, and with confidence. 
              Start managing your feature flags and experiments today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-base px-10 h-12">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-10 h-12 border-foreground/20">
                <Link href="/flags">
                  Explore Features
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
