export default function ModuleHeader({ title, subtitle, rightSlot }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="heading-large">{title}</h1>
        <p className="text-sub mt-1">{subtitle}</p>
      </div>
      {rightSlot ? <div>{rightSlot}</div> : null}
    </div>
  );
}
