'use client';

import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { MATERIALS, getMaterialDisplayName } from '@/lib/data/product-options';
import { useTranslations } from '@/lib/hooks/use-translations';

interface MaterialSelectorProps {
  value?: string[]; // Multiple materials
  onValueChange?: (value: string[]) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  maxSelections?: number;
}

export function MaterialSelector({
  value = [],
  onValueChange,
  className,
  required,
  disabled,
  maxSelections = 3,
}: MaterialSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isHebrew } = useTranslations();

  // Filter materials based on search
  const filteredMaterials = MATERIALS.filter(material =>
    material.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (materialValue: string) => {
    if (disabled) return;
    
    const currentValues = value || [];
    let newValues: string[];
    
    if (currentValues.includes(materialValue)) {
      // Remove if already selected
      newValues = currentValues.filter(v => v !== materialValue);
    } else if (currentValues.length < maxSelections) {
      // Add if not at max selections
      newValues = [...currentValues, materialValue];
    } else {
      // At max selections, do nothing
      return;
    }
    
    onValueChange?.(newValues);
  };

  const removeMaterial = (materialValue: string) => {
    if (disabled) return;
    const newValues = value.filter(v => v !== materialValue);
    onValueChange?.(newValues);
  };

  const clearAll = () => {
    if (disabled) return;
    onValueChange?.([]);
  };

  const displayText = value.length > 0 
    ? `${value.length} ${isHebrew ? 'חומרים נבחרו' : 'materials selected'}`
    : (isHebrew ? 'בחר חומרים...' : 'Select materials...');

  return (
    <div className={cn('space-y-2', className)}>
      <Label>
        {isHebrew ? 'חומר' : 'Material'}
        {required && <span className="text-destructive ml-1">*</span>}
        <span className="text-xs text-muted-foreground ml-2">
          ({isHebrew ? 'עד' : 'up to'} {maxSelections})
        </span>
      </Label>
      
      {/* Selected materials display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((materialValue) => {
            const material = MATERIALS.find(m => m.value === materialValue);
            return (
              <Badge
                key={materialValue}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                <span className="text-xs">
                  {material ? getMaterialDisplayName(materialValue, isHebrew) : materialValue}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeMaterial(materialValue)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
          {value.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground hover:text-destructive"
              onClick={clearAll}
              disabled={disabled}
            >
              {isHebrew ? 'נקה הכל' : 'Clear all'}
            </Button>
          )}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              value.length === 0 && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align={isHebrew ? "end" : "start"}>
          <Command>
            <CommandInput
              placeholder={isHebrew ? "חפש חומר..." : "Search materials..."}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList className="max-h-[200px]">
              <CommandEmpty>
                {isHebrew ? "לא נמצאו חומרים" : "No materials found"}
              </CommandEmpty>
              
              <CommandGroup>
                {filteredMaterials.map((material) => {
                  const isSelected = value.includes(material.value);
                  const isAtMaxAndNotSelected = value.length >= maxSelections && !isSelected;
                  
                  return (
                    <CommandItem
                      key={material.value}
                      value={material.value}
                      onSelect={() => handleSelect(material.value)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        isAtMaxAndNotSelected && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={isAtMaxAndNotSelected}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="flex-1 text-sm">
                        {material.label}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default MaterialSelector;