"use client";

import React from "react";
import { Card, CardContent, CardTitle } from "./ui/card";

interface TileFactoryProps {
  title: string;
  data?: any;
  fallbackData: any;
  children: React.ReactElement<any>;
}

const TileFactory: React.FC<TileFactoryProps> = ({
  title,
  data,
  fallbackData,
  children,
}) => {
  const chartData = data || fallbackData;

  const chartWithData = React.cloneElement(children, { data: chartData });

  return (
    <Card className="p-4 rounded-sm m-4 bg-zinc-800 border border-zinc-700 text-zinc-300">
      <CardTitle>{title}</CardTitle>
      <CardContent style={{ width: "100%", height: "30vh" }}>
        {chartWithData}
      </CardContent>
    </Card>
  );
};

export default TileFactory;
