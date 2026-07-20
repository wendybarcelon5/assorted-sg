export default function OrdersChart() {
  const stats = [
    {
      label: "Delivered",
      value: "53%",
      color: "bg-green-500",
    },
    {
      label: "Processing",
      value: "22%",
      color: "bg-yellow-500",
    },
    {
      label: "Shipped",
      value: "15%",
      color: "bg-blue-500",
    },
    {
      label: "Pending",
      value: "10%",
      color: "bg-red-500",
    },
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-[#1E293B] p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white">
        Orders Overview
      </h2>

      <div className="mt-8 space-y-5">
        {stats.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex justify-between">
              <span className="text-gray-300">
                {item.label}
              </span>

              <span className="font-bold text-white">
                {item.value}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-[#111827]">
              <div
                className={`h-full ${item.color}`}
                style={{
                  width: item.value,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}