import { FormState } from "@/hooks/form/useForm";

type Props = {
  field: FormState;
  setField: (content: FormState) => void;
};

export const Form = ({ field, setField }: Props) => {
  return (
    <div className="rounded-2xl border border-[#292929] bg-[#191919] p-6 space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">Fund Name</label>
        <input
          type="text"
          value={field.name}
          onChange={(e) => setField({ ...field, name: e.target.value })}
          placeholder="e.g., Aave Lending Turbo"
          className="w-full rounded-xl border border-[#262626] bg-[#191919] px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 transition-colors focus:border-[#3a3a3a] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">Description</label>
        <textarea
          value={field.description}
          onChange={(e) => setField({ ...field, description: e.target.value })}
          placeholder="Describe your fund strategy and goals..."
          rows={4}
          className="w-full resize-none rounded-xl border border-[#262626] bg-[#191919] px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 transition-colors focus:border-[#3a3a3a] focus:outline-none"
        />
      </div>
    </div>
  );
};

