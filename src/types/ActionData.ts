import { UNOCard } from "../models/unoCard";

export interface ActionData {
  id?: number;
  suit?: string;
  rank?: string;
  
  action?: string;
  value?: string;
}