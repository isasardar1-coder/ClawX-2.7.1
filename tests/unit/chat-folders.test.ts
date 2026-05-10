import { beforeEach, describe, expect, it } from 'vitest';
import { useChatFoldersStore } from '@/stores/chatFolders';

describe('chat folder store', () => {
  beforeEach(() => {
    localStorage.clear();
    useChatFoldersStore.setState({
      folders: [],
      sessionFolderIds: {},
    });
  });

  it('creates, renames, and deletes folders while preserving session assignments correctly', () => {
    const folderId = useChatFoldersStore.getState().addFolder('  Work   chats  ');

    expect(folderId).toBeTruthy();
    expect(useChatFoldersStore.getState().folders).toMatchObject([
      { id: folderId, name: 'Work chats' },
    ]);

    useChatFoldersStore.getState().moveSessionToFolder('agent:main:session-1', folderId);
    expect(useChatFoldersStore.getState().sessionFolderIds['agent:main:session-1']).toBe(folderId);

    useChatFoldersStore.getState().renameFolder(folderId!, 'Renamed');
    expect(useChatFoldersStore.getState().folders[0].name).toBe('Renamed');

    useChatFoldersStore.getState().deleteFolder(folderId!);
    expect(useChatFoldersStore.getState().folders).toEqual([]);
    expect(useChatFoldersStore.getState().sessionFolderIds).toEqual({});
  });

  it('moves a session back to all chats when folder id is null', () => {
    const folderId = useChatFoldersStore.getState().addFolder('Inbox');

    useChatFoldersStore.getState().moveSessionToFolder('agent:main:session-2', folderId);
    useChatFoldersStore.getState().moveSessionToFolder('agent:main:session-2', null);

    expect(useChatFoldersStore.getState().sessionFolderIds).toEqual({});
  });
});
