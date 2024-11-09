function SkeletonLoader() {
  return (
    <div role="status" className="w-full animate-pulse">
      <div className="h-2.5 bg-gray-300 rounded-full w-48 mb-4 dark:bg-gray-200"></div>
      <div className="h-2 bg-gray-300 rounded-full max-w-[460px] mb-2.5 dark:bg-gray-200"></div>
      <div className="h-2 bg-gray-300 rounded-full mb-2.5 dark:bg-gray-200"></div>
      <div className="h-2 bg-gray-300 rounded-full max-w-[430px] mb-2.5 dark:bg-gray-200"></div>
      <div className="h-2 bg-gray-300 rounded-full max-w-[400px] mb-2.5 dark:bg-gray-200"></div>
      <div className="h-2 bg-gray-300 rounded-full max-w-[460px] dark:bg-gray-200"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default SkeletonLoader;
