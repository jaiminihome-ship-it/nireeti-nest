'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Category } from '@/types';

interface ProductFilterProps {
  categories: Category[];
  selectedCategory: string;
  priceRange: [number, number];
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onPriceChange: (range: [number, number]) => void;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

export default function ProductFilter({
  categories,
  selectedCategory,
  priceRange,
  sortBy,
  onCategoryChange,
  onPriceChange,
  onSortChange,
  onClearFilters,
}: ProductFilterProps) {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = selectedCategory !== 'all' || sortBy !== 'newest';

  const handleApplyFilters = () => {
    onPriceChange(localPriceRange);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setLocalPriceRange([0, 5000]);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-8">
      {/* Desktop Filters */}
      <div className="hidden md:flex items-center gap-4 flex-1">
        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={handleClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Mobile Filter Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="h-5 w-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <Label>Price Range</Label>
              <Slider
                value={localPriceRange}
                onValueChange={(value) => setLocalPriceRange(value as [number, number])}
                max={5000}
                step={50}
                className="mt-2"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>${localPriceRange[0]}</span>
                <span>${localPriceRange[1]}</span>
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleApplyFilters} className="flex-1 bg-amber-600 hover:bg-amber-700">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Search Input */}
      <div className="flex-1 md:max-w-xs">
        <Input placeholder="Search products..." className="w-full" />
      </div>
    </div>
  );
}
