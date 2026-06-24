import { Card } from "@/components/ui/card"

export function KanbanColumn({
  title,
  count,
  children,
  className,
}: {
  title: string
  count: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card
      className={`p-4 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">
          {title}
        </h2>

        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs">
          {count}
        </span>
      </div>

      <div className="space-y-3">
        {children}
      </div>
    </Card>
  )
}