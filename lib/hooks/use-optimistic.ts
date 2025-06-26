'use client';

import { useState } from 'react';

/**
 * Custom hook for optimistic updates
 * @param initialData The initial data
 * @returns The current data, a function to update the data optimistically, and a function to reset the data
 */
export function useOptimistic<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [originalData, setOriginalData] = useState<T>(initialData);

  /**
   * Update the data optimistically
   * @param updateFn A function that takes the current data and returns the updated data
   * @param callback A callback function to execute after the optimistic update
   * @returns A function to revert the optimistic update
   */
  function update(
    updateFn: (currentData: T) => T,
    callback?: (updatedData: T) => void
  ): () => void {
    // Store the original data for potential rollback
    setOriginalData(data);

    // Apply the update
    const updatedData = updateFn(data);
    setData(updatedData);

    // Execute the callback if provided
    if (callback) {
      callback(updatedData);
    }

    // Return a function to revert the update
    return () => {
      setData(originalData);
    };
  }

  /**
   * Reset the data to the provided value or the original data
   * @param resetData Optional data to reset to
   */
  function reset(resetData?: T) {
    if (resetData) {
      setData(resetData);
      setOriginalData(resetData);
    } else {
      setData(originalData);
    }
  }

  return { data, update, reset };
}

/**
 * Custom hook for optimistic array operations
 * @param initialItems The initial array of items
 * @returns Functions for optimistic array operations
 */
export function useOptimisticArray<T extends { id: string }>(initialItems: T[] = []) {
  const { data: items, update, reset } = useOptimistic<T[]>(initialItems);

  /**
   * Add an item optimistically
   * @param item The item to add
   * @param callback A callback function to execute after the optimistic update
   * @returns A function to revert the optimistic update
   */
  function addItem(item: T, callback?: (items: T[]) => void) {
    return update((currentItems) => [...currentItems, item], callback);
  }

  /**
   * Update an item optimistically
   * @param id The ID of the item to update
   * @param updateData The data to update the item with
   * @param callback A callback function to execute after the optimistic update
   * @returns A function to revert the optimistic update
   */
  function updateItem(id: string, updateData: Partial<T>, callback?: (items: T[]) => void) {
    return update(
      (currentItems) =>
        currentItems.map((item) => (item.id === id ? { ...item, ...updateData } : item)),
      callback
    );
  }

  /**
   * Remove an item optimistically
   * @param id The ID of the item to remove
   * @param callback A callback function to execute after the optimistic update
   * @returns A function to revert the optimistic update
   */
  function removeItem(id: string, callback?: (items: T[]) => void) {
    return update((currentItems) => currentItems.filter((item) => item.id !== id), callback);
  }

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    reset,
  };
}
