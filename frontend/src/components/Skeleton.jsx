export default function Skeleton({ className, circle = false }) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-[#1c2434] ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`} 
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4 mb-8">
        {[...Array(cols)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center border-t border-gray-100 dark:border-[#2a3447] pt-4">
          {[...Array(cols)].map((_, j) => (
            <Skeleton key={j} className={`h-8 flex-1 ${j === 0 ? 'max-w-[100px]' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12" circle />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
