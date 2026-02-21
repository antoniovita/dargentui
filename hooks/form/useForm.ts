"use client";

import { useState } from "react";

export type FormState = {
  name: string;
  description: string;
};

export function useForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [metadataUri, setMetadataUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function uploadToIpfs(data: Blob): Promise<string> {
    throw new Error("uploadToIpfs não implementado");
  }
  
  async function submit() {
    try {
      setLoading(true);
      setError(null);

      const metadata = {
        name: form.name,
        description: form.description,
      };

      const blob = new Blob(
        [JSON.stringify(metadata)],
        { type: "application/json" }
      );

      const cid = await uploadToIpfs(blob);

      const uri = `ipfs://${cid}`;
      setMetadataUri(uri);

      return uri;

    } catch (err: any) {
      setError(err.message ?? "Erro ao enviar metadata");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    setField,
    submit,
    loading,
    metadataUri,
    error,
  };
}