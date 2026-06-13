export default function UnauthorizedError() {
  return (
    <div className="flex h-full w-full items-center">
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
        <p className="text-gray-600">
          Looks like you don&apos;t have permission to view this page. Please
          contact your administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
}
