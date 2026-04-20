export default function MemberStatCard({ label, value, icon: Icon, colorClass, subtext }) {
  return (
    <div className="card p-6 flex items-start justify-between group hover:border-primary-500/20 transition-all dark:bg-navy-900 dark:border-navy-800">
      <div>
        <p className="text-[10px] font-bold text-gray-400 dark:text-navy-400 uppercase tracking-[0.15em] mb-1">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
        {subtext && <p className="text-[11px] text-gray-500 dark:text-navy-400 mt-2 font-medium">{subtext}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl ${colorClass.includes('navy') ? 'dark:bg-navy-800 dark:text-navy-300' : colorClass} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
