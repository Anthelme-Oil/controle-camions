"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserClientService, UserDTO } from "@/lib/client/user.service";
import { AuthModal } from "@/components/modals/AuthModal";

interface AuthContextType {
  user: UserDTO | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password?: string }) => Promise<void>;
  logout: () => void;
  triggerSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "saferoute_user_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Charger la session sauvegardée au démarrage de l'application
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setIsAuthModalOpen(true);
      }
    } catch (error) {
      console.error("Erreur lors de la lecture de la session :", error);
      setIsAuthModalOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction de connexion
  const login = async (credentials: { email: string; password?: string }) => {
    const authenticatedUser = await UserClientService.login(credentials);
    setUser(authenticatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
    setIsAuthModalOpen(false);
  };

  // Fonction de déconnexion
  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthModalOpen(true);
  };

  // Déclencher manuellement l'expiration de session (ex: lors d'un retour API 401/403)
  const triggerSessionExpired = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (loggedUser: UserDTO) => {
    setUser(loggedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        triggerSessionExpired,
      }}
    >
      {children}

      {/* Le Modal s'affiche globalement dès que la session est absente ou expirée */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onSuccess={handleAuthSuccess}
      />
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour consommer le contexte facilement
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider");
  }
  return context;
}