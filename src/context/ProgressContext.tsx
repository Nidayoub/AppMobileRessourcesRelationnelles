import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';

type ResourceId = string;

type ProgressContextType = {
  favorites: ResourceId[];
  explored: ResourceId[];
  saved: ResourceId[];
  addToFavorites: (resourceId: ResourceId) => void;
  removeFromFavorites: (resourceId: ResourceId) => void;
  markAsExplored: (resourceId: ResourceId) => void;
  addToSaved: (resourceId: ResourceId) => void;
  removeFromSaved: (resourceId: ResourceId) => void;
  isFavorite: (resourceId: ResourceId) => boolean;
  isExplored: (resourceId: ResourceId) => boolean;
  isSaved: (resourceId: ResourceId) => boolean;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<ResourceId[]>([]);
  const [explored, setExplored] = useState<ResourceId[]>([]);
  const [saved, setSaved] = useState<ResourceId[]>([]);

  // Dans une application réelle, on chargerait les données depuis AsyncStorage ici
  // mais on n'initialise plus avec des données fictives

  const addToFavorites = (resourceId: ResourceId) => {
    if (!favorites.includes(resourceId)) {
      setFavorites([...favorites, resourceId]);
    }
  };

  const removeFromFavorites = (resourceId: ResourceId) => {
    setFavorites(favorites.filter(id => id !== resourceId));
  };

  const markAsExplored = (resourceId: ResourceId) => {
    if (!explored.includes(resourceId)) {
      setExplored([...explored, resourceId]);
    }
  };

  const addToSaved = (resourceId: ResourceId) => {
    if (!saved.includes(resourceId)) {
      setSaved([...saved, resourceId]);
    }
  };

  const removeFromSaved = (resourceId: ResourceId) => {
    setSaved(saved.filter(id => id !== resourceId));
  };

  const isFavorite = (resourceId: ResourceId) => favorites.includes(resourceId);
  const isExplored = (resourceId: ResourceId) => explored.includes(resourceId);
  const isSaved = (resourceId: ResourceId) => saved.includes(resourceId);

  const contextValue = useMemo(() => ({
    favorites, 
    explored, 
    saved, 
    addToFavorites, 
    removeFromFavorites, 
    markAsExplored, 
    addToSaved, 
    removeFromSaved,
    isFavorite,
    isExplored,
    isSaved
  }), [favorites, explored, saved]);

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}; 