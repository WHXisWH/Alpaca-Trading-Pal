import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function QuestsPanelSkeleton() {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-16" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-3 w-48 mb-2" />
              
              {/* Progress Bar */}
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="flex-1 h-2" />
                <Skeleton className="h-3 w-8" />
              </div>
              
              {/* Reward and Button */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <Skeleton className="h-3 w-48 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}