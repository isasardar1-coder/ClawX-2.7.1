import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatFolder {
  id: string;
  name: string;
  createdAt: number;
}

interface ChatFoldersState {
  folders: ChatFolder[];
  sessionFolderIds: Record<string, string>;
  addFolder: (name: string) => string | null;
  renameFolder: (folderId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  moveSessionToFolder: (sessionKey: string, folderId: string | null) => void;
  clearSessionFolder: (sessionKey: string) => void;
}

function createFolderId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `folder-${crypto.randomUUID()}`;
  }
  return `folder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeFolderName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export const useChatFoldersStore = create<ChatFoldersState>()(
  persist(
    (set) => ({
      folders: [],
      sessionFolderIds: {},

      addFolder: (name) => {
        const normalized = normalizeFolderName(name);
        if (!normalized) return null;

        const folderId = createFolderId();
        set((state) => ({
          folders: [
            ...state.folders,
            {
              id: folderId,
              name: normalized,
              createdAt: Date.now(),
            },
          ],
        }));
        return folderId;
      },

      renameFolder: (folderId, name) => {
        const normalized = normalizeFolderName(name);
        if (!normalized) return;
        set((state) => ({
          folders: state.folders.map((folder) => (
            folder.id === folderId ? { ...folder, name: normalized } : folder
          )),
        }));
      },

      deleteFolder: (folderId) => {
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== folderId),
          sessionFolderIds: Object.fromEntries(
            Object.entries(state.sessionFolderIds).filter(([, assignedFolderId]) => assignedFolderId !== folderId),
          ),
        }));
      },

      moveSessionToFolder: (sessionKey, folderId) => {
        set((state) => {
          const nextSessionFolderIds = { ...state.sessionFolderIds };
          if (folderId) {
            nextSessionFolderIds[sessionKey] = folderId;
          } else {
            delete nextSessionFolderIds[sessionKey];
          }
          return { sessionFolderIds: nextSessionFolderIds };
        });
      },

      clearSessionFolder: (sessionKey) => {
        set((state) => {
          if (!(sessionKey in state.sessionFolderIds)) return state;
          const nextSessionFolderIds = { ...state.sessionFolderIds };
          delete nextSessionFolderIds[sessionKey];
          return { sessionFolderIds: nextSessionFolderIds };
        });
      },
    }),
    {
      name: 'clawx-chat-folders',
    },
  ),
);
