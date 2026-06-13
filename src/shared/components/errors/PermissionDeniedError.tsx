export default function PermissionDeniedError() {
  return (
    <div className="flex w-full flex-col items-center justify-center py-10">
      <div className="flex h-full w-full max-w-[450px] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-4xl font-medium text-red-600">Access Denied</h1>
        <p className="text-sm text-gray-600">
          Looks like you don&apos;t have permission to view this page.
          <br /> Please contact your administrator if you believe this is an
          error.
        </p>
      </div>
    </div>
  );
}
