import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'rectangular' | 'circular' | 'text';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height
}) => {
    const baseClasses = "animate-pulse bg-slate-200 dark:bg-white/5";
    const variantClasses = {
        rectangular: "rounded-xl",
        circular: "rounded-full",
        text: "rounded-md"
    };

    const style = {
        width: width,
        height: height
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
};

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="p-4 lg:p-10 space-y-8 lg:space-y-10">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4">
                <Skeleton variant="text" width={200} height={32} />
                <Skeleton variant="text" width={300} height={20} />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] h-[180px] border border-gray-100 dark:border-white/5">
                        <div className="flex justify-between mb-4">
                            <Skeleton variant="text" width={100} height={20} />
                            <Skeleton variant="circular" width={48} height={48} />
                        </div>
                        <Skeleton variant="rectangular" width="100%" height={40} className="mt-8" />
                    </div>
                ))}
            </div>

            {/* List Grid Skeleton */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <Skeleton variant="text" width={150} height={28} />
                    <Skeleton variant="rectangular" width={80} height={36} className="rounded-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-surface-dark rounded-[2rem] h-[340px] border border-gray-100 dark:border-white/5 overflow-hidden">
                            <Skeleton variant="rectangular" width="100%" height={160} />
                            <div className="p-6 space-y-4">
                                <Skeleton variant="text" width="80%" height={24} />
                                <Skeleton variant="rectangular" width="100%" height={10} className="rounded-full" />
                                <Skeleton variant="rectangular" width="100%" height={48} className="rounded-xl mt-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
