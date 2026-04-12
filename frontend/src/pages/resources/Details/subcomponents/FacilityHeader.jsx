import React from 'react';
import { Building2 } from 'lucide-react';
import { formatLongDate } from '../../../../utils/dateUtils';

export default function FacilityHeader({ name, building, type, floor }) {
  return (
    <div className="resource-detail-header-v2">
      <div className="flex items-center gap-2 text-indigo-400 mb-2">
        <Building2 size={16} />
        <span className="text-xs font-bold tracking-widest uppercase">{type.replace('_', ' ')}</span>
      </div>
      <h1 className="text-4xl font-black text-white mb-2">{name}</h1>
      <p className="text-slate-400 flex items-center gap-4">
        <span>Building {building}</span>
        <span className="opacity-30">|</span>
        <span>{floor} Floor</span>
      </p>
    </div>
  );
}
