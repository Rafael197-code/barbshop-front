import Icon from "./Icon";

type NoticeProps = {
  kind: "error" | "success";
  children: React.ReactNode;
};

export default function Notice({ kind, children }: NoticeProps) {
  const erro = kind === "error";

  return (
    <p
      role={erro ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm font-medium ${
        erro ? "border-red/30 bg-red/5 text-red-deep" : "border-navy/20 bg-tint text-navy"
      }`}
    >
      <Icon name={erro ? "x" : "check"} className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
