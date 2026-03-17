import { useEffect, useState } from "react";
import {
  Banner,
  Button,
  Field,
  Input,
  Modal,
  TextArea,
  Toggle,
} from "../../../components/ui.jsx";

export default function EditGroupModal({ group, isOpen, onClose, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ name: "", description: "", joinable: true, iconFile: null });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !group) return;
    setForm({
      name: group.name || "",
      description: group.description || "",
      joinable: Boolean(group.joinable),
      iconFile: null,
    });
    setError("");
  }, [group, isOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Group name is required.");
      return;
    }

    try {
      setError("");
      await onSubmit(form);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update group");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit group"
      description="Update your group details, joinability, and icon."
      actions={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="edit-group-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save group"}
          </Button>
        </>
      )}
    >
      <form id="edit-group-form" className="space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <Banner title="Group issue" tone="danger">
            {error}
          </Banner>
        ) : null}

        <Field label="Group name">
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </Field>

        <Field label="Group bio">
          <TextArea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </Field>

        <Field label="Joinability">
          <Toggle
            checked={form.joinable}
            onChange={(joinable) => setForm((current) => ({ ...current, joinable }))}
            onLabel="Open"
            offLabel="Closed"
          />
        </Field>

        <Field label="Group icon">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setForm((current) => ({ ...current, iconFile: event.target.files?.[0] || null }))}
            className="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          />
        </Field>
      </form>
    </Modal>
  );
}
