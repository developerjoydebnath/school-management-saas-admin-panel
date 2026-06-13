"use client";

import { OrderFilter } from "@/app/(protected)/dashboard/page";
import DataTable from "@/shared/components/table/DataTable";
import { Order } from "@/shared/models/order.model";
import { format } from "date-fns";
import { useState } from "react";

const data = [
  {
    id: 1,
    orderId: "ORD-1001",
    subtotal: 500,
    totalCharge: 50,
    discount: 20,
    currency: "USD",
    deliveryCharge: 30,
    deliveryAddress: "Dhaka, Bangladesh",
    deliveryManId: 101,
    total: 530,
    grandTotal: 560,
    customerId: 1,
    note: "Leave at door",
    trxId: "TRX1001",
    createdAt: "2026-04-26T10:00:00Z",
    updatedAt: "2026-04-26T10:10:00Z",
    deletedAt: null
  },
  {
    id: 2,
    orderId: "ORD-1002",
    subtotal: 800,
    totalCharge: 80,
    discount: 0,
    currency: "USD",
    deliveryCharge: 40,
    deliveryAddress: "Chattogram, Bangladesh",
    deliveryManId: 102,
    total: 880,
    grandTotal: 920,
    customerId: 2,
    note: "",
    trxId: "TRX1002",
    createdAt: "2026-04-25T09:00:00Z",
    updatedAt: "2026-04-25T09:05:00Z",
    deletedAt: null
  },
  {
    id: 3,
    orderId: "ORD-1003",
    subtotal: 1200,
    totalCharge: 100,
    discount: 50,
    currency: "USD",
    deliveryCharge: 60,
    deliveryAddress: "Khulna, Bangladesh",
    deliveryManId: 103,
    total: 1250,
    grandTotal: 1310,
    customerId: 3,
    note: "Call before delivery",
    trxId: "TRX1003",
    createdAt: "2026-04-24T08:00:00Z",
    updatedAt: "2026-04-24T08:15:00Z",
    deletedAt: null
  },
  {
    id: 4,
    orderId: "ORD-1004",
    subtotal: 300,
    totalCharge: 20,
    discount: 0,
    currency: "USD",
    deliveryCharge: 25,
    deliveryAddress: "Sylhet, Bangladesh",
    deliveryManId: 104,
    total: 320,
    grandTotal: 345,
    customerId: 4,
    note: "",
    trxId: "TRX1004",
    createdAt: "2026-04-23T07:00:00Z",
    updatedAt: "2026-04-23T07:10:00Z",
    deletedAt: null
  },
  {
    id: 5,
    orderId: "ORD-1005",
    subtotal: 950,
    totalCharge: 70,
    discount: 30,
    currency: "USD",
    deliveryCharge: 50,
    deliveryAddress: "Rajshahi, Bangladesh",
    deliveryManId: 105,
    total: 990,
    grandTotal: 1040,
    customerId: 5,
    note: "Handle with care",
    trxId: "TRX1005",
    createdAt: "2026-04-22T06:00:00Z",
    updatedAt: "2026-04-22T06:20:00Z",
    deletedAt: null
  },
  {
    id: 6,
    orderId: "ORD-1006",
    subtotal: 400,
    totalCharge: 40,
    discount: 10,
    currency: "USD",
    deliveryCharge: 20,
    deliveryAddress: "Barisal, Bangladesh",
    deliveryManId: 106,
    total: 430,
    grandTotal: 450,
    customerId: 6,
    note: "",
    trxId: "TRX1006",
    createdAt: "2026-04-21T05:00:00Z",
    updatedAt: "2026-04-21T05:05:00Z",
    deletedAt: null
  },
  {
    id: 7,
    orderId: "ORD-1007",
    subtotal: 1500,
    totalCharge: 120,
    discount: 100,
    currency: "USD",
    deliveryCharge: 70,
    deliveryAddress: "Rangpur, Bangladesh",
    deliveryManId: 107,
    total: 1520,
    grandTotal: 1590,
    customerId: 7,
    note: "Urgent delivery",
    trxId: "TRX1007",
    createdAt: "2026-04-20T04:00:00Z",
    updatedAt: "2026-04-20T04:30:00Z",
    deletedAt: null
  },
  {
    id: 8,
    orderId: "ORD-1008",
    subtotal: 600,
    totalCharge: 60,
    discount: 0,
    currency: "USD",
    deliveryCharge: 35,
    deliveryAddress: "Mymensingh, Bangladesh",
    deliveryManId: 108,
    total: 660,
    grandTotal: 695,
    customerId: 8,
    note: "",
    trxId: "TRX1008",
    createdAt: "2026-04-19T03:00:00Z",
    updatedAt: "2026-04-19T03:10:00Z",
    deletedAt: null
  },
  {
    id: 9,
    orderId: "ORD-1009",
    subtotal: 1100,
    totalCharge: 90,
    discount: 60,
    currency: "USD",
    deliveryCharge: 55,
    deliveryAddress: "Comilla, Bangladesh",
    deliveryManId: 109,
    total: 1130,
    grandTotal: 1185,
    customerId: 9,
    note: "Gift wrap",
    trxId: "TRX1009",
    createdAt: "2026-04-18T02:00:00Z",
    updatedAt: "2026-04-18T02:15:00Z",
    deletedAt: null
  },
  {
    id: 10,
    orderId: "ORD-1010",
    subtotal: 700,
    totalCharge: 65,
    discount: 25,
    currency: "USD",
    deliveryCharge: 45,
    deliveryAddress: "Gazipur, Bangladesh",
    deliveryManId: 110,
    total: 740,
    grandTotal: 785,
    customerId: 10,
    note: "",
    trxId: "TRX1010",
    createdAt: "2026-04-17T01:00:00Z",
    updatedAt: "2026-04-17T01:10:00Z",
    deletedAt: null
  },
  {
    id: 11,
    orderId: "ORD-1010",
    subtotal: 700,
    totalCharge: 65,
    discount: 25,
    currency: "USD",
    deliveryCharge: 45,
    deliveryAddress: "Gazipur, Bangladesh",
    deliveryManId: 110,
    total: 740,
    grandTotal: 785,
    customerId: 10,
    note: "",
    trxId: "TRX1010",
    createdAt: "2026-04-17T01:00:00Z",
    updatedAt: "2026-04-17T01:10:00Z",
    deletedAt: null
  },
  {
    id: 12,
    orderId: "ORD-1010",
    subtotal: 700,
    totalCharge: 65,
    discount: 25,
    currency: "USD",
    deliveryCharge: 45,
    deliveryAddress: "Gazipur, Bangladesh",
    deliveryManId: 110,
    total: 740,
    grandTotal: 785,
    customerId: 10,
    note: "",
    trxId: "TRX1010",
    createdAt: "2026-04-17T01:00:00Z",
    updatedAt: "2026-04-17T01:10:00Z",
    deletedAt: null
  }
];

const ROW_LIMIT = 10;

export default function OrderTable({
  queryType,
  filter,
}: {
  queryType: "ACTIVE" | "HISTORY";
  filter: OrderFilter;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(ROW_LIMIT);

  // const { data, meta, isLoading } = useTableData("/orders", {
  //   page: page.toString(),
  //   limit: ROW_LIMIT,
  //   queryType,
  //   ...filter,
  //   startDate: filter.startDate
  //     ? format(filter.startDate, "yyyy-MM-dd")
  //     : undefined,
  //   endDate: filter.endDate ? format(filter.endDate, "yyyy-MM-dd") : undefined,
  // });

  const orders: Order[] = data.map((order: Record<string, any>) => new Order(order));

  const meta = {
    page: 1,
    limit: ROW_LIMIT,
    total: 1000,
    totalPages: Math.ceil(1000 / ROW_LIMIT),
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const isLoading = false;

  return (
    <div>
      <DataTable<Order>
        data={orders || Array.from({ length: ROW_LIMIT })}
        isLoading={isLoading}
        pagination={{
          page,
          totalPages: meta.totalPages,
          total: meta.total,
          limit: ROW_LIMIT,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
        columns={[
          {
            id: "id",
            header: "#",
            cell: ({ row }) => row.original.getOrderId(),
          },

          {
            id: "date",
            header: "Date",
            cell: ({ row }) =>
              format(row.original.getCreatedAt(), "dd-MM-yyyy, hh:mm aa"),
          },

          {
            id: "items",
            header: "Items",
            cell: ({ row }) => row.original.getTotalCharge(),
          },
          // {
          //   id: "totalPrice",
          //   header: "Total Price",
          //   accessorKey: "grandTotal",
          //   cell: ({ row }) => {
          //     const data = row.original;
          //     const currencyFormatter = new CurrencyFormatter(
          //       data.getCurrency(),
          //     );
          //     return currencyFormatter.format(data.getGrandTotal());
          //   },
          // },
          {
            id: "customerName",
            header: "Customer name",
            cell: ({ row }) => row.original.getTrxId(),
          },

          {
            id: "customerPhone",
            header: "Customer phone",
            cell: ({ row }) => row.original.getDeliveryAddress(),
          },

          // {
          //   id: "order_type",
          //   header: "Order Type",
          //   cell: ({ row }) => (
          //     <OrderTypeBadge orderType={row.original.getOrderType()} />
          //   ),
          // },

          // {
          //   id: "payment",
          //   header: "Payment",
          //   cell: ({ row }) => (
          //     <div className="flex items-center space-x-1">
          //       <PaymentStatusBadge
          //         orderId={row.original.getId()}
          //         paymentStatus={row.original.getPaymentStatus()}
          //         orderStatus={row.original.getStatus()}
          //       />
          //       <PaymentMethodBadge
          //         status={row.original.getStatus()}
          //         orderId={row.original.getId()}
          //         method={row.original.getPaymentMethod()}
          //       />
          //     </div>
          //   ),
          // },

          // {
          //   id: "status",
          //   header: "Status",
          //   cell: ({ row }) => (
          //     <OrderStatusBadge
          //       mode="edit"
          //       orderId={row.original.getId()}
          //       orderType={row.original.getOrderType()}
          //       status={row.original.getStatus()}
          //     />
          //   ),
          // },

          {
            id: "delieryMan",
            header: "Delivery Man",
            accessorFn: (row) => row.getDeliveryManId(),
            cell: (info) => info.getValue() || "N/A",
          },

          // {
          //   id: "action",
          //   header: "Action",
          //   enableSorting: false,
          //   cell: ({ row }) => (
          //     <div className="flex items-center space-x-1">
          //       <OrderPreviewButton mode="edit" order={row.original} />

          //       <PrintOrderInvoice
          //         variant="ghost"
          //         colorScheme="secondary"
          //         size="icon"
          //         className="text-gray-600 hover:text-gray-900"
          //         order={row.original}
          //       >
          //         <IconPrinter />
          //       </PrintOrderInvoice>
          //     </div>
          //   ),
          // },
        ]}
      />
    </div>
  );
}
