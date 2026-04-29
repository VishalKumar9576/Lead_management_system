const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function PaymentSummaryCards({ summary }) {
  const cards = [
    {
      label: "Payment Entries",
      value: summary?.total_payment_entries ?? 0,
      helper: "Total recorded payments",
    },
    {
      label: "Total Received",
      value: formatMoney(summary?.total_received_amount),
      helper: "Cash + online collection",
    },
    {
      label: "Cash Received",
      value: formatMoney(summary?.total_cash_received),
      helper: "Collected in cash",
    },
    {
      label: "Online Received",
      value: formatMoney(summary?.total_online_received),
      helper: "Received online",
    },
    {
      label: "Pending Settlement",
      value: formatMoney(summary?.pending_cash_settlement),
      helper: "Cash with executive",
      danger: true,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((item) => (
        <div key={item.label} className="border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">{item.label}</p>

          <h2
            className={`mt-2 truncate text-xl font-bold ${
              item.danger ? "text-red-600" : "text-gray-900"
            }`}
          >
            {item.value}
          </h2>

          <p className="mt-1 text-xs text-gray-500">{item.helper}</p>
        </div>
      ))}
    </div>
  );
}