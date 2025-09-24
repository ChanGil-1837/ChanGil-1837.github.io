export default function ProjectItemSkeleton() {
  return (
    <div className="project-card animate-pulse">
      <div className="bg-gray-300 dark:bg-gray-700 rounded-t-xl w-full h-48"></div>
      <div className="p-4 flex flex-col">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="flex items-start">
          <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded mr-2"></div>
          <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded mr-2"></div>
          <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}
