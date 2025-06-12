"use client";

import { useEffect, use } from "react";
import { TrendingDownIcon, TrendingUpIcon, ActivityIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StatCard = ({ stats }) => {
  const { title, value, trend, trendType, subtitle } = stats;
  const formatTrend = (trend, trendType) => {
    if (trend === 0 || trend === null || trend === undefined) {
      return { display: "0%", color: "text-gray-500" };
    }

    const sign = trend > 0 ? "+" : "";
    const display = `${sign}${trend}%`;

    if (trendType === "positive") {
      return { display, color: "text-green-600" };
    } else if (trendType === "negative") {
      return { display, color: "text-red-600" };
    } else {
      return { display, color: "text-gray-500" };
    }
  };
  const trendData = formatTrend(trend, trendType);
  const TrendIcon =
    trendType === "positive"
      ? TrendingUpIcon
      : trendType === "negative"
      ? TrendingDownIcon
      : ActivityIcon;
  const trendDescription =
    trendType === "positive"
      ? " Trending up"
      : trendType === "negative"
      ? "Trending down"
      : "Activity";

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          {trend !== 0 && (
            <Badge variant="outline">
              <TrendIcon />
              {trendData.display}
            </Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          ${`${trendDescription} this month`} <TrendIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">{subtitle}</div>
      </CardFooter>
    </Card>
  );
};

export default function SectionCards({ stats, userRole = "system_admin" }) {
  // const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const cardStats = use(stats);
  console.log(cardStats);
  // const handleTimeRangeChange = (newRange) => {
  // setSelectedTimeRange(newRange)

  // if (error && stats.length === 0) {
  //     return (
  //       <div className={`grid grid-cols-1 gap-4`}>
  //         <p>Error</p>
  //       </div>
  //     )
  //   }

  return (
    <>
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {cardStats.map((card) => (
          <StatCard stats={card} key={card.id} />
        ))}
      </div>
    </>
  );
}
