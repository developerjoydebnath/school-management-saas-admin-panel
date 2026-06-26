import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";

import { ClassModel } from "@/shared/models/class.model";
import { useLocale } from "next-intl";
import { getLocalizedName } from "@/shared/utils/localization";

interface ClassSelectionProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function ClassSelection({ value = [], onChange, placeholder, className }: ClassSelectionProps) {
  const { data: classResponse, isLoading } = useSWR("/classes/active-list");
  const locale = useLocale();

  const classes = Array.isArray(classResponse?.data) ? classResponse.data : classResponse || [];
  const serializedClasses = classes?.map((cls: any) => new ClassModel(cls));

  const toggleClass = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      ) : !serializedClasses || serializedClasses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No classes available.</p>
      ) : (
        <div className="space-y-2">
          {placeholder && value.length === 0 && (
            <p className="text-sm text-muted-foreground">{placeholder}</p>
          )}
          <div className="flex flex-wrap gap-2">
          {serializedClasses.map((cls: ClassModel) => {
            const isSelected = value?.includes(cls.id);
            return (
              <Badge
                key={cls.id}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/90 h-auto",
                  !isSelected && "bg-transparent hover:bg-muted text-muted-foreground",
                  isSelected && "bg-primary text-primary-foreground"
                )}
                onClick={() => toggleClass(cls.id)}
              >
                {getLocalizedName(cls.name, locale)}
              </Badge>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
