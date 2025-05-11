import { BackendResourceType } from '../components/FilterDropdown';

// Ressource compatible avec le backend
export interface Resource {
  id: string;
  title: string;
  content: string;
  type: BackendResourceType;
  summary: string;
  author: string;
  public: boolean;
  date: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  date: string;
  text: string;
  replies?: Comment[];
}

// Supprimer les données de ressources simulées
// Supprimer les types fictifs qui ne correspondent pas au backend 