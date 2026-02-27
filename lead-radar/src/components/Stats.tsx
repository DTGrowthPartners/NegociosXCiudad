'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, Target, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface StatsProps {
  stats: {
    total: number;
    highOpportunity: number;
    contacted: number;
    won: number;
  };
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue}</>;
}

export function Stats({ stats }: StatsProps) {
  const statCards = [
    {
      label: 'Total Leads',
      value: stats.total,
      icon: Users,
      gradient: 'from-primary-500 to-primary-600',
      iconBg: 'bg-primary-500/10',
      iconColor: 'text-primary-600',
      accent: 'bg-primary-500',
    },
    {
      label: 'Alta Oportunidad',
      value: stats.highOpportunity,
      icon: Target,
      gradient: 'from-emerald-500 to-green-600',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      accent: 'bg-emerald-500',
    },
    {
      label: 'Contactados',
      value: stats.contacted,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      accent: 'bg-amber-500',
    },
    {
      label: 'Ganados',
      value: stats.won,
      icon: CheckCircle,
      gradient: 'from-violet-500 to-purple-600',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-600',
      accent: 'bg-violet-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={stat.label}
          className="group relative bg-white rounded-2xl shadow-card border border-gray-100 p-5 card-hover overflow-hidden"
          style={{ animationDelay: `${index * 0.08}s` }}
        >
          {/* Gradient accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-80`} />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-dark-700 tracking-tight">
                <AnimatedNumber value={stat.value} />
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>

          {/* Subtle indicator */}
          {stat.value > 0 && (
            <div className="mt-3 flex items-center gap-1 text-xs text-dark-300">
              <TrendingUp className="w-3 h-3" />
              <span>{stat.value} registrados</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
