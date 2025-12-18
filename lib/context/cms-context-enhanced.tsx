/**
 * Enhanced CMS Context - State Management with Undo/Redo
 *
 * Extends the base CMS context with history management for undo/redo.
 * Uses the Command Pattern for all section operations.
 */

'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Homepage, Section, SectionType } from '@/types/cms';
import { apiUrl } from '@/lib/utils/api';
import {
  HistoryManager,
  HistoryState,
  createSessionId,
} from '@/lib/cms/history/history-manager';
import {
  AddSectionCommand,
  RemoveSectionCommand,
  UpdateSectionCommand,
  ReorderSectionCommand,
  DuplicateSectionCommand,
  ToggleVisibilityCommand,
  createDefaultSection,
} from '@/lib/cms/commands/section-commands';

// Enhanced State with History
export interface EnhancedCMSState {
  homepage: Homepage;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isDirty: boolean;
  activeSection: string | null;
  draggedSection: string | null;
  previewMode: boolean;
  lastSaved: string | null;
  // History state
  historyState: HistoryState;
  sessionId: string;
}

// Enhanced Context Type
export interface EnhancedCMSContextType extends EnhancedCMSState {
  // Homepage Operations
  loadHomepage: () => Promise<void>;
  saveHomepage: () => Promise<void>;
  publishHomepage: () => Promise<void>;
  revertToPublished: () => Promise<void>;

  // Section Operations (with undo/redo support)
  addSection: (sectionType: SectionType, insertIndex?: number) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  duplicateSection: (id: string) => void;
  toggleSectionVisibility: (id: string) => void;

  // History Operations
  undo: () => void;
  redo: () => void;
  jumpToHistory: (commandId: string) => void;
  clearHistory: () => void;
  getHistoryEntries: () => Array<{
    id: string;
    description: string;
    timestamp: number;
    isUndone: boolean;
    isCurrent: boolean;
  }>;

  // Editor State
  setActiveSection: (id: string | null) => void;
  setDraggedSection: (id: string | null) => void;
  togglePreviewMode: () => void;

  // Utility
  resetError: () => void;
}

// Action Types
type CMSAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_HOMEPAGE'; payload: Homepage }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_ACTIVE_SECTION'; payload: string | null }
  | { type: 'SET_DRAGGED_SECTION'; payload: string | null }
  | { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'SET_LAST_SAVED'; payload: string }
  | { type: 'SET_HISTORY_STATE'; payload: HistoryState };

// Default homepage structure
function getDefaultHomepage(): Homepage {
  const now = new Date().toISOString();
  return {
    id: 'homepage-draft',
    sections: [],
    status: 'draft',
    created_at: now,
    updated_at: now,
    metadata: {},
  };
}

// Default history state
const defaultHistoryState: HistoryState = {
  currentIndex: -1,
  canUndo: false,
  canRedo: false,
  undoDescription: null,
  redoDescription: null,
  historySize: 0,
  maxHistorySize: 50,
};

// Initial State
const initialState: EnhancedCMSState = {
  homepage: getDefaultHomepage(),
  isLoading: false,
  isSaving: false,
  error: null,
  isDirty: false,
  activeSection: null,
  draggedSection: null,
  previewMode: false,
  lastSaved: null,
  historyState: defaultHistoryState,
  sessionId: '',
};

// Reducer
function cmsReducer(state: EnhancedCMSState, action: CMSAction): EnhancedCMSState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_HOMEPAGE':
      return {
        ...state,
        homepage: action.payload,
        isLoading: false,
        error: null,
      };

    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };

    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };

    case 'SET_DRAGGED_SECTION':
      return { ...state, draggedSection: action.payload };

    case 'TOGGLE_PREVIEW_MODE':
      return { ...state, previewMode: !state.previewMode };

    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload, isDirty: false };

    case 'SET_HISTORY_STATE':
      return { ...state, historyState: action.payload };

    default:
      return state;
  }
}

// Context
const EnhancedCMSContext = createContext<EnhancedCMSContextType | undefined>(undefined);

// Provider
export function EnhancedCMSProvider({ children }: { children: React.ReactNode }) {
  const sessionIdRef = useRef(createSessionId());
  const [state, dispatch] = useReducer(cmsReducer, {
    ...initialState,
    sessionId: sessionIdRef.current,
  });
  const { session } = useAuth();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize History Manager
  const historyManager = useMemo(() => {
    return new HistoryManager({
      sessionId: sessionIdRef.current,
      userId: session?.user?.id,
      maxHistorySize: 50,
      mergeWindow: 500,
      onHistoryChange: (historyState) => {
        dispatch({ type: 'SET_HISTORY_STATE', payload: historyState });
      },
    });
  }, [session?.user?.id]);

  // Load homepage
  const loadHomepage = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch(apiUrl('/api/cms/homepage'), {
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });

      if (!response.ok) {
        throw new Error('Failed to load homepage');
      }

      const data = await response.json();
      const homepage = data.homepage || data.data || getDefaultHomepage();
      dispatch({ type: 'SET_HOMEPAGE', payload: homepage });

      // Clear history when loading new content
      historyManager.clear();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [session?.access_token, historyManager]);

  // Save homepage
  const saveHomepage = useCallback(async () => {
    if (!state.homepage) return;

    dispatch({ type: 'SET_SAVING', payload: true });

    try {
      const response = await fetch(apiUrl('/api/cms/homepage'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
        body: JSON.stringify({
          sections: state.homepage.sections,
          status: 'draft',
          metadata: state.homepage.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save homepage');
      }

      const data = await response.json();
      dispatch({ type: 'SET_HOMEPAGE', payload: data.homepage || data.data });
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date().toISOString() });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [state.homepage, session?.access_token]);

  // Publish homepage
  const publishHomepage = useCallback(async () => {
    if (!state.homepage) return;

    dispatch({ type: 'SET_SAVING', payload: true });

    try {
      const response = await fetch(apiUrl('/api/cms/homepage'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
        body: JSON.stringify({
          action: 'publish',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish homepage');
      }

      const data = await response.json();
      dispatch({ type: 'SET_HOMEPAGE', payload: data.homepage || data.data });
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date().toISOString() });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [state.homepage, session?.access_token]);

  // Revert to published
  const revertToPublished = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch(apiUrl('/api/cms/homepage'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
        body: JSON.stringify({
          action: 'revert',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to revert to published version');
      }

      const data = await response.json();
      dispatch({ type: 'SET_HOMEPAGE', payload: data.homepage || data.data });
      dispatch({ type: 'SET_DIRTY', payload: false });

      // Clear history on revert
      historyManager.clear();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [session?.access_token, historyManager]);

  // Add section with command pattern
  const addSection = useCallback(
    (sectionType: SectionType, insertIndex?: number) => {
      const newSection = createDefaultSection(sectionType);
      const command = new AddSectionCommand(newSection, insertIndex);
      const result = historyManager.execute(command, state.homepage);

      if (result.success) {
        dispatch({ type: 'SET_HOMEPAGE', payload: result.homepage });
        dispatch({ type: 'SET_DIRTY', payload: true });
        dispatch({ type: 'SET_ACTIVE_SECTION', payload: newSection.id });
      }
    },
    [state.homepage, historyManager]
  );

  // Update section with command pattern
  const updateSection = useCallback(
    (id: string, updates: Partial<Section>) => {
      const command = new UpdateSectionCommand(id, updates);
      const result = historyManager.execute(command, state.homepage);

      if (result.success) {
        dispatch({ type: 'SET_HOMEPAGE', payload: result.homepage });
        dispatch({ type: 'SET_DIRTY', payload: true });
      }
    },
    [state.homepage, historyManager]
  );

  // Delete section with command pattern
  const deleteSection = useCallback(
    (id: string) => {
      const command = new RemoveSectionCommand(id);
      const result = historyManager.execute(command, state.homepage);

      if (result.success) {
        dispatch({ type: 'SET_HOMEPAGE', payload: result.homepage });
        dispatch({ type: 'SET_DIRTY', payload: true });

        // Clear active section if it was deleted
        if (state.activeSection === id) {
          dispatch({ type: 'SET_ACTIVE_SECTION', payload: null });
        }
      }
    },
    [state.homepage, state.activeSection, historyManager]
  );

  // Reorder sections with command pattern
  const reorderSections = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      const section = state.homepage.sections[fromIndex];
      if (!section) return;

      const command = new ReorderSectionCommand(section.id, fromIndex, toIndex);
      const result = historyManager.execute(command, state.homepage);

      if (result.success) {
        dispatch({ type: 'SET_HOMEPAGE', payload: result.homepage });
        dispatch({ type: 'SET_DIRTY', payload: true });
      }
    },
    [state.homepage, historyManager]
  );

  // Duplicate section with command pattern
  const duplicateSection = useCallback(
    (id: string) => {
      const command = new DuplicateSectionCommand(id);
      const result = historyManager.execute(command, state.homepage);

      if (result.success) {
        dispatch({ type: 'SET_HOMEPAGE', payload: result.homepage });
        dispatch({ type: 'SET_DIRTY', payload: true });
      }
    },
    [state.homepage, historyManager]
  );

  // Toggle visibility with command pattern
  const toggleSectionVisibility = useCallback(
    (id: string) => {
      const section = state.homepage.sections.find((s) => s.id === id);
      if (!section) return;

      const command = new ToggleVisibilityCommand(id, !section.visible);
      const result = historyManager.execute(command, state.homepage);

      if (result.success) {
        dispatch({ type: 'SET_HOMEPAGE', payload: result.homepage });
        dispatch({ type: 'SET_DIRTY', payload: true });
      }
    },
    [state.homepage, historyManager]
  );

  // Undo
  const undo = useCallback(() => {
    const result = historyManager.undo(state.homepage);

    if (result?.success) {
      dispatch({ type: 'SET_HOMEPAGE', payload: result.homepage });
      dispatch({ type: 'SET_DIRTY', payload: true });
    }
  }, [state.homepage, historyManager]);

  // Redo
  const redo = useCallback(() => {
    const result = historyManager.redo(state.homepage);

    if (result?.success) {
      dispatch({ type: 'SET_HOMEPAGE', payload: result.homepage });
      dispatch({ type: 'SET_DIRTY', payload: true });
    }
  }, [state.homepage, historyManager]);

  // Jump to history point
  const jumpToHistory = useCallback(
    (commandId: string) => {
      const result = historyManager.jumpTo(commandId, state.homepage);

      if (result?.success) {
        dispatch({ type: 'SET_HOMEPAGE', payload: result.homepage });
        dispatch({ type: 'SET_DIRTY', payload: true });
      }
    },
    [state.homepage, historyManager]
  );

  // Clear history
  const clearHistory = useCallback(() => {
    historyManager.clear();
  }, [historyManager]);

  // Get history entries
  const getHistoryEntries = useCallback(() => {
    return historyManager.getHistory();
  }, [historyManager]);

  // Editor state operations
  const setActiveSection = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: id });
  }, []);

  const setDraggedSection = useCallback((id: string | null) => {
    dispatch({ type: 'SET_DRAGGED_SECTION', payload: id });
  }, []);

  const togglePreviewMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' });
  }, []);

  const resetError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl modifier
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (isMod && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        saveHomepage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveHomepage]);

  // Auto-save effect
  useEffect(() => {
    if (state.isDirty && state.homepage && !state.isSaving) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        saveHomepage();
      }, 3000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.isDirty, state.homepage, state.isSaving, saveHomepage]);

  // Load on mount
  useEffect(() => {
    loadHomepage();
  }, [loadHomepage]);

  // Context value
  const value: EnhancedCMSContextType = {
    ...state,
    loadHomepage,
    saveHomepage,
    publishHomepage,
    revertToPublished,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    duplicateSection,
    toggleSectionVisibility,
    undo,
    redo,
    jumpToHistory,
    clearHistory,
    getHistoryEntries,
    setActiveSection,
    setDraggedSection,
    togglePreviewMode,
    resetError,
  };

  return (
    <EnhancedCMSContext.Provider value={value}>{children}</EnhancedCMSContext.Provider>
  );
}

// Hook
export function useEnhancedCMS() {
  const context = useContext(EnhancedCMSContext);
  if (context === undefined) {
    throw new Error('useEnhancedCMS must be used within an EnhancedCMSProvider');
  }
  return context;
}

// Re-export for convenience
export { createSessionId };
