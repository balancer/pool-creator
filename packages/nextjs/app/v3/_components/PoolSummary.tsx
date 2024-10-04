export function PoolSummary({ poolType }: { poolType: string | undefined }) {
  return (
    <div className="bg-base-200 w-full max-w-[400px] rounded-xl p-5">
      <div className="font-bold text-2xl mb-7">Pool Summary</div>
      <div className="px-5">
        <div className="flex justify-between text-lg">
          <div className="text-lg font-bold">Pool Type: </div>
          <div className="text-lg">{poolType ? <b>{poolType}</b> : <i>No type selected</i>}</div>
        </div>
      </div>
    </div>
  );
}
