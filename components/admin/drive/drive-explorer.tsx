"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  FolderOpen,
  File,
  Trash2,
  Upload,
  Plus,
  X,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DriveItem = {
  id: string;
  name: string;
  mimeType: string;
};

type Props = {
  rootFolderId: string;
  rootName: string;
};

type FolderEntry = {
  id: string;
  name: string;
};

export function DriveExplorer({ rootFolderId, rootName }: Props) {
  const [path, setPath] = useState<FolderEntry[]>([
    { id: rootFolderId, name: rootName },
  ]);
  const [items, setItems] = useState<DriveItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [preview, setPreview] = useState<DriveItem | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const current = path[path.length - 1];

  const fetchFolder = useCallback(async (folderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/drive/folder/${folderId}`);
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Error al cargar carpeta");
      }
      const data = (await res.json()) as { items?: DriveItem[] };
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolder(current.id);
  }, [current.id, fetchFolder]);

  function navigateTo(folderId: string, name: string) {
    setPath((prev) => [...prev, { id: folderId, name }]);
  }

  function goBack() {
    if (path.length > 1) {
      setPath((prev) => prev.slice(0, -1));
    }
  }

  async function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    setCreating(false);
    setNewFolderName("");
    try {
      const res = await fetch("/api/drive/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId: current.id }),
      });
      if (!res.ok) throw new Error("Error al crear carpeta");
      await fetchFolder(current.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al crear carpeta");
    }
  }

  async function handleDelete(item: DriveItem) {
    if (!window.confirm(`¿Eliminar "${item.name}"?`)) return;
    try {
      const res = await fetch(`/api/drive/item/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      setItems((prev) => (prev ?? []).filter((i) => i.id !== item.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("parentId", current.id);
    try {
      const res = await fetch("/api/drive/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Error al subir archivo");
      }
      await fetchFolder(current.id);
    } catch (err) {
      alert(
        err instanceof Error
          ? "Error al subir archivo: " + err.message
          : "Error al subir archivo"
      );
    } finally {
      setUploading(false);
    }
  }

  const folders = (items ?? []).filter(
    (i) => i.mimeType === "application/vnd.google-apps.folder"
  );
  const files = (items ?? []).filter(
    (i) => i.mimeType !== "application/vnd.google-apps.folder"
  );

  function isImage(mimeType: string) {
    return mimeType.startsWith("image/");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {path.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="gap-1"
          >
            <ArrowLeft className="size-4" />
            Atrás
          </Button>
        )}

        <div className="flex items-center gap-1 text-sm text-zinc-500">
          {path.map((entry, i) => (
            <span key={entry.id} className="flex items-center gap-1">
              {i > 0 && <span className="text-zinc-300">/</span>}
              <span
                className={
                  i === path.length - 1
                    ? "font-medium text-zinc-900"
                    : "cursor-pointer hover:text-zinc-700"
                }
                onClick={() => {
                  if (i < path.length - 1) {
                    setPath(path.slice(0, i + 1));
                  }
                }}
              >
                {entry.name}
              </span>
            </span>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {creating && (
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Nombre de la carpeta"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") {
                    setCreating(false);
                    setNewFolderName("");
                  }
                }}
                className="w-44 rounded-md border border-zinc-200 px-2 py-1 text-sm focus:border-[#3B1E8A] focus:outline-none"
                autoFocus
              />
              <Button size="sm" onClick={handleCreateFolder}>
                Crear
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCreating(false);
                  setNewFolderName("");
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
          {!creating && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCreating(true)}
              className="gap-1"
            >
              <Plus className="size-4" />
              Nueva carpeta
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-1"
          >
            <Upload className={cn("size-4", uploading && "animate-bounce")} />
            {uploading ? "Subiendo…" : "Subir archivo"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleUpload(file);
                e.target.value = "";
              }
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-sm text-zinc-400">
          Cargando…
        </div>
      )}

      {/* Empty */}
      {!loading && !error && items?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-200 py-16 text-sm text-zinc-400">
          <FolderOpen className="size-8 text-zinc-300" />
          <p>Carpeta vacía</p>
          <p className="text-xs">
            Sube archivos o crea carpetas desde los botones superiores
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && items && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {folders.map((item) => (
            <div
              key={item.id}
              className="group relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              onClick={() => navigateTo(item.id, item.name)}
            >
              <FolderOpen className="size-10 text-[#3B1E8A]" />
              <span className="max-w-full truncate text-center text-xs font-medium text-zinc-700">
                {item.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item);
                }}
                className="absolute right-1 top-1 hidden rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500 group-hover:block"
                title="Eliminar"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}

          {files.map((item) => {
            const img = isImage(item.mimeType);
            return (
              <div
                key={item.id}
                onClick={() => img && setPreview(item)}
                className={cn(
                  "group relative flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50",
                  img && "cursor-pointer"
                )}
              >
                {img && !brokenImages.has(item.id) ? (
                  <div className="flex size-14 items-center justify-center overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/drive/file/${item.id}`}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                      onError={() =>
                        setBrokenImages((prev) => new Set(prev).add(item.id))
                      }
                    />
                  </div>
                ) : (
                  <File className="size-10 text-zinc-400" />
                )}
                <span className="max-w-full truncate text-center text-xs font-medium text-zinc-700">
                  {item.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                  className="absolute right-1 top-1 hidden rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500 group-hover:block"
                  title="Eliminar"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {/* Image preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <X className="size-5" />
            </button>
            <img
              src={`/api/drive/file/${preview.id}`}
              alt={preview.name}
              className="block max-h-[85vh] max-w-[85vw] object-contain"
            />
            <div className="border-t border-zinc-200 px-4 py-2 text-center text-sm text-zinc-600">
              {preview.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
