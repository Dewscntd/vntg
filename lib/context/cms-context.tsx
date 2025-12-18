/**
 * CMS Context - State Management for Homepage Editor
 *
 * Follows the same pattern as cart-context.tsx for consistency.
 * Implements optimistic updates and local draft management.
 */

'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Homepage, Section } from '@/types/cms';
import { apiUrl } from '@/lib/utils/api';

// Context State
export interface CMSState {
  homepage: Homepage | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isDirty: boolean;
  activeSection: string | null;
  draggedSection: string | null;
  previewMode: boolean;
  lastSaved: string | null;
}

// Context Actions
export interface CMSContextType extends CMSState {
  // Homepage Operations
  loadHomepage: () => Promise<void>;
  saveHomepage: () => Promise<void>;
  publishHomepage: () => Promise<void>;
  revertToPublished: () => Promise<void>;

  // Section Operations
  addSection: (section: Omit<Section, 'id' | 'created_at' | 'updated_at'>) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  reorderSections: (sections: Section[]) => void;
  duplicateSection: (id: string) => void;

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
  | { type: 'ADD_SECTION'; payload: Section }
  | { type: 'UPDATE_SECTION'; payload: { id: string; updates: Partial<Section> } }
  | { type: 'DELETE_SECTION'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: Section[] }
  | { type: 'SET_ACTIVE_SECTION'; payload: string | null }
  | { type: 'SET_DRAGGED_SECTION'; payload: string | null }
  | { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'SET_LAST_SAVED'; payload: string };

// Initial State
const initialState: CMSState = {
  homepage: null,
  isLoading: false,
  isSaving: false,
  error: null,
  isDirty: false,
  activeSection: null,
  draggedSection: null,
  previewMode: false,
  lastSaved: null,
};

// Reducer
function cmsReducer(state: CMSState, action: CMSAction): CMSState {
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

    case 'ADD_SECTION': {
      if (!state.homepage) return state;

      return {
        ...state,
        homepage: {
          ...state.homepage,
          sections: [...state.homepage.sections, action.payload],
        },
        isDirty: true,
      };
    }

    case 'UPDATE_SECTION': {
      if (!state.homepage) return state;

      return {
        ...state,
        homepage: {
          ...state.homepage,
          sections: state.homepage.sections.map((section) =>
            section.id === action.payload.id
              ? ({ ...section, ...action.payload.updates } as Section)
              : section
          ),
        },
        isDirty: true,
      };
    }

    case 'DELETE_SECTION': {
      if (!state.homepage) return state;

      return {
        ...state,
        homepage: {
          ...state.homepage,
          sections: state.homepage.sections.filter(
            (section) => section.id !== action.payload
          ),
        },
        isDirty: true,
        activeSection: state.activeSection === action.payload ? null : state.activeSection,
      };
    }

    case 'REORDER_SECTIONS': {
      if (!state.homepage) return state;

      return {
        ...state,
        homepage: {
          ...state.homepage,
          sections: action.payload,
        },
        isDirty: true,
      };
    }

    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };

    case 'SET_DRAGGED_SECTION':
      return { ...state, draggedSection: action.payload };

    case 'TOGGLE_PREVIEW_MODE':
      return { ...state, previewMode: !state.previewMode };

    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload, isDirty: false };

    default:
      return state;
  }
}

// Context
const CMSContext = createContext<CMSContextType | undefined>(undefined);

// Provider
export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cmsReducer, initialState);
  const { session } = useAuth();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load homepage on mount
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
      dispatch({ type: 'SET_HOMEPAGE', payload: data.homepage || data.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [session?.access_token]);

  // Save homepage (draft)
  const saveHomepage = useCallback(async () => {
    if (!state.homepage || !session?.access_token) return;

    dispatch({ type: 'SET_SAVING', payload: true });

    try {
      const response = await fetch(apiUrl('/api/cms/homepage'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
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
    if (!state.homepage || !session?.access_token) return;

    dispatch({ type: 'SET_SAVING', payload: true });

    try {
      const response = await fetch(apiUrl('/api/cms/homepage/publish'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sections: state.homepage.sections,
          metadata: state.homepage.metadata,
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

  // Revert to published version
  const revertToPublished = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch(apiUrl('/api/cms/homepage?version=published'), {
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });

      if (!response.ok) {
        throw new Error('Failed to revert to published version');
      }

      const data = await response.json();
      dispatch({ type: 'SET_HOMEPAGE', payload: data.homepage || data.data });
      dispatch({ type: 'SET_DIRTY', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [session?.access_token]);

  // Section operations
  const addSection = useCallback(
    (section: Omit<Section, 'id' | 'created_at' | 'updated_at'>) => {
      const newSection: Section = {
        ...section,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Section;

      dispatch({ type: 'ADD_SECTION', payload: newSection });
    },
    []
  );

  const updateSection = useCallback((id: string, updates: Partial<Section>) => {
    dispatch({
      type: 'UPDATE_SECTION',
      payload: { id, updates: { ...updates, updated_at: new Date().toISOString() } },
    });
  }, []);

  const deleteSection = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SECTION', payload: id });
  }, []);

  const reorderSections = useCallback((sections: Section[]) => {
    // Update order property
    const reorderedSections = sections.map((section, index) => ({
      ...section,
      order: index,
    }));
    dispatch({ type: 'REORDER_SECTIONS', payload: reorderedSections });
  }, []);

  const duplicateSection = useCallback(
    (id: string) => {
      if (!state.homepage) return;

      const sectionToDuplicate = state.homepage.sections.find((s) => s.id === id);
      if (!sectionToDuplicate) return;

      const duplicated: Section = {
        ...sectionToDuplicate,
        id: crypto.randomUUID(),
        order: sectionToDuplicate.order + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_SECTION', payload: duplicated });
    },
    [state.homepage]
  );

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

  // Auto-save effect
  useEffect(() => {
    if (state.isDirty && state.homepage && !state.isSaving) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save (3 seconds after last change)
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
  const value: CMSContextType = {
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
    setActiveSection,
    setDraggedSection,
    togglePreviewMode,
    resetError,
  };

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
}

// Hook
export function useCMS() {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}
