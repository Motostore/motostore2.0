import { EyeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export function ViewTransaction({ id }: { id: number }) {
  return (
    <Link
      href={`/dashboard/transactions/${id}/verify`}
      className="flex justify-center"
    >
      <EyeIcon className="w-10 bg-orange-500 text-white font-bold rounded-lg px-2 py-1" />
    </Link>
  );
}