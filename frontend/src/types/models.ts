/**
 * PackDrashiti Domain Models and Database Schemas.
 * Consumer Food Nutrition, Ingredient Safety & Daily Product Scanner.
 */

import type { UserRole } from './roles';
export type { UserRole };

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface HealthAuditModel {
  id: string;
  energyKcal: number;
  proteinG: number;
  carbohydratesG: number;
  totalSugarsG: number;
  addedSugarsG: number;
  totalFatG: number;
  saturatedFatG: number;
  transFatG: number;
  sodiumMg: number;
  healthScore: number;
  advisoryBadges: string[];
  contraindications: string[];
  recommendations: string[];
}

// Authentication & Session Contracts
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// API Envelope Standard
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}
