import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, TrendingUp, AlertTriangle, Calendar, CreditCard } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, differenceInDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface MembershipLevel {
  id: string;
  name: string;
  price: number;
  status: string;
}

interface Membership {
  id: string;
  membership_level_id: string;
  full_name: string;
  email: string;
  purchase_date: string;
  expiration_date: string;
  active: boolean;
  payment_status: string;
  created_at: string;
  membership_levels?: MembershipLevel;
}

interface VIPAnalyticsDashboardProps {
  memberships: Membership[] | undefined;
  levels: MembershipLevel[] | undefined;
  isLoading: boolean;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
];

const VIPAnalyticsDashboard = ({ memberships, levels, isLoading }: VIPAnalyticsDashboardProps) => {
  const analytics = useMemo(() => {
    if (!memberships || !levels) return null;

    const now = new Date();
    const activeMemberships = memberships.filter(
      (m) => m.active && m.payment_status === "completed" && new Date(m.expiration_date) > now
    );
    const expiredMemberships = memberships.filter(
      (m) => new Date(m.expiration_date) <= now && m.payment_status === "completed"
    );
    const pendingPayments = memberships.filter((m) => m.payment_status === "pending");

    // Calculate total revenue (completed payments only)
    const totalRevenue = memberships
      .filter((m) => m.payment_status === "completed")
      .reduce((sum, m) => {
        const level = levels.find((l) => l.id === m.membership_level_id);
        return sum + (level?.price || 0);
      }, 0);

    // Expiring soon (within 30 days)
    const expiringInDays = 30;
    const expiringSoon = activeMemberships.filter((m) => {
      const daysUntilExpiry = differenceInDays(new Date(m.expiration_date), now);
      return daysUntilExpiry <= expiringInDays && daysUntilExpiry > 0;
    });

    // Distribution by level
    const levelDistribution = levels.map((level) => ({
      name: level.name,
      count: activeMemberships.filter((m) => m.membership_level_id === level.id).length,
      revenue: memberships
        .filter((m) => m.membership_level_id === level.id && m.payment_status === "completed")
        .length * level.price,
    }));

    // Monthly signups (last 6 months)
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: endOfMonth(now),
    });

    const monthlySignups = months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const signups = memberships.filter((m) => {
        const createdDate = new Date(m.created_at);
        return createdDate >= monthStart && createdDate <= monthEnd && m.payment_status === "completed";
      });
      const revenue = signups.reduce((sum, m) => {
        const level = levels.find((l) => l.id === m.membership_level_id);
        return sum + (level?.price || 0);
      }, 0);

      return {
        month: format(month, "MMM yyyy"),
        signups: signups.length,
        revenue: revenue / 100,
      };
    });

    // Expiration trends (next 6 months)
    const futureMonths = eachMonthOfInterval({
      start: startOfMonth(now),
      end: endOfMonth(subMonths(now, -5)),
    });

    const expirationTrends = futureMonths.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const expiring = activeMemberships.filter((m) => {
        const expirationDate = new Date(m.expiration_date);
        return expirationDate >= monthStart && expirationDate <= monthEnd;
      });

      return {
        month: format(month, "MMM yyyy"),
        expiring: expiring.length,
      };
    });

    return {
      totalActive: activeMemberships.length,
      totalExpired: expiredMemberships.length,
      totalPending: pendingPayments.length,
      totalRevenue,
      expiringSoon: expiringSoon.length,
      levelDistribution,
      monthlySignups,
      expirationTrends,
    };
  }, [memberships, levels]);

  if (isLoading || !analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalActive}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.totalExpired} expired · {analytics.totalPending} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">From completed memberships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.expiringSoon}</div>
            <p className="text-xs text-muted-foreground mt-1">Within next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Revenue/Member</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.totalActive > 0
                ? formatCurrency(analytics.totalRevenue / (analytics.totalActive + analytics.totalExpired))
                : "$0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per membership sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Signups & Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Signups & Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlySignups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [
                      name === "revenue" ? `$${value.toFixed(2)}` : value,
                      name === "revenue" ? "Revenue" : "Signups",
                    ]}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="signups"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="Signups"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="revenue"
                    fill="hsl(var(--accent))"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Membership Distribution by Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Active Members by Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.levelDistribution.filter((l) => l.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                    labelLine={false}
                  >
                    {analytics.levelDistribution
                      .filter((l) => l.count > 0)
                      .map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string, props: { payload?: { name: string } }) => [
                      value,
                      props.payload?.name || "Members",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {analytics.levelDistribution
                .filter((l) => l.count > 0)
                .map((level, index) => (
                  <div key={level.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">{level.name}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiration Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Upcoming Expirations (Next 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.expirationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [value, "Memberships Expiring"]}
                />
                <Line
                  type="monotone"
                  dataKey="expiring"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Level Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Membership Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.levelDistribution.map((level) => (
              <div key={level.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{level.name}</Badge>
                  <span className="text-sm text-muted-foreground">{level.count} members</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(level.revenue)}</div>
                  <div className="text-xs text-muted-foreground">total revenue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VIPAnalyticsDashboard;
