'use client';
import { createContext, useContext, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile } from '@/features/profile/api';
import { api, queryKeys } from '@/lib/api/client';
import type { Config, Doc, Message, Source } from '@/lib/api/types';
import { listDocuments, uploadDocument, deleteDocument } from '@/features/documents/api';
import { completeChat } from '@/features/chat/api';
import { isInsufficientAnswer } from '@/features/chat/source-utils';
import { demoDocuments, demoConfig, demoAnswer } from './demo';
function useWorkspaceState(preview: boolean, local: boolean) {
  const client = useQueryClient();
  const [examples, setExamples] = useState<Doc[]>(demoDocuments);
  const [selected, setSelected] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sourcesAreRetrieved, setSourcesAreRetrieved] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<{
    name: string;
    status: 'processing' | 'ready' | 'error';
  } | null>(null);
  const [sources, setSources] = useState<Source[] | null>(null);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [chatError, setChatError] = useState('');
  const conversationVersion = useRef(0);
  const documentsQuery = useQuery({
    queryKey: queryKeys.documents,
    queryFn: listDocuments,
    enabled: !preview,
    refetchInterval: preview ? false : 15000,
  });
  const sessionQuery = useQuery({
    queryKey: ['session'],
    queryFn: getProfile,
    enabled: !preview && !local,
  });
  const configQuery = useQuery({
    queryKey: queryKeys.config,
    queryFn: () => api<Config>('v1/config'),
    enabled: !preview,
  });
  const healthQuery = useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api<{ status: string }>('health'),
    enabled: !preview,
    refetchInterval: 30000,
  });
  const docs = preview ? examples : documentsQuery.data?.documents || [];
  const readinessQuery = useQuery({
    queryKey: queryKeys.ready,
    queryFn: () => api<{ status: 'ready'; components: Record<string, string> }>('ready'),
    enabled: !preview,
    refetchInterval: 30000,
  });
  const selectedIds = selected;
  const scopeInvalid = selected.some(
    (id) => !docs.some((d) => d.document_id === id && d.status === 'ready'),
  );
  const refresh = () => client.invalidateQueries({ queryKey: queryKeys.documents });
  const uploadFile = async (file: File) => {
    if (!preview) {
      const result = await uploadDocument(file);
      await refresh();
      return result;
    }
    const id = `example-${crypto.randomUUID()}`;
    setExamples((current) => [
      ...current,
      {
        document_id: id,
        file_name: file.name,
        file_type: file.name.split('.').pop() || '',
        size_bytes: file.size,
        num_chunks: 0,
        ingested_at: new Date().toISOString(),
        status: 'ready',
      },
    ]);
    return { document_id: id, status: 'success' as const };
  };
  const upload = async (file: File) => {
    setUploadNotice({ name: file.name, status: 'processing' });
    try {
      const result = await uploadFile(file);
      setUploadNotice({ name: file.name, status: 'ready' });
      return result;
    } catch (error) {
      setUploadNotice({ name: file.name, status: 'error' });
      throw error;
    }
  };
  const openSources = (message: Message, sourceId = message.sources?.[0]?.source_id) => {
    if (!sourceId) return;
    setSources(message.sources || []);
    setSourcesAreRetrieved(isInsufficientAnswer(message.content));
    setActiveSource(sourceId);
  };
  const remove = async (id: string) => {
    if (preview) setExamples((current) => current.filter((d) => d.document_id !== id));
    else {
      await deleteDocument(id);
      await refresh();
    }
    // Preserve explicit scope until the reader chooses a replacement.
  };
  const answer = async (history: Message[]) => {
    if (scopeInvalid)
      throw new Error(
        'A selected document is no longer ready. Choose a new document scope before asking.',
      );
    if (selectedIds.length > 100) throw new Error('Select at most 100 documents.');
    if (!preview) return completeChat(history, selectedIds);
    const doc = docs.find((d) =>
      selectedIds.length ? selectedIds.includes(d.document_id) : d.status === 'ready',
    );
    if (!doc) throw new Error('Add an example document first.');
    const result = demoAnswer(doc);
    return {
      choices: [{ message: { role: 'assistant' as const, content: result.content } }],
      sources: result.sources,
    };
  };
  const clear = () => {
    conversationVersion.current += 1;
    setMessages([]);
    setSources(null);
    setUploadNotice(null);
    setSourcesAreRetrieved(false);
    setActiveSource(null);
    setPending(false);
    setChatError('');
  };
  return {
    preview,
    local,
    uploadNotice,
    setUploadNotice,
    openSources,
    sourcesAreRetrieved,
    scopeInvalid,
    readinessQuery,
    sessionQuery,
    base: preview ? '/preview' : '',
    docs,
    config: preview ? demoConfig : configQuery.data,
    documentsQuery,
    configQuery,
    healthQuery,
    selectedIds,
    setSelected,
    messages,
    setMessages,
    sources,
    setSources,
    activeSource,
    setActiveSource,
    uploadOpen,
    setUploadOpen,
    settingsOpen,
    setSettingsOpen,
    scopeOpen,
    setScopeOpen,
    upload,
    remove,
    answer,
    clear,
    refresh,
    pending,
    setPending,
    chatError,
    setChatError,
    conversationVersion,
  };
}
type Workspace = ReturnType<typeof useWorkspaceState>;
const Context = createContext<Workspace | null>(null);
export function WorkspaceProvider({
  children,
  preview = false,
  local = false,
}: {
  children: React.ReactNode;
  preview?: boolean;
  local?: boolean;
}) {
  const state = useWorkspaceState(preview, local);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error('Workspace provider required');
  return value;
}
