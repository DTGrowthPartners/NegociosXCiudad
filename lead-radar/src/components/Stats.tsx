'use client';

import { Users, Target, CheckCircle, Clock } from 'lucide-react';
import { Lead } from '@/types';

interface StatsProps {
  leads: Lead[];
  totalCount: number;
}

export function Stats({ leads, totalCount }: StatsProps) {
  // Calculate stats from all leads
  const stats = {
    total: totalCount,
    highOpportunity: leads.filter((l) => l.opportunityScore >= 70).length,
    contacted: leads.filter((l) => l.status === 'CONTACTED').length,
    won: leads.filter((l) => l.status === 'WON').length,
  };

  const statCards = [
    {
      label: 'Total Leads',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Alta Oportunidad',
      value: stats.highOpportunity,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Contactados',
      value: stats.contacted,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Ganados',
      value: stats.won,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
