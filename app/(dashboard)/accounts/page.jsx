"use client";

import { useState, useEffect } from "react";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useAuth";
import Modal from "@/components/ui/Modal";

export default function AccountsPage() {
  const { data, isLoading } = useUsers();
  const { mutate: createUser, isPending: isCreating, error: createError } = useCreateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const users = (data?.users ?? []).filter((u) => u.role !== "admin");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", isActive: false });
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [editUser, setEditUser] = useState(null); // the user object being edited, or null

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  function handleCreateSubmit(e) {
    e.preventDefault();
    createUser(form, {
      onSuccess: () => {
        setForm({ name: "", email: "", password: "", isActive: false });
        setCreateOpen(false);
      },
    });
  }

  function handleDeleteClick(userId) {
    setSelectedUserId(userId);
    setDeleteOpen(true);
  }

  function handleDeleteConfirm() {
    if (selectedUserId && !isDeleting) {
      deleteUser(selectedUserId, {
        onSettled: () => {
          setDeleteOpen(false);
          setSelectedUserId(null);
        },
      });
    }
  }

  const inputClass =
    "w-full h-10 rounded-lg border border-slate-300 px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Accounts</h1>
          <p className="text-[15px] text-slate-500 mt-0.5">
            {isLoading ? "Loading…" : `${users.length} user${users.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-[15px] font-medium px-4 h-10 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New user
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-40" />
                <div className="h-3 bg-slate-100 rounded w-56" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3">👤</div>
          <p className="text-[15px] font-medium text-slate-900 mb-1">No users yet</p>
          <p className="text-[14px] text-slate-500 mb-5">
            You&apos;re the only account so far. Create one for a teammate to use the admin panel.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-[15px] font-medium px-4 h-10 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Create user
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <UserRow
              key={u.userId}
              user={u}
              onDelete={() => handleDeleteClick(u.userId)}
              onEdit={() => setEditUser(u)}
            />
          ))}
        </div>
      )}

      {/* Edit user modal */}
      <EditUserModal user={editUser} onClose={() => setEditUser(null)} />

      {/* Create user modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <div className="flex flex-col gap-5 w-96">
          <div>
            <h2 className="text-base font-medium text-slate-900">New user</h2>
            <p className="text-sm text-slate-500 mt-1">
              They&apos;ll be able to sign in once you mark them active.
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Jane Doe"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="jane@hotel.com"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showCreatePassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showCreatePassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showCreatePassword} />
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-100 cursor-pointer"
              />
              <span className="text-sm text-slate-700">Active — can log in immediately</span>
            </label>

            {createError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-2.5">
                <span>⚠</span> {createError.message}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="cursor-pointer text-sm text-slate-500 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? "Creating…" : "Create user"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="flex flex-col gap-5 w-80">
          <div>
            <h2 className="text-base font-medium text-slate-900">Delete user</h2>
            <p className="text-sm text-slate-500 mt-1">
              This will permanently remove their account. This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteOpen(false)}
              className="cursor-pointer text-sm text-slate-500 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function UserRow({ user, onDelete, onEdit }) {
  const { mutate: updateUser, isPending } = useUpdateUser(user.userId);

  function toggleActive() {
    updateUser({ isActive: !user.isActive });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
          {user.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-slate-900 truncate">{user.name}</p>
          <p className="text-sm text-slate-400 truncate">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleActive}
          disabled={isPending}
          className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-2.5 h-7 rounded-full border transition-colors cursor-pointer disabled:opacity-50 ${
            user.isActive
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-slate-400"}`} />
          {user.isActive ? "Active" : "Inactive"}
        </button>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-600 border border-slate-300 px-3 h-9 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-red-600 border border-red-200 px-3 h-9 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose }) {
  const { mutate: updateUser, isPending, error, reset } = useUpdateUser(user?.userId);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Sync form to whichever user was clicked, each time the modal opens for
  // a (possibly different) user.
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({ name: user.name ?? "", email: user.email ?? "", password: "" });
      setShowPassword(false);
      reset();
    }
  }, [user, reset]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Only send password if they actually typed a new one — an empty
    // string would fail the backend's min-length check and, more
    // importantly, we don't want to accidentally wipe/reset it.
    const { password, ...rest } = form;
    const payload = password ? { ...rest, password } : rest;

    updateUser(payload, { onSuccess: () => onClose() });
  }

  const inputClass =
    "w-full h-10 rounded-lg border border-slate-300 px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

  return (
    <Modal open={!!user} onClose={onClose}>
      <div className="flex flex-col gap-5 w-96">
        <div>
          <h2 className="text-base font-medium text-slate-900">Edit user</h2>
          <p className="text-sm text-slate-500 mt-1">
            Leave the password blank to keep their current one.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              New password <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                minLength={6}
                placeholder="Leave blank to keep current password"
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-2.5">
              <span>⚠</span> {error.message}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-sm text-slate-500 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function EyeIcon({ open }) {
  if (open) {
    // "Eye" — password visible
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  // "Eye-off" — password hidden
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.4 19.4 0 0 1 4.22-5.44M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a19.4 19.4 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}